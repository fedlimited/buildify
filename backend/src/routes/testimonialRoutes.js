const express = require('express');
const router = express.Router();
const db = require('../db');

// ============ PUBLIC ROUTES ============

// Get approved testimonials (public) - with location filter
router.get('/approved', async (req, res) => {
  const { location } = req.query;
  let locationFilter = '';
  
  if (location === 'landing') {
    locationFilter = "AND display_location IN ('landing', 'both')";
  } else if (location === 'login') {
    locationFilter = "AND display_location IN ('login', 'both')";
  } else {
    locationFilter = "AND display_location IN ('landing', 'login', 'both')";
  }
  
  try {
    const [rows] = await db.query(
      `SELECT id, name, role, company, 
              COALESCE(edited_text, text) as text, 
              rating, display_location
       FROM testimonials 
       WHERE is_approved = true ${locationFilter}
       ORDER BY display_order ASC, created_at DESC 
       LIMIT 10`
    );
    res.json({ success: true, testimonials: rows });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ SUPER ADMIN ROUTES ============

// Get all testimonials (admin only)
router.get('/admin/all', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM testimonials ORDER BY is_approved DESC, created_at DESC`
    );
    res.json({ success: true, testimonials: rows });
  } catch (error) {
    console.error('Get all testimonials error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add testimonial (admin only)
router.post('/admin', async (req, res) => {
  const { name, role, company, text, edited_text, rating, display_order, display_location, is_approved } = req.body;
  
  if (!name || !text) {
    return res.status(400).json({ error: 'Name and comment are required' });
  }
  
  try {
    const [result] = await db.query(
      `INSERT INTO testimonials (name, role, company, text, edited_text, rating, display_order, is_approved, display_location) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [name, role || '', company || '', text, edited_text || null, rating || 5, display_order || 0, is_approved || false, display_location || 'both']
    );
    res.json({ success: true, id: result[0].id });
  } catch (error) {
    console.error('Add testimonial error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update testimonial (admin only)
router.put('/admin/:id', async (req, res) => {
  const { name, role, company, text, edited_text, rating, display_order, is_approved, display_location } = req.body;
  
  try {
    await db.query(
      `UPDATE testimonials 
       SET name = $1, role = $2, company = $3, text = $4, 
           edited_text = $5, rating = $6, display_order = $7, 
           is_approved = $8, display_location = $9
       WHERE id = $10`,
      [name, role || '', company || '', text, edited_text || null, 
       rating, display_order || 0, is_approved, display_location || 'both', req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve/reject testimonial (admin only)
router.put('/admin/:id/approve', async (req, res) => {
  const { is_approved } = req.body;
  try {
    await db.query(
      'UPDATE testimonials SET is_approved = $1 WHERE id = $2',
      [is_approved, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Approve testimonial error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete testimonial (admin only)
router.delete('/admin/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM testimonials WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;