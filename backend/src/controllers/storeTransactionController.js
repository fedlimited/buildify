const { getDb } = require('../config/database');

const storeTransactionController = {
  getTransactions: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      const transactions = await db.all(
        `SELECT * FROM store_transactions WHERE company_id = ? ORDER BY date DESC`,
        [company_id]
      );
      
      res.json(transactions);
    } catch (error) {
      console.error('Error in getTransactions:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  createTransaction: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const {
        date, project_id, project_name, transaction_type,
        item_id, item_name, unit, category,
        quantity_supplied, quantity_issued, quantity_returned,
        balance, reference, issued_to, returned_by, notes
      } = req.body;
      
      const result = await db.run(
        `INSERT INTO store_transactions (
          company_id, date, project_id, project_name, transaction_type,
          item_id, item_name, unit, category,
          quantity_supplied, quantity_issued, quantity_returned,
          balance, reference, issued_to, returned_by, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          company_id, date, project_id, project_name, transaction_type,
          item_id, item_name, unit, category,
          quantity_supplied || 0, quantity_issued || 0, quantity_returned || 0,
          balance, reference, issued_to, returned_by, notes
        ]
      );
      
      const newTransaction = await db.get(
        'SELECT * FROM store_transactions WHERE id = ?',
        [result.lastID]
      );
      
      res.status(201).json(newTransaction);
    } catch (error) {
      console.error('Error in createTransaction:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  updateTransaction: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      const { notes } = req.body;
      
      const result = await db.run(
        'UPDATE store_transactions SET notes = ? WHERE id = ? AND company_id = ?',
        [notes, id, company_id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      const updated = await db.get(
        'SELECT * FROM store_transactions WHERE id = ?',
        [id]
      );
      res.json(updated);
    } catch (error) {
      console.error('Error in updateTransaction:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  deleteTransaction: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const result = await db.run(
        'DELETE FROM store_transactions WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteTransaction:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = storeTransactionController;