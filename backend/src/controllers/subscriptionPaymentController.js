const { getDb } = require('../config/database'); 
const mpesaService = require('../services/mpesaSubscriptionService'); 
 
class SubscriptionPaymentController { 
  async getPlans(req, res) { 
    try { 
      const db = getDb(); 
      const plans = await db.all('SELECT * FROM subscription_plans WHERE is_active = true ORDER BY display_order'); 
      res.json(plans); 
    } catch (error) { 
      res.status(500).json({ error: error.message }); 
    } 
  } 
 
  async getCurrentSubscription(req, res) { 
    try { 
      const db = getDb(); 
      const company_id = req.user.companyId; 
      const subscription = await db.get(` 
        SELECT cs.*, sp.name as plan_name, sp.display_name, sp.price_monthly_kes, sp.price_yearly_kes, 
        sp.max_projects, sp.max_workers, sp.max_users, sp.features 
        FROM company_subscriptions cs 
        JOIN subscription_plans sp ON cs.plan_id = sp.id 
        WHERE cs.company_id = ? AND cs.status IN ('active', 'trial') 
        ORDER BY cs.id DESC LIMIT 1 
      `, [company_id]); 
      if (!subscription) { 
        const freePlan = await db.get('SELECT * FROM subscription_plans WHERE name = ?', ['free']); 
      } 
      res.json(subscription); 
    } catch (error) { 
      res.status(500).json({ error: error.message }); 
    } 
  } 
 
  async initiatePayment(req, res) { 
    try { 
      const db = getDb(); 
      const { planId, phoneNumber, billingCycle } = req.body; 
      const company_id = req.user.companyId; 
      const plan = await db.get('SELECT * FROM subscription_plans WHERE id = ?', [planId]); 
      if (!plan) return res.status(404).json({ error: 'Plan not found' }); 
      let amount = billingCycle === 'yearly' ? plan.price_yearly_kes : plan.price_monthly_kes; 
      const currentSub = await db.get('SELECT * FROM company_subscriptions WHERE company_id = ? AND status IN ("active", "trial")', [company_id]); 
        const currentPlan = await db.get('SELECT * FROM subscription_plans WHERE id = ?', [currentSub.plan_id]); 
        const currentAmount = billingCycle === 'yearly' ? currentPlan.price_yearly_kes : currentPlan.price_monthly_kes; 
        amount = amount - currentAmount; 
      } 
      const accountReference = `SUB-${company_id}-${Date.now()}`; 
      const mpesaResponse = await mpesaService.initiatePayment(phoneNumber, amount, accountReference, `Subscription: ${plan.display_name} (${billingCycle})`); 
      if (mpesaResponse.ResponseCode === '0') { 
        const result = await db.run(`INSERT INTO subscription_payments (company_id, amount_kes, payment_method, mpesa_transaction_id, status, created_at) VALUES (?, ?, 'mpesa', ?, 'pending', CURRENT_TIMESTAMP)`, [company_id, amount, mpesaResponse.CheckoutRequestID]); 
        res.json({ success: true, message: 'Payment prompt sent to your phone', checkoutRequestId: mpesaResponse.CheckoutRequestID, paymentId: result.lastID }); 
      } else { 
      } 
    } catch (error) { 
      res.status(500).json({ error: error.message }); 
    } 
  } 
 
  async handleCallback(req, res) { 
    try { 
      const db = getDb(); 
      const { Body } = req.body; 
      const checkoutRequestId = Body.stkCallback.CheckoutRequestID; 
      const resultCode = Body.stkCallback.ResultCode; 
      const mpesaReceipt = Body.stkCallback?.CallbackMetadata?.Item?.find(item = === 'MpesaReceiptNumber')?.Value; 
      const payment = await db.get('SELECT * FROM subscription_payments WHERE mpesa_transaction_id = ?', [checkoutRequestId]); 
      if (!payment) return res.json({ ResultCode: 0, ResultDesc: 'Success' }); 
      if (resultCode === 0) { 
        await db.run(`UPDATE subscription_payments SET status = 'completed', paid_at = CURRENT_TIMESTAMP WHERE id = ?`, [payment.id]); 
        const existingSub = await db.get('SELECT * FROM company_subscriptions WHERE company_id = ? AND status IN ("active", "trial")', [payment.company_id]); 
        const endDate = new Date(); 
        endDate.setMonth(endDate.getMonth() + 1); 
        if (existingSub) { 
          await db.run(`UPDATE company_subscriptions SET end_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [endDate.toISOString().split('T')[0], existingSub.id]); 
        } else { 
          const basicPlan = await db.get('SELECT id FROM subscription_plans WHERE name = ?', ['basic']); 
          const startDate = new Date(); 
          await db.run(`INSERT INTO company_subscriptions (company_id, plan_id, status, start_date, end_date, created_at, updated_at) VALUES (?, ?, 'active', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`, [payment.company_id, basicPlan?.id, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]); 
        } 
        console.log(`? Subscription payment successful for company ${payment.company_id}`); 
      } else { 
        await db.run(`UPDATE subscription_payments SET status = 'failed' WHERE id = ?`, [payment.id]); 
        console.log(`? Subscription payment failed for company ${payment.company_id}`); 
      } 
      res.json({ ResultCode: 0, ResultDesc: 'Success' }); 
    } catch (error) { 
      console.error('Callback error:', error); 
      res.json({ ResultCode: 0, ResultDesc: 'Success' }); 
    } 
  } 
 
  async checkPaymentStatus(req, res) { 
    try { 
      const db = getDb(); 
      const { paymentId } = req.params; 
      const company_id = req.user.companyId; 
      const payment = await db.get('SELECT * FROM subscription_payments WHERE id = ? AND company_id = ?', [paymentId, company_id]); 
      if (!payment) return res.status(404).json({ error: 'Payment not found' }); 
      res.json({ status: payment.status, amount: payment.amount_kes, paidAt: payment.paid_at }); 
    } catch (error) { 
      res.status(500).json({ error: error.message }); 
    } 
  } 
} 
 
module.exports = new SubscriptionPaymentController(); 
