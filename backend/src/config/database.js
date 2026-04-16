const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

let db = null;

async function initializeDatabase() {
  db = await open({
    filename: path.join(__dirname, '../../database.sqlite'),
    driver: sqlite3.Database
  });

  // Create tables with multi-tenancy
  await db.exec(`
    -- Companies table (tenants)
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      subdomain TEXT UNIQUE NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      kra_pin TEXT,
      currency TEXT DEFAULT 'KES',
      currency_symbol TEXT DEFAULT 'KES',
      logo_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Users table (now linked to company)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      permissions TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(company_id, email),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- Projects table (linked to company)
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      client TEXT NOT NULL,
      contract_sum REAL NOT NULL,
      location TEXT,
      start_date TEXT,
      end_date TEXT,
      status TEXT DEFAULT 'Active',
      project_manager TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- Income/Certificates table
    CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      project_id INTEGER NOT NULL,
      certificate_no TEXT NOT NULL,
      date TEXT NOT NULL,
      gross_amount REAL NOT NULL,
      retention_percent REAL DEFAULT 0,
      amount_received REAL NOT NULL,
      payment_date TEXT,
      payment_method TEXT,
      status TEXT DEFAULT 'Pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- Expenses table
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      project_id INTEGER NOT NULL,
      project_name TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      vat REAL DEFAULT 0,
      payment_method TEXT,
      status TEXT DEFAULT 'Paid',
      reference TEXT,
      subcontractor_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- Worker Categories table
    CREATE TABLE IF NOT EXISTS worker_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      day_rate REAL NOT NULL,
      color TEXT,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- Workers table
    CREATE TABLE IF NOT EXISTS workers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      project_id INTEGER NOT NULL,
      day_rate REAL NOT NULL,
      is_active INTEGER DEFAULT 1,
      date_added TEXT,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES worker_categories(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    -- Payroll Records table
    CREATE TABLE IF NOT EXISTS payroll_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      week_number INTEGER NOT NULL,
      year INTEGER NOT NULL,
      week_start TEXT NOT NULL,
      week_end TEXT NOT NULL,
      project_id INTEGER NOT NULL,
      project_name TEXT NOT NULL,
      status TEXT DEFAULT 'Draft',
      entries TEXT NOT NULL,
      total_gross_pay REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      approved_at TEXT,
      paid_at TEXT,
      expense_id INTEGER,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    -- Approved Items (Materials) table
    CREATE TABLE IF NOT EXISTS approved_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      unit TEXT NOT NULL,
      default_price REAL NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    -- Suppliers table
    CREATE TABLE IF NOT EXISTS suppliers (
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
    );

    -- Purchase Orders table
    CREATE TABLE IF NOT EXISTS purchase_orders (
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
    );

    -- Supplies table
    CREATE TABLE IF NOT EXISTS supplies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      supplier_id INTEGER NOT NULL,
      supplier_name TEXT NOT NULL,
      project_id INTEGER NOT NULL,
      project_name TEXT NOT NULL,
      date TEXT NOT NULL,
      item_id INTEGER NOT NULL,
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
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
      FOREIGN KEY (item_id) REFERENCES approved_items(id)
    );

    -- Store Transactions table
    CREATE TABLE IF NOT EXISTS store_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      project_id INTEGER NOT NULL,
      project_name TEXT NOT NULL,
      item_id INTEGER NOT NULL,
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
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (item_id) REFERENCES approved_items(id)
    );

    -- Subcontractors table
    CREATE TABLE IF NOT EXISTS subcontractors (
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
    );

    -- Invoices table
    CREATE TABLE IF NOT EXISTS invoices (
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
    );
  `);

  // Create demo company if not exists
  const demoCompany = await db.get('SELECT * FROM companies WHERE subdomain = ?', ['demo']);
  if (!demoCompany) {
    await db.run(
      `INSERT INTO companies (name, subdomain, email, phone, address, kra_pin)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Demo Construction Ltd', 'demo', 'demo@bochaberi.co.ke', '+254 700 000 000', 'Nairobi, Kenya', 'P051012345Z']
    );

    // Get the demo company ID
    const company = await db.get('SELECT * FROM companies WHERE subdomain = ?', ['demo']);
    
    // Create admin user for demo company
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.run(
      `INSERT INTO users (company_id, name, email, password, role, permissions)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [company.id, 'Admin User', 'admin@demo.com', hashedPassword, 'admin', JSON.stringify([])]
    );
  }

  console.log('Multi-tenant database initialized successfully');
  return db;
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

module.exports = { initializeDatabase, getDb };