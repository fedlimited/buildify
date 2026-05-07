const { getDb } = require('../config/database');
const { sendBulkEmail } = require('../services/emailService');

const tenantsController = {
  // Get all tenants (users from all companies)
  getAllTenants: async (req, res) => {
    try {
      const db = await getDb();
      
      // Check if user is super admin
      const isSuperAdmin = req.user?.isSuperAdmin || req.user?.role === 'super_admin';
      if (!isSuperAdmin) {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      
const tenants = await db.query(`
  SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email,
    u.role,
    u.is_active,
    u.created_at as user_created_at,
    c.id as company_id,
    c.name as company_name,
    c.subdomain,
    c.phone as company_phone,
    cs.plan_type,
    cs.status as subscription_status,
    cs.current_period_end
  FROM users u
  JOIN companies c ON u.company_id = c.id
  LEFT JOIN company_subscriptions cs ON c.id = cs.company_id AND cs.status = 'active'
  WHERE u.role != 'super_admin'
  ORDER BY c.name, u.name
`);
      
      res.json({
        success: true,
        tenants: tenants.rows,
        total: tenants.rowCount
      });
      
    } catch (error) {
      console.error('Error fetching tenants:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Send bulk email to selected tenants
  sendBulkEmail: async (req, res) => {
    try {
      const db = await getDb();
      const { subject, message, tenantIds, sendToAll } = req.body;
      const masterPassword = req.body.masterPassword;
      
      // Verify master password
      if (masterPassword !== process.env.ADMIN_MASTER_PASSWORD) {
        return res.status(401).json({ error: 'Invalid master password' });
      }
      
      // Check if user is super admin
      const isSuperAdmin = req.user?.isSuperAdmin || req.user?.role === 'super_admin';
      if (!isSuperAdmin) {
        return res.status(403).json({ error: 'Super admin access required' });
      }
      
      if (!subject || !message) {
        return res.status(400).json({ error: 'Subject and message are required' });
      }
      
      // Get tenant emails
      let emails = [];
      let tenants = [];
      
      if (sendToAll) {
        const result = await db.query(`
          SELECT u.id, u.name, u.email, c.name as company_name
          FROM users u
          JOIN companies c ON u.company_id = c.id
          WHERE u.role != 'super_admin' AND u.is_active = 1
        `);
        tenants = result.rows;
        emails = result.rows.map(t => t.email);
      } else if (tenantIds && tenantIds.length > 0) {
        const placeholders = tenantIds.map((_, i) => `$${i + 1}`).join(',');
        const result = await db.query(`
          SELECT u.id, u.name, u.email, c.name as company_name
          FROM users u
          JOIN companies c ON u.company_id = c.id
          WHERE u.id IN (${placeholders})
        `, tenantIds);
        tenants = result.rows;
        emails = result.rows.map(t => t.email);
      } else {
        return res.status(400).json({ error: 'No recipients selected' });
      }
      
      if (emails.length === 0) {
        return res.status(400).json({ error: 'No valid email addresses found' });
      }
      
      // Log the bulk email attempt
      await db.query(`
        INSERT INTO admin_communications (admin_id, subject, message, recipient_count, sent_at)
        VALUES ($1, $2, $3, $4, NOW())
      `, [req.user.id, subject, message, emails.length]);
      
      // Send emails (batch process)
      const results = [];
      for (const tenant of tenants) {
        try {
          await sendBulkEmail(tenant.email, subject, message, tenant.name, tenant.company_name);
          results.push({ email: tenant.email, status: 'sent', name: tenant.name });
          console.log(`✅ Email sent to ${tenant.email}`);
        } catch (error) {
          results.push({ email: tenant.email, status: 'failed', error: error.message });
          console.error(`❌ Failed to send to ${tenant.email}:`, error.message);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const successCount = results.filter(r => r.status === 'sent').length;
      const failedCount = results.filter(r => r.status === 'failed').length;
      
      res.json({
        success: true,
        message: `Email sent to ${successCount} of ${emails.length} recipients`,
        details: {
          total: emails.length,
          sent: successCount,
          failed: failedCount,
          results: results
        }
      });
      
    } catch (error) {
      console.error('Error sending bulk email:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Get communication history
  getCommunicationHistory: async (req, res) => {
    try {
      const db = await getDb();
      
      const isSuperAdmin = req.user?.isSuperAdmin || req.user?.role === 'super_admin';
      if (!isSuperAdmin) {
        return res.status(403).json({ error: 'Super admin access required' });
      }
      
      const history = await db.query(`
        SELECT * FROM admin_communications 
        ORDER BY sent_at DESC 
        LIMIT 50
      `);
      
      res.json({
        success: true,
        communications: history.rows
      });
      
    } catch (error) {
      console.error('Error fetching communication history:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = tenantsController;