const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://buildify_user:rHx8RNUanGVyykJy1XmKjgzvxPI9yF6q@dpg-d7g92nlckfvc73b3lh60-a.ohio-postgres.render.com/buildify_db_79nz',
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('Connected to database. Running migration...');
        
        // Drop existing tables
        await client.query(`DROP TABLE IF EXISTS subscription_payments CASCADE`);
        await client.query(`DROP TABLE IF EXISTS company_subscriptions CASCADE`);
        await client.query(`DROP TABLE IF EXISTS subscription_plans CASCADE`);
        
        // Create subscription_plans table
        await client.query(`
            CREATE TABLE subscription_plans (
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
            )
        `);
        console.log('✅ Created subscription_plans table');
        
        // Create company_subscriptions table
        await client.query(`
            CREATE TABLE company_subscriptions (
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
            )
        `);
        console.log('✅ Created company_subscriptions table');
        
        // Create subscription_payments table
        await client.query(`
            CREATE TABLE subscription_payments (
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
            )
        `);
        console.log('✅ Created subscription_payments table');
        
        // Insert plans
        await client.query(`
            INSERT INTO subscription_plans (name, display_name, description, price_monthly_usd, price_yearly_usd, price_monthly_kes, price_yearly_kes, max_projects, max_workers, max_users, max_income_records, storage_mb, features, display_order) VALUES
            ('free', 'Free', 'For solo contractors and small projects', 0, 0, 0, 0, 1, 10, 1, 10, 100, '["basic_reports", "expenses"]', 1),
            ('basic', 'Basic', 'For small construction businesses', 49, 470, 6370, 61100, 3, 30, 5, 999999, 500, '["basic_reports", "expenses", "income", "payroll", "procurement", "store", "site_diary", "email_support"]', 2),
            ('pro', 'Pro', 'For growing construction companies', 259, 2486, 33670, 323180, 10, 150, 15, 999999, 2048, '["basic_reports", "expenses", "income", "payroll", "procurement", "store", "site_diary", "priority_support", "gantt_charts", "time_tracking", "receipt_scanning", "low_stock_alerts", "api_access", "export_excel"]', 3),
            ('premier', 'Premier', 'For large enterprises', 499, 4790, 64870, 622700, 999999, 999999, 999999, 999999, 10240, '["all_features", "custom_reports", "dedicated_support", "white_label", "sso", "phone_support", "custom_integrations", "audit_logs"]', 4)
        `);
        console.log('✅ Inserted subscription plans');
        
        // Give existing companies 30-day Pro trial
        const result = await client.query(`
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
            RETURNING company_id
        `);
        console.log(`✅ Added ${result.rowCount} companies to trial`);
        
        // Create indexes
        await client.query(`CREATE INDEX idx_company_subscriptions_company_id ON company_subscriptions(company_id)`);
        await client.query(`CREATE INDEX idx_company_subscriptions_status ON company_subscriptions(status)`);
        await client.query(`CREATE INDEX idx_subscription_payments_company_id ON subscription_payments(company_id)`);
        console.log('✅ Created indexes');
        
        // Verify
        const plansCount = await client.query(`SELECT COUNT(*) FROM subscription_plans`);
        console.log(`\n📊 SUMMARY:`);
        console.log(`   Subscription plans: ${plansCount.rows[0].count}`);
        
        console.log('\n✅ Migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();