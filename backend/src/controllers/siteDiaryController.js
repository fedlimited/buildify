const { getDb } = require('../config/database');

const siteDiaryController = {
    // Get all entries
    getEntries: async (req, res) => {
        try {
            const db = await getDb();
            const company_id = req.user?.companyId || req.user?.company_id;
            
            console.log('Fetching site diary entries for company:', company_id);
            
            const entries = await db.all(
                `SELECT * FROM site_diary_entries WHERE company_id = ? ORDER BY date DESC`,
                [company_id]
            );
            
            const parsedEntries = entries.map(entry => {
                // Safely parse JSON fields
                let weather = {};
                let activities = [];
                let deliveries = [];
                let incidents = [];
                let siteWorkers = [];
                let siteSubcontractors = [];
                let summary = {};
                
                try { weather = entry.weather ? JSON.parse(entry.weather) : { condition: 'sunny', temp: 28 }; } catch(e) { weather = { condition: 'sunny', temp: 28 }; }
                try { activities = entry.activities ? JSON.parse(entry.activities) : []; } catch(e) { activities = []; }
                try { deliveries = entry.deliveries ? JSON.parse(entry.deliveries) : []; } catch(e) { deliveries = []; }
                try { incidents = entry.incidents ? JSON.parse(entry.incidents) : []; } catch(e) { incidents = []; }
                try { siteWorkers = entry.site_workers ? JSON.parse(entry.site_workers) : []; } catch(e) { siteWorkers = []; }
                try { siteSubcontractors = entry.site_subcontractors ? JSON.parse(entry.site_subcontractors) : []; } catch(e) { siteSubcontractors = []; }
                try { summary = entry.summary ? JSON.parse(entry.summary) : {}; } catch(e) { summary = {}; }
                
                return {
                    id: entry.id,
                    date: entry.date,
                    projectId: entry.project_id,
                    projectName: entry.project_name,
                    weather: weather,
                    totalWorkers: entry.total_workers || 0,
                    activities: activities,
                    deliveries: deliveries,
                    incidents: incidents,
                    siteWorkers: siteWorkers,
                    siteSubcontractors: siteSubcontractors,
                    summary: summary,
                    status: entry.status || 'Draft',
                    createdAt: entry.created_at
                };
            });
            
            res.json(parsedEntries);
        } catch (error) {
            console.error('Error in getEntries:', error);
            res.status(500).json({ error: error.message });
        }
    },
    
    // Get single entry by ID
    getEntryById: async (req, res) => {
        try {
            const db = await getDb();
            const company_id = req.user?.companyId || req.user?.company_id;
            const { id } = req.params;
            
            const entry = await db.get(
                `SELECT * FROM site_diary_entries WHERE id = ? AND company_id = ?`,
                [id, company_id]
            );
            
            if (!entry) {
                return res.status(404).json({ error: 'Entry not found' });
            }
            
            // Safely parse JSON fields
            let weather = {}, activities = [], deliveries = [], incidents = [], siteWorkers = [], siteSubcontractors = [], summary = {};
            try { weather = entry.weather ? JSON.parse(entry.weather) : { condition: 'sunny', temp: 28 }; } catch(e) {}
            try { activities = entry.activities ? JSON.parse(entry.activities) : []; } catch(e) {}
            try { deliveries = entry.deliveries ? JSON.parse(entry.deliveries) : []; } catch(e) {}
            try { incidents = entry.incidents ? JSON.parse(entry.incidents) : []; } catch(e) {}
            try { siteWorkers = entry.site_workers ? JSON.parse(entry.site_workers) : []; } catch(e) {}
            try { siteSubcontractors = entry.site_subcontractors ? JSON.parse(entry.site_subcontractors) : []; } catch(e) {}
            try { summary = entry.summary ? JSON.parse(entry.summary) : {}; } catch(e) {}
            
            res.json({
                id: entry.id,
                date: entry.date,
                projectId: entry.project_id,
                projectName: entry.project_name,
                weather: weather,
                totalWorkers: entry.total_workers || 0,
                activities: activities,
                deliveries: deliveries,
                incidents: incidents,
                siteWorkers: siteWorkers,
                siteSubcontractors: siteSubcontractors,
                summary: summary,
                status: entry.status || 'Draft',
                createdAt: entry.created_at
            });
        } catch (error) {
            console.error('Error in getEntryById:', error);
            res.status(500).json({ error: error.message });
        }
    },
    
    // Create new entry
    createEntry: async (req, res) => {
        try {
            const db = await getDb();
            const company_id = req.user?.companyId || req.user?.company_id;
            
            console.log('Creating site diary entry for company:', company_id);
            console.log('Request body:', JSON.stringify(req.body, null, 2));
            
            const {
                date,
                project_id,
                project_name,
                weather,
                total_workers,
                activities,
                deliveries,
                incidents,
                site_workers,
                site_subcontractors,
                summary,
                status
            } = req.body;
            
            // Validate required fields
            if (!date) {
                return res.status(400).json({ error: 'Date is required' });
            }
            if (!project_id && !project_name) {
                return res.status(400).json({ error: 'Project is required' });
            }
            
            const result = await db.run(
                `INSERT INTO site_diary_entries (
                    company_id, date, project_id, project_name,
                    weather, total_workers, activities, deliveries,
                    incidents, site_workers, site_subcontractors,
                    summary, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()) RETURNING id`,
                [
                    company_id,
                    date,
                    project_id || null,
                    project_name || '',
                    JSON.stringify(weather || { condition: 'sunny', temp: 28 }),
                    total_workers || 0,
                    JSON.stringify(activities || []),
                    JSON.stringify(deliveries || []),
                    JSON.stringify(incidents || []),
                    JSON.stringify(site_workers || []),
                    JSON.stringify(site_subcontractors || []),
                    JSON.stringify(summary || {}),
                    status || 'Submitted'
                ]
            );
            
            const newEntry = await db.get(
                `SELECT * FROM site_diary_entries WHERE id = ?`,
                [result.lastID]
            );
            
            // Parse JSON fields for response
            let weatherData = {}, activitiesData = [], deliveriesData = [], incidentsData = [], siteWorkersData = [], siteSubcontractorsData = [], summaryData = {};
            try { weatherData = newEntry.weather ? JSON.parse(newEntry.weather) : {}; } catch(e) {}
            try { activitiesData = newEntry.activities ? JSON.parse(newEntry.activities) : []; } catch(e) {}
            try { deliveriesData = newEntry.deliveries ? JSON.parse(newEntry.deliveries) : []; } catch(e) {}
            try { incidentsData = newEntry.incidents ? JSON.parse(newEntry.incidents) : []; } catch(e) {}
            try { siteWorkersData = newEntry.site_workers ? JSON.parse(newEntry.site_workers) : []; } catch(e) {}
            try { siteSubcontractorsData = newEntry.site_subcontractors ? JSON.parse(newEntry.site_subcontractors) : []; } catch(e) {}
            try { summaryData = newEntry.summary ? JSON.parse(newEntry.summary) : {}; } catch(e) {}
            
            res.status(201).json({
                id: newEntry.id,
                date: newEntry.date,
                projectId: newEntry.project_id,
                projectName: newEntry.project_name,
                weather: weatherData,
                totalWorkers: newEntry.total_workers || 0,
                activities: activitiesData,
                deliveries: deliveriesData,
                incidents: incidentsData,
                siteWorkers: siteWorkersData,
                siteSubcontractors: siteSubcontractorsData,
                summary: summaryData,
                status: newEntry.status,
                createdAt: newEntry.created_at
            });
        } catch (error) {
            console.error('Error in createEntry:', error);
            res.status(500).json({ error: error.message });
        }
    },
    
    // Update entry
    updateEntry: async (req, res) => {
        try {
            const db = await getDb();
            const company_id = req.user?.companyId || req.user?.company_id;
            const { id } = req.params;
            
            console.log('Updating site diary entry:', id);
            
            const {
                date,
                project_id,
                project_name,
                weather,
                total_workers,
                activities,
                deliveries,
                incidents,
                site_workers,
                site_subcontractors,
                summary,
                status
            } = req.body;
            
            // Build update query dynamically
            const updates = [];
            const values = [];
            
            if (date !== undefined) { updates.push('date = ?'); values.push(date); }
            if (project_id !== undefined) { updates.push('project_id = ?'); values.push(project_id); }
            if (project_name !== undefined) { updates.push('project_name = ?'); values.push(project_name); }
            if (weather !== undefined) { updates.push('weather = ?'); values.push(JSON.stringify(weather)); }
            if (total_workers !== undefined) { updates.push('total_workers = ?'); values.push(total_workers); }
            if (activities !== undefined) { updates.push('activities = ?'); values.push(JSON.stringify(activities)); }
            if (deliveries !== undefined) { updates.push('deliveries = ?'); values.push(JSON.stringify(deliveries)); }
            if (incidents !== undefined) { updates.push('incidents = ?'); values.push(JSON.stringify(incidents)); }
            if (site_workers !== undefined) { updates.push('site_workers = ?'); values.push(JSON.stringify(site_workers)); }
            if (site_subcontractors !== undefined) { updates.push('site_subcontractors = ?'); values.push(JSON.stringify(site_subcontractors)); }
            if (summary !== undefined) { updates.push('summary = ?'); values.push(JSON.stringify(summary)); }
            if (status !== undefined) { updates.push('status = ?'); values.push(status); }
            
            values.push(id, company_id);
            
            const query = `UPDATE site_diary_entries SET ${updates.join(', ')} WHERE id = ? AND company_id = ?`;
            
            const result = await db.run(query, values);
            
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Entry not found' });
            }
            
            const updatedEntry = await db.get(
                `SELECT * FROM site_diary_entries WHERE id = ? AND company_id = ?`,
                [id, company_id]
            );
            
            // Parse JSON fields for response
            let weatherData = {}, activitiesData = [], deliveriesData = [], incidentsData = [], siteWorkersData = [], siteSubcontractorsData = [], summaryData = {};
            try { weatherData = updatedEntry.weather ? JSON.parse(updatedEntry.weather) : {}; } catch(e) {}
            try { activitiesData = updatedEntry.activities ? JSON.parse(updatedEntry.activities) : []; } catch(e) {}
            try { deliveriesData = updatedEntry.deliveries ? JSON.parse(updatedEntry.deliveries) : []; } catch(e) {}
            try { incidentsData = updatedEntry.incidents ? JSON.parse(updatedEntry.incidents) : []; } catch(e) {}
            try { siteWorkersData = updatedEntry.site_workers ? JSON.parse(updatedEntry.site_workers) : []; } catch(e) {}
            try { siteSubcontractorsData = updatedEntry.site_subcontractors ? JSON.parse(updatedEntry.site_subcontractors) : []; } catch(e) {}
            try { summaryData = updatedEntry.summary ? JSON.parse(updatedEntry.summary) : {}; } catch(e) {}
            
            res.json({
                id: updatedEntry.id,
                date: updatedEntry.date,
                projectId: updatedEntry.project_id,
                projectName: updatedEntry.project_name,
                weather: weatherData,
                totalWorkers: updatedEntry.total_workers || 0,
                activities: activitiesData,
                deliveries: deliveriesData,
                incidents: incidentsData,
                siteWorkers: siteWorkersData,
                siteSubcontractors: siteSubcontractorsData,
                summary: summaryData,
                status: updatedEntry.status,
                createdAt: updatedEntry.created_at
            });
        } catch (error) {
            console.error('Error in updateEntry:', error);
            res.status(500).json({ error: error.message });
        }
    },
    
    // Delete entry
    deleteEntry: async (req, res) => {
        try {
            const db = await getDb();
            const company_id = req.user?.companyId || req.user?.company_id;
            const { id } = req.params;
            
            const result = await db.run(
                `DELETE FROM site_diary_entries WHERE id = ? AND company_id = ?`,
                [id, company_id]
            );
            
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Entry not found' });
            }
            
            res.status(204).send();
        } catch (error) {
            console.error('Error in deleteEntry:', error);
            res.status(500).json({ error: error.message });
        }
    },
    
    // Get statistics for dashboard
    getStatistics: async (req, res) => {
        try {
            const db = await getDb();
            const company_id = req.user?.companyId || req.user?.company_id;
            const { start_date, end_date } = req.query;
            
            let query = `
                SELECT 
                    COUNT(*) as total_entries,
                    COALESCE(SUM(total_workers), 0) as total_worker_days,
                    COUNT(DISTINCT project_id) as total_projects,
                    COALESCE(AVG(total_workers), 0) as avg_workers_per_day
                FROM site_diary_entries
                WHERE company_id = ?
            `;
            const params = [company_id];
            
            if (start_date) {
                query += ` AND date >= ?`;
                params.push(start_date);
            }
            if (end_date) {
                query += ` AND date <= ?`;
                params.push(end_date);
            }
            
            const stats = await db.get(query, params);
            
            res.json({
                totalEntries: stats?.total_entries || 0,
                totalWorkerDays: stats?.total_worker_days || 0,
                totalProjects: stats?.total_projects || 0,
                avgWorkersPerDay: Math.round(stats?.avg_workers_per_day || 0)
            });
        } catch (error) {
            console.error('Error in getStatistics:', error);
            res.status(500).json({ error: error.message });
        }
    },
    
    // Get entries by date range
    getEntriesByDateRange: async (req, res) => {
        try {
            const db = await getDb();
            const company_id = req.user?.companyId || req.user?.company_id;
            const { start_date, end_date } = req.query;
            
            if (!start_date || !end_date) {
                return res.status(400).json({ error: 'start_date and end_date are required' });
            }
            
            const entries = await db.all(
                `SELECT * FROM site_diary_entries 
                 WHERE company_id = ? AND date >= ? AND date <= ? 
                 ORDER BY date DESC`,
                [company_id, start_date, end_date]
            );
            
            const parsedEntries = entries.map(entry => {
                let weather = {}, activities = [], deliveries = [], incidents = [], siteWorkers = [], siteSubcontractors = [], summary = {};
                try { weather = entry.weather ? JSON.parse(entry.weather) : {}; } catch(e) {}
                try { activities = entry.activities ? JSON.parse(entry.activities) : []; } catch(e) {}
                try { deliveries = entry.deliveries ? JSON.parse(entry.deliveries) : []; } catch(e) {}
                try { incidents = entry.incidents ? JSON.parse(entry.incidents) : []; } catch(e) {}
                try { siteWorkers = entry.site_workers ? JSON.parse(entry.site_workers) : []; } catch(e) {}
                try { siteSubcontractors = entry.site_subcontractors ? JSON.parse(entry.site_subcontractors) : []; } catch(e) {}
                try { summary = entry.summary ? JSON.parse(entry.summary) : {}; } catch(e) {}
                
                return {
                    id: entry.id,
                    date: entry.date,
                    projectId: entry.project_id,
                    projectName: entry.project_name,
                    weather: weather,
                    totalWorkers: entry.total_workers || 0,
                    activities: activities,
                    deliveries: deliveries,
                    incidents: incidents,
                    siteWorkers: siteWorkers,
                    siteSubcontractors: siteSubcontractors,
                    summary: summary,
                    status: entry.status || 'Draft',
                    createdAt: entry.created_at
                };
            });
            
            res.json(parsedEntries);
        } catch (error) {
            console.error('Error in getEntriesByDateRange:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = siteDiaryController;