const { Pool } = require('pg');

let pool = null;

// Helper function to convert ? placeholders to $1, $2, etc.
function convertPlaceholders(sql, params) {
  let pgSql = sql;
  let paramIndex = 1;
  pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);
  return pgSql;
}

async function query(sql, params = []) {
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

async function get(sql, params = []) {
  const result = await query(sql, params);
  return result.rows[0];
}

async function all(sql, params = []) {
  const result = await query(sql, params);
  return result.rows;
}

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

  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL database connected successfully at:', result.rows[0].now);
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }

  // Create subscription tables if they don't exist
  await pool.query(`
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

  // Insert subscription plans if they don't exist
  const planCount = await pool.query('SELECT COUNT(*) FROM subscription_plans');
  if (parseInt(planCount.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO subscription_plans (name, display_name, description, price_monthly_usd, price_yearly_usd, price_monthly_kes, price_yearly_kes, max_projects, max_workers, max_users, max_income_records, storage_mb, features, display_order) VALUES
      ('free', 'Free', 'For solo contractors and small projects', 0, 0, 0, 0, 1, 10, 1, 10, 100, '["basic_reports", "expenses"]', 1),
      ('basic', 'Basic', 'For small construction businesses', 49, 470, 6370, 61100, 3, 30, 5, 999999, 500, '["basic_reports", "expenses", "income", "payroll", "procurement", "store", "site_diary", "email_support"]', 2),
      ('pro', 'Pro', 'For growing construction companies', 259, 2486, 33670, 323180, 10, 150, 15, 999999, 2048, '["basic_reports", "expenses", "income", "payroll", "procurement", "store", "site_diary", "priority_support", "gantt_charts", "time_tracking", "receipt_scanning", "low_stock_alerts", "api_access", "export_excel"]', 3),
      ('premier', 'Premier', 'For large enterprises', 499, 4790, 64870, 622700, 999999, 999999, 999999, 999999, 10240, '["all_features", "custom_reports", "dedicated_support", "white_label", "sso", "phone_support", "custom_integrations", "audit_logs"]', 4)
    `);
    console.log('✅ Inserted subscription plans');
  }

  // Give existing companies a 30-day Pro trial
  await pool.query(`
    INSERT INTO company_subscriptions (company_id, plan_id, status, start_date, end_date, trial_end_date)
    SELECT 
      c.id,
      (SELECT id FROM subscription_plans WHERE name = 'pro'),
      'trial',
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '30 days',
      CURRENT_DATE + INTERVAL '30 days'
    FROM companies c
    WHERE NOT EXISTS (
      SELECT 1 FROM company_subscriptions cs WHERE cs.company_id = c.id
    )
  `);

  console.log('✅ PostgreSQL database initialized with all tables');
  return pool;
}

function getDb() {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  
  return {
    get: async (sql, params = []) => get(sql, params),
    all: async (sql, params = []) => all(sql, params),
    run: async (sql, params = []) => run(sql, params),
    query: async (sql, params = []) => query(sql, params),
    getPool: () => pool
  };
}

module.exports = { initializeDatabase, getDb, query, get, all, run };