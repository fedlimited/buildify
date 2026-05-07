const { getDb } = require('../config/database');

const paystackController = {
  // Initialize payment
  initializePayment: async (req, res) => {
    try {
      const { planId, currency = 'KES' } = req.body;
      const userId = req.user.id;
      const db = await getDb();
      
      // Get the plan details
      const plan = await db.query(
        `SELECT * FROM subscription_plans WHERE id = $1`,
        [planId]
      );
      
      if (plan.rows.length === 0) {
        return res.status(404).json({ error: 'Plan not found' });
      }
      
      const selectedPlan = plan.rows[0];
      
      // Calculate amount based on currency
      let amount = selectedPlan.price_kes;
      let amountUSD = null;
      let amountKES = null;
      
      if (currency === 'USD') {
        amount = selectedPlan.price_usd || Math.ceil(selectedPlan.price_kes / 130);
        amountUSD = amount;
      } else {
        amountKES = amount;
      }
      
      // Get user email
      const user = await db.query(
        `SELECT email FROM users WHERE id = $1`,
        [userId]
      );
      
      const userEmail = user.rows[0].email;
      
      // Initialize Paystack transaction
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userEmail,
          amount: Math.round(amount * 100),
          currency: currency,
          callback_url: `${process.env.FRONTEND_URL || 'https://bochi.ke'}/payment-verification`,
          metadata: {
            user_id: userId,
            plan_id: planId,
            currency: currency,
            amount_usd: amountUSD,
            amount_kes: amountKES
          }
        })
      });
      
      const data = await response.json();
      
      if (!data.status) {
        console.error('Paystack error:', data);
        return res.status(400).json({ error: data.message || 'Payment initialization failed' });
      }
      
      // Store transaction reference
      await db.query(
        `INSERT INTO paystack_transactions (reference, user_id, plan_id, amount_usd, amount_kes, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'pending', NOW())`,
        [data.data.reference, userId, planId, amountUSD, amountKES]
      );
      
      res.json({
        success: true,
        authorization_url: data.data.authorization_url,
        reference: data.data.reference
      });
      
    } catch (error) {
      console.error('Payment initialization error:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Verify payment (callback)
  verifyPayment: async (req, res) => {
    try {
      const { reference } = req.query;
      
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      });
      
      const data = await response.json();
      
      if (data.data.status === 'success') {
        const { amount, currency, metadata } = data.data;
        
        const db = await getDb();
        
        // Update transaction status
        await db.query(
          `UPDATE paystack_transactions 
           SET status = 'completed', verified_at = NOW() 
           WHERE reference = $1`,
          [reference]
        );
        
        // Create subscription payment record
        await db.query(
          `INSERT INTO subscription_payments (
            subscription_id, amount_usd, amount_kes, currency, 
            payment_method, status, paid_at, reference
          ) VALUES ($1, $2, $3, $4, 'paystack', 'completed', NOW(), $5)`,
          [
            metadata.plan_id,
            metadata.amount_usd,
            metadata.amount_kes,
            currency,
            reference
          ]
        );
        
        // Redirect to success page
        res.redirect(`${process.env.FRONTEND_URL || 'https://bochi.ke'}/payment-verification?status=success&reference=${reference}`);
      } else {
        res.redirect(`${process.env.FRONTEND_URL || 'https://bochi.ke'}/payment-verification?status=failed&reference=${reference}`);
      }
      
    } catch (error) {
      console.error('Payment verification error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'https://bochi.ke'}/payment-verification?status=failed`);
    }
  },
  
  // Webhook handler
  handleWebhook: async (req, res) => {
    try {
      const event = req.body;
      
      if (event.event === 'charge.success') {
        const { reference, amount, currency, metadata } = event.data;
        
        const db = await getDb();
        
        // Update transaction
        await db.query(
          `UPDATE paystack_transactions 
           SET status = 'completed', verified_at = NOW() 
           WHERE reference = $1`,
          [reference]
        );
        
        // Create or update subscription payment
        await db.query(
          `INSERT INTO subscription_payments (
            subscription_id, amount_usd, amount_kes, currency, 
            payment_method, status, paid_at, reference
          ) VALUES ($1, $2, $3, $4, 'paystack', 'completed', NOW(), $5)
          ON CONFLICT (reference) DO NOTHING`,
          [
            metadata.plan_id,
            metadata.amount_usd,
            metadata.amount_kes,
            currency,
            reference
          ]
        );
        
        console.log(`✅ Paystack payment completed: ${reference}`);
      }
      
      res.sendStatus(200);
      
    } catch (error) {
      console.error('Webhook error:', error);
      res.sendStatus(500);
    }
  }
};

module.exports = paystackController;