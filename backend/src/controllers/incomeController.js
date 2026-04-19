const { getDb } = require('../config/database');

const IncomeController = {
  // Get all income records
  getIncome: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { project_id } = req.query;

      let query = 'SELECT * FROM income WHERE company_id = $1';
      const params = [company_id];

      if (project_id) {
        query += ' AND project_id = $2';
        params.push(project_id);
      }

      query += ' ORDER BY date DESC';

      const rows = await db.all(query, params);
      res.json(rows);
    } catch (error) {
      console.error('Error in getIncome:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get single income record
  getIncomeById: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;

      const row = await db.get(
        'SELECT * FROM income WHERE id = $1 AND company_id = $2',
        [id, company_id]
      );

      if (!row) {
        return res.status(404).json({ error: 'Income record not found' });
      }
      res.json(row);
    } catch (error) {
      console.error('Error in getIncomeById:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Create income record
  createIncome: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const {
        project_id, certificate_no, date, gross_amount,
        retention_percent, amount_received, payment_date,
        payment_method, status, notes
      } = req.body;

      // Verify project exists
      const project = await db.get(
        'SELECT id FROM projects WHERE id = $1 AND company_id = $2',
        [project_id, company_id]
      );

      if (!project) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }

      const result = await db.run(
        `INSERT INTO income (
          company_id, project_id, certificate_no, date, gross_amount,
          retention_percent, amount_received, payment_date,
          payment_method, status, notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) RETURNING id`,
        [company_id, project_id, certificate_no, date, gross_amount,
         retention_percent || 0, amount_received || 0, payment_date,
         payment_method, status || 'Pending', notes]
      );

      // Return the full created record
      const newIncome = await db.get(
        'SELECT * FROM income WHERE id = $1',
        [result.lastID]
      );

      res.status(201).json(newIncome);
    } catch (error) {
      console.error('Error in createIncome:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update income record
  updateIncome: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      const {
        project_id, certificate_no, date, gross_amount,
        retention_percent, amount_received, payment_date,
        payment_method, status, notes
      } = req.body;

      const result = await db.run(
        `UPDATE income SET
          project_id = $1, certificate_no = $2, date = $3, gross_amount = $4,
          retention_percent = $5, amount_received = $6, payment_date = $7,
          payment_method = $8, status = $9, notes = $10
        WHERE id = $11 AND company_id = $12`,
        [project_id, certificate_no, date, gross_amount, retention_percent,
         amount_received, payment_date, payment_method, status, notes, id, company_id]
      );

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Income record not found' });
      }
      
      const updated = await db.get(
        'SELECT * FROM income WHERE id = $1',
        [id]
      );
      res.json(updated);
    } catch (error) {
      console.error('Error in updateIncome:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete income record
  deleteIncome: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;

      const result = await db.run(
        'DELETE FROM income WHERE id = $1 AND company_id = $2',
        [id, company_id]
      );

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Income record not found' });
      }
      res.json({ message: 'Income record deleted' });
    } catch (error) {
      console.error('Error in deleteIncome:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = IncomeController;