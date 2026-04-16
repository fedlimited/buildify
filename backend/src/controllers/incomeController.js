const { getDb } = require('../config/database');

const IncomeController = {
  // Get all income records
  getIncome: async (req, res) => {
    try {
      const db = await getDb();
      const { company_id } = req.user;
      const { project_id } = req.query;

      let query = 'SELECT * FROM income WHERE company_id = ?';
      const params = [company_id];

      if (project_id) {
        query += ' AND project_id = ?';
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
      const { company_id } = req.user;
      const { id } = req.params;

      const row = await db.get(
        'SELECT * FROM income WHERE id = ? AND company_id = ?',
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
      const { company_id } = req.user;
      const {
        project_id, certificate_no, date, gross_amount,
        retention_percent, amount_received, payment_date,
        payment_method, status, notes
      } = req.body;

      const result = await db.run(
        `INSERT INTO income (
          company_id, project_id, certificate_no, date, gross_amount,
          retention_percent, amount_received, payment_date,
          payment_method, status, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [company_id, project_id, certificate_no, date, gross_amount,
         retention_percent || 0, amount_received, payment_date,
         payment_method, status || 'Pending', notes]
      );

      res.status(201).json({ id: result.lastID, message: 'Income record created' });
    } catch (error) {
      console.error('Error in createIncome:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update income record
  updateIncome: async (req, res) => {
    try {
      const db = await getDb();
      const { company_id } = req.user;
      const { id } = req.params;
      const {
        project_id, certificate_no, date, gross_amount,
        retention_percent, amount_received, payment_date,
        payment_method, status, notes
      } = req.body;

      const result = await db.run(
        `UPDATE income SET
          project_id = ?, certificate_no = ?, date = ?, gross_amount = ?,
          retention_percent = ?, amount_received = ?, payment_date = ?,
          payment_method = ?, status = ?, notes = ?
        WHERE id = ? AND company_id = ?`,
        [project_id, certificate_no, date, gross_amount, retention_percent,
         amount_received, payment_date, payment_method, status, notes, id, company_id]
      );

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Income record not found' });
      }
      res.json({ message: 'Income record updated' });
    } catch (error) {
      console.error('Error in updateIncome:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete income record
  deleteIncome: async (req, res) => {
    try {
      const db = await getDb();
      const { company_id } = req.user;
      const { id } = req.params;

      const result = await db.run(
        'DELETE FROM income WHERE id = ? AND company_id = ?',
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