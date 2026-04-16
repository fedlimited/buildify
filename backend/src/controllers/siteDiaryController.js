const { getDb } = require('../config/database');

const siteDiaryController = {
  // Get all site diary entries for the company
  getEntries: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id || 1;
      
      const entries = await db.all(
        'SELECT * FROM site_diary_entries WHERE company_id = ? ORDER BY date DESC',
        [company_id]
      );
      
      // Parse JSON fields
      const parsedEntries = entries.map(entry => ({
        id: entry.id,
        date: entry.date,
        projectId: entry.project_id,
        projectName: entry.project_name,
        weather: entry.weather ? JSON.parse(entry.weather) : { condition: 'sunny', temp: 28 },
        activities: entry.activities ? JSON.parse(entry.activities) : [],
        deliveries: entry.deliveries ? JSON.parse(entry.deliveries) : [],
        incidents: entry.incidents ? JSON.parse(entry.incidents) : [],
        siteWorkers: entry.site_workers ? JSON.parse(entry.site_workers) : [],
        siteSubcontractors: entry.site_subcontractors ? JSON.parse(entry.site_subcontractors) : [],
        totalWorkers: entry.total_workers || 0,
        summary: entry.summary ? JSON.parse(entry.summary) : {},
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
      const {
        date,
        projectId,
        projectName,
        weather,
        activities,
        deliveries,
        incidents,
        siteWorkers,
        siteSubcontractors,
        totalWorkers,
        summary,
        status
      } = req.body;
      
      console.log('Creating entry:', { date, projectId, projectName });
      
      const result = await db.run(
        `INSERT INTO site_diary_entries (
          company_id, date, project_id, project_name,
          weather, activities, deliveries, incidents,
          site_workers, site_subcontractors, total_workers,
          summary, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          company_id, 
          date, 
          projectId, 
          projectName || '',
          JSON.stringify(weather || { condition: 'sunny', temp: 28 }),
          JSON.stringify(activities || []),
          JSON.stringify(deliveries || []),
          JSON.stringify(incidents || []),
          JSON.stringify(siteWorkers || []),
          JSON.stringify(siteSubcontractors || []),
          totalWorkers || 0,
          JSON.stringify(summary || {}),
          status || 'Submitted'
        ]
      );
      
      const newEntry = await db.get(
        'SELECT * FROM site_diary_entries WHERE id = ?',
        [result.lastID]
      );
      
      // Parse for response
      const parsedEntry = {
        id: newEntry.id,
        date: newEntry.date,
        projectId: newEntry.project_id,
        projectName: newEntry.project_name,
        weather: newEntry.weather ? JSON.parse(newEntry.weather) : { condition: 'sunny', temp: 28 },
        activities: newEntry.activities ? JSON.parse(newEntry.activities) : [],
        deliveries: newEntry.deliveries ? JSON.parse(newEntry.deliveries) : [],
        incidents: newEntry.incidents ? JSON.parse(newEntry.incidents) : [],
        siteWorkers: newEntry.site_workers ? JSON.parse(newEntry.site_workers) : [],
        siteSubcontractors: newEntry.site_subcontractors ? JSON.parse(newEntry.site_subcontractors) : [],
        totalWorkers: newEntry.total_workers || 0,
        summary: newEntry.summary ? JSON.parse(newEntry.summary) : {},
        status: newEntry.status,
        createdAt: newEntry.created_at
      };
      
      res.status(201).json(parsedEntry);
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
        projectId,
        projectName,
        weather,
        activities,
        deliveries,
        incidents,
        siteWorkers,
        siteSubcontractors,
        totalWorkers,
        summary,
        status
      } = req.body;
      
      const result = await db.run(
        `UPDATE site_diary_entries SET
          date = ?, project_id = ?, project_name = ?,
          weather = ?, activities = ?, deliveries = ?, incidents = ?,
          site_workers = ?, site_subcontractors = ?, total_workers = ?,
          summary = ?, status = ?, updated_at = datetime('now')
        WHERE id = ? AND company_id = ?`,
        [
          date, projectId, projectName,
          JSON.stringify(weather || {}),
          JSON.stringify(activities || []),
          JSON.stringify(deliveries || []),
          JSON.stringify(incidents || []),
          JSON.stringify(siteWorkers || []),
          JSON.stringify(siteSubcontractors || []),
          totalWorkers || 0,
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
      
      const parsedEntry = {
        id: updatedEntry.id,
        date: updatedEntry.date,
        projectId: updatedEntry.project_id,
        projectName: updatedEntry.project_name,
        weather: updatedEntry.weather ? JSON.parse(updatedEntry.weather) : {},
        activities: updatedEntry.activities ? JSON.parse(updatedEntry.activities) : [],
        deliveries: updatedEntry.deliveries ? JSON.parse(updatedEntry.deliveries) : [],
        incidents: updatedEntry.incidents ? JSON.parse(updatedEntry.incidents) : [],
        siteWorkers: updatedEntry.site_workers ? JSON.parse(updatedEntry.site_workers) : [],
        siteSubcontractors: updatedEntry.site_subcontractors ? JSON.parse(updatedEntry.site_subcontractors) : [],
        totalWorkers: updatedEntry.total_workers || 0,
        summary: updatedEntry.summary ? JSON.parse(updatedEntry.summary) : {},
        status: updatedEntry.status,
        createdAt: updatedEntry.created_at
      };
      
      res.json(parsedEntry);
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