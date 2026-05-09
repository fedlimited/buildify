const { getDb } = require('../config/database');
const emailService = require('../services/emailService');

const documentController = {
    // Upload new document or revision
    async uploadDocument(req, res) {
        try {
            const db = getDb();
            const { project_id, title, description, category, version_notes, is_revision, document_id } = req.body;
            const user_id = req.user.id;
            const stakeholder_role = req.user.role || 'stakeholder';

            // For now, using a placeholder URL - you'll integrate file upload later
            const file_url = req.body.file_url || '/uploads/placeholder.pdf';
            const file_name = req.body.file_name || 'document.pdf';
            const file_size = req.body.file_size || null;
            const mime_type = req.body.mime_type || 'application/pdf';

            if (!file_url) {
                return res.status(400).json({ error: 'File URL is required' });
            }

            // Check if this is a revision of an existing document
            if (is_revision && document_id) {
                const currentDoc = await db.query(
                    'SELECT * FROM project_documents WHERE id = $1 AND project_id = $2',
                    [document_id, project_id]
                );

                if (currentDoc.rows.length === 0) {
                    return res.status(404).json({ error: 'Original document not found' });
                }

                // Mark old version as not latest
                await db.query(
                    'UPDATE project_documents SET is_latest = false WHERE id = $1',
                    [document_id]
                );

                // Create new version
                const newVersion = await db.query(
                    `INSERT INTO project_documents 
                    (project_id, uploaded_by, stakeholder_role, title, description, category, 
                     version, file_url, file_name, file_size, mime_type, is_latest)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
                     RETURNING *`,
                    [project_id, user_id, stakeholder_role, title, description, category,
                     currentDoc.rows[0].version + 1, file_url, file_name, file_size, mime_type]
                );

                // Save revision history
                await db.query(
                    `INSERT INTO document_revisions 
                    (document_id, version, revision_notes, file_url, created_by)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [document_id, newVersion.rows[0].version, version_notes, file_url, user_id]
                );

                // Send notifications
                await documentController._notifyStakeholders(project_id, newVersion.rows[0], 'revision', version_notes);

                return res.json({
                    success: true,
                    message: 'Document revision uploaded successfully',
                    document: newVersion.rows[0]
                });
            }

            // New document upload
            const result = await db.query(
                `INSERT INTO project_documents 
                (project_id, uploaded_by, stakeholder_role, title, description, category, 
                 version, file_url, file_name, file_size, mime_type, is_latest)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
                 RETURNING *`,
                [project_id, user_id, stakeholder_role, title, description, category, 1,
                 file_url, file_name, file_size, mime_type]
            );

            // Send notifications
            await documentController._notifyStakeholders(project_id, result.rows[0], 'upload', null);

            res.status(201).json({
                success: true,
                message: 'Document uploaded successfully',
                document: result.rows[0]
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // Get all documents for a project
    async getProjectDocuments(req, res) {
        try {
            const db = getDb();
            const { projectId } = req.params;
            const { category } = req.query;

            let query = `
                SELECT d.*, u.name as uploaded_by_name
                FROM project_documents d
                LEFT JOIN users u ON d.uploaded_by = u.id
                WHERE d.project_id = $1 AND d.is_latest = true
            `;
            let params = [projectId];

            if (category) {
                query += ` AND d.category = $2`;
                params.push(category);
            }

            query += ` ORDER BY d.created_at DESC`;

            const result = await db.query(query, params);

            // Get revision history for each document
            for (const doc of result.rows) {
                const revisions = await db.query(
                    `SELECT r.*, u.name as created_by_name
                     FROM document_revisions r
                     LEFT JOIN users u ON r.created_by = u.id
                     WHERE r.document_id = $1 
                     ORDER BY r.version DESC`,
                    [doc.id]
                );
                doc.revisions = revisions.rows;
            }

            res.json(result.rows);
        } catch (error) {
            console.error('Get documents error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // Get single document with all revisions
    async getDocumentById(req, res) {
        try {
            const db = getDb();
            const { documentId } = req.params;

            const document = await db.query(
                `SELECT d.*, u.name as uploaded_by_name
                 FROM project_documents d
                 LEFT JOIN users u ON d.uploaded_by = u.id
                 WHERE d.id = $1`,
                [documentId]
            );

            if (document.rows.length === 0) {
                return res.status(404).json({ error: 'Document not found' });
            }

            const revisions = await db.query(
                `SELECT r.*, u.name as created_by_name
                 FROM document_revisions r
                 LEFT JOIN users u ON r.created_by = u.id
                 WHERE r.document_id = $1 
                 ORDER BY r.version DESC`,
                [documentId]
            );

            document.rows[0].revisions = revisions.rows;

            res.json(document.rows[0]);
        } catch (error) {
            console.error('Get document error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // Delete document (soft delete by marking not latest)
    async deleteDocument(req, res) {
        try {
            const db = getDb();
            const { documentId } = req.params;

            await db.query(
                'UPDATE project_documents SET is_latest = false WHERE id = $1',
                [documentId]
            );

            res.json({ success: true, message: 'Document deleted successfully' });
        } catch (error) {
            console.error('Delete document error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // Internal: Notify stakeholders
    async _notifyStakeholders(project_id, document, action, revisionNotes) {
        try {
            const db = getDb();
            
            // Get project name
            const project = await db.query(
                'SELECT name FROM projects WHERE id = $1',
                [project_id]
            );
            const projectName = project.rows[0]?.name || 'the project';
            
            // Get uploader name
            const uploader = await db.query(
                'SELECT name FROM users WHERE id = $1',
                [document.uploaded_by]
            );
            const uploaded_by = uploader.rows[0]?.name || 'A stakeholder';
            
            // Get all active stakeholders for this project
            const stakeholders = await db.query(
                `SELECT s.*, u.name, u.email 
                 FROM project_stakeholders s
                 JOIN users u ON s.user_id = u.id
                 WHERE s.project_id = $1 AND s.status = 'active' AND u.id != $2`,
                [project_id, document.uploaded_by]
            );

            const actionText = action === 'upload' ? 'uploaded' : 'updated';
            
            for (const stakeholder of stakeholders.rows) {
                try {
                    await emailService.sendDocumentNotification({
                        to: stakeholder.email,
                        stakeholder_name: stakeholder.name,
                        project_name: projectName,
                        document: document,
                        action: action,
                        uploaded_by: uploaded_by,
                        revision_notes: revisionNotes
                    });

                    // Log notification
                    await db.query(
                        `INSERT INTO document_notifications 
                        (document_id, project_id, stakeholder_id, email_sent, sent_at, email_status)
                         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)`,
                        [document.id, project_id, stakeholder.user_id, true, 'sent']
                    );
                } catch (emailErr) {
                    console.error(`Failed to email ${stakeholder.email}:`, emailErr.message);
                    await db.query(
                        `INSERT INTO document_notifications 
                        (document_id, project_id, stakeholder_id, email_sent, sent_at, email_status)
                         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)`,
                        [document.id, project_id, stakeholder.user_id, false, 'failed']
                    );
                }
            }
            
            console.log(`Notified ${stakeholders.rows.length} stakeholders about document ${action}`);
        } catch (error) {
            console.error('Notification error:', error);
        }
    }
};

module.exports = documentController;