const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const createTableSQL = `
CREATE TABLE IF NOT EXISTS otp_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  used INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_email_code ON otp_codes(email, code);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);
`;

db.exec(createTableSQL, (err) => {
  if (err) {
    console.error('❌ Error creating table:', err.message);
  } else {
    console.log('✅ OTP codes table created successfully!');
    
    // Verify table was created
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='otp_codes'", (err, row) => {
      if (row) {
        console.log('✅ Table "otp_codes" exists and is ready to use');
      } else {
        console.log('❌ Table was not created');
      }
      db.close();
    });
  }
});