const { getDb } = require('../config/database');

const SettingsController = {
  // Get company settings
  getSettings: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      console.log('Fetching settings for company:', company_id);
      
      // Your table doesn't have company_id, so we need to handle differently
      // For now, get the first row (assuming one company per database)
      let settings = await db.get(
        'SELECT * FROM company_settings LIMIT 1'
      );
      
      if (!settings) {
        // Create default settings if none exist
        const result = await db.run(
          `INSERT INTO company_settings (name, currency, currency_symbol)
           VALUES (?, ?, ?)`,
          ['My Company', 'KES', 'KES']
        );
        settings = await db.get(
          'SELECT * FROM company_settings WHERE id = ?',
          [result.lastID]
        );
      }
      
      res.json(settings);
    } catch (error) {
      console.error('Error in getSettings:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update company settings
  updateSettings: async (req, res) => {
    try {
      const db = await getDb();
      const {
        name,
        address,
        phone,
        email,
        kra_pin,
        currency,
        logo_url
      } = req.body;
      
      console.log('Updating settings:', { name, address, phone, email, currency });
      
      // Check if settings exist
      const existing = await db.get(
        'SELECT * FROM company_settings LIMIT 1'
      );
      
      let result;
      if (existing) {
        // Update existing
        result = await db.run(
          `UPDATE company_settings SET
            name = ?, address = ?, phone = ?, email = ?,
            kra_pin = ?, currency = ?, currency_symbol = ?, logo_url = ?
          WHERE id = ?`,
          [name, address, phone, email, kra_pin, currency, currency, logo_url, existing.id]
        );
      } else {
        // Insert new
        result = await db.run(
          `INSERT INTO company_settings (
            name, address, phone, email, kra_pin, currency, currency_symbol, logo_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [name, address, phone, email, kra_pin, currency, currency, logo_url]
        );
      }
      
      const updatedSettings = await db.get(
        'SELECT * FROM company_settings LIMIT 1'
      );
      
      res.json(updatedSettings);
    } catch (error) {
      console.error('Error in updateSettings:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = SettingsController;