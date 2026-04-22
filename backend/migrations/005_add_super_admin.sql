-- ============================================
-- SUPER ADMIN MIGRATION
-- Adds super admin column and creates first super admin
-- ============================================

-- 1. Add is_super_admin column to users table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'is_super_admin') THEN
        ALTER TABLE users ADD COLUMN is_super_admin BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Added is_super_admin column to users table';
    ELSE
        RAISE NOTICE '⏭️ is_super_admin column already exists';
    END IF;
END $$;

-- 2. Create index for faster super admin lookups
CREATE INDEX IF NOT EXISTS idx_users_super_admin ON users(is_super_admin);

-- 3. Create a system company for super admins (if not exists)
INSERT INTO companies (name, subdomain, is_active, created_at)
SELECT 'System', 'system', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE subdomain = 'system');

-- 4. Note: You'll create the first super admin manually
-- Example: UPDATE users SET is_super_admin = true WHERE email = 'your-email@example.com';

RAISE NOTICE '✅ Super admin migration completed!';