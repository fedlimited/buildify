const { getDb } = require('../config/database');

const stakeholderLimitMiddleware = async (req, res, next) => {
  try {
    const db = await getDb();
    const company_id = req.user.companyId;
    
    // Get current subscription limits
    let subscription;
    if (process.env.NODE_ENV === 'production') {
      const result = await db.query(`
        SELECT sp.max_stakeholders
        FROM company_subscriptions cs
        JOIN subscription_plans sp ON cs.plan_id = sp.id
        WHERE cs.company_id = $1 AND cs.status IN ('active', 'trial')
        LIMIT 1
      `, [company_id]);
      subscription = result.rows[0];
    } else {
      subscription = await db.get(`
        SELECT sp.max_stakeholders
        FROM company_subscriptions cs
        JOIN subscription_plans sp ON cs.plan_id = sp.id
        WHERE cs.company_id = ? AND cs.status IN ('active', 'trial')
        LIMIT 1
      `, [company_id]);
    }
    
    const maxStakeholders = subscription?.max_stakeholders || 0;
    
    // Count current active stakeholders
    let currentCount;
    if (process.env.NODE_ENV === 'production') {
      const result = await db.query(`
        SELECT COUNT(DISTINCT ps.user_id) as count 
        FROM project_stakeholders ps 
        JOIN projects p ON ps.project_id = p.id 
        WHERE p.company_id = $1 AND ps.status = 'active'
      `, [company_id]);
      currentCount = parseInt(result.rows[0].count);
    } else {
      const result = await db.get(`
        SELECT COUNT(DISTINCT ps.user_id) as count 
        FROM project_stakeholders ps 
        JOIN projects p ON ps.project_id = p.id 
        WHERE p.company_id = ? AND ps.status = 'active'
      `, [company_id]);
      currentCount = result.count;
    }
    
    // Check if limit is reached
    if (maxStakeholders !== 999999 && currentCount >= maxStakeholders) {
      let planName = '';
      if (maxStakeholders === 0) planName = 'Free';
      else if (maxStakeholders === 3) planName = 'Basic';
      else if (maxStakeholders === 15) planName = 'Pro';
      else planName = 'current';
      
      return res.status(403).json({ 
        error: 'Stakeholder limit reached',
        limit: maxStakeholders,
        current: currentCount,
        plan: planName,
        message: `Your ${planName} plan allows ${maxStakeholders === 0 ? 'no' : maxStakeholders} stakeholder${maxStakeholders === 1 ? '' : 's'}. Please upgrade to add more stakeholders.`
      });
    }
    
    next();
  } catch (error) {
    console.error('Stakeholder limit middleware error:', error);
    next(); // Allow on error to prevent blocking
  }
};

module.exports = stakeholderLimitMiddleware;