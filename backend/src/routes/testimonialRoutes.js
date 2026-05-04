const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');

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
    const db = getDb();
    const testimonials = await db.all(
      `SELECT id, name, role, company, 
              COALESCE(edited_text, text) as text, 
              rating, display_location
       FROM testimonials 
       WHERE is_approved = 1 ${locationFilter}
       ORDER BY display_order ASC, created_at DESC 
       LIMIT 10`
    );
    res.json({ success: true, testimonials });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ SUPER ADMIN ROUTES ============

// Get all testimonials (admin only)
router.get('/admin/all', async (req, res) => {
  try {
    const db = getDb();
    const testimonials = await db.all(
      `SELECT * FROM testimonials ORDER BY is_approved DESC, created_at DESC`
    );
    res.json({ success: true, testimonials });
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
    const db = getDb();
    const result = await db.run(
      `INSERT INTO testimonials (name, role, company, text, edited_text, rating, display_order, is_approved, display_location) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, role || '', company || '', text, edited_text || null, rating || 5, display_order || 0, is_approved ? 1 : 0, display_location || 'both']
    );
    res.json({ success: true, id: result.lastID });
  } catch (error) {
    console.error('Add testimonial error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update testimonial (admin only)
router.put('/admin/:id', async (req, res) => {
  const { name, role, company, text, edited_text, rating, display_order, is_approved, display_location } = req.body;
  
  try {
    const db = getDb();
    await db.run(
      `UPDATE testimonials 
       SET name = ?, role = ?, company = ?, text = ?, 
           edited_text = ?, rating = ?, display_order = ?, 
           is_approved = ?, display_location = ?
       WHERE id = ?`,
      [name, role || '', company || '', text, edited_text || null, 
       rating, display_order || 0, is_approved ? 1 : 0, display_location || 'both', req.params.id]
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
    const db = getDb();
    await db.run(
      'UPDATE testimonials SET is_approved = ? WHERE id = ?',
      [is_approved ? 1 : 0, req.params.id]
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
    const db = getDb();
    await db.run('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;