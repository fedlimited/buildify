const { getDb } = require('../config/database');
const mpesaService = require('../services/mpesaSubscriptionService');

class SubscriptionPaymentController {
  // Get all subscription plans
  async getPlans(req, res) {
    try {
      const db = await getDb();
      let plans;
      if (process.env.NODE_ENV === 'production') {
        const result = await db.query(
          'SELECT * FROM subscription_plans WHERE is_active = true ORDER BY display_order'
        );
        plans = result.rows;
      } else {
        plans = await db.all(
          'SELECT * FROM subscription_plans WHERE is_active = 1 ORDER BY display_order'
        );
      }
      res.json(plans);
    } catch (error) {
      console.error('Error getting plans:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get current company's subscription
  async getCurrentSubscription(req, res) {
    try {
      const db = await getDb();
      const company_id = req.user.companyId;

      let subscription;
      if (process.env.NODE_ENV === 'production') {
        const result = await db.query(`
          SELECT cs.*, sp.name as plan_name, sp.display_name, sp.price_monthly_kes, sp.price_yearly_kes,
                 sp.max_projects, sp.max_workers, sp.max_users, sp.features
          FROM company_subscriptions cs
          JOIN subscription_plans sp ON cs.plan_id = sp.id
          WHERE cs.company_id = $1 AND cs.status IN ('active', 'trial')
          ORDER BY cs.id DESC LIMIT 1
        `, [company_id]);
        subscription = result.rows[0];
      } else {
        subscription = await db.get(`
          SELECT cs.*, sp.name as plan_name, sp.display_name, sp.price_monthly_kes, sp.price_yearly_kes,
                 sp.max_projects, sp.max_workers, sp.max_users, sp.features
          FROM company_subscriptions cs
          JOIN subscription_plans sp ON cs.plan_id = sp.id
          WHERE cs.company_id = ? AND cs.status IN ('active', 'trial')
          ORDER BY cs.id DESC LIMIT 1
        `, [company_id]);
      }

      if (!subscription) {
        let freePlan;
        if (process.env.NODE_ENV === 'production') {
          const result = await db.query("SELECT * FROM subscription_plans WHERE name = 'free'");
          freePlan = result.rows[0];
        } else {
          freePlan = await db.get("SELECT * FROM subscription_plans WHERE name = 'free'");
        }
        return res.json({
          plan_name: 'free',
          display_name: 'Free',
          status: 'active',
          price_monthly_kes: 0,
          max_projects: freePlan?.max_projects || 1,
          max_workers: freePlan?.max_workers || 10,
          max_users: freePlan?.max_users || 1
        });
      }

      res.json(subscription);
    } catch (error) {
      console.error('Error getting subscription:', error);
      res.status(500).json({ error: error.message });
    }
  }








async initiatePayment(req, res) {
  try {
    const db = await getDb();
    const { planId, phoneNumber, billingCycle } = req.body;
    const company_id = req.user.companyId;

    // Get the target plan
    let plan;
    if (process.env.NODE_ENV === 'production') {
      const result = await db.query('SELECT * FROM subscription_plans WHERE id = $1', [planId]);
      plan = result.rows[0];
    } else {
      plan = await db.get('SELECT * FROM subscription_plans WHERE id = ?', [planId]);
    }

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Start with full amount of the new plan
    let amount = billingCycle === 'yearly' ? plan.price_yearly_kes : plan.price_monthly_kes;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid plan amount' });
    }

    // Get current subscription
    let currentSub;
    if (process.env.NODE_ENV === 'production') {
      const result = await db.query(
        "SELECT * FROM company_subscriptions WHERE company_id = $1 AND status IN ('active', 'trial') ORDER BY id DESC LIMIT 1",
        [company_id]
      );
      currentSub = result.rows[0];
    } else {
      currentSub = await db.get(
        "SELECT * FROM company_subscriptions WHERE company_id = ? AND status IN ('active', 'trial') ORDER BY id DESC LIMIT 1",
        [company_id]
      );
    }

    // ============================================
    // OPTION 2: Only prorate if current plan is PAID (not free)
    // ============================================
    if (currentSub && currentSub.plan_id !== planId) {
      // Get current plan details
      let currentPlan;
      if (process.env.NODE_ENV === 'production') {
        const result = await db.query('SELECT * FROM subscription_plans WHERE id = $1', [currentSub.plan_id]);
        currentPlan = result.rows[0];
      } else {
        currentPlan = await db.get('SELECT * FROM subscription_plans WHERE id = ?', [currentSub.plan_id]);
      }

      console.log(`📊 Current plan: ${currentPlan.name} (KES ${currentPlan.price_monthly_kes})`);
      console.log(`🎯 Target plan: ${plan.name} (KES ${plan.price_monthly_kes})`);

      // ONLY subtract if current plan is NOT free
      if (currentPlan.name !== 'free') {
        const currentAmount = billingCycle === 'yearly' ? currentPlan.price_yearly_kes : currentPlan.price_monthly_kes;
        amount = amount - currentAmount;
        console.log(`💰 Prorated amount: ${amount} (${plan.price_monthly_kes} - ${currentAmount})`);
      } else {
        console.log(`🆓 Current plan is FREE - charging full amount: ${amount}`);
      }

      // Prevent negative amounts (downgrade)
      if (amount <= 0) {
        return res.status(400).json({ 
          error: 'Cannot process downgrade. Please contact support.' 
        });
      }
    }

    console.log(`💳 Final charge amount: KES ${amount}`);

    const accountReference = `SUB-${company_id}-${Date.now()}`;
    const mpesaResponse = await mpesaService.initiatePayment(
      phoneNumber, 
      amount, 
      accountReference, 
      `Subscription: ${plan.display_name} (${billingCycle})`
    );

    if (mpesaResponse.ResponseCode === '0') {
      let result;
      if (process.env.NODE_ENV === 'production') {
        result = await db.query(`
          INSERT INTO subscription_payments 
          (company_id, plan_id, amount_kes, payment_method, mpesa_transaction_id, status, created_at) 
          VALUES ($1, $2, $3, 'mpesa', $4, 'pending', CURRENT_TIMESTAMP)
          RETURNING id
        `, [company_id, planId, amount, mpesaResponse.CheckoutRequestID]);
      } else {
        result = await db.run(`
          INSERT INTO subscription_payments 
          (company_id, plan_id, amount_kes, payment_method, mpesa_transaction_id, status, created_at) 
          VALUES (?, ?, ?, 'mpesa', ?, 'pending', CURRENT_TIMESTAMP)
        `, [company_id, planId, amount, mpesaResponse.CheckoutRequestID]);
      }

      res.json({
        success: true,
        message: 'Payment prompt sent to your phone',
        checkoutRequestId: mpesaResponse.CheckoutRequestID,
        paymentId: process.env.NODE_ENV === 'production' ? result.rows[0].id : result.lastID,
        amount: amount,
        isProrated: currentSub && currentSub.plan_id !== planId
      });
    } else {
      res.status(400).json({ error: mpesaResponse.ResponseDescription || 'Payment initiation failed' });
    }
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({ error: error.message });
  }
}




  // M-Pesa Callback (webhook)
  async handleCallback(req, res) {
    try {
      const db = await getDb();
      const { Body } = req.body;

      console.log('📞 Subscription payment callback received');

      if (!Body || !Body.stkCallback) {
        return res.json({ ResultCode: 0, ResultDesc: 'Success' });
      }

      const checkoutRequestId = Body.stkCallback.CheckoutRequestID;
      const resultCode = Body.stkCallback.ResultCode;

      let payment;
      if (process.env.NODE_ENV === 'production') {
        const result = await db.query('SELECT * FROM subscription_payments WHERE mpesa_transaction_id = $1', [checkoutRequestId]);
        payment = result.rows[0];
      } else {
        payment = await db.get('SELECT * FROM subscription_payments WHERE mpesa_transaction_id = ?', [checkoutRequestId]);
      }

      if (!payment) {
        console.log('❌ No payment found for checkout ID:', checkoutRequestId);
        return res.json({ ResultCode: 0, ResultDesc: 'Success' });
      }

      console.log(`💰 Payment found: ID=${payment.id}, Company=${payment.company_id}, Amount=${payment.amount_kes}, Plan=${payment.plan_id}`);

      if (resultCode === 0) {
        // Mark payment as completed
        if (process.env.NODE_ENV === 'production') {
          await db.query(`UPDATE subscription_payments SET status = 'completed', paid_at = CURRENT_TIMESTAMP WHERE id = $1`, [payment.id]);
        } else {
          await db.run(`UPDATE subscription_payments SET status = 'completed', paid_at = CURRENT_TIMESTAMP WHERE id = ?`, [payment.id]);
        }

        console.log(`✅ Payment ${payment.id} marked as completed`);

        // ============================================
        // 🔄 UPGRADE USER TO THE PLAN THEY PAID FOR
        // ============================================
        const newPlanId = payment.plan_id;
        
        if (newPlanId) {
          // Get plan details
          let planDetails;
          if (process.env.NODE_ENV === 'production') {
            const result = await db.query('SELECT * FROM subscription_plans WHERE id = $1', [newPlanId]);
            planDetails = result.rows[0];
          } else {
            planDetails = await db.get('SELECT * FROM subscription_plans WHERE id = ?', [newPlanId]);
          }
          
          console.log(`🎯 Upgrading company ${payment.company_id} to ${planDetails.name} plan`);

          // Calculate new end date
          const startDate = new Date();
          const endDate = new Date();
          
          // Check if yearly or monthly based on amount
          if (payment.amount_kes === planDetails.price_yearly_kes) {
            endDate.setFullYear(endDate.getFullYear() + 1);
            console.log(`📅 Yearly subscription until ${endDate.toISOString().split('T')[0]}`);
          } else {
            endDate.setMonth(endDate.getMonth() + 1);
            console.log(`📅 Monthly subscription until ${endDate.toISOString().split('T')[0]}`);
          }

          // Check if company already has a subscription
          let existingSub;
          if (process.env.NODE_ENV === 'production') {
            const result = await db.query(
              'SELECT * FROM company_subscriptions WHERE company_id = $1',
              [payment.company_id]
            );
            existingSub = result.rows[0];
          } else {
            existingSub = await db.get(
              'SELECT * FROM company_subscriptions WHERE company_id = ?',
              [payment.company_id]
            );
          }

          if (existingSub) {
            // UPDATE existing subscription to the NEW plan
            console.log(`📝 Updating subscription from plan ${existingSub.plan_id} to ${newPlanId}`);
            
            if (process.env.NODE_ENV === 'production') {
              await db.query(`
                UPDATE company_subscriptions 
                SET plan_id = $1, 
                    status = 'active', 
                    active = true,
                    start_date = $2,
                    end_date = $3,
                    updated_at = CURRENT_TIMESTAMP 
                WHERE id = $4
              `, [newPlanId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], existingSub.id]);
            } else {
              await db.run(`
                UPDATE company_subscriptions 
                SET plan_id = ?, 
                    status = 'active', 
                    active = 1,
                    start_date = ?,
                    end_date = ?,
                    updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
              `, [newPlanId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], existingSub.id]);
            }
          } else {
            // CREATE new subscription
            console.log(`📝 Creating new subscription for company ${payment.company_id}`);
            
            if (process.env.NODE_ENV === 'production') {
              await db.query(`
                INSERT INTO company_subscriptions 
                (company_id, plan_id, status, active, start_date, end_date, created_at, updated_at) 
                VALUES ($1, $2, 'active', true, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              `, [payment.company_id, newPlanId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);
            } else {
              await db.run(`
                INSERT INTO company_subscriptions 
                (company_id, plan_id, status, active, start_date, end_date, created_at, updated_at) 
                VALUES (?, ?, 'active', 1, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              `, [payment.company_id, newPlanId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);
            }
          }

          console.log(`🎉 Company ${payment.company_id} successfully upgraded to ${planDetails.name}!`);
        } else {
          console.log(`⚠️ Payment has no plan_id - cannot upgrade`);
        }
      } else {
        // Payment failed
        console.log(`❌ Payment failed with code ${resultCode}`);
        
        if (process.env.NODE_ENV === 'production') {
          await db.query(`UPDATE subscription_payments SET status = 'failed' WHERE id = $1`, [payment.id]);
        } else {
          await db.run(`UPDATE subscription_payments SET status = 'failed' WHERE id = ?`, [payment.id]);
        }
      }

      res.json({ ResultCode: 0, ResultDesc: 'Success' });
    } catch (error) {
      console.error('💥 Callback error:', error);
      res.json({ ResultCode: 0, ResultDesc: 'Success' });
    }
  }








  // Check payment status
  async checkPaymentStatus(req, res) {
    try {
      const db = await getDb();
      const { paymentId } = req.params;
      const company_id = req.user.companyId;

      let payment;
      if (process.env.NODE_ENV === 'production') {
        const result = await db.query('SELECT * FROM subscription_payments WHERE id = $1 AND company_id = $2', [paymentId, company_id]);
        payment = result.rows[0];
      } else {
        payment = await db.get('SELECT * FROM subscription_payments WHERE id = ? AND company_id = ?', [paymentId, company_id]);
      }

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      res.json({
        status: payment.status,
        amount: payment.amount_kes,
        paidAt: payment.paid_at
      });
    } catch (error) {
      console.error('Check payment error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new SubscriptionPaymentController();