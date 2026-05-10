const { getDb } = require('../config/database');

const projectTeamController = {
  // Get all team members for a project (from accepted stakeholders)
  getProjectTeam: async (req, res) => {
    try {
      const db = await getDb();
      const { projectId } = req.params;
      
      const team = await db.query(`
        SELECT 
          ps.id,
          ps.user_id,
          ps.stakeholder_type as role,
          u.name,
          NULL as firm_name,
          u.email,
          NULL as phone,
          NULL as address,
          ps.invite_status,
          ps.is_active
        FROM project_stakeholders ps
        JOIN users u ON ps.user_id = u.id
        WHERE ps.project_id = $1 
          AND ps.invite_status = 'accepted'
          AND ps.is_active = 1
        ORDER BY 
          CASE ps.stakeholder_type 
            WHEN 'project_manager' THEN 1
            WHEN 'architect' THEN 2
            WHEN 'structural_engineer' THEN 3
            WHEN 'electrical_engineer' THEN 4
            WHEN 'mechanical_engineer' THEN 5
            WHEN 'quantity_surveyor' THEN 6
            WHEN 'contractor' THEN 7
            WHEN 'client' THEN 8
            ELSE 10
          END,
          u.name
      `, [projectId]);
      
      res.json(team.rows);
    } catch (error) {
      console.error('Error fetching project team:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Add team member (this should be replaced by inviteStakeholder in stakeholderController)
  // Keeping for API compatibility but redirecting to stakeholder invite
  addTeamMember: async (req, res) => {
    try {
      const db = await getDb();
      const { projectId } = req.params;
      const { role, name, email } = req.body;
      const company_id = req.user?.companyId || req.user?.company_id;
      
      // First, check if user exists
      let user = await db.query(
        `SELECT id FROM users WHERE email = $1 AND company_id = $2`,
        [email, company_id]
      );
      
      let userId;
      const tempPassword = Math.random().toString(36).slice(-8);
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      
      if (user.rows.length === 0) {
        const newUser = await db.query(`
          INSERT INTO users (name, email, password, role, stakeholder_type, temporary_password, password_changed, company_id, is_active)
          VALUES ($1, $2, $3, 'stakeholder', $4, $5, false, $6, 1) RETURNING id
        `, [name, email, hashedPassword, role, tempPassword, company_id]);
        userId = newUser.rows[0].id;
      } else {
        userId = user.rows[0].id;
      }
      
      // Add to project stakeholders
      await db.query(`
        INSERT INTO project_stakeholders (project_id, user_id, stakeholder_type, invite_status, invited_by)
        VALUES ($1, $2, $3, 'accepted', $4)
        ON CONFLICT (project_id, user_id) DO UPDATE SET 
          stakeholder_type = EXCLUDED.stakeholder_type,
          invite_status = 'accepted'
      `, [projectId, userId, role, req.user.id]);
      
      res.json({ success: true, message: 'Team member added successfully' });
    } catch (error) {
      console.error('Error adding team member:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Update team member (update stakeholder_type)
  updateTeamMember: async (req, res) => {
    try {
      const db = await getDb();
      const { projectId, teamId } = req.params;
      const { role } = req.body;
      
      await db.query(`
        UPDATE project_stakeholders 
        SET stakeholder_type = $1, updated_at = NOW()
        WHERE id = $2 AND project_id = $3
      `, [role, teamId, projectId]);
      
      res.json({ success: true, message: 'Team member updated successfully' });
    } catch (error) {
      console.error('Error updating team member:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Delete team member (soft delete from project_stakeholders)
  deleteTeamMember: async (req, res) => {
    try {
      const db = await getDb();
      const { projectId, teamId } = req.params;
      
      await db.query(`
        UPDATE project_stakeholders 
        SET is_active = false 
        WHERE id = $1 AND project_id = $2
      `, [teamId, projectId]);
      
      res.json({ success: true, message: 'Team member removed successfully' });
    } catch (error) {
      console.error('Error deleting team member:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = projectTeamController;