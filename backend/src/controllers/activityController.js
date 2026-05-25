const ActivityLogger = require('../services/activityLogger');

const activityController = {
  // Get all activities for the company
  getActivities: async (req, res) => {
    try {
      const companyId = req.user?.companyId || req.user?.company_id;
      const {
        userId,
        action,
        entityType,
        startDate,
        endDate,
        limit = 50,
        offset = 0
      } = req.query;
      
      const result = await ActivityLogger.getActivities({
        companyId,
        userId: userId ? parseInt(userId) : null,
        action,
        entityType,
        startDate,
        endDate,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Get activity summary by user
  getUserActivitySummary: async (req, res) => {
    try {
      const companyId = req.user?.companyId || req.user?.company_id;
      const days = req.query.days ? parseInt(req.query.days) : 30;
      
      const summary = await ActivityLogger.getUserActivitySummary(companyId, days);
      res.json({ summary, days });
    } catch (error) {
      console.error('Error fetching user activity summary:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Get activity types for filter dropdowns
  getActivityTypes: async (req, res) => {
    try {
      const companyId = req.user?.companyId || req.user?.company_id;
      const db = require('../config/database').getDb;
      const connection = await db();
      
      const actions = await connection.query(`
        SELECT DISTINCT action FROM user_activities 
        WHERE company_id = $1 ORDER BY action
      `, [companyId]);
      
      const entityTypes = await connection.query(`
        SELECT DISTINCT entity_type FROM user_activities 
        WHERE company_id = $1 ORDER BY entity_type
      `, [companyId]);
      
      res.json({
        actions: actions.rows.map(r => r.action),
        entityTypes: entityTypes.rows.map(r => r.entity_type)
      });
    } catch (error) {
      console.error('Error fetching activity types:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = activityController;