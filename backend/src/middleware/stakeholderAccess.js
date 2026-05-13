const { getDb } = require('../config/database');

// Middleware to check if stakeholder has access to a specific project
async function requireStakeholderAccess(req, res, next) {
  try {
    const db = await getDb();
    const userId = req.user.id;
    const userRole = req.user.role;
    const { projectId } = req.params;
    
    // Super admins and contractors have full access
    if (userRole === 'admin' || userRole === 'super_admin') {
      return next();
    }
    
    // Stakeholders must be explicitly added to the project
    if (userRole === 'stakeholder') {
      const hasAccess = await db.query(`
        SELECT 1 FROM project_stakeholders 
        WHERE user_id = $1 AND project_id = $2 AND is_active = 1
      `, [userId, projectId]);
      
      if (hasAccess.rows.length === 0) {
        return res.status(403).json({ 
          error: 'Access denied. You have not been invited to this project.' 
        });
      }
      
      return next();
    }
    
    return res.status(403).json({ error: 'Access denied' });
    
  } catch (error) {
    console.error('Stakeholder access error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { requireStakeholderAccess };