const { getDb } = require('../config/database');
const emailService = require('../services/emailService');

class MinutesController {
    // Get all minutes for a project
    async getProjectMinutes(req, res) {
        try {
            const db = getDb();
            const { projectId } = req.params;

            const result = await db.query(
                `SELECT m.*, u.name as created_by_name,
                    (SELECT COUNT(*) FROM minutes_action_items WHERE minutes_id = m.id AND status != 'completed') as pending_tasks
                 FROM project_minutes m
                 JOIN users u ON m.created_by = u.id
                 WHERE m.project_id = $1
                 ORDER BY m.meeting_date DESC`,
                [projectId]
            );

            res.json(result.rows);
        } catch (error) {
            console.error('Get minutes error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Create new minutes
    async createMinutes(req, res) {
        try {
            const db = getDb();
            const { project_id, meeting_date, title, location, meeting_type, attendees, agenda_items } = req.body;
            const user_id = req.user.id;

            const result = await db.query(
                `INSERT INTO project_minutes 
                (project_id, meeting_date, title, location, meeting_type, status, created_by)
                 VALUES ($1, $2, $3, $4, $5, 'draft', $6)
                 RETURNING *`,
                [project_id, meeting_date, title, location, meeting_type, user_id]
            );

            const minutesId = result.rows[0].id;

            // Add attendees
            if (attendees && attendees.length) {
                for (const attendee of attendees) {
                    await db.query(
                        `INSERT INTO minutes_attendees (minutes_id, stakeholder_id, attendance_status)
                         VALUES ($1, $2, $3)`,
                        [minutesId, attendee.id, attendee.status || 'present']
                    );
                }
            }

            // Add agenda items
            if (agenda_items && agenda_items.length) {
                for (let i = 0; i < agenda_items.length; i++) {
                    await db.query(
                        `INSERT INTO minutes_agenda (minutes_id, item_order, title, description, proposed_by)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [minutesId, i + 1, agenda_items[i].title, agenda_items[i].description, agenda_items[i].proposed_by || user_id]
                    );
                }
            }

            res.status(201).json({
                success: true,
                message: 'Minutes created successfully',
                minutes: result.rows[0]
            });
        } catch (error) {
            console.error('Create minutes error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Update minutes (add topics, matters arising, etc.)
    async updateMinutes(req, res) {
        try {
            const db = getDb();
            const { minutesId } = req.params;
            const { status, topics, matters_arising, aob } = req.body;

            // Update status if provided
            if (status) {
                await db.query(
                    `UPDATE project_minutes SET status = $1, updated_at = CURRENT_TIMESTAMP
                     WHERE id = $2`,
                    [status, minutesId]
                );
            }

            // Add matters arising as a topic
            if (matters_arising) {
                await db.query(
                    `INSERT INTO minutes_topics (minutes_id, topic_type, title, content)
                     VALUES ($1, 'matters_arising', 'Matters Arising', $2)`,
                    [minutesId, matters_arising]
                );
            }

            // Add AOB
            if (aob) {
                await db.query(
                    `INSERT INTO minutes_topics (minutes_id, topic_type, title, content)
                     VALUES ($1, 'aob', 'Any Other Business', $2)`,
                    [minutesId, aob]
                );
            }

            // Add custom topics
            if (topics && topics.length) {
                for (const topic of topics) {
                    await db.query(
                        `INSERT INTO minutes_topics (minutes_id, topic_type, title, content)
                         VALUES ($1, 'custom', $2, $3)`,
                        [minutesId, topic.title, topic.content]
                    );
                }
            }

            res.json({
                success: true,
                message: 'Minutes updated successfully'
            });
        } catch (error) {
            console.error('Update minutes error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Add action item with task assignment
    async addActionItem(req, res) {
        try {
            const db = getDb();
            const { minutes_id, description, assigned_to, due_date, priority, topic_id } = req.body;
            const user_id = req.user.id;

            // Validate due date
            if (new Date(due_date) < new Date()) {
                return res.status(400).json({ error: 'Due date cannot be in the past' });
            }

            const result = await db.query(
                `INSERT INTO minutes_action_items 
                (minutes_id, topic_id, description, assigned_to, assigned_by, due_date, priority, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
                 RETURNING *`,
                [minutes_id, topic_id || null, description, assigned_to, user_id, due_date, priority]
            );

            const actionItem = result.rows[0];

            // Get stakeholder and project details for email
            const details = await db.query(
                `SELECT u.name as assignee_name, u.email, p.name as project_name, m.title as minutes_title
                 FROM users u
                 JOIN project_stakeholders ps ON u.id = ps.user_id
                 JOIN projects p ON ps.project_id = p.id
                 JOIN project_minutes m ON m.project_id = p.id
                 WHERE u.id = $1 AND m.id = $2 AND ps.status = 'active'`,
                [assigned_to, minutes_id]
            );

            // Get assigner name
            const assigner = await db.query(
                'SELECT name FROM users WHERE id = $1',
                [user_id]
            );
            const assigner_name = assigner.rows[0]?.name || 'A project manager';

            if (details.rows.length > 0 && emailService.sendTaskAssignment) {
                await emailService.sendTaskAssignment({
                    to: details.rows[0].email,
                    assignee_name: details.rows[0].assignee_name,
                    assigner_name: assigner_name,
                    project_name: details.rows[0].project_name,
                    minutes_title: details.rows[0].minutes_title,
                    task: description,
                    due_date: due_date,
                    priority: priority,
                    action_item_id: actionItem.id
                });
            }

            // Schedule reminder (1 day before due date)
            const reminderDate = new Date(due_date);
            reminderDate.setDate(reminderDate.getDate() - 1);
            
            if (reminderDate > new Date()) {
                await db.query(
                    `INSERT INTO task_reminders (action_item_id, reminder_date, reminder_type)
                     VALUES ($1, $2, 'due_date')`,
                    [actionItem.id, reminderDate]
                );
            }

            res.status(201).json({
                success: true,
                message: 'Action item created and assigned',
                actionItem: actionItem
            });
        } catch (error) {
            console.error('Add action item error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Get minutes with all details
    async getMinutesDetails(req, res) {
        try {
            const db = getDb();
            const { minutesId } = req.params;

            // Get minutes header
            const minutes = await db.query(
                `SELECT m.*, u.name as created_by_name
                 FROM project_minutes m
                 JOIN users u ON m.created_by = u.id
                 WHERE m.id = $1`,
                [minutesId]
            );

            if (minutes.rows.length === 0) {
                return res.status(404).json({ error: 'Minutes not found' });
            }

            // Get all stakeholders for this project (for attendee dropdown)
            const projectId = minutes.rows[0].project_id;
            const allStakeholders = await db.query(
                `SELECT u.id, u.name, u.email, u.role
                 FROM users u
                 JOIN project_stakeholders ps ON u.id = ps.user_id
                 WHERE ps.project_id = $1 AND ps.status = 'active'`,
                [projectId]
            );

            // Get attendees
            const attendees = await db.query(
                `SELECT ma.*, u.name, u.email, u.role
                 FROM minutes_attendees ma
                 JOIN users u ON ma.stakeholder_id = u.id
                 WHERE ma.minutes_id = $1`,
                [minutesId]
            );

            // Get agenda items
            const agenda = await db.query(
                `SELECT * FROM minutes_agenda
                 WHERE minutes_id = $1
                 ORDER BY item_order`,
                [minutesId]
            );

            // Get topics (matters arising, etc.)
            const topics = await db.query(
                `SELECT * FROM minutes_topics
                 WHERE minutes_id = $1
                 ORDER BY id`,
                [minutesId]
            );

            // Get action items with assignment details
            const actionItems = await db.query(
                `SELECT ai.*, 
                        assigned_user.name as assigned_to_name,
                        assigner_user.name as assigned_by_name,
                        (SELECT COUNT(*) FROM task_reminders WHERE action_item_id = ai.id AND sent = false) as pending_reminders
                 FROM minutes_action_items ai
                 JOIN users assigned_user ON ai.assigned_to = assigned_user.id
                 JOIN users assigner_user ON ai.assigned_by = assigner_user.id
                 WHERE ai.minutes_id = $1
                 ORDER BY 
                    CASE ai.status 
                        WHEN 'pending' THEN 1
                        WHEN 'overdue' THEN 2
                        WHEN 'in_progress' THEN 3
                        ELSE 4
                    END,
                    ai.due_date ASC`,
                [minutesId]
            );

            res.json({
                minutes: minutes.rows[0],
                allStakeholders: allStakeholders.rows,
                attendees: attendees.rows,
                agenda: agenda.rows,
                topics: topics.rows,
                actionItems: actionItems.rows
            });
        } catch (error) {
            console.error('Get minutes details error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Update task status
    async updateTaskStatus(req, res) {
        try {
            const db = getDb();
            const { actionItemId } = req.params;
            const { status, completion_notes } = req.body;
            const user_id = req.user.id;

            // Check if user is assigned to this task
            const task = await db.query(
                'SELECT * FROM minutes_action_items WHERE id = $1',
                [actionItemId]
            );

            if (task.rows.length === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }

            if (task.rows[0].assigned_to !== user_id && !req.user.is_admin) {
                return res.status(403).json({ error: 'You are not assigned to this task' });
            }

            const result = await db.query(
                `UPDATE minutes_action_items 
                 SET status = $1, 
                     completion_notes = COALESCE($2, completion_notes),
                     completed_at = CASE WHEN $1 = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $3
                 RETURNING *`,
                [status, completion_notes, actionItemId]
            );

            // If completed, cancel pending reminders
            if (status === 'completed') {
                await db.query(
                    `UPDATE task_reminders SET sent = true WHERE action_item_id = $1 AND sent = false`,
                    [actionItemId]
                );
            }

            res.json({
                success: true,
                message: 'Task status updated',
                task: result.rows[0]
            });
        } catch (error) {
            console.error('Update task error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Get upcoming tasks for current user
    async getUpcomingTasks(req, res) {
        try {
            const db = getDb();
            const user_id = req.user.id;

            const tasks = await db.query(
                `SELECT ai.*, p.name as project_name, m.title as minutes_title,
                        assigner_user.name as assigned_by_name
                 FROM minutes_action_items ai
                 JOIN project_minutes m ON ai.minutes_id = m.id
                 JOIN projects p ON m.project_id = p.id
                 JOIN users assigner_user ON ai.assigned_by = assigner_user.id
                 WHERE ai.assigned_to = $1 
                   AND ai.status IN ('pending', 'in_progress')
                   AND ai.due_date >= CURRENT_DATE - INTERVAL '7 days'
                 ORDER BY 
                    CASE WHEN ai.due_date < CURRENT_DATE THEN 0 ELSE 1 END,
                    ai.due_date ASC
                 LIMIT 20`,
                [user_id]
            );

            res.json(tasks.rows);
        } catch (error) {
            console.error('Get upcoming tasks error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new MinutesController();