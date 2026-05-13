const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Add missing columns to store_transactions
const addColumns = `
  ALTER TABLE store_transactions ADD COLUMN quantity REAL;
  ALTER TABLE store_transactions ADD COLUMN unit TEXT;
  ALTER TABLE store_transactions ADD COLUMN item_name TEXT;
  ALTER TABLE store_transactions ADD COLUMN reference TEXT;
  ALTER TABLE store_transactions ADD COLUMN notes TEXT;
`;

// Run each ALTER statement separately
const statements = [
  "ALTER TABLE store_transactions ADD COLUMN quantity REAL",
  "ALTER TABLE store_transactions ADD COLUMN unit TEXT",
  "ALTER TABLE store_transactions ADD COLUMN item_name TEXT",
  "ALTER TABLE store_transactions ADD COLUMN reference TEXT",
  "ALTER TABLE store_transactions ADD COLUMN notes TEXT"
];

let completed = 0;

statements.forEach(statement => {
  db.run(statement, (err) => {
    if (err) {
      // Column might already exist
      console.log(`Note: ${err.message}`);
    } else {
      console.log(`✅ Executed: ${statement}`);
    }
    completed++;
    if (completed === statements.length) {
      console.log('\n✅ Database fix completed!');
      db.close();
    }
  });
});