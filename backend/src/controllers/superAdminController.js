const { getDb } = require('../config/database');
const bcrypt = require('bcryptjs');

class SuperAdminController {
  
  // Get all companies (across entire system)
  static async getAllCompanies(req, res) {
    try {
      const db = getDb();
      const companies = await db.all(
        `SELECT c.*, 
         (SELECT COUNT(*) FROM users WHERE company_id = c.id) as user_count,
         (SELECT COUNT(*) FROM projects WHERE company_id = c.id) as project_count,
         cs.status as subscription_status,
         sp.name as plan_name
         FROM companies c
         LEFT JOIN company_subscriptions cs ON c.id = cs.company_id
         LEFT JOIN subscription_plans sp ON cs.plan_id = sp.id
         ORDER BY c.created_at DESC`
      );
      res.json(companies);
    } catch (error) {
      console.error('Get all companies error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get single company details
  static async getCompanyDetails(req, res) {
    try {
      const db = getDb();
      const { companyId } = req.params;
      
      const company = await db.get(
        `SELECT c.*, 
         (SELECT COUNT(*) FROM users WHERE company_id = c.id) as user_count,
         (SELECT COUNT(*) FROM projects WHERE company_id = c.id) as project_count,
         cs.status as subscription_status,
         cs.start_date,
         cs.end_date,
         cs.trial_end_date,
         sp.name as plan_name,
         sp.display_name as plan_display_name
         FROM companies c
         LEFT JOIN company_subscriptions cs ON c.id = cs.company_id
         LEFT JOIN subscription_plans sp ON cs.plan_id = sp.id
         WHERE c.id = ?`,
        [companyId]
      );
      
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
      
      res.json(company);
    } catch (error) {
      console.error('Get company details error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all users across all companies
  static async getAllUsers(req, res) {
    try {
      const db = getDb();
      const users = await db.all(
        `SELECT u.*, c.name as company_name, c.subdomain
         FROM users u
         JOIN companies c ON u.company_id = c.id
         ORDER BY u.created_at DESC`
      );
      res.json(users);
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all subscriptions
  static async getAllSubscriptions(req, res) {
    try {
      const db = getDb();
      const subscriptions = await db.all(
        `SELECT cs.*, 
         c.name as company_name, 
         c.subdomain,
         sp.name as plan_name,
         sp.display_name as plan_display_name
         FROM company_subscriptions cs
         JOIN companies c ON cs.company_id = c.id
         JOIN subscription_plans sp ON cs.plan_id = sp.id
         ORDER BY cs.created_at DESC`
      );
      res.json(subscriptions);
    } catch (error) {
      console.error('Get all subscriptions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all payments
  static async getAllPayments(req, res) {
    try {
      const db = getDb();
      const payments = await db.all(
        `SELECT sp.*, 
         c.name as company_name, 
         c.subdomain
         FROM subscription_payments sp
         JOIN companies c ON sp.company_id = c.id
         ORDER BY sp.created_at DESC`
      );
      res.json(payments);
    } catch (error) {
      console.error('Get all payments error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Toggle super admin status for a user
  static async toggleSuperAdmin(req, res) {
    try {
      const db = getDb();
      const { userId } = req.params;
      const { isSuperAdmin } = req.body;
      
      // Prevent removing your own super admin status
      if (userId == req.user.id && !isSuperAdmin) {
        return res.status(400).json({ error: 'You cannot remove your own super admin privileges' });
      }
      
      await db.run(
        'UPDATE users SET is_super_admin = ? WHERE id = ?',
        [isSuperAdmin ? 1 : 0, userId]
      );
      
      res.json({ success: true, userId, isSuperAdmin });
    } catch (error) {
      console.error('Toggle super admin error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get system statistics
  static async getSystemStats(req, res) {
    try {
      const db = getDb();
      
      const stats = await db.get(
        `SELECT 
         (SELECT COUNT(*) FROM companies) as total_companies,
         (SELECT COUNT(*) FROM users) as total_users,
         (SELECT COUNT(*) FROM projects) as total_projects,
         (SELECT COUNT(*) FROM company_subscriptions WHERE status = 'active') as active_subscriptions,
         (SELECT COUNT(*) FROM company_subscriptions WHERE status = 'trial') as trial_subscriptions,
         (SELECT SUM(amount_usd) FROM subscription_payments WHERE status = 'completed') as total_revenue_usd
        `
      );
      
      res.json(stats);
    } catch (error) {
      console.error('Get system stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = SuperAdminController;