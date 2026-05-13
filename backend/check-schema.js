const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function checkSchema() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
  
  console.log('=== Checking approved_items table ===');
  const columns = await db.all("PRAGMA table_info(approved_items)");
  console.log('Columns:', columns.map(c => c.name));
  
  console.log('\n=== Checking suppliers table ===');
  const supplierCols = await db.all("PRAGMA table_info(suppliers)");
  console.log('Columns:', supplierCols.map(c => c.name));
  
  console.log('\n=== Checking expenses table ===');
  const expenseCols = await db.all("PRAGMA table_info(expenses)");
  console.log('Columns:', expenseCols.map(c => c.name));
  
  await db.close();
}

checkSchema();