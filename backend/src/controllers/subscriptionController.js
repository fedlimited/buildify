const { getDb } = require('../config/database');
const LimitChecker = require('../services/limitChecker');

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

  // Get company's current subscription with trial auto-downgrade
  getCurrentSubscription: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user.companyId;
      
      let result;
      if (process.env.NODE_ENV === 'production') {
        result = await db.query(`
          SELECT cs.*, sp.name as plan_name, sp.display_name, sp.price_monthly_usd, 
                 sp.price_monthly_kes, sp.price_yearly_kes,
                 sp.max_projects, sp.max_workers, sp.max_users, sp.max_income_records, sp.features
          FROM company_subscriptions cs
          JOIN subscription_plans sp ON cs.plan_id = sp.id
          WHERE cs.company_id = $1 AND cs.status IN ('active', 'trial')
          ORDER BY cs.created_at DESC LIMIT 1
        `, [company_id]);
      } else {
        result = await db.get(`
          SELECT cs.*, sp.name as plan_name, sp.display_name, sp.price_monthly_usd,
                 sp.price_monthly_kes, sp.price_yearly_kes,
                 sp.max_projects, sp.max_workers, sp.max_users, sp.max_income_records, sp.features
          FROM company_subscriptions cs
          JOIN subscription_plans sp ON cs.plan_id = sp.id
          WHERE cs.company_id = ? AND cs.status IN ('active', 'trial')
          ORDER BY cs.created_at DESC LIMIT 1
        `, [company_id]);
      }
      
      let subscription = process.env.NODE_ENV === 'production' ? result.rows[0] : result;
      
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
      
      // Check if trial has expired and auto-downgrade
      if (subscription.status === 'trial' && subscription.trial_end_date) {
        const today = new Date();
        const trialEnd = new Date(subscription.trial_end_date);
        const daysRemaining = Math.ceil((trialEnd - today) / (1000 * 60 * 60 * 24));
        
        if (daysRemaining <= 0) {
          console.log(`Trial expired for company ${company_id}, downgrading to Free plan...`);
          
          // Get free plan ID
          let freePlan;
          if (process.env.NODE_ENV === 'production') {
            const freeResult = await db.query("SELECT id, * FROM subscription_plans WHERE name = 'free'");
            freePlan = freeResult.rows[0];
          } else {
            freePlan = await db.get("SELECT id, * FROM subscription_plans WHERE name = 'free'");
          }
          
          // Get current counts before downgrade and archive excess if needed
          const currentLimits = await LimitChecker.checkAllLimits(company_id, subscription);
          
          // If over project limits, archive excess projects
          if (currentLimits.projects.isOverLimit && freePlan.max_projects < 999999) {
            const excessCount = currentLimits.projects.current - freePlan.max_projects;
            if (excessCount > 0) {
              if (process.env.NODE_ENV === 'production') {
                await db.query(`
                  UPDATE projects 
                  SET status = 'Archived', is_active = false 
                  WHERE company_id = $1 AND status != 'Archived'
                  ORDER BY created_at DESC
                  LIMIT $2
                `, [company_id, excessCount]);
              } else {
                await db.run(`
                  UPDATE projects 
                  SET status = 'Archived', is_active = 0 
                  WHERE company_id = ? AND status != 'Archived'
                  ORDER BY created_at DESC
                  LIMIT ?
                `, [company_id, excessCount]);
              }
              console.log(`Archived ${excessCount} projects due to Free plan limit`);
            }
          }
          
          // If over worker limits, deactivate excess workers
          if (currentLimits.workers.isOverLimit && freePlan.max_workers < 999999) {
            const excessCount = currentLimits.workers.current - freePlan.max_workers;
            if (excessCount > 0) {
              if (process.env.NODE_ENV === 'production') {
                await db.query(`
                  UPDATE workers 
                  SET is_active = false 
                  WHERE company_id = $1 AND is_active = true
                  ORDER BY id DESC
                  LIMIT $2
                `, [company_id, excessCount]);
              } else {
                await db.run(`
                  UPDATE workers 
                  SET is_active = 0 
                  WHERE company_id = ? AND is_active = 1
                  ORDER BY id DESC
                  LIMIT ?
                `, [company_id, excessCount]);
              }
              console.log(`Deactivated ${excessCount} workers due to Free plan limit`);
            }
          }
          
          // Mark current subscription as expired
          if (process.env.NODE_ENV === 'production') {
            await db.query(`
              UPDATE company_subscriptions 
              SET status = 'expired', updated_at = CURRENT_TIMESTAMP 
              WHERE id = $1
            `, [subscription.id]);
          } else {
            await db.run(`
              UPDATE company_subscriptions 
              SET status = 'expired', updated_at = CURRENT_TIMESTAMP 
              WHERE id = ?
            `, [subscription.id]);
          }
          
          // Create new free subscription
          const startDate = new Date();
          const endDate = new Date();
          endDate.setFullYear(endDate.getFullYear() + 100); // Effectively never expires
          
          if (process.env.NODE_ENV === 'production') {
            await db.query(`
              INSERT INTO company_subscriptions 
              (company_id, plan_id, status, start_date, end_date, created_at, updated_at)
              VALUES ($1, $2, 'active', $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [company_id, freePlan.id, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);
          } else {
            await db.run(`
              INSERT INTO company_subscriptions 
              (company_id, plan_id, status, start_date, end_date, created_at, updated_at)
              VALUES (?, ?, 'active', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [company_id, freePlan.id, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);
          }
          
          // Return free plan
          return res.json({ ...freePlan, is_default: true });
        }
        
        subscription.trial_days_remaining = daysRemaining;
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
          const result = await db.query('SELECT COUNT(*) as count FROM projects WHERE company_id = $1 AND status != "Archived"', [company_id]);
          currentCount = result.rows[0].count;
        } else {
          const result = await db.get('SELECT COUNT(*) as count FROM projects WHERE company_id = ? AND status != "Archived"', [company_id]);
          currentCount = result.count;
        }
        max = limits.max_projects;
        allowed = currentCount < max;
      } else if (type === 'worker') {
        if (process.env.NODE_ENV === 'production') {
          const result = await db.query('SELECT COUNT(*) as count FROM workers WHERE company_id = $1 AND is_active = true', [company_id]);
          currentCount = result.rows[0].count;
        } else {
          const result = await db.get('SELECT COUNT(*) as count FROM workers WHERE company_id = ? AND is_active = 1', [company_id]);
          currentCount = result.count;
        }
        max = limits.max_workers;
        allowed = currentCount < max;
      } else if (type === 'user') {
        if (process.env.NODE_ENV === 'production') {
          const result = await db.query('SELECT COUNT(*) as count FROM users WHERE company_id = $1 AND role != "admin"', [company_id]);
          currentCount = result.rows[0].count;
        } else {
          const result = await db.get('SELECT COUNT(*) as count FROM users WHERE company_id = ? AND role != "admin"', [company_id]);
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
        max: max === 999999 ? 'Unlimited' : max,
        remaining: max === 999999 ? 'Unlimited' : max - currentCount,
        message: allowed ? `You can add ${max === 999999 ? 'unlimited' : max - currentCount} more ${type}(s)` : `${type.charAt(0).toUpperCase() + type.slice(1)} limit reached. Maximum ${max === 999999 ? 'unlimited' : max}.`,
        isOverLimit: currentCount > max && max !== 999999
      });
    } catch (error) {
      console.error('Error checking limit:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Check if company can downgrade to a target plan
  canDowngrade: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user.companyId;
      const { targetPlanId } = req.body;
      
      if (!targetPlanId) {
        return res.status(400).json({ error: 'targetPlanId is required' });
      }
      
      // Get current subscription with limits
      let currentSub;
      if (process.env.NODE_ENV === 'production') {
        const result = await db.query(`
          SELECT cs.*, sp.max_projects, sp.max_workers, sp.max_users
          FROM company_subscriptions cs
          JOIN subscription_plans sp ON cs.plan_id = sp.id
          WHERE cs.company_id = $1 AND cs.status IN ('active', 'trial')
          LIMIT 1
        `, [company_id]);
        currentSub = result.rows[0];
      } else {
        currentSub = await db.get(`
          SELECT cs.*, sp.max_projects, sp.max_workers, sp.max_users
          FROM company_subscriptions cs
          JOIN subscription_plans sp ON cs.plan_id = sp.id
          WHERE cs.company_id = ? AND cs.status IN ('active', 'trial')
          LIMIT 1
        `, [company_id]);
      }
      
      if (!currentSub) {
        return res.status(404).json({ error: 'No active subscription found' });
      }
      
      // Get target plan
      let targetPlan;
      if (process.env.NODE_ENV === 'production') {
        const result = await db.query('SELECT * FROM subscription_plans WHERE id = $1', [targetPlanId]);
        targetPlan = result.rows[0];
      } else {
        targetPlan = await db.get('SELECT * FROM subscription_plans WHERE id = ?', [targetPlanId]);
      }
      
      if (!targetPlan) {
        return res.status(404).json({ error: 'Plan not found' });
      }
      
      // Get current counts
      const limits = await LimitChecker.checkAllLimits(company_id, currentSub);
      const downgradeCheck = LimitChecker.canDowngradeToPlan(limits, targetPlan);
      
      res.json(downgradeCheck);
    } catch (error) {
      console.error('Error checking downgrade:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all limits for current company
  getLimits: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user.companyId;
      
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
      
      if (!subscription) {
        return res.status(404).json({ error: 'No active subscription found' });
      }
      
      const limits = await LimitChecker.checkAllLimits(company_id, subscription);
      res.json(limits);
    } catch (error) {
      console.error('Error getting limits:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = SubscriptionController;