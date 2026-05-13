const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Create currency settings table
const createTable = `
CREATE TABLE IF NOT EXISTS currency_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  currency_code TEXT DEFAULT 'KES',
  currency_symbol TEXT DEFAULT 'KSh',
  decimal_places INTEGER DEFAULT 2,
  thousand_separator TEXT DEFAULT ',',
  decimal_separator TEXT DEFAULT '.',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  UNIQUE(company_id)
);
`;

db.run(createTable, (err) => {
  if (err) {
    console.error('Error creating table:', err.message);
  } else {
    console.log('✅ Currency settings table created');
    
    // Insert default currency for existing companies
    db.run(`
      INSERT OR IGNORE INTO currency_settings (company_id, currency_code, currency_symbol)
      SELECT id, 'KES', 'KSh' FROM companies
    `, (err2) => {
      if (err2) {
        console.error('Error inserting defaults:', err2.message);
      } else {
        console.log('✅ Default currency settings added for all companies');
      }
      db.close();
    });
  }
});