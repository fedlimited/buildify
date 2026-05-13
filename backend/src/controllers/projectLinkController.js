const { getDb } = require('../config/database');

const projectLinkController = {
  // Get all links for a project
  getProjectLinks: async (req, res) => {
    try {
      const db = await getDb();
      const { projectId } = req.params;
      const { type } = req.query;
      
      let query = `
        SELECT pl.*, u.name as created_by_name
        FROM project_links pl
        JOIN users u ON pl.created_by = u.id
        WHERE pl.project_id = $1
      `;
      const params = [projectId];
      
      if (type) {
        query += ` AND pl.link_type = $2`;
        params.push(type);
      }
      
      query += ` ORDER BY pl.created_at DESC`;
      
      const links = await db.query(query, params);
      
      res.json(links.rows);
    } catch (error) {
      console.error('Error fetching project links:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Create a new link
  createLink: async (req, res) => {
    try {
      const db = await getDb();
      const { projectId } = req.params;
      const { title, description, url, linkType, category } = req.body;
      
      // Validate URL is from Google Drive (optional)
      const isValidUrl = url.includes('drive.google.com') || 
                         url.includes('docs.google.com') ||
                         url.includes('https://');
      
      if (!isValidUrl) {
        return res.status(400).json({ error: 'Please provide a valid Google Drive or document URL' });
      }
      
      const result = await db.query(`
        INSERT INTO project_links (project_id, created_by, title, description, url, link_type, category)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
      `, [projectId, req.user.id, title, description, url, linkType, category || 'general']);
      
      res.json({ success: true, id: result.rows[0].id, message: 'Link added successfully' });
    } catch (error) {
      console.error('Error creating link:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update a link
  updateLink: async (req, res) => {
    try {
      const db = await getDb();
      const { projectId, linkId } = req.params;
      const { title, description, url, linkType, category } = req.body;
      
      await db.query(`
        UPDATE project_links 
        SET title = $1, description = $2, url = $3, link_type = $4, category = $5, updated_at = NOW()
        WHERE id = $6 AND project_id = $7
      `, [title, description, url, linkType, category, linkId, projectId]);
      
      res.json({ success: true, message: 'Link updated successfully' });
    } catch (error) {
      console.error('Error updating link:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete a link
  deleteLink: async (req, res) => {
    try {
      const db = await getDb();
      const { projectId, linkId } = req.params;
      
      await db.query(`DELETE FROM project_links WHERE id = $1 AND project_id = $2`, [linkId, projectId]);
      
      res.json({ success: true, message: 'Link deleted successfully' });
    } catch (error) {
      console.error('Error deleting link:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get links by type (for stakeholder portal)
  getLinksByType: async (req, res) => {
    try {
      const db = await getDb();
      const { projectId, type } = req.params;
      
      const links = await db.query(`
        SELECT pl.*, u.name as created_by_name
        FROM project_links pl
        JOIN users u ON pl.created_by = u.id
        WHERE pl.project_id = $1 AND pl.link_type = $2
        ORDER BY pl.created_at DESC
      `, [projectId, type]);
      
      res.json(links.rows);
    } catch (error) {
      console.error('Error fetching links by type:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = projectLinkController;