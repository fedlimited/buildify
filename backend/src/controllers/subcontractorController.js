const { getDb } = require('../config/database');

const SubcontractorController = {
  // Get all subcontractors
  getSubcontractors: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      console.log('Fetching subcontractors for company:', company_id);
      
      const subcontractors = await db.all(
        'SELECT * FROM subcontractors WHERE company_id = ? ORDER BY name',
        [company_id]
      );
      
      res.json(subcontractors);
    } catch (error) {
      console.error('Error in getSubcontractors:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get single subcontractor
  getSubcontractorById: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const subcontractor = await db.get(
        'SELECT * FROM subcontractors WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      if (!subcontractor) {
        return res.status(404).json({ error: 'Subcontractor not found' });
      }
      res.json(subcontractor);
    } catch (error) {
      console.error('Error in getSubcontractorById:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Create subcontractor
  createSubcontractor: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      console.log('Creating subcontractor for company:', company_id);
      console.log('Request body:', req.body);
      
      const {
        name,
        phone,
        email,
        kra_pin,
        specialization,
        address,
        contact_person
      } = req.body;
      
      const result = await db.run(
        `INSERT INTO subcontractors (
          company_id, name, phone, email, kra_pin,
          specialization, address, contact_person, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
        [company_id, name, phone, email, kra_pin, specialization, address, contact_person]
      );
      
      const newSubcontractor = await db.get(
        'SELECT * FROM subcontractors WHERE id = ?',
        [result.lastID]
      );
      
      res.status(201).json(newSubcontractor);
    } catch (error) {
      console.error('Error in createSubcontractor:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update subcontractor
  updateSubcontractor: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const {
        name,
        phone,
        email,
        kra_pin,
        specialization,
        address,
        contact_person,
        is_active
      } = req.body;
      
      const result = await db.run(
        `UPDATE subcontractors SET
          name = ?, phone = ?, email = ?, kra_pin = ?,
          specialization = ?, address = ?, contact_person = ?, is_active = ?
        WHERE id = ? AND company_id = ?`,
        [name, phone, email, kra_pin, specialization, address, contact_person, is_active, id, company_id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Subcontractor not found' });
      }
      
      const updatedSubcontractor = await db.get(
        'SELECT * FROM subcontractors WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      res.json(updatedSubcontractor);
    } catch (error) {
      console.error('Error in updateSubcontractor:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete subcontractor
  deleteSubcontractor: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      
      const result = await db.run(
        'DELETE FROM subcontractors WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Subcontractor not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteSubcontractor:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = SubcontractorController;