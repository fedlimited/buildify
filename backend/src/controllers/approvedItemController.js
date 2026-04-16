const { getDb } = require('../config/database');

const ApprovedItemController = {
  // Get all approved items
  getItems: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      console.log('Fetching approved items for company:', company_id);
      
      const items = await db.all(
        'SELECT * FROM approved_items WHERE company_id = ? ORDER BY name',
        [company_id]
      );
      
      res.json(items);
    } catch (error) {
      console.error('Error in getItems:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get single approved item
  getItemById: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const item = await db.get(
        'SELECT * FROM approved_items WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(item);
    } catch (error) {
      console.error('Error in getItemById:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Create approved item
  createItem: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      console.log('Creating approved item for company:', company_id);
      console.log('Request body:', req.body);
      
      const {
        name,
        category,
        unit,
        default_price,
        description
      } = req.body;
      
      const result = await db.run(
        `INSERT INTO approved_items (
          company_id, name, category, unit, default_price, description, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
        [company_id, name, category, unit, default_price || 0, description]
      );
      
      const newItem = await db.get(
        'SELECT * FROM approved_items WHERE id = ?',
        [result.lastID]
      );
      
      res.status(201).json(newItem);
    } catch (error) {
      console.error('Error in createItem:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update approved item
  updateItem: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const {
        name,
        category,
        unit,
        default_price,
        description,
        is_active
      } = req.body;
      
      const result = await db.run(
        `UPDATE approved_items SET
          name = ?, category = ?, unit = ?, default_price = ?,
          description = ?, is_active = ?
        WHERE id = ? AND company_id = ?`,
        [name, category, unit, default_price, description, is_active, id, company_id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      
      const updatedItem = await db.get(
        'SELECT * FROM approved_items WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      res.json(updatedItem);
    } catch (error) {
      console.error('Error in updateItem:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete approved item
  deleteItem: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const result = await db.run(
        'DELETE FROM approved_items WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteItem:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = ApprovedItemController;