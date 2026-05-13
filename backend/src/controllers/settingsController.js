const { getDb } = require('../config/database');

const SettingsController = {
  // Get company settings
  getSettings: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;

      console.log('Fetching settings for company:', company_id);

      // Get settings for this specific company
      let settings = await db.get(
        'SELECT * FROM company_settings WHERE company_id = ? LIMIT 1',
        [company_id]
      );

      if (!settings) {
        // Create default settings for this company
        const result = await db.run(
          `INSERT INTO company_settings (company_id, name, currency, currency_symbol)
           VALUES (?, ?, ?, ?) RETURNING id`,
          [company_id, 'My Company', 'KES', 'KES']
        );
        
        // Fetch the newly created settings
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
      const company_id = req.user?.companyId || req.user?.company_id;
      const {
        name,
        address,
        phone,
        email,
        kra_pin,
        currency,
        logo_url
      } = req.body;

      console.log('Updating settings for company:', company_id);

      // Check if settings exist for this company
      const existing = await db.get(
        'SELECT * FROM company_settings WHERE company_id = ? LIMIT 1',
        [company_id]
      );

      let result;
      if (existing) {
        // Update existing
        result = await db.run(
          `UPDATE company_settings SET
            name = ?, address = ?, phone = ?, email = ?,
            kra_pin = ?, currency = ?, currency_symbol = ?, logo_url = ?, updated_at = CURRENT_TIMESTAMP
          WHERE company_id = ?`,
          [name, address, phone, email, kra_pin, currency, currency, logo_url, company_id]
        );
      } else {
        // Insert new
        result = await db.run(
          `INSERT INTO company_settings (
            company_id, name, address, phone, email, kra_pin, currency, currency_symbol, logo_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [company_id, name, address, phone, email, kra_pin, currency, currency, logo_url]
        );
      }

      const updatedSettings = await db.get(
        'SELECT * FROM company_settings WHERE company_id = ? LIMIT 1',
        [company_id]
      );

      res.json(updatedSettings);
    } catch (error) {
      console.error('Error in updateSettings:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = SettingsController;