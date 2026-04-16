const { getDb } = require('../config/database');

const ExpenseController = {
  // Get all expenses
  getExpenses: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      const expenses = await db.all(
        'SELECT * FROM expenses WHERE company_id = ? ORDER BY date DESC',
        [company_id]
      );
      res.json(expenses);
    } catch (error) {
      console.error('Error in getExpenses:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get single expense
  getExpenseById: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const expense = await db.get(
        'SELECT * FROM expenses WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      res.json(expense);
    } catch (error) {
      console.error('Error in getExpenseById:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Create expense
  createExpense: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      const {
        project_id,
        project_name,
        date,
        category,
        description,
        amount,
        vat,
        payment_method,
        status,
        reference,
        subcontractor_id
      } = req.body;
      
      const result = await db.run(
        `INSERT INTO expenses (
          company_id, project_id, project_name, date, category,
          description, amount, vat, payment_method, status,
          reference, subcontractor_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          company_id, project_id, project_name, date, category,
          description, amount, vat || 0, payment_method,
          status || 'Paid', reference, subcontractor_id
        ]
      );
      
      const newExpense = await db.get(
        'SELECT * FROM expenses WHERE id = ?',
        [result.lastID]
      );
      
      res.status(201).json(newExpense);
    } catch (error) {
      console.error('Error in createExpense:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update expense
  updateExpense: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const {
        project_id,
        project_name,
        date,
        category,
        description,
        amount,
        vat,
        payment_method,
        status,
        reference,
        subcontractor_id
      } = req.body;
      
      const result = await db.run(
        `UPDATE expenses SET
          project_id = ?, project_name = ?, date = ?, category = ?,
          description = ?, amount = ?, vat = ?, payment_method = ?,
          status = ?, reference = ?, subcontractor_id = ?
        WHERE id = ? AND company_id = ?`,
        [
          project_id, project_name, date, category, description,
          amount, vat, payment_method, status, reference,
          subcontractor_id, id, company_id
        ]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      
      const updatedExpense = await db.get(
        'SELECT * FROM expenses WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      res.json(updatedExpense);
    } catch (error) {
      console.error('Error in updateExpense:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete expense
  deleteExpense: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const result = await db.run(
        'DELETE FROM expenses WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteExpense:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = ExpenseController;