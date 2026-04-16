const { Pool } = require('pg');

let pool = null;

// Helper function to convert ? placeholders to $1, $2, etc.
function convertPlaceholders(sql, params) {
  let pgSql = sql;
  let paramIndex = 1;
  pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);
  return pgSql;
}

// Core query function that handles PostgreSQL syntax
async function query(sql, params = []) {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  
  const client = await pool.connect();
  try {
    // Convert ? placeholders to $1, $2, etc. for PostgreSQL
    const pgSql = convertPlaceholders(sql, params);
    const result = await client.query(pgSql, params);
    
    // Return an object compatible with SQLite's API
    return {
      rows: result.rows,
      rowCount: result.rowCount,
      lastID: result.rows[0]?.id || null,
      changes: result.rowCount
    };
  } finally {
    client.release();
  }
}

// Wrapper for db.get() - returns single row
async function get(sql, params = []) {
  const result = await query(sql, params);
  return result.rows[0];
}

// Wrapper for db.all() - returns all rows
async function all(sql, params = []) {
  const result = await query(sql, params);
  return result.rows;
}

// Wrapper for db.run() - for INSERT, UPDATE, DELETE
async function run(sql, params = []) {
  const result = await query(sql, params);
  return { lastID: result.lastID, changes: result.changes };
}

async function initializeDatabase() {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Test the connection
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('PostgreSQL database connected successfully at:', result.rows[0].now);
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }

  // Create all tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      permissions TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(company_id, email)
    );

    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      client TEXT NOT NULL,
      contract_sum REAL NOT NULL,
      location TEXT,
      start_date TEXT,
      end_date TEXT,
      status TEXT DEFAULT 'Active',
      project_manager TEXT,
      description TEXT,
      progress INTEGER DEFAULT 0,
      latitude REAL,
      longitude REAL,
      google_maps_url TEXT,
      location_address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS income (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      certificate_no TEXT NOT NULL,
      date TEXT NOT NULL,
      gross_amount REAL NOT NULL,
      retention_percent REAL DEFAULT 0,
      amount_received REAL NOT NULL,
      payment_date TEXT,
      payment_method TEXT,
      status TEXT DEFAULT 'Pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS worker_categories (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      day_rate REAL NOT NULL,
      color TEXT,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS workers (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      category_id INTEGER NOT NULL REFERENCES worker_categories(id),
      project_id INTEGER NOT NULL REFERENCES projects(id),
      day_rate REAL NOT NULL,
      is_active INTEGER DEFAULT 1,
      date_added TEXT
    );

    CREATE TABLE IF NOT EXISTS payroll_records (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      week_number INTEGER NOT NULL,
      year INTEGER NOT NULL,
      week_start TEXT NOT NULL,
      week_end TEXT NOT NULL,
      project_id INTEGER NOT NULL REFERENCES projects(id),
      project_name TEXT NOT NULL,
      status TEXT DEFAULT 'Draft',
      entries TEXT NOT NULL,
      total_gross_pay REAL NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      approved_at TEXT,
      paid_at TEXT,
      expense_id INTEGER
    );

    CREATE TABLE IF NOT EXISTS approved_items (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      unit TEXT NOT NULL,
      default_price REAL NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      kra_pin TEXT,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      contact_person TEXT,
      payment_terms TEXT,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      order_number TEXT NOT NULL,
      supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
      supplier_name TEXT NOT NULL,
      project_id INTEGER NOT NULL REFERENCES projects(id),
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS supplies (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
      supplier_name TEXT NOT NULL,
      project_id INTEGER NOT NULL REFERENCES projects(id),
      project_name TEXT NOT NULL,
      date TEXT NOT NULL,
      item_id INTEGER REFERENCES approved_items(id),
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_transactions (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      project_id INTEGER NOT NULL REFERENCES projects(id),
      project_name TEXT NOT NULL,
      item_id INTEGER NOT NULL REFERENCES approved_items(id),
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subcontractors (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      kra_pin TEXT,
      specialization TEXT,
      address TEXT,
      contact_person TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      invoice_number TEXT NOT NULL,
      project_id INTEGER NOT NULL REFERENCES projects(id),
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS otp_codes (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      purpose TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_otp_codes_email_code ON otp_codes(email, code);
    CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);

    CREATE TABLE IF NOT EXISTS currency_settings (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      currency_code TEXT DEFAULT 'KES',
      currency_symbol TEXT DEFAULT 'KSh',
      decimal_places INTEGER DEFAULT 2,
      thousand_separator TEXT DEFAULT ',',
      decimal_separator TEXT DEFAULT '.',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quotations (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      subcontractor_id INTEGER NOT NULL REFERENCES subcontractors(id),
      subcontractor_name TEXT NOT NULL,
      project_id INTEGER NOT NULL REFERENCES projects(id),
      project_name TEXT NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS site_diary_entries (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      project_id INTEGER NOT NULL REFERENCES projects(id),
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('PostgreSQL database initialized with all tables');
  return pool;
}

// Main database interface - returns an object with SQLite-compatible methods
function getDb() {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  
  // Return an object that mimics the SQLite interface
  return {
    // For SELECT queries that return a single row
    get: async (sql, params = []) => {
      return get(sql, params);
    },
    
    // For SELECT queries that return multiple rows
    all: async (sql, params = []) => {
      return all(sql, params);
    },
    
    // For INSERT, UPDATE, DELETE queries
    run: async (sql, params = []) => {
      return run(sql, params);
    },
    
    // Direct query access if needed
    query: async (sql, params = []) => {
      return query(sql, params);
    },
    
    // Get the underlying pool if needed
    getPool: () => pool
  };
}

module.exports = { initializeDatabase, getDb, query, get, all, run };