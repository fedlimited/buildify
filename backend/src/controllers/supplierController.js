const { getDb } = require('../config/database');

const SupplierController = {
  // Get all suppliers
  getSuppliers: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      const suppliers = await db.all(
        'SELECT * FROM suppliers WHERE company_id = ? ORDER BY name',
        [company_id]
      );
      
      res.json(suppliers);
    } catch (error) {
      console.error('Error in getSuppliers:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get single supplier
  getSupplierById: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const supplier = await db.get(
        'SELECT * FROM suppliers WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
      }
      res.json(supplier);
    } catch (error) {
      console.error('Error in getSupplierById:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Create supplier
  createSupplier: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      const {
        name,
        kra_pin,
        phone,
        email,
        address,
        contact_person,
        payment_terms
      } = req.body;
      
      const result = await db.run(
        `INSERT INTO suppliers (
          company_id, name, kra_pin, phone, email,
          address, contact_person, payment_terms, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [company_id, name, kra_pin, phone, email, address, contact_person, payment_terms]
      );
      
      const newSupplier = await db.get(
        'SELECT * FROM suppliers WHERE id = ?',
        [result.lastID]
      );
      
      res.status(201).json(newSupplier);
    } catch (error) {
      console.error('Error in createSupplier:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update supplier
  updateSupplier: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const {
        name,
        kra_pin,
        phone,
        email,
        address,
        contact_person,
        payment_terms,
        is_active
      } = req.body;
      
      const result = await db.run(
        `UPDATE suppliers SET
          name = ?, kra_pin = ?, phone = ?, email = ?,
          address = ?, contact_person = ?, payment_terms = ?, is_active = ?
        WHERE id = ? AND company_id = ?`,
        [name, kra_pin, phone, email, address, contact_person, payment_terms, is_active, id, company_id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Supplier not found' });
      }
      
      const updatedSupplier = await db.get(
        'SELECT * FROM suppliers WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      res.json(updatedSupplier);
    } catch (error) {
      console.error('Error in updateSupplier:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete supplier
  deleteSupplier: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const result = await db.run(
        'DELETE FROM suppliers WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Supplier not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteSupplier:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = SupplierController;