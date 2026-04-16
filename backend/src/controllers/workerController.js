const { getDb } = require('../config/database');

const WorkerController = {
  // Get all workers
  getWorkers: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      const workers = await db.all(
        'SELECT * FROM workers WHERE company_id = ? ORDER BY name',
        [company_id]
      );
      
      res.json(workers);
    } catch (error) {
      console.error('Error in getWorkers:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get single worker
  getWorker: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const worker = await db.get(
        'SELECT * FROM workers WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      if (!worker) {
        return res.status(404).json({ error: 'Worker not found' });
      }
      res.json(worker);
    } catch (error) {
      console.error('Error in getWorker:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Create worker
  createWorker: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      console.log('Creating worker for company:', company_id);
      console.log('Request body:', req.body);
      
      const { name, phone, category_id, project_id, day_rate, is_active, date_added } = req.body;
      
      const result = await db.run(
        `INSERT INTO workers (company_id, name, phone, category_id, project_id, day_rate, is_active, date_added)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [company_id, name, phone, category_id, project_id, day_rate, is_active !== false ? 1 : 0, date_added || new Date().toISOString().split('T')[0]]
      );
      
      const newWorker = await db.get(
        'SELECT * FROM workers WHERE id = ?',
        [result.lastID]
      );
      
      res.status(201).json(newWorker);
    } catch (error) {
      console.error('Error in createWorker:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update worker
  updateWorker: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const { name, phone, category_id, project_id, day_rate, is_active } = req.body;
      
      const result = await db.run(
        `UPDATE workers SET
          name = ?, phone = ?, category_id = ?, project_id = ?,
          day_rate = ?, is_active = ?
        WHERE id = ? AND company_id = ?`,
        [name, phone, category_id, project_id, day_rate, is_active ? 1 : 0, id, company_id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Worker not found' });
      }
      
      const updatedWorker = await db.get(
        'SELECT * FROM workers WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      res.json(updatedWorker);
    } catch (error) {
      console.error('Error in updateWorker:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete worker
  deleteWorker: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const result = await db.run(
        'DELETE FROM workers WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Worker not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteWorker:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = WorkerController;