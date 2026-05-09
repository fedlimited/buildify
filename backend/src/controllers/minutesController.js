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
                    (SELECT COUNT(*) FROM minutes_action_items WHERE minutes_id = m.id AND status != 'completed') as pending_tasks,
                    (SELECT COUNT(*) FROM minutes_action_items WHERE minutes_id = m.id AND due_date < CURRENT_DATE AND status != 'completed') as overdue_tasks
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

    // Get matters arising from previous meetings
    async getMattersArising(req, res) {
        try {
            const db = getDb();
            const { minutesId } = req.params;
            
            const result = await db.query(`
                SELECT ma.*, ai.description, ai.due_date, ai.priority, 
                       ai.status as action_status, u.name as assigned_to_name,
                       pm.title as previous_meeting_title, pm.meeting_date as previous_meeting_date
                FROM matters_arising ma
                JOIN minutes_action_items ai ON ma.action_item_id = ai.id
                JOIN project_minutes pm ON ma.previous_minutes_id = pm.id
                JOIN users u ON ai.assigned_to = u.id
                WHERE ma.minutes_id = $1 AND ma.status != 'resolved'
                ORDER BY ai.due_date ASC
            `, [minutesId]);
            
            res.json(result.rows);
        } catch (error) {
            console.error('Get matters arising error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Create new minutes
    async createMinutes(req, res) {
        try {
            const db = getDb();
            const { project_id, meeting_date, title, location, meeting_type, attendees } = req.body;
            const user_id = req.user.id;

            const result = await db.query(
                `INSERT INTO project_minutes 
                (project_id, meeting_date, title, location, meeting_type, status, approval_status, created_by, version)
                 VALUES ($1, $2, $3, $4, $5, 'draft', 'draft', $6, 1)
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

            // Get unresolved action items from previous meetings to add as matters arising
            const previousUnresolved = await db.query(`
                SELECT ai.id, ai.description, ai.assigned_to, ai.assigned_by, ai.due_date, ai.priority, m.id as previous_minutes_id
                FROM minutes_action_items ai
                JOIN project_minutes m ON ai.minutes_id = m.id
                WHERE m.project_id = $1 
                  AND m.meeting_date < $2
                  AND ai.status NOT IN ('completed', 'cancelled')
                ORDER BY m.meeting_date DESC
                LIMIT 20
            `, [project_id, meeting_date]);

            // Add matters arising
            for (const item of previousUnresolved.rows) {
                await db.query(`
                    INSERT INTO matters_arising (minutes_id, action_item_id, previous_minutes_id, status)
                    VALUES ($1, $2, $3, 'pending')
                `, [minutesId, item.id, item.previous_minutes_id]);
            }

            res.status(201).json({
                success: true,
                message: 'Minutes created successfully',
                minutes: result.rows[0],
                matters_arising_count: previousUnresolved.rows.length
            });
        } catch (error) {
            console.error('Create minutes error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Update minutes with agenda, decisions, etc.
    async updateMinutes(req, res) {
        try {
            const db = getDb();
            const { minutesId } = req.params;
            const { topics, agenda_items, status, approval_status } = req.body;
            const userId = req.user.id;

            // Get current version for versioning
            const currentMinutes = await db.query(
                'SELECT * FROM project_minutes WHERE id = $1',
                [minutesId]
            );

            // Save version history
            if (currentMinutes.rows.length > 0) {
                const currentAgenda = await db.query(
                    'SELECT * FROM minutes_agenda WHERE minutes_id = $1 ORDER BY item_order',
                    [minutesId]
                );
                const currentActionItems = await db.query(
                    'SELECT * FROM minutes_action_items WHERE minutes_id = $1',
                    [minutesId]
                );

                const versionContent = {
                    minutes: currentMinutes.rows[0],
                    agenda: currentAgenda.rows,
                    action_items: currentActionItems.rows,
                    topics: topics || []
                };

                await db.query(
                    `INSERT INTO minutes_versions (minutes_id, version_number, content, changed_by, change_reason)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [minutesId, currentMinutes.rows[0].version || 1, JSON.stringify(versionContent), userId, 'Update minutes']
                );
            }

            // Update minutes
            let updateQuery = `UPDATE project_minutes SET updated_at = CURRENT_TIMESTAMP, version = version + 1`;
            const updateParams = [];
            let paramIndex = 1;

            if (status) {
                updateQuery += `, status = $${paramIndex++}`;
                updateParams.push(status);
            }
            if (approval_status) {
                updateQuery += `, approval_status = $${paramIndex++}`;
                updateParams.push(approval_status);
                if (approval_status === 'approved') {
                    updateQuery += `, approved_by = $${paramIndex++}, approved_at = CURRENT_TIMESTAMP`;
                    updateParams.push(userId);
                }
                if (approval_status === 'published') {
                    updateQuery += `, published_at = CURRENT_TIMESTAMP`;
                }
            }

            updateQuery += ` WHERE id = $${paramIndex}`;
            updateParams.push(minutesId);

            await db.query(updateQuery, updateParams);

            // Update or insert agenda items
            if (agenda_items && agenda_items.length) {
                // Delete existing agenda items for this minutes
                await db.query('DELETE FROM minutes_agenda WHERE minutes_id = $1', [minutesId]);
                
                for (let i = 0; i < agenda_items.length; i++) {
                    await db.query(
                        `INSERT INTO minutes_agenda (minutes_id, item_order, title, description, proposed_by, estimated_duration, decision, discussion_summary)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                        [minutesId, i + 1, agenda_items[i].title, agenda_items[i].description || '', 
                         agenda_items[i].proposed_by || userId, agenda_items[i].estimated_duration || 0,
                         agenda_items[i].decision || '', agenda_items[i].discussion_summary || '']
                    );
                }
            }

            // Add topics (discussions, decisions, next steps)
            if (topics && topics.length) {
                // Delete existing topics
                await db.query('DELETE FROM minutes_topics WHERE minutes_id = $1', [minutesId]);
                
                for (const topic of topics) {
                    await db.query(
                        `INSERT INTO minutes_topics (minutes_id, topic_type, title, content)
                         VALUES ($1, $2, $3, $4)`,
                        [minutesId, topic.topic_type || 'custom', topic.title, topic.content]
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

    // Publish minutes for approval
    async publishMinutes(req, res) {
        try {
            const db = getDb();
            const { minutesId } = req.params;
            const userId = req.user.id;
            
            // Get minutes details
            const minutes = await db.query('SELECT * FROM project_minutes WHERE id = $1', [minutesId]);
            
            if (minutes.rows.length === 0) {
                return res.status(404).json({ error: 'Minutes not found' });
            }
            
            // Save current version
            const agenda = await db.query('SELECT * FROM minutes_agenda WHERE minutes_id = $1 ORDER BY item_order', [minutesId]);
            const actionItems = await db.query('SELECT * FROM minutes_action_items WHERE minutes_id = $1', [minutesId]);
            const topics = await db.query('SELECT * FROM minutes_topics WHERE minutes_id = $1', [minutesId]);
            
            const versionContent = {
                minutes: minutes.rows[0],
                agenda: agenda.rows,
                action_items: actionItems.rows,
                topics: topics.rows
            };
            
            await db.query(`
                INSERT INTO minutes_versions (minutes_id, version_number, content, changed_by, change_reason)
                VALUES ($1, $2, $3, $4, $5)
            `, [minutesId, minutes.rows[0].version || 1, JSON.stringify(versionContent), userId, 'Published for approval']);
            
            // Update minutes status
            await db.query(`
                UPDATE project_minutes 
                SET approval_status = 'pending_approval', 
                    status = 'pending_approval',
                    version = COALESCE(version, 0) + 1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
            `, [minutesId]);
            
            // Get stakeholders to notify for approval (only those with can_approve = true or chairperson)
            const stakeholders = await db.query(`
                SELECT u.email, u.name, u.can_approve FROM project_stakeholders ps
                JOIN users u ON ps.user_id = u.id
                WHERE ps.project_id = (SELECT project_id FROM project_minutes WHERE id = $1)
                AND ps.is_active = true
                AND (u.can_approve = true OR u.id = (SELECT created_by FROM project_minutes WHERE id = $1))
            `, [minutesId]);
            
            // Send approval request emails
            for (const stakeholder of stakeholders.rows) {
                try {
                    await emailService.sendApprovalRequest({
                        to: stakeholder.email,
                        name: stakeholder.name,
                        minutesTitle: minutes.rows[0].title,
                        minutesId: minutesId,
                        frontendUrl: process.env.FRONTEND_URL
                    });
                } catch (emailErr) {
                    console.error(`Failed to send approval email to ${stakeholder.email}:`, emailErr.message);
                }
            }
            
            res.json({ 
                success: true, 
                message: 'Minutes published for approval',
                notified: stakeholders.rows.length
            });
        } catch (error) {
            console.error('Publish error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Approve minutes
    async approveMinutes(req, res) {
        try {
            const db = getDb();
            const { minutesId } = req.params;
            const userId = req.user.id;
            
            // Check if user has approval rights
            const user = await db.query('SELECT can_approve, role FROM users WHERE id = $1', [userId]);
            const canApprove = user.rows[0]?.can_approve || user.rows[0]?.role === 'admin';
            
            if (!canApprove) {
                return res.status(403).json({ error: 'You do not have permission to approve minutes' });
            }
            
            await db.query(`
                UPDATE project_minutes 
                SET approval_status = 'approved', 
                    approved_by = $2, 
                    approved_at = CURRENT_TIMESTAMP,
                    status = 'published',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
            `, [minutesId, userId]);
            
            res.json({ success: true, message: 'Minutes approved' });
        } catch (error) {
            console.error('Approve error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Reject minutes with feedback
    async rejectMinutes(req, res) {
        try {
            const db = getDb();
            const { minutesId } = req.params;
            const { feedback } = req.body;
            const userId = req.user.id;
            
            await db.query(`
                UPDATE project_minutes 
                SET approval_status = 'rejected', 
                    status = 'draft',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
            `, [minutesId]);
            
            // Notify creator about rejection
            const minutes = await db.query('SELECT created_by, title FROM project_minutes WHERE id = $1', [minutesId]);
            const creator = await db.query('SELECT email, name FROM users WHERE id = $1', [minutes.rows[0].created_by]);
            
            await emailService.sendMinutesRejection({
                to: creator.rows[0].email,
                name: creator.rows[0].name,
                minutesTitle: minutes.rows[0].title,
                feedback: feedback,
                minutesId: minutesId,
                frontendUrl: process.env.FRONTEND_URL
            });
            
            res.json({ success: true, message: 'Minutes rejected. Feedback sent to creator.' });
        } catch (error) {
            console.error('Reject error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Get minutes with all details
    async getMinutesDetails(req, res) {
        try {
            const db = getDb();
            const { minutesId } = req.params;
            const userId = req.user.id;

            // Get minutes header
            const minutes = await db.query(
                `SELECT m.*, u.name as created_by_name, u.email as created_by_email,
                        approver.name as approved_by_name
                 FROM project_minutes m
                 JOIN users u ON m.created_by = u.id
                 LEFT JOIN users approver ON m.approved_by = approver.id
                 WHERE m.id = $1`,
                [minutesId]
            );

            if (minutes.rows.length === 0) {
                return res.status(404).json({ error: 'Minutes not found' });
            }

            const projectId = minutes.rows[0].project_id;
            
            // Get all stakeholders for this project
            const allStakeholders = await db.query(
                `SELECT u.id, u.name, u.email, u.role, u.stakeholder_type, u.can_approve
                 FROM users u
                 JOIN project_stakeholders ps ON u.id = ps.user_id
                 WHERE ps.project_id = $1 AND ps.is_active = true`,
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

            // Get agenda items with decisions
            const agenda = await db.query(
                `SELECT * FROM minutes_agenda
                 WHERE minutes_id = $1
                 ORDER BY item_order`,
                [minutesId]
            );

            // Get topics (discussions, decisions, next steps)
            const topics = await db.query(
                `SELECT * FROM minutes_topics
                 WHERE minutes_id = $1
                 ORDER BY id`,
                [minutesId]
            );

            // Get action items with assignment details
            const actionItems = await db.query(
                `SELECT ai.*, 
                        assigned_user.name as assigned_to_name, assigned_user.email as assigned_to_email,
                        assigner_user.name as assigned_by_name,
                        (SELECT COUNT(*) FROM task_reminders WHERE action_item_id = ai.id AND sent = false) as pending_reminders
                 FROM minutes_action_items ai
                 JOIN users assigned_user ON ai.assigned_to = assigned_user.id
                 JOIN users assigner_user ON ai.assigned_by = assigner_user.id
                 WHERE ai.minutes_id = $1
                 ORDER BY 
                    CASE ai.status 
                        WHEN 'overdue' THEN 0
                        WHEN 'pending' THEN 1
                        WHEN 'in_progress' THEN 2
                        WHEN 'completed' THEN 3
                        ELSE 4
                    END,
                    ai.due_date ASC`,
                [minutesId]
            );

            // Get matters arising
            const mattersArising = await db.query(`
                SELECT ma.*, ai.description, ai.due_date, ai.priority, 
                       ai.status as action_status, u.name as assigned_to_name,
                       pm.title as previous_meeting_title, pm.meeting_date as previous_meeting_date
                FROM matters_arising ma
                JOIN minutes_action_items ai ON ma.action_item_id = ai.id
                JOIN project_minutes pm ON ma.previous_minutes_id = pm.id
                JOIN users u ON ai.assigned_to = u.id
                WHERE ma.minutes_id = $1
                ORDER BY ai.due_date ASC
            `, [minutesId]);

            // Get version history
            const versions = await db.query(
                `SELECT mv.*, u.name as changed_by_name
                 FROM minutes_versions mv
                 JOIN users u ON mv.changed_by = u.id
                 WHERE mv.minutes_id = $1
                 ORDER BY mv.changed_at DESC`,
                [minutesId]
            );

            res.json({
                minutes: minutes.rows[0],
                allStakeholders: allStakeholders.rows,
                attendees: attendees.rows,
                agenda: agenda.rows,
                topics: topics.rows,
                actionItems: actionItems.rows,
                mattersArising: mattersArising.rows,
                versions: versions.rows
            });
        } catch (error) {
            console.error('Get minutes details error:', error);
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
                `SELECT u.name as assignee_name, u.email, u.manager_id, 
                        p.name as project_name, m.title as minutes_title,
                        manager.email as manager_email
                 FROM users u
                 LEFT JOIN users manager ON u.manager_id = manager.id
                 JOIN project_stakeholders ps ON u.id = ps.user_id
                 JOIN projects p ON ps.project_id = p.id
                 JOIN project_minutes m ON m.project_id = p.id
                 WHERE u.id = $1 AND m.id = $2 AND ps.is_active = true`,
                [assigned_to, minutes_id]
            );

            // Get assigner name
            const assigner = await db.query('SELECT name FROM users WHERE id = $1', [user_id]);
            const assigner_name = assigner.rows[0]?.name || 'A project manager';

            if (details.rows.length > 0 && emailService && typeof emailService.sendTaskAssignment === 'function') {
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

            // Schedule reminders at multiple intervals
            const dueDateObj = new Date(due_date);
            
            // 48 hours before
            const reminder48h = new Date(dueDateObj);
            reminder48h.setHours(reminder48h.getHours() - 48);
            if (reminder48h > new Date()) {
                await db.query(
                    `INSERT INTO task_reminders (action_item_id, reminder_date, reminder_type)
                     VALUES ($1, $2, '48_hour')`,
                    [actionItem.id, reminder48h]
                );
            }
            
            // 24 hours before
            const reminder24h = new Date(dueDateObj);
            reminder24h.setHours(reminder24h.getHours() - 24);
            if (reminder24h > new Date()) {
                await db.query(
                    `INSERT INTO task_reminders (action_item_id, reminder_date, reminder_type)
                     VALUES ($1, $2, '24_hour')`,
                    [actionItem.id, reminder24h]
                );
            }
            
            // Due date at 9 AM
            const dueDay = new Date(dueDateObj);
            dueDay.setHours(9, 0, 0, 0);
            if (dueDay > new Date()) {
                await db.query(
                    `INSERT INTO task_reminders (action_item_id, reminder_date, reminder_type)
                     VALUES ($1, $2, 'due_today')`,
                    [actionItem.id, dueDay]
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

    // Update task status
    async updateTaskStatus(req, res) {
        try {
            const db = getDb();
            const { actionItemId } = req.params;
            const { status, completion_notes } = req.body;
            const user_id = req.user.id;

            // Check if user is assigned to this task or is admin
            const task = await db.query(
                'SELECT * FROM minutes_action_items WHERE id = $1',
                [actionItemId]
            );

            if (task.rows.length === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }

            if (task.rows[0].assigned_to !== user_id && !req.user.is_admin && !req.user.can_approve) {
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
                    `UPDATE task_reminders SET sent = true, email_status = 'cancelled' 
                     WHERE action_item_id = $1 AND sent = false`,
                    [actionItemId]
                );
                
                // Update matters arising if this task was from previous minutes
                await db.query(
                    `UPDATE matters_arising SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP
                     WHERE action_item_id = $1`,
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
                        assigner_user.name as assigned_by_name,
                        CASE 
                            WHEN ai.due_date < CURRENT_DATE AND ai.status != 'completed' THEN 'overdue'
                            WHEN ai.due_date = CURRENT_DATE THEN 'due_today'
                            ELSE 'upcoming'
                        END as urgency
                 FROM minutes_action_items ai
                 JOIN project_minutes m ON ai.minutes_id = m.id
                 JOIN projects p ON m.project_id = p.id
                 JOIN users assigner_user ON ai.assigned_by = assigner_user.id
                 WHERE ai.assigned_to = $1 
                   AND ai.status NOT IN ('completed', 'cancelled')
                   AND ai.due_date <= CURRENT_DATE + INTERVAL '14 days'
                 ORDER BY 
                    CASE 
                        WHEN ai.due_date < CURRENT_DATE THEN 0
                        WHEN ai.due_date = CURRENT_DATE THEN 1
                        ELSE 2
                    END,
                    ai.due_date ASC
                 LIMIT 50`,
                [user_id]
            );

            res.json(tasks.rows);
        } catch (error) {
            console.error('Get upcoming tasks error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Get overdue actions count for dashboard
    async getOverdueActionsCount(req, res) {
        try {
            const db = getDb();
            const userId = req.user.id;
            
            const result = await db.query(`
                SELECT COUNT(*) as count
                FROM minutes_action_items ai
                JOIN project_minutes m ON ai.minutes_id = m.id
                JOIN projects p ON m.project_id = p.id
                WHERE ai.assigned_to = $1 
                  AND ai.status NOT IN ('completed', 'cancelled')
                  AND ai.due_date < CURRENT_DATE
            `, [userId]);
            
            res.json({ overdue_count: parseInt(result.rows[0].count) });
        } catch (error) {
            console.error('Get overdue count error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Delete minutes
    async deleteMinutes(req, res) {
        try {
            const db = getDb();
            const { minutesId } = req.params;
            const userId = req.user.id;
            
            // Check if user is the creator or admin
            const minutes = await db.query(
                'SELECT created_by FROM project_minutes WHERE id = $1',
                [minutesId]
            );
            
            if (minutes.rows.length === 0) {
                return res.status(404).json({ error: 'Minutes not found' });
            }
            
            if (minutes.rows[0].created_by !== userId && !req.user.is_admin && !req.user.isSuperAdmin) {
                return res.status(403).json({ error: 'You do not have permission to delete these minutes' });
            }
            
            // Delete cascade will handle related records
            await db.query('DELETE FROM project_minutes WHERE id = $1', [minutesId]);
            
            res.json({ success: true, message: 'Minutes deleted successfully' });
        } catch (error) {
            console.error('Delete minutes error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new MinutesController();