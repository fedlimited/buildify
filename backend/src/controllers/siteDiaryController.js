const { getDb } = require('../config/database');

const siteDiaryController = {
  // Get all site diary entries for the company
  getEntries: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id || 1;
      
      console.log('Fetching site diary entries for company:', company_id);
      
      const entries = await db.all(
        'SELECT * FROM site_diary_entries WHERE company_id = ? ORDER BY date DESC',
        [company_id]
      );
      
      // Parse JSON fields safely
      const parsedEntries = entries.map(entry => ({
        id: entry.id,
        date: entry.date,
        projectId: entry.project_id,
        projectName: entry.project_name,
        weather: entry.weather ? (typeof entry.weather === 'string' ? JSON.parse(entry.weather) : entry.weather) : { condition: 'sunny', temp: 28 },
        totalWorkers: entry.total_workers || 0,
        activities: entry.activities ? (typeof entry.activities === 'string' ? JSON.parse(entry.activities) : entry.activities) : [],
        deliveries: entry.deliveries ? (typeof entry.deliveries === 'string' ? JSON.parse(entry.deliveries) : entry.deliveries) : [],
        incidents: entry.incidents ? (typeof entry.incidents === 'string' ? JSON.parse(entry.incidents) : entry.incidents) : [],
        siteWorkers: [],
        siteSubcontractors: [],
        summary: entry.summary ? (typeof entry.summary === 'string' ? JSON.parse(entry.summary) : entry.summary) : {},
        status: entry.status || 'Draft',
        createdAt: entry.created_at
      }));
      
      res.json(parsedEntries);
    } catch (error) {
      console.error('Error in getEntries:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Create a new site diary entry
  createEntry: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id || 1;
      
      console.log('Request body:', req.body);
      
      const {
        date,
        project_id,
        project_name,
        weather,
        total_workers,
        activities,
        deliveries,
        incidents,
        summary,
        status
      } = req.body;
      
      const result = await db.run(
        `INSERT INTO site_diary_entries (
          company_id, date, project_id, project_name,
          weather, total_workers, activities, deliveries,
          incidents, summary, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()) RETURNING id`,
        [
          company_id, 
          date, 
          project_id, 
          project_name || '',
          JSON.stringify(weather || { condition: 'sunny', temp: 28 }),
          total_workers || 0,
          JSON.stringify(activities || []),
          JSON.stringify(deliveries || []),
          JSON.stringify(incidents || []),
          JSON.stringify(summary || {}),
          status || 'Submitted'
        ]
      );
      
      const newEntry = await db.get(
        'SELECT * FROM site_diary_entries WHERE id = ?',
        [result.lastID]
      );
      
      res.status(201).json({
        id: newEntry.id,
        date: newEntry.date,
        projectId: newEntry.project_id,
        projectName: newEntry.project_name,
        weather: newEntry.weather ? JSON.parse(newEntry.weather) : {},
        totalWorkers: newEntry.total_workers || 0,
        activities: newEntry.activities ? JSON.parse(newEntry.activities) : [],
        deliveries: newEntry.deliveries ? JSON.parse(newEntry.deliveries) : [],
        incidents: newEntry.incidents ? JSON.parse(newEntry.incidents) : [],
        summary: newEntry.summary ? JSON.parse(newEntry.summary) : {},
        status: newEntry.status,
        createdAt: newEntry.created_at
      });
    } catch (error) {
      console.error('Error in createEntry:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Update a site diary entry
  updateEntry: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id || 1;
      const { id } = req.params;
      
      const {
        date,
        project_id,
        project_name,
        weather,
        total_workers,
        activities,
        deliveries,
        incidents,
        summary,
        status
      } = req.body;
      
      const result = await db.run(
        `UPDATE site_diary_entries SET
          date = ?, project_id = ?, project_name = ?,
          weather = ?, total_workers = ?, activities = ?,
          deliveries = ?, incidents = ?, summary = ?,
          status = ?, updated_at = NOW()
        WHERE id = ? AND company_id = ?`,
        [
          date, project_id, project_name,
          JSON.stringify(weather || {}),
          total_workers || 0,
          JSON.stringify(activities || []),
          JSON.stringify(deliveries || []),
          JSON.stringify(incidents || []),
          JSON.stringify(summary || {}),
          status || 'Submitted',
          id, company_id
        ]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      
      const updatedEntry = await db.get(
        'SELECT * FROM site_diary_entries WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      res.json({
        id: updatedEntry.id,
        date: updatedEntry.date,
        projectId: updatedEntry.project_id,
        projectName: updatedEntry.project_name,
        weather: updatedEntry.weather ? JSON.parse(updatedEntry.weather) : {},
        totalWorkers: updatedEntry.total_workers || 0,
        activities: updatedEntry.activities ? JSON.parse(updatedEntry.activities) : [],
        deliveries: updatedEntry.deliveries ? JSON.parse(updatedEntry.deliveries) : [],
        incidents: updatedEntry.incidents ? JSON.parse(updatedEntry.incidents) : [],
        summary: updatedEntry.summary ? JSON.parse(updatedEntry.summary) : {},
        status: updatedEntry.status,
        createdAt: updatedEntry.created_at
      });
    } catch (error) {
      console.error('Error in updateEntry:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Delete a site diary entry
  deleteEntry: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id || 1;
      const { id } = req.params;
      
      const result = await db.run(
        'DELETE FROM site_diary_entries WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteEntry:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = siteDiaryController;