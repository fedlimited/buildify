const { getDb } = require('../config/database');

class ActivityLogger {
  static async log({
    userId,
    companyId,
    action,
    entityType,
    entityId = null,
    entityName = null,
    details = {},
    ipAddress = null,
    userAgent = null
  }) {
    try {
      const db = await getDb();
      
      await db.query(`
        INSERT INTO user_activities (
          user_id, company_id, action, entity_type, entity_id, 
          entity_name, details, ip_address, user_agent, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      `, [
        userId, companyId, action, entityType, entityId,
        entityName, JSON.stringify(details), ipAddress, userAgent
      ]);
      
      console.log(`✅ Activity logged: ${action} - ${entityType} by user ${userId}`);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  static async getActivities({
    companyId,
    userId = null,
    action = null,
    entityType = null,
    startDate = null,
    endDate = null,
    limit = 50,
    offset = 0
  }) {
    try {
      const db = await getDb();
      let query = `
        SELECT 
          a.id,
          a.user_id,
          u.name as user_name,
          u.email as user_email,
          a.action,
          a.entity_type,
          a.entity_id,
          a.entity_name,
          a.details,
          a.ip_address,
          a.created_at
        FROM user_activities a
        JOIN users u ON a.user_id = u.id
        WHERE a.company_id = $1
      `;
      const params = [companyId];
      let paramIndex = 2;

      if (userId) {
        query += ` AND a.user_id = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      }

      if (action) {
        query += ` AND a.action = $${paramIndex}`;
        params.push(action);
        paramIndex++;
      }

      if (entityType) {
        query += ` AND a.entity_type = $${paramIndex}`;
        params.push(entityType);
        paramIndex++;
      }

      if (startDate) {
        query += ` AND a.created_at >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        query += ` AND a.created_at <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
      }

      query += ` ORDER BY a.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      
      return {
        activities: result.rows,
        total: result.rows.length,
        limit,
        offset
      };
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  static async getUserActivitySummary(companyId, days = 30) {
    try {
      const db = await getDb();
      const result = await db.query(`
        SELECT 
          u.id as user_id,
          u.name as user_name,
          u.email,
          COUNT(a.id) as total_activities,
          COUNT(CASE WHEN a.action = 'create' THEN 1 END) as creations,
          COUNT(CASE WHEN a.action = 'update' THEN 1 END) as updates,
          COUNT(CASE WHEN a.action = 'delete' THEN 1 END) as deletions,
          MAX(a.created_at) as last_active
        FROM users u
        LEFT JOIN user_activities a ON u.id = a.user_id AND a.created_at >= NOW() - INTERVAL '${days} days'
        WHERE u.company_id = $1 AND u.is_active = 1
        GROUP BY u.id, u.name, u.email
        ORDER BY total_activities DESC
      `, [companyId]);
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching user activity summary:', error);
      throw error;
    }
  }
}

module.exports = ActivityLogger;