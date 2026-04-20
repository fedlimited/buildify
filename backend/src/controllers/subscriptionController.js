const { getDb } = require('../config/database');

const SubscriptionController = {
  // Get all subscription plans
  getPlans: async (req, res) => {
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
      console.error('Error fetching plans:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Get company's current subscription
  getCurrentSubscription: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user.companyId;
      
      let result;
      if (process.env.NODE_ENV === 'production') {
        result = await db.query(`
          SELECT cs.*, sp.name as plan_name, sp.display_name, sp.price_monthly_usd, 
                 sp.max_projects, sp.max_workers, sp.max_users, sp.features
          FROM company_subscriptions cs
          JOIN subscription_plans sp ON cs.plan_id = sp.id
          WHERE cs.company_id = $1 AND cs.status IN ('active', 'trial')
          ORDER BY cs.created_at DESC LIMIT 1
        `, [company_id]);
      } else {
        result = await db.get(`
          SELECT cs.*, sp.name as plan_name, sp.display_name, sp.price_monthly_usd,
                 sp.max_projects, sp.max_workers, sp.max_users, sp.features
          FROM company_subscriptions cs
          JOIN subscription_plans sp ON cs.plan_id = sp.id
          WHERE cs.company_id = ? AND cs.status IN ('active', 'trial')
          ORDER BY cs.created_at DESC LIMIT 1
        `, [company_id]);
      }
      
      const subscription = process.env.NODE_ENV === 'production' ? result.rows[0] : result;
      
      if (!subscription) {
        // Return free plan as default
        let freePlan;
        if (process.env.NODE_ENV === 'production') {
          const freeResult = await db.query("SELECT * FROM subscription_plans WHERE name = 'free'");
          freePlan = freeResult.rows[0];
        } else {
          freePlan = await db.get("SELECT * FROM subscription_plans WHERE name = 'free'");
        }
        return res.json({ ...freePlan, is_default: true });
      }
      
      // Calculate days remaining in trial
      if (subscription.status === 'trial' && subscription.trial_end_date) {
        const today = new Date();
        const trialEnd = new Date(subscription.trial_end_date);
        const daysRemaining = Math.ceil((trialEnd - today) / (1000 * 60 * 60 * 24));
        subscription.trial_days_remaining = daysRemaining > 0 ? daysRemaining : 0;
      }
      
      res.json(subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Check usage limits
  checkLimit: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user.companyId;
      const { type } = req.query;
      
      // Get current subscription
      let subscription;
      if (process.env.NODE_ENV === 'production') {
        const result = await db.query(`
          SELECT sp.max_projects, sp.max_workers, sp.max_users, sp.max_income_records
          FROM company_subscriptions cs
          JOIN subscription_plans sp ON cs.plan_id = sp.id
          WHERE cs.company_id = $1 AND cs.status IN ('active', 'trial')
          LIMIT 1
        `, [company_id]);
        subscription = result.rows[0];
      } else {
        subscription = await db.get(`
          SELECT sp.max_projects, sp.max_workers, sp.max_users, sp.max_income_records
          FROM company_subscriptions cs
          JOIN subscription_plans sp ON cs.plan_id = sp.id
          WHERE cs.company_id = ? AND cs.status IN ('active', 'trial')
          LIMIT 1
        `, [company_id]);
      }
      
      const limits = subscription || { max_projects: 1, max_workers: 10, max_users: 1, max_income_records: 10 };
      
      let currentCount = 0;
      let allowed = true;
      let max = 0;
      
      if (type === 'project') {
        if (process.env.NODE_ENV === 'production') {
          const result = await db.query('SELECT COUNT(*) as count FROM projects WHERE company_id = $1', [company_id]);
          currentCount = result.rows[0].count;
        } else {
          const result = await db.get('SELECT COUNT(*) as count FROM projects WHERE company_id = ?', [company_id]);
          currentCount = result.count;
        }
        max = limits.max_projects;
        allowed = currentCount < max;
      } else if (type === 'worker') {
        if (process.env.NODE_ENV === 'production') {
          const result = await db.query('SELECT COUNT(*) as count FROM workers WHERE company_id = $1', [company_id]);
          currentCount = result.rows[0].count;
        } else {
          const result = await db.get('SELECT COUNT(*) as count FROM workers WHERE company_id = ?', [company_id]);
          currentCount = result.count;
        }
        max = limits.max_workers;
        allowed = currentCount < max;
      } else if (type === 'user') {
        if (process.env.NODE_ENV === 'production') {
          const result = await db.query('SELECT COUNT(*) as count FROM users WHERE company_id = $1', [company_id]);
          currentCount = result.rows[0].count;
        } else {
          const result = await db.get('SELECT COUNT(*) as count FROM users WHERE company_id = ?', [company_id]);
          currentCount = result.count;
        }
        max = limits.max_users;
        allowed = currentCount < max;
      } else if (type === 'income') {
        if (process.env.NODE_ENV === 'production') {
          const result = await db.query(`
            SELECT COUNT(*) as count FROM income 
            WHERE company_id = $1 
            AND date >= DATE_TRUNC('month', CURRENT_DATE)
          `, [company_id]);
          currentCount = result.rows[0].count;
        } else {
          const result = await db.get(`
            SELECT COUNT(*) as count FROM income 
            WHERE company_id = ? 
            AND date >= date('now', 'start of month')
          `, [company_id]);
          currentCount = result.count;
        }
        max = limits.max_income_records;
        allowed = currentCount < max;
      }
      
      res.json({
        type,
        allowed,
        current: currentCount,
        max,
        remaining: max - currentCount,
        message: allowed ? `You can add ${max - currentCount} more ${type}(s)` : `${type.charAt(0).toUpperCase() + type.slice(1)} limit reached. Maximum ${max}.`
      });
    } catch (error) {
      console.error('Error checking limit:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = SubscriptionController;