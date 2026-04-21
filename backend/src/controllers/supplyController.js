const { getDb } = require('../config/database');

const SupplyController = {
  // Get all supplies
  getSupplies: async (req, res) => {
    try {
      const db = getDb();
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
      const db = getDb();
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

  // Create supply - FIXED: Now creates store transaction automatically
  createSupply: async (req, res) => {
    try {
      const db = getDb();
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
      
      // Insert supply
      const result = await db.run(
        `INSERT INTO supplies (
          company_id, supplier_id, supplier_name, project_id, project_name,
          date, item_id, item_name, unit, quantity, unit_price,
          total_amount, vat, status, paid, order_id, delivery_note, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) RETURNING id`,
        [
          company_id, supplier_id, supplier_name, project_id, project_name,
          date, item_id, item_name, unit, quantity, unit_price,
          total_amount || (quantity * unit_price), vat || 0, status || 'Delivered', paid || 0,
          order_id, delivery_note, notes
        ]
      );
      
      // 🔥 CRITICAL FIX: Create store transaction for this supply
      console.log('Creating store transaction for supply...');
      
      // Get current balance for this item in this project
      const existingBalance = await db.get(
        `SELECT balance FROM store_transactions 
         WHERE company_id = ? AND project_id = ? AND item_name = ? 
         ORDER BY date DESC, id DESC LIMIT 1`,
        [company_id, project_id, item_name]
      );
      
      const previousBalance = existingBalance?.balance || 0;
      const newBalance = previousBalance + Number(quantity);
      
      await db.run(
        `INSERT INTO store_transactions (
          company_id, project_id, project_name, transaction_type,
          item_id, item_name, unit, category,
          quantity_supplied, quantity_issued, quantity_returned,
          balance, reference, date, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          company_id, project_id, project_name,
          'SUPPLY',
          item_id, item_name, unit, 'Materials',
          quantity, 0, 0,
          newBalance,
          `SUPPLY-${result.lastID}`,
          date,
          `Supply from ${supplier_name} - ${item_name}`
        ]
      );
      
      console.log('Store transaction created successfully');
      
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
      const db = getDb();
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
      const db = getDb();
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
  },

  // Mark supply as paid and create expense record
  markAsPaid: async (req, res) => {
    try {
      const db = getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      // First, get the supply details
      const supply = await db.get(
        'SELECT * FROM supplies WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      if (!supply) {
        return res.status(404).json({ error: 'Supply not found' });
      }
      
      // Check if already paid
      if (supply.paid === 1) {
        return res.status(400).json({ error: 'Supply already marked as paid' });
      }
      
      // Update the supply to paid
      const result = await db.run(
        'UPDATE supplies SET paid = 1 WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Supply not found' });
      }
      
      // Create an expense record for this supply
      const totalAmount = supply.total_amount || (supply.quantity * supply.unit_price);
      const vatAmount = supply.vat || (totalAmount * 0.16);
      
      await db.run(
        `INSERT INTO expenses (
          company_id, project_id, project_name, date, category,
          description, amount, vat, payment_method, status, reference, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          company_id,
          supply.project_id,
          supply.project_name,
          new Date().toISOString().split('T')[0],
          'Supplier',
          `Supply payment: ${supply.item_name} from ${supply.supplier_name}`,
          totalAmount,
          vatAmount,
          'Bank Transfer',
          'Paid',
          `SUPPLY-${supply.id}`,
        ]
      );
      
      res.json({ 
        message: 'Supply marked as paid and expense record created',
        supplyId: supply.id,
        expenseCreated: true
      });
    } catch (error) {
      console.error('Error in markAsPaid:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = SupplyController;