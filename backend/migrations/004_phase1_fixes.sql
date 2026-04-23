-- ============================================
-- PHASE 1: DATABASE FIXES
-- Adds missing columns, indexes, and helper functions
-- ============================================

-- 1. Add missing columns to purchase_orders
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchase_orders' AND column_name = 'expense_id') THEN
        ALTER TABLE purchase_orders ADD COLUMN expense_id INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchase_orders' AND column_name = 'store_updated') THEN
        ALTER TABLE purchase_orders ADD COLUMN store_updated INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Add missing columns to supplies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'supplies' AND column_name = 'expense_created') THEN
        ALTER TABLE supplies ADD COLUMN expense_created INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'supplies' AND column_name = 'store_updated') THEN
        ALTER TABLE supplies ADD COLUMN store_updated INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. Add missing columns to site_diary_entries
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_diary_entries' AND column_name = 'worker_ids') THEN
        ALTER TABLE site_diary_entries ADD COLUMN worker_ids TEXT DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_diary_entries' AND column_name = 'subcontractor_ids') THEN
        ALTER TABLE site_diary_entries ADD COLUMN subcontractor_ids TEXT DEFAULT '[]';
    END IF;
END $$;

-- 4. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_purchase_orders_company_status ON purchase_orders(company_id, status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_payment ON purchase_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_supplies_company_paid ON supplies(company_id, paid);
CREATE INDEX IF NOT EXISTS idx_store_transactions_type ON store_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_store_transactions_date ON store_transactions(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category_date ON expenses(category, date);
CREATE INDEX IF NOT EXISTS idx_site_diary_date ON site_diary_entries(date);
CREATE INDEX IF NOT EXISTS idx_site_diary_project ON site_diary_entries(project_id);

-- 5. Create helper function to safely clear company data (fixes sample data loading)
CREATE OR REPLACE FUNCTION clear_company_data(company_id_param INTEGER)
RETURNS TEXT AS $$
DECLARE
    tables_to_clear TEXT[] := ARRAY[
        'invoices', 'quotations', 'payroll_records', 'store_transactions',
        'supplies', 'purchase_orders', 'site_diary_entries', 'expenses',
        'income', 'workers', 'worker_categories', 'approved_items',
        'subcontractors', 'suppliers', 'projects'
    ];
    table_name TEXT;
    total_deleted INTEGER := 0;
BEGIN
    FOREACH table_name IN ARRAY tables_to_clear
    LOOP
        EXECUTE format('DELETE FROM %I WHERE company_id = $1', table_name) USING company_id_param;
        GET DIAGNOSTICS total_deleted = ROW_COUNT;
        RAISE NOTICE 'Cleared % records from %', total_deleted, table_name;
    END LOOP;
    RETURN format('Cleared all data for company %s', company_id_param);
END;
$$ LANGUAGE plpgsql;

-- 6. Create view for purchase order summary
CREATE OR REPLACE VIEW purchase_order_details AS
SELECT 
    po.*,
    s.name as supplier_name_detail,
    s.phone as supplier_phone,
    p.name as project_name_detail
FROM purchase_orders po
LEFT JOIN suppliers s ON po.supplier_id = s.id
LEFT JOIN projects p ON po.project_id = p.id;

-- 7. Create view for store balance summary
CREATE OR REPLACE VIEW store_balance_summary AS
SELECT 
    company_id,
    project_id,
    project_name,
    item_id,
    item_name,
    unit,
    category,
    SUM(quantity_supplied) as total_supplied,
    SUM(quantity_issued) as total_issued,
    SUM(quantity_returned) as total_returned,
    SUM(quantity_supplied) - SUM(quantity_issued) + SUM(quantity_returned) as current_balance
FROM store_transactions
GROUP BY company_id, project_id, project_name, item_id, item_name, unit, category;

-- 8. Create function to update store balance (for trigger later)
CREATE OR REPLACE FUNCTION update_store_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate new balance for this item
    NEW.balance = COALESCE(
        (SELECT SUM(quantity_supplied) - SUM(quantity_issued) + SUM(quantity_returned)
         FROM store_transactions 
         WHERE company_id = NEW.company_id 
           AND project_id = NEW.project_id 
           AND item_id = NEW.item_id),
        0
    ) + NEW.quantity_supplied - NEW.quantity_issued + NEW.quantity_returned;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger to auto-calculate balance (optional - can be enabled later)
DROP TRIGGER IF EXISTS trigger_update_store_balance ON store_transactions;
CREATE TRIGGER trigger_update_store_balance
    BEFORE INSERT ON store_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_store_balance();

-- 10. Verify all fixes were applied
DO $$
DECLARE
    missing_items TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Check purchase_orders columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_orders' AND column_name = 'expense_id') THEN
        missing_items := missing_items || 'purchase_orders.expense_id';
    END IF;
    
    -- Check supplies columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplies' AND column_name = 'expense_created') THEN
        missing_items := missing_items || 'supplies.expense_created';
    END IF;
    
    -- Report results
    IF array_length(missing_items, 1) > 0 THEN
        RAISE NOTICE 'Missing columns: %', missing_items;
    ELSE
        RAISE NOTICE '✅ All Phase 1 migrations completed successfully!';
    END IF;
END $$;