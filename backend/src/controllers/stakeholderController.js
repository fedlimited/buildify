const { getDb } = require('../config/database');
const { sendStakeholderInvitation } = require('../services/emailService');
const bcrypt = require('bcryptjs');

const stakeholderController = {
  // Get all stakeholders for a project
  getProjectStakeholders: async (req, res) => {
    try {
      const db = await getDb();
      const { projectId } = req.params;
      const company_id = req.user?.companyId || req.user?.company_id;
      
      const stakeholders = await db.query(`
        SELECT 
          ps.id,
          ps.user_id,
          ps.stakeholder_type,
          ps.invite_status,
          ps.invited_at,
          ps.is_active,
          u.name,
          u.email
        FROM project_stakeholders ps
        JOIN users u ON ps.user_id = u.id
        WHERE ps.project_id = $1 AND u.company_id = $2
        ORDER BY ps.invited_at DESC
      `, [projectId, company_id]);
      
      res.json(stakeholders.rows);
    } catch (error) {
      console.error('Error fetching stakeholders:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Invite stakeholder to project
  inviteStakeholder: async (req, res) => {
    try {
      const db = await getDb();
      const { projectId } = req.params;
      const { email, name, stakeholderType } = req.body;
      const company_id = req.user?.companyId || req.user?.company_id;
      
      // Get company subdomain from authenticated user
      const companySubdomain = req.user?.companySubdomain || req.user?.subdomain || 'app';
      
      // 🔥 FIX: Get company name from company_settings table
      let companyName = 'BOCHI Construction Suite'; // Default fallback
      
      if (company_id) {
        const companyResult = await db.query(
          `SELECT name FROM company_settings WHERE company_id = $1`,
          [company_id]
        );
        
        if (companyResult.rows[0] && companyResult.rows[0].name) {
          companyName = companyResult.rows[0].name;
          console.log(`✅ Company name found: ${companyName} for company_id: ${company_id}`);
        } else {
          console.log(`⚠️ No company settings found for company_id: ${company_id}, using default`);
        }
      }
      
      // Generate temporary password (stored in DB but NOT sent in email)
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      
      // Check if user already exists
      let user = await db.query(
        `SELECT id FROM users WHERE email = $1 AND company_id = $2`,
        [email, company_id]
      );
      
      let userId;
      
      if (user.rows.length === 0) {
        // Create new user
        const newUser = await db.query(`
          INSERT INTO users (name, email, password, role, stakeholder_type, temporary_password, password_changed, company_id, is_active)
          VALUES ($1, $2, $3, 'stakeholder', $4, $5, false, $6, 1) RETURNING id
        `, [name, email, hashedPassword, stakeholderType, tempPassword, company_id]);
        userId = newUser.rows[0].id;
      } else {
        userId = user.rows[0].id;
        // Update stakeholder type if needed
        await db.query(`UPDATE users SET stakeholder_type = $1 WHERE id = $2`, [stakeholderType, userId]);
      }
      
      // Add to project stakeholders
      await db.query(`
        INSERT INTO project_stakeholders (project_id, user_id, stakeholder_type, invite_status, invited_by)
        VALUES ($1, $2, $3, 'pending', $4)
        ON CONFLICT (project_id, user_id) DO NOTHING
      `, [projectId, userId, stakeholderType, req.user.id]);
      
      // Get project details for email
      const project = await db.query(`SELECT name FROM projects WHERE id = $1`, [projectId]);
      
      // Send invitation email - 7 parameters (NO tempPassword)
      await sendStakeholderInvitation(
        email,                    // email
        name,                     // name
        project.rows[0].name,     // projectName
        stakeholderType,          // role
        req.user.name,            // inviterName
        companySubdomain,         // subdomain
        companyName               // companyName - Now correctly "Finite Element Designs Limited"
      );
      
      res.json({ success: true, message: 'Invitation sent successfully' });
    } catch (error) {
      console.error('Error inviting stakeholder:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Resend invitation to stakeholder
  resendInvitation: async (req, res) => {
    try {
      const db = await getDb();
      const { projectId } = req.params;
      const { email, name } = req.body;
      
      // Get company subdomain from authenticated user
      const companySubdomain = req.user?.companySubdomain || req.user?.subdomain || 'app';
      const company_id = req.user?.companyId || req.user?.company_id;
      
      // 🔥 FIX: Get company name from company_settings table
      let companyName = 'BOCHI Construction Suite';
      
      if (company_id) {
        const companyResult = await db.query(
          `SELECT name FROM company_settings WHERE company_id = $1`,
          [company_id]
        );
        
        if (companyResult.rows[0] && companyResult.rows[0].name) {
          companyName = companyResult.rows[0].name;
        }
      }
      
      // Generate new temporary password (stored in DB but NOT sent in email)
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      
      // Update user password
      await db.query(`
        UPDATE users 
        SET password = $1, temporary_password = $2, password_changed = false 
        WHERE email = $3
      `, [hashedPassword, tempPassword, email]);
      
      // Get project details
      const project = await db.query(`SELECT name FROM projects WHERE id = $1`, [projectId]);
      
      // Get stakeholder type
      const stakeholder = await db.query(`
        SELECT ps.stakeholder_type 
        FROM project_stakeholders ps
        JOIN users u ON ps.user_id = u.id
        WHERE ps.project_id = $1 AND u.email = $2
      `, [projectId, email]);
      
      const stakeholderType = stakeholder.rows[0]?.stakeholder_type || 'consultant';
      
      // Send invitation email - 7 parameters (NO tempPassword)
      await sendStakeholderInvitation(
        email,
        name,
        project.rows[0].name,
        stakeholderType,
        req.user.name,
        companySubdomain,
        companyName
      );
      
      res.json({ success: true, message: 'Invitation resent successfully' });
    } catch (error) {
      console.error('Error resending invitation:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Remove stakeholder from project
  removeStakeholder: async (req, res) => {
    try {
      const db = await getDb();
      const { projectId, stakeholderId } = req.params;
      
      await db.query(`DELETE FROM project_stakeholders WHERE project_id = $1 AND id = $2`, [projectId, stakeholderId]);
      
      res.json({ success: true, message: 'Stakeholder removed successfully' });
    } catch (error) {
      console.error('Error removing stakeholder:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get projects for stakeholder dashboard
  getStakeholderProjects: async (req, res) => {
    try {
      const db = await getDb();
      const userId = req.user.id;

      const projects = await db.query(`
        SELECT 
          p.id,
          p.name,
          p.client,
          p.location,
          p.progress,
          p.status,
          ps.stakeholder_type,
          ps.invite_status
        FROM project_stakeholders ps
        JOIN projects p ON ps.project_id = p.id
        WHERE ps.user_id = $1 AND ps.is_active = 1
      `, [userId]);

      res.json({ projects: projects.rows });
    } catch (error) {
      console.error('Error fetching stakeholder projects:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get a single project (with access verification)
  getStakeholderProject: async (req, res) => {
    try {
      const db = await getDb();
      const { projectId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // First, check if user has access
      let hasAccess = false;
      
      if (userRole === 'admin' || userRole === 'super_admin') {
        hasAccess = true;
      } else if (userRole === 'stakeholder') {
        const accessCheck = await db.query(`
          SELECT 1 FROM project_stakeholders 
          WHERE user_id = $1 AND project_id = $2 AND is_active = 1
        `, [userId, projectId]);
        hasAccess = accessCheck.rows.length > 0;
      }
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'You do not have access to this project' });
      }
      
      // Get project details
      const project = await db.query(`
        SELECT 
          p.id,
          p.name,
          p.client,
          p.location,
          p.description,
          p.progress,
          p.status,
          p.start_date as "startDate",
          p.end_date as "endDate",
          ps.stakeholder_type
        FROM projects p
        LEFT JOIN project_stakeholders ps ON p.id = ps.project_id AND ps.user_id = $1
        WHERE p.id = $2
      `, [userId, projectId]);
      
      if (project.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      res.json(project.rows[0]);
      
    } catch (error) {
      console.error('Error fetching stakeholder project:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Accept invitation
  acceptInvitation: async (req, res) => {
    try {
      const db = await getDb();
      const { projectId } = req.params;
      const userId = req.user.id;
      
      await db.query(`
        UPDATE project_stakeholders 
        SET invite_status = 'accepted', last_active = NOW()
        WHERE project_id = $1 AND user_id = $2
      `, [projectId, userId]);
      
      res.json({ success: true, message: 'Invitation accepted' });
    } catch (error) {
      console.error('Error accepting invitation:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get financial summary for stakeholder
  getFinancialSummary: async (req, res) => {
    try {
      const db = await getDb();
      const { projectId } = req.params;
      
      // Get contract sum from project
      const project = await db.query(
        `SELECT contract_sum FROM projects WHERE id = $1`,
        [projectId]
      );
      
      // Get total invoiced and paid from income table
      const financial = await db.query(`
        SELECT 
          COALESCE(SUM(gross_amount), 0) as total_invoiced,
          COALESCE(SUM(amount_received), 0) as total_paid
        FROM income
        WHERE project_id = $1
      `, [projectId]);
      
      const contractSum = project.rows[0]?.contract_sum || 0;
      const totalInvoiced = financial.rows[0]?.total_invoiced || 0;
      const totalPaid = financial.rows[0]?.total_paid || 0;
      const outstanding = totalInvoiced - totalPaid;
      
      res.json({
        contractSum,
        totalInvoiced,
        totalPaid,
        outstanding
      });
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get site diaries for stakeholder
  getSiteDiaries: async (req, res) => {
    try {
      const db = await getDb();
      const { projectId } = req.params;
      
      const diaries = await db.query(`
        SELECT id, date, summary, weather, total_workers as workers_count
        FROM site_diary_entries
        WHERE project_id = $1
        ORDER BY date DESC
        LIMIT 10
      `, [projectId]);
      
      res.json(diaries.rows);
    } catch (error) {
      console.error('Error fetching site diaries:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get meetings for a project (stakeholder view)
  getProjectMeetings: async (req, res) => {
    try {
      const db = getDb();
      const { projectId } = req.params;
      
      const result = await db.query(
        `SELECT id, title, meeting_date, location, meeting_type, status, created_at
         FROM project_minutes 
         WHERE project_id = $1 
         ORDER BY meeting_date DESC`,
        [projectId]
      );
      
      res.json(result.rows);
    } catch (error) {
      console.error('Get meetings error:', error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = stakeholderController;