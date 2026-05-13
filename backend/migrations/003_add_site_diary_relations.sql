-- ============================================
-- INGENIOUS SITE DIARY MIGRATION
-- Adds proper relationships for workers and subcontractors
-- ============================================

-- Step 1: Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add site_workers column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_diary_entries' AND column_name = 'site_workers') THEN
        ALTER TABLE site_diary_entries ADD COLUMN site_workers TEXT;
    END IF;
    
    -- Add site_subcontractors column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_diary_entries' AND column_name = 'site_subcontractors') THEN
        ALTER TABLE site_diary_entries ADD COLUMN site_subcontractors TEXT;
    END IF;
    
    -- Add worker_ids column for proper relations (JSON array of worker IDs)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_diary_entries' AND column_name = 'worker_ids') THEN
        ALTER TABLE site_diary_entries ADD COLUMN worker_ids TEXT DEFAULT '[]';
    END IF;
    
    -- Add subcontractor_ids column for proper relations
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_diary_entries' AND column_name = 'subcontractor_ids') THEN
        ALTER TABLE site_diary_entries ADD COLUMN subcontractor_ids TEXT DEFAULT '[]';
    END IF;
    
    -- Add indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_site_diary_date ON site_diary_entries(date);
    CREATE INDEX IF NOT EXISTS idx_site_diary_project ON site_diary_entries(project_id);
    CREATE INDEX IF NOT EXISTS idx_site_diary_status ON site_diary_entries(status);
END $$;

-- Step 2: Create a view for easy querying with worker details
CREATE OR REPLACE VIEW site_diary_with_details AS
SELECT 
    sde.*,
    p.name as project_details,
    json_agg(DISTINCT w.*) FILTER (WHERE w.id IS NOT NULL) as workers_details,
    json_agg(DISTINCT sc.*) FILTER (WHERE sc.id IS NOT NULL) as subcontractors_details
FROM site_diary_entries sde
LEFT JOIN projects p ON sde.project_id = p.id
LEFT JOIN LATERAL json_array_elements_text(COALESCE(sde.worker_ids::json, '[]'::json)) AS worker_id ON true
LEFT JOIN workers w ON w.id = worker_id::integer AND w.company_id = sde.company_id
LEFT JOIN LATERAL json_array_elements_text(COALESCE(sde.subcontractor_ids::json, '[]'::json)) AS sub_id ON true
LEFT JOIN subcontractors sc ON sc.id = sub_id::integer AND sc.company_id = sde.company_id
GROUP BY sde.id, p.name;