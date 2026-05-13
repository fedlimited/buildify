const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function createMissingTables() {
  const db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  console.log('Creating missing tables...');

  const tables = [
    `CREATE TABLE IF NOT EXISTS approved_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      unit TEXT NOT NULL,
      default_price REAL NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      kra_pin TEXT,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      contact_person TEXT,
      payment_terms TEXT,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      order_number TEXT NOT NULL,
      supplier_id INTEGER NOT NULL,
      supplier_name TEXT NOT NULL,
      project_id INTEGER NOT NULL,
      project_name TEXT NOT NULL,
      order_date TEXT NOT NULL,
      expected_date TEXT,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      vat REAL NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'Ordered',
      payment_status TEXT DEFAULT 'Unpaid',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )`,
    `CREATE TABLE IF NOT EXISTS supplies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      supplier_id INTEGER NOT NULL,
      supplier_name TEXT NOT NULL,
      project_id INTEGER NOT NULL,
      project_name TEXT NOT NULL,
      date TEXT NOT NULL,
      item_id INTEGER,
      item_name TEXT NOT NULL,
      unit TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      total_amount REAL NOT NULL,
      vat REAL NOT NULL,
      status TEXT DEFAULT 'Delivered',
      paid INTEGER DEFAULT 0,
      order_id INTEGER,
      delivery_note TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    )`,
    `CREATE TABLE IF NOT EXISTS store_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      project_id INTEGER NOT NULL,
      project_name TEXT NOT NULL,
      item_id INTEGER,
      item_name TEXT NOT NULL,
      unit TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity_supplied REAL DEFAULT 0,
      quantity_issued REAL DEFAULT 0,
      quantity_returned REAL DEFAULT 0,
      balance REAL NOT NULL,
      transaction_type TEXT NOT NULL,
      reference TEXT,
      issued_to TEXT,
      returned_by TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )`,
    `CREATE TABLE IF NOT EXISTS site_diary_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      project_id INTEGER NOT NULL,
      project_name TEXT NOT NULL,
      weather TEXT,
      total_workers INTEGER DEFAULT 0,
      activities TEXT,
      inspections TEXT,
      deliveries TEXT,
      incidents TEXT,
      challenges TEXT,
      summary TEXT,
      status TEXT DEFAULT 'Draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )`,
    `CREATE TABLE IF NOT EXISTS subcontractors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      kra_pin TEXT,
      specialization TEXT,
      address TEXT,
      contact_person TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS quotations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      subcontractor_id INTEGER,
      subcontractor_name TEXT,
      project_id INTEGER NOT NULL,
      project_name TEXT NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )`,
    `CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      invoice_number TEXT NOT NULL,
      project_id INTEGER NOT NULL,
      project_name TEXT NOT NULL,
      client_name TEXT NOT NULL,
      date TEXT NOT NULL,
      due_date TEXT,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      vat REAL NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'Draft',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )`
  ];

  for (const createTableSQL of tables) {
    try {
      await db.exec(createTableSQL);
      console.log('✓ Table created successfully');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('Table already exists, skipping...');
      } else {
        console.error('Error creating table:', error.message);
      }
    }
  }

  console.log('\n✅ All missing tables created successfully!');
  await db.close();
}

createMissingTables().catch(console.error);
