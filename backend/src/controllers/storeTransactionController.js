const { getDb } = require('../config/database');

const storeTransactionController = {
  getTransactions: async (req, res) => {
    try {
      const db = getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      const transactions = await db.all(
        'SELECT * FROM store_transactions WHERE company_id = ? ORDER BY date DESC',
        [company_id]
      );
      
      // Convert snake_case to camelCase for frontend compatibility
      const formattedTransactions = transactions.map(t => ({
        id: t.id,
        date: t.date,
        projectId: t.project_id,
        projectName: t.project_name,
        transactionType: t.transaction_type,
        itemId: t.item_id,
        itemName: t.item_name,
        unit: t.unit,
        category: t.category,
        quantitySupplied: t.quantity_supplied || 0,
        quantityIssued: t.quantity_issued || 0,
        quantityReturned: t.quantity_returned || 0,
        balance: t.balance || 0,
        reference: t.reference,
        issuedTo: t.issued_to,
        returnedBy: t.returned_by,
        notes: t.notes,
        createdAt: t.created_at
      }));
      
      res.json(formattedTransactions);
    } catch (error) {
      console.error('Error in getTransactions:', error);
      res.status(500).json({ error: error.message });
    }
  },

  createTransaction: async (req, res) => {
    try {
      const db = getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const {
        date, projectId, projectName, transactionType,
        itemId, itemName, unit, category,
        quantitySupplied, quantityIssued, quantityReturned,
        balance, reference, issuedTo, returnedBy, notes
      } = req.body;
      
      console.log('Creating store transaction for company:', company_id);
      console.log('Item:', itemName, 'Quantity Supplied:', quantitySupplied);
      
      const result = await db.run(
        `INSERT INTO store_transactions (
          company_id, date, project_id, project_name, transaction_type,
          item_id, item_name, unit, category,
          quantity_supplied, quantity_issued, quantity_returned,
          balance, reference, issued_to, returned_by, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) RETURNING id`,
        [
          company_id, date, projectId, projectName, transactionType,
          itemId || null, itemName, unit, category,
          quantitySupplied || 0, quantityIssued || 0, quantityReturned || 0,
          balance || 0, reference || null, issuedTo || null, returnedBy || null, notes || null
        ]
      );
      
      if (!result || !result.lastID) {
        throw new Error('Failed to insert transaction');
      }
      
      const newTransaction = await db.get(
        'SELECT * FROM store_transactions WHERE id = ?',
        [result.lastID]
      );
      
      // Format response to camelCase
      const formattedTransaction = {
        id: newTransaction.id,
        date: newTransaction.date,
        projectId: newTransaction.project_id,
        projectName: newTransaction.project_name,
        transactionType: newTransaction.transaction_type,
        itemId: newTransaction.item_id,
        itemName: newTransaction.item_name,
        unit: newTransaction.unit,
        category: newTransaction.category,
        quantitySupplied: newTransaction.quantity_supplied || 0,
        quantityIssued: newTransaction.quantity_issued || 0,
        quantityReturned: newTransaction.quantity_returned || 0,
        balance: newTransaction.balance || 0,
        reference: newTransaction.reference,
        issuedTo: newTransaction.issued_to,
        returnedBy: newTransaction.returned_by,
        notes: newTransaction.notes,
        createdAt: newTransaction.created_at
      };
      
      console.log('Transaction created successfully:', formattedTransaction.id);
      res.status(201).json(formattedTransaction);
      
    } catch (error) {
      console.error('Error in createTransaction:', error);
      res.status(500).json({ error: error.message });
    }
  },

  updateTransaction: async (req, res) => {
    try {
      const db = getDb();
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
      
      const formattedTransaction = {
        id: updated.id,
        date: updated.date,
        projectId: updated.project_id,
        projectName: updated.project_name,
        transactionType: updated.transaction_type,
        itemId: updated.item_id,
        itemName: updated.item_name,
        unit: updated.unit,
        category: updated.category,
        quantitySupplied: updated.quantity_supplied || 0,
        quantityIssued: updated.quantity_issued || 0,
        quantityReturned: updated.quantity_returned || 0,
        balance: updated.balance || 0,
        reference: updated.reference,
        issuedTo: updated.issued_to,
        returnedBy: updated.returned_by,
        notes: updated.notes,
        createdAt: updated.created_at
      };
      
      res.json(formattedTransaction);
    } catch (error) {
      console.error('Error in updateTransaction:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  deleteTransaction: async (req, res) => {
    try {
      const db = getDb();
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