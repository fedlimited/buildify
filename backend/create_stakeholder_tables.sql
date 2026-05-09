-- STAKEHOLDER PORTAL TABLES
-- Run this in your Render PostgreSQL database

-- Documents table
CREATE TABLE IF NOT EXISTS project_documents (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    category VARCHAR(50) DEFAULT 'general',
    uploaded_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meeting Minutes table
CREATE TABLE IF NOT EXISTS project_minutes (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    meeting_date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    meeting_type VARCHAR(50) DEFAULT 'regular',
    status VARCHAR(50) DEFAULT 'draft',
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Minutes Attendees table
CREATE TABLE IF NOT EXISTS minutes_attendees (
    id SERIAL PRIMARY KEY,
    minutes_id INTEGER NOT NULL,
    stakeholder_id INTEGER NOT NULL,
    attendance_status VARCHAR(50) DEFAULT 'present',
    notes TEXT
);

-- Minutes Agenda table
CREATE TABLE IF NOT EXISTS minutes_agenda (
    id SERIAL PRIMARY KEY,
    minutes_id INTEGER NOT NULL,
    item_order INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    proposed_by INTEGER,
    estimated_duration INTEGER
);

-- Minutes Topics table
CREATE TABLE IF NOT EXISTS minutes_topics (
    id SERIAL PRIMARY KEY,
    minutes_id INTEGER NOT NULL,
    topic_type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Action Items table
CREATE TABLE IF NOT EXISTS minutes_action_items (
    id SERIAL PRIMARY KEY,
    minutes_id INTEGER NOT NULL,
    topic_id INTEGER,
    description TEXT NOT NULL,
    assigned_to INTEGER NOT NULL,
    assigned_by INTEGER NOT NULL,
    due_date DATE NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'pending',
    reminder_sent BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    completion_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task Reminders table
CREATE TABLE IF NOT EXISTS task_reminders (
    id SERIAL PRIMARY KEY,
    action_item_id INTEGER NOT NULL,
    reminder_date TIMESTAMP NOT NULL,
    reminder_type VARCHAR(50) DEFAULT 'due_date',
    sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    email_status VARCHAR(50)
);

-- Document Revisions table
CREATE TABLE IF NOT EXISTS document_revisions (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL,
    version INTEGER NOT NULL,
    revision_notes TEXT,
    file_url TEXT NOT NULL,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_documents_project ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_minutes_project ON project_minutes(project_id);
CREATE INDEX IF NOT EXISTS idx_minutes_action_items_assigned ON minutes_action_items(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_task_reminders_pending ON task_reminders(sent, reminder_date);