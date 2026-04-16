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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
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
  }
};

module.exports = ProjectController;