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
      
      // Parse counts as integers
      const parsed = companies.map(c => ({
        ...c,
        user_count: parseInt(c.user_count) || 0,
        project_count: parseInt(c.project_count) || 0
      }));
      
      res.json(parsed);
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
         cs.id as subscription_id,
         cs.plan_id,
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
      
      // Parse counts as integers
      res.json({
        ...company,
        user_count: parseInt(company.user_count) || 0,
        project_count: parseInt(company.project_count) || 0
      });
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
      
      // Parse all values as proper numbers
      res.json({
        total_companies: parseInt(stats.total_companies) || 0,
        total_users: parseInt(stats.total_users) || 0,
        total_projects: parseInt(stats.total_projects) || 0,
        active_subscriptions: parseInt(stats.active_subscriptions) || 0,
        trial_subscriptions: parseInt(stats.trial_subscriptions) || 0,
        total_revenue_usd: parseFloat(stats.total_revenue_usd) || 0
      });
    } catch (error) {
      console.error('Get system stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update company subscription plan (Super Admin only)
  static async updateCompanySubscription(req, res) {
    try {
      const db = getDb();
      const { companyId } = req.params;
      const { planId, status, startDate, endDate } = req.body;

      // Validate the plan exists
      const plan = await db.get('SELECT * FROM subscription_plans WHERE id = ?', [planId]);
      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      // Validate the company exists
      const company = await db.get('SELECT * FROM companies WHERE id = ?', [companyId]);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Check if company already has a subscription
      const existingSub = await db.get(
        'SELECT * FROM company_subscriptions WHERE company_id = ?',
        [companyId]
      );

      if (existingSub) {
        // Update existing subscription
        await db.run(
          `UPDATE company_subscriptions 
           SET plan_id = ?, 
               status = ?, 
               start_date = ?,
               end_date = ?,
               updated_at = CURRENT_TIMESTAMP 
           WHERE company_id = ?`,
          [planId, status || 'active', startDate || new Date().toISOString().split('T')[0], endDate || null, companyId]
        );
        console.log(`📝 Updated subscription for company ${companyId} to plan ${plan.name} (${status || 'active'})`);
      } else {
        // Create new subscription
        await db.run(
          `INSERT INTO company_subscriptions 
           (company_id, plan_id, status, start_date, end_date, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [companyId, planId, status || 'active', startDate || new Date().toISOString().split('T')[0], endDate || null]
        );
        console.log(`📝 Created new subscription for company ${companyId} with plan ${plan.name} (${status || 'active'})`);
      }

      res.json({
        success: true,
        message: `Company ${company.name} subscription updated to ${plan.name}`,
        plan: plan.name,
        status: status || 'active'
      });

    } catch (error) {
      console.error('Update company subscription error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


// Get all testimonials (pending and approved)
static async getAllTestimonials(req, res) {
  try {
    const db = getDb();
    const testimonials = await db.all(
      'SELECT * FROM testimonials ORDER BY created_at DESC'
    );
    res.json(testimonials);
  } catch (error) {
    console.error('Get all testimonials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Approve or reject a testimonial
static async approveTestimonial(req, res) {
  try {
    const db = getDb();
    const { id } = req.params;
    const { is_approved } = req.body;
    
    await db.run(
      'UPDATE testimonials SET is_approved = ? WHERE id = ?',
      [is_approved ? 1 : 0, id]
    );
    
    res.json({ success: true, message: is_approved ? 'Testimonial approved' : 'Testimonial rejected' });
  } catch (error) {
    console.error('Approve testimonial error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Delete a testimonial
static async deleteTestimonial(req, res) {
  try {
    const db = getDb();
    const { id } = req.params;
    
    await db.run('DELETE FROM testimonials WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


}

module.exports = SuperAdminController;