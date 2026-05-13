const { getDb } = require('../config/database');

const ProjectController = {

  getProjects: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      const projects = await db.all(
        'SELECT * FROM projects WHERE company_id = ? ORDER BY created_at DESC',
        [company_id]
      );
      
      res.json(projects);
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  getProject: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const project = await db.get(
        'SELECT * FROM projects WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  createProject: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { 
        name, client, contract_sum, location, start_date, end_date, 
        status, project_manager, description, progress,
        latitude, longitude, google_maps_url, location_address 
      } = req.body;
      
      console.log('Creating project for company:', company_id);
      
      const result = await db.run(
        `INSERT INTO projects (
          company_id, name, client, contract_sum, location,
          start_date, end_date, status, project_manager, description, progress,
          latitude, longitude, google_maps_url, location_address, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now')) RETURNING id`,
        [
          company_id, name, client, contract_sum, location,
          start_date, end_date, status, project_manager, description, progress || 0,
          latitude || null, longitude || null, google_maps_url || null, location_address || null
        ]
      );
      
      const newProject = await db.get(
        'SELECT * FROM projects WHERE id = ?',
        [result.lastID]
      );
      res.status(201).json(newProject);
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  updateProject: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      const { 
        name, client, contract_sum, location, start_date, end_date, 
        status, project_manager, description, progress,
        latitude, longitude, google_maps_url, location_address 
      } = req.body;
      
      console.log('Updating project:', { id, name, client, contract_sum });
      
      const result = await db.run(
        `UPDATE projects SET
          name = ?, client = ?, contract_sum = ?, location = ?,
          start_date = ?, end_date = ?, status = ?, project_manager = ?,
          description = ?, progress = ?, latitude = ?, longitude = ?,
          google_maps_url = ?, location_address = ?
        WHERE id = ? AND company_id = ?`,
        [
          name, client, contract_sum, location, 
          start_date, end_date, status, project_manager,
          description, progress || 0,
          latitude || null, longitude || null,
          google_maps_url || null, location_address || null,
          id, company_id
        ]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const updatedProject = await db.get(
        'SELECT * FROM projects WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      res.json(updatedProject);
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  deleteProject: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const result = await db.run(
        'DELETE FROM projects WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({ error: error.message });
    }
  },










  // Get Gantt chart data for a project (PostgreSQL version)
  getProjectGantt: async (req, res) => {
    try {
      const db = await getDb();
      const { projectId } = req.params;
      
      console.log(`Fetching Gantt data for project ${projectId}`);
      
      const tasks = await db.query(
        `SELECT 
          id, 
          name, 
          start_date as "startDate", 
          end_date as "endDate", 
          duration, 
          progress, 
          parent_id as "parentId",
          is_milestone as "isMilestone",
          status as priority,
          assigned_to_text as "assignedTo",
          cost
         FROM project_gantt_tasks 
         WHERE project_id = $1 
         ORDER BY parent_id, id`,
        [projectId]
      );
      
      // Map status to priority format
      const formattedTasks = (tasks.rows || tasks).map(task => {
        let priority = 'medium';
        if (task.priority === 'urgent') priority = 'urgent';
        else if (task.priority === 'high') priority = 'high';
        else if (task.priority === 'medium') priority = 'medium';
        else if (task.priority === 'low') priority = 'low';
        
        return {
          id: task.id,
          name: task.name,
          startDate: task.startDate,
          endDate: task.endDate,
          duration: task.duration,
          progress: Math.round((task.progress || 0) * 100),
          parentId: task.parentId === 0 ? null : task.parentId,
          priority: priority,
          isMilestone: task.isMilestone === 1,
          assignedTo: task.assignedTo || '',
          cost: task.cost || 0
        };
      });
      
      res.json({
        tasks: formattedTasks,
        dependencies: []
      });
    } catch (error) {
      console.error('Error fetching gantt data:', error);
      res.json({ tasks: [], dependencies: [] });
    }
  },



  // Save Gantt chart data for a project (PostgreSQL version - CORRECTED)
saveProjectGantt: async (req, res) => {
    // 🔒 SECURITY: Block stakeholders from saving/modifying Gantt data
    if (req.user?.role === 'stakeholder') {
      console.log('⛔ Stakeholder attempted to modify Gantt chart');
      return res.status(403).json({ 
        error: 'Stakeholders cannot modify Gantt chart data. View-only access.' 
      });
    }


    try {
      const db = await getDb();
      const { projectId } = req.params;
      const { tasks, dependencies } = req.body;

    console.log(`📊 Saving Gantt data for project ${projectId}: ${tasks?.length || 0} tasks, ${dependencies?.length || 0} dependencies`);
    console.log(`👤 User role: ${req.user?.role}, User ID: ${req.user?.id}`);
      
      
      try {
        await db.query('BEGIN');
        
        // Delete existing data for this project
        await db.query(`DELETE FROM project_gantt_tasks WHERE project_id = $1`, [projectId]);
        
        // Insert tasks
        for (const task of tasks) {
          const progressDecimal = (task.progress || 0) / 100;
          const parentId = task.parentId ? parseInt(task.parentId) : 0;
          
          // Map priority to status
          let status = 'pending';
          if (task.priority === 'urgent') status = 'urgent';
          else if (task.priority === 'high') status = 'high';
          else if (task.priority === 'medium') status = 'medium';
          else if (task.priority === 'low') status = 'low';
          
          await db.query(
            `INSERT INTO project_gantt_tasks 
             (id, project_id, name, start_date, end_date, duration, progress, parent_id, status, is_milestone, assigned_to_text, cost, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
            [
              task.id, 
              projectId, 
              task.name, 
              task.startDate, 
              task.endDate, 
              task.duration, 
              progressDecimal, 
              parentId,
              status,
              task.isMilestone ? 1 : 0,
              task.assignedTo || '',  // ← Store the name in assigned_to_text
              task.cost || 0
            ]
          );
        }
        
        await db.query('COMMIT');
        
        console.log(`✅ Gantt data saved successfully for project ${projectId}`);
        res.json({ success: true, message: 'Gantt data saved successfully' });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error saving gantt data:', error);
      res.status(500).json({ error: error.message });
  
    }
 }
};

module.exports = ProjectController;