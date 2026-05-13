CREATE TABLE IF NOT EXISTS site_diary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  project_id INTEGER NOT NULL,
  project_name TEXT NOT NULL,
  weather TEXT,
  workers_present INTEGER DEFAULT 0,
  work_done TEXT,
  equipment_used TEXT,
  materials_used TEXT,
  challenges TEXT,
  next_day_plan TEXT,
  supervisor TEXT,
  company_id INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);