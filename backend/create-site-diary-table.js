const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

const createTableSQL = `
CREATE TABLE IF NOT EXISTS site_diary_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  project_id INTEGER NOT NULL,
  project_name TEXT NOT NULL,
  weather TEXT,
  activities TEXT,
  deliveries TEXT,
  incidents TEXT,
  site_workers TEXT,
  site_subcontractors TEXT,
  total_workers INTEGER DEFAULT 0,
  summary TEXT,
  status TEXT DEFAULT 'Draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);
`;

db.run(createTableSQL, (err) => {
  if (err) {
    console.error('Error creating table:', err.message);
  } else {
    console.log('✅ Site diary entries table created successfully');
    
    // Check if table exists
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='site_diary_entries'", (err, row) => {
      if (row) {
        console.log('✅ Table "site_diary_entries" verified');
      }
      db.close();
    });
  }
});