const { getDb } = require('../config/database');

const quotationController = {
  // Get all quotations for the company
  getQuotations: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      const quotations = await db.all(
        'SELECT * FROM quotations WHERE company_id = ? ORDER BY date DESC, created_at DESC',
        [company_id]
      );
      
      res.json(quotations);
    } catch (error) {
      console.error('Error in getQuotations:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Get a single quotation by ID
  getQuotationById: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const quotation = await db.get(
        'SELECT * FROM quotations WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      if (!quotation) {
        return res.status(404).json({ error: 'Quotation not found' });
      }
      
      res.json(quotation);
    } catch (error) {
      console.error('Error in getQuotationById:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Create a new quotation
  createQuotation: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const {
        subcontractor_id,
        subcontractor_name,
        project_id,
        project_name,
        description,
        amount,
        date,
        status,
        notes
      } = req.body;
      
      const result = await db.run(
        `INSERT INTO quotations (
          company_id, 
          subcontractor_id, 
          subcontractor_name, 
          project_id, 
          project_name, 
          description, 
          amount, 
          date, 
          status, 
          notes, 
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          company_id,
          subcontractor_id,
          subcontractor_name || '',
          project_id,
          project_name || '',
          description || '',
          amount || 0,
          date || new Date().toISOString().split('T')[0],
          status || 'Pending',
          notes || ''
        ]
      );
      
      const newQuotation = await db.get(
        'SELECT * FROM quotations WHERE id = ?',
        [result.lastID]
      );
      
      res.status(201).json(newQuotation);
    } catch (error) {
      console.error('Error in createQuotation:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Update a quotation (all fields)
  updateQuotation: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      const {
        subcontractor_id,
        subcontractor_name,
        project_id,
        project_name,
        description,
        amount,
        date,
        status,
        notes
      } = req.body;
      
      const result = await db.run(
        `UPDATE quotations SET 
          subcontractor_id = ?, 
          subcontractor_name = ?, 
          project_id = ?, 
          project_name = ?, 
          description = ?, 
          amount = ?, 
          date = ?, 
          status = ?, 
          notes = ?,
          updated_at = datetime('now')
        WHERE id = ? AND company_id = ?`,
        [
          subcontractor_id,
          subcontractor_name,
          project_id,
          project_name,
          description,
          amount,
          date,
          status,
          notes,
          id,
          company_id
        ]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Quotation not found' });
      }
      
      const updatedQuotation = await db.get(
        'SELECT * FROM quotations WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      res.json(updatedQuotation);
    } catch (error) {
      console.error('Error in updateQuotation:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Delete a quotation
  deleteQuotation: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const result = await db.run(
        'DELETE FROM quotations WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Quotation not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteQuotation:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = quotationController;