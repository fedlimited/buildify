const { Pool } = require('pg');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let pool = null;
let sqliteDb = null;

// Helper function to convert ? placeholders to $1, $2, etc. (for PostgreSQL)
function convertPlaceholders(sql, params) {
  let pgSql = sql;
  let paramIndex = 1;
  pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);
  return pgSql;
}

// ========== SQLITE IMPLEMENTATION ==========
async function getSqliteDb() {
  if (sqliteDb) return sqliteDb;
  
  sqliteDb = await open({
    filename: path.join(__dirname, '../../database.sqlite'),
    driver: sqlite3.Database
  });
  
  // Enable foreign keys
  await sqliteDb.run('PRAGMA foreign_keys = ON');
  
  return sqliteDb;
}

async function sqliteQuery(sql, params = []) {
  const db = await getSqliteDb();
  
  if (sql.toLowerCase().trim().startsWith('select')) {
    return await db.all(sql, params);
  } else {
    const result = await db.run(sql, params);
    return { changes: result.changes, lastID: result.lastID };
  }
}

async function sqliteGet(sql, params = []) {
  const db = await getSqliteDb();
  return await db.get(sql, params);
}

async function sqliteAll(sql, params = []) {
  const db = await getSqliteDb();
  return await db.all(sql, params);
}

async function sqliteRun(sql, params = []) {
  const db = await getSqliteDb();
  const result = await db.run(sql, params);
  return { lastID: result.lastID, changes: result.changes };
}

// ========== POSTGRESQL IMPLEMENTATION ==========
async function pgQuery(sql, params = []) {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  
  const client = await pool.connect();
  try {
    const pgSql = convertPlaceholders(sql, params);
    const result = await client.query(pgSql, params);
    
    let lastID = null;
    if (pgSql.toUpperCase().includes('RETURNING') && result.rows.length > 0) {
      lastID = result.rows[0].id;
    }
    
    return {
      rows: result.rows,
      rowCount: result.rowCount,
      lastID: lastID,
      changes: result.rowCount
    };
  } finally {
    client.release();
  }
}

async function pgGet(sql, params = []) {
  const result = await pgQuery(sql, params);
  return result.rows[0];
}

async function pgAll(sql, params = []) {
  const result = await pgQuery(sql, params);
  return result.rows;
}

async function pgRun(sql, params = []) {
  const result = await pgQuery(sql, params);
  return { lastID: result.lastID, changes: result.changes };
}

// ========== MAIN FUNCTIONS (Environment-aware) ==========
async function initializeDatabase() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Use PostgreSQL for production
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    try {
      const result = await pool.query('SELECT NOW()');
      console.log('✅ PostgreSQL database connected successfully at:', result.rows[0].now);
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }

    await createPostgresTables();
    console.log('✅ PostgreSQL database initialized with all tables');
    return pool;
  } else {
    // Use SQLite for development
    const db = await getSqliteDb();
    await createSqliteTables();
    console.log('✅ SQLite database initialized');
    return db;
  }
}

async function createPostgresTables() {
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

    -- Add subscription tables
    CREATE TABLE IF NOT EXISTS subscription_plans (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      display_name VARCHAR(100) NOT NULL,
      description TEXT,
      price_monthly_usd DECIMAL(10,2) DEFAULT 0,
      price_yearly_usd DECIMAL(10,2) DEFAULT 0,
      price_monthly_kes DECIMAL(10,2) DEFAULT 0,
      price_yearly_kes DECIMAL(10,2) DEFAULT 0,
      max_projects INTEGER DEFAULT 1,
      max_workers INTEGER DEFAULT 10,
      max_users INTEGER DEFAULT 1,
      max_income_records INTEGER DEFAULT 10,
      storage_mb INTEGER DEFAULT 100,
      features JSONB DEFAULT '[]',
      is_active BOOLEAN DEFAULT true,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS company_subscriptions (
      id SERIAL PRIMARY KEY,
      company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
      plan_id INTEGER REFERENCES subscription_plans(id),
      status VARCHAR(20) DEFAULT 'active',
      start_date DATE,
      end_date DATE,
      trial_end_date DATE,
      auto_renew BOOLEAN DEFAULT true,
      stripe_customer_id VARCHAR(255),
      stripe_subscription_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subscription_payments (
      id SERIAL PRIMARY KEY,
      company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
      subscription_id INTEGER REFERENCES company_subscriptions(id),
      amount_usd DECIMAL(10,2),
      amount_kes DECIMAL(10,2),
      payment_method VARCHAR(50),
      stripe_payment_intent_id VARCHAR(255),
      stripe_invoice_id VARCHAR(255),
      mpesa_transaction_id VARCHAR(255),
      mpesa_result_code VARCHAR(50),
      status VARCHAR(20) DEFAULT 'pending',
      invoice_url TEXT,
      paid_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function createSqliteTables() {
  const db = await getSqliteDb();
  
  await db.exec(`
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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

    CREATE TABLE IF NOT EXISTS subscription_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(50) NOT NULL,
      display_name VARCHAR(100) NOT NULL,
      description TEXT,
      price_monthly_usd DECIMAL(10,2) DEFAULT 0,
      price_yearly_usd DECIMAL(10,2) DEFAULT 0,
      price_monthly_kes DECIMAL(10,2) DEFAULT 0,
      price_yearly_kes DECIMAL(10,2) DEFAULT 0,
      max_projects INTEGER DEFAULT 1,
      max_workers INTEGER DEFAULT 10,
      max_users INTEGER DEFAULT 1,
      max_income_records INTEGER DEFAULT 10,
      storage_mb INTEGER DEFAULT 100,
      features TEXT DEFAULT '[]',
      is_active INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS company_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
      plan_id INTEGER REFERENCES subscription_plans(id),
      status VARCHAR(20) DEFAULT 'active',
      start_date TEXT,
      end_date TEXT,
      trial_end_date TEXT,
      auto_renew INTEGER DEFAULT 1,
      stripe_customer_id VARCHAR(255),
      stripe_subscription_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subscription_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
      subscription_id INTEGER REFERENCES company_subscriptions(id),
      amount_usd DECIMAL(10,2),
      amount_kes DECIMAL(10,2),
      payment_method VARCHAR(50),
      stripe_payment_intent_id VARCHAR(255),
      stripe_invoice_id VARCHAR(255),
      mpesa_transaction_id VARCHAR(255),
      mpesa_result_code VARCHAR(50),
      status VARCHAR(20) DEFAULT 'pending',
      invoice_url TEXT,
      paid_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Insert default subscription plans for SQLite
  const existingPlans = await db.get('SELECT COUNT(*) as count FROM subscription_plans');
  if (existingPlans.count === 0) {
    await db.exec(`
      INSERT INTO subscription_plans (name, display_name, description, price_monthly_usd, price_yearly_usd, price_monthly_kes, price_yearly_kes, max_projects, max_workers, max_users, max_income_records, storage_mb, features, display_order) VALUES
      ('free', 'Free', 'For solo contractors and small projects', 0, 0, 0, 0, 1, 10, 1, 10, 100, '["basic_reports", "expenses"]', 1),
      ('basic', 'Basic', 'For small construction businesses', 49, 470, 6370, 61100, 3, 30, 5, 999999, 500, '["basic_reports", "expenses", "income", "payroll", "procurement", "store", "site_diary", "email_support"]', 2),
      ('pro', 'Pro', 'For growing construction companies', 259, 2486, 33670, 323180, 10, 150, 15, 999999, 2048, '["basic_reports", "expenses", "income", "payroll", "procurement", "store", "site_diary", "priority_support", "gantt_charts", "time_tracking", "receipt_scanning", "low_stock_alerts", "api_access", "export_excel"]', 3),
      ('premier', 'Premier', 'For large enterprises', 499, 4790, 64870, 622700, 999999, 999999, 999999, 999999, 10240, '["all_features", "custom_reports", "dedicated_support", "white_label", "sso", "phone_support", "custom_integrations", "audit_logs"]', 4)
    `);
    console.log('✅ Inserted subscription plans into SQLite');
  }
}

function getDb() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    if (!pool) {
      throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return {
      get: async (sql, params = []) => pgGet(sql, params),
      all: async (sql, params = []) => pgAll(sql, params),
      run: async (sql, params = []) => pgRun(sql, params),
      query: async (sql, params = []) => pgQuery(sql, params),
      getPool: () => pool
    };
  } else {
    return {
      get: async (sql, params = []) => sqliteGet(sql, params),
      all: async (sql, params = []) => sqliteAll(sql, params),
      run: async (sql, params = []) => sqliteRun(sql, params),
      getDb: () => getSqliteDb()
    };
  }
}

module.exports = { initializeDatabase, getDb };