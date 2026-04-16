const { getDb } = require('../config/database');

const SupplyController = {
  // Get all supplies
  getSupplies: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      console.log('Fetching supplies for company:', company_id);
      
      const supplies = await db.all(
        'SELECT * FROM supplies WHERE company_id = ? ORDER BY date DESC',
        [company_id]
      );
      
      res.json(supplies);
    } catch (error) {
      console.error('Error in getSupplies:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get single supply
  getSupplyById: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const supply = await db.get(
        'SELECT * FROM supplies WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      if (!supply) {
        return res.status(404).json({ error: 'Supply not found' });
      }
      res.json(supply);
    } catch (error) {
      console.error('Error in getSupplyById:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Create supply
  createSupply: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      console.log('Creating supply for company:', company_id);
      console.log('Request body:', req.body);
      
      const {
        supplier_id,
        supplier_name,
        project_id,
        project_name,
        date,
        item_id,
        item_name,
        unit,
        quantity,
        unit_price,
        total_amount,
        vat,
        status,
        paid,
        order_id,
        delivery_note,
        notes
      } = req.body;
      
      const result = await db.run(
        `INSERT INTO supplies (
          company_id, supplier_id, supplier_name, project_id, project_name,
          date, item_id, item_name, unit, quantity, unit_price,
          total_amount, vat, status, paid, order_id, delivery_note, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          company_id, supplier_id, supplier_name, project_id, project_name,
          date, item_id, item_name, unit, quantity, unit_price,
          total_amount, vat || 0, status || 'Delivered', paid || 0,
          order_id, delivery_note, notes
        ]
      );
      
      const newSupply = await db.get(
        'SELECT * FROM supplies WHERE id = ?',
        [result.lastID]
      );
      
      res.status(201).json(newSupply);
    } catch (error) {
      console.error('Error in createSupply:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update supply
  updateSupply: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const {
        status,
        paid,
        notes
      } = req.body;
      
      const result = await db.run(
        `UPDATE supplies SET
          status = ?, paid = ?, notes = ?
        WHERE id = ? AND company_id = ?`,
        [status, paid, notes, id, company_id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Supply not found' });
      }
      
      const updatedSupply = await db.get(
        'SELECT * FROM supplies WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      res.json(updatedSupply);
    } catch (error) {
      console.error('Error in updateSupply:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete supply
  deleteSupply: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const result = await db.run(
        'DELETE FROM supplies WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Supply not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteSupply:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = SupplyController;