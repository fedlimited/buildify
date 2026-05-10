const { getDb } = require('../config/database');

const projectTeamController = {
  // Get all team members for a project
  getProjectTeam: async (req, res) => {
    try {
      const db = await getDb();
      const { projectId } = req.params;
      
      const team = await db.query(`
        SELECT * FROM project_team 
        WHERE project_id = $1 AND is_active = true
        ORDER BY 
          CASE role 
            WHEN 'Project Manager' THEN 1
            WHEN 'Architect' THEN 2
            WHEN 'Structural Engineer' THEN 3
            WHEN 'Electrical Engineer' THEN 4
            WHEN 'Mechanical Engineer' THEN 5
            WHEN 'Quantity Surveyor' THEN 6
            WHEN 'Contractor' THEN 7
            ELSE 10
          END
      `, [projectId]);
      
      res.json(team.rows);
    } catch (error) {
      console.error('Error fetching project team:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Add team member to project
  addTeamMember: async (req, res) => {
    try {
      const db = await getDb();
      const { projectId } = req.params;
      const { role, name, firmName, email, phone, address } = req.body;
      const company_id = req.user?.companyId || req.user?.company_id;
      
      // Verify user has access to this project
      const project = await db.query(
        `SELECT id FROM projects WHERE id = $1 AND company_id = $2`,
        [projectId, company_id]
      );
      
      if (project.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const result = await db.query(`
        INSERT INTO project_team (project_id, role, name, firm_name, email, phone, address)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
      `, [projectId, role, name, firmName, email, phone, address]);
      
      res.json({ success: true, id: result.rows[0].id, message: 'Team member added successfully' });
    } catch (error) {
      console.error('Error adding team member:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Update team member
  updateTeamMember: async (req, res) => {
    try {
      const db = await getDb();
      const { projectId, teamId } = req.params;
      const { role, name, firmName, email, phone, address } = req.body;
      
      await db.query(`
        UPDATE project_team 
        SET role = $1, name = $2, firm_name = $3, email = $4, phone = $5, address = $6, updated_at = NOW()
        WHERE id = $7 AND project_id = $8
      `, [role, name, firmName, email, phone, address, teamId, projectId]);
      
      res.json({ success: true, message: 'Team member updated successfully' });
    } catch (error) {
      console.error('Error updating team member:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Delete team member
  deleteTeamMember: async (req, res) => {
    try {
      const db = await getDb();
      const { projectId, teamId } = req.params;
      
      await db.query(`DELETE FROM project_team WHERE id = $1 AND project_id = $2`, [teamId, projectId]);
      
      res.json({ success: true, message: 'Team member removed successfully' });
    } catch (error) {
      console.error('Error deleting team member:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = projectTeamController;