const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');

// ============ PUBLIC ROUTES ============

// Submit a testimonial (PUBLIC)
router.post('/submit', async (req, res) => {
  try {
    const db = getDb();
    const { name, role, company, text, rating } = req.body;
    
    console.log('📝 Testimonial submission received:', { name, role, company });
    
    if (!name || !text) {
      return res.status(400).json({ error: 'Name and testimonial text are required' });
    }
    
    // PostgreSQL compatible INSERT (no CURRENT_TIMESTAMP in VALUES)
    const result = await db.run(
      `INSERT INTO testimonials (name, role, company, text, rating, is_approved) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, role || '', company || '', text, rating || 5, 0]
    );
    
    console.log('✅ Testimonial saved with ID:', result.lastID);
    
    res.status(201).json({ 
      success: true, 
      message: 'Thank you! Your testimonial has been submitted for review.',
      id: result.lastID 
    });
  } catch (error) {
    console.error('❌ Submit testimonial error:', error);
    res.status(500).json({ error: 'Failed to submit testimonial: ' + error.message });
  }
});

// Get approved testimonials (public)
router.get('/approved', async (req, res) => {
  try {
    const db = getDb();
    const testimonials = await db.all(
      `SELECT id, name, role, company, text, rating FROM testimonials 
       WHERE is_approved = 1 
       ORDER BY created_at DESC 
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
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
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
       SET name = $1, role = $2, company = $3, text = $4, 
           edited_text = $5, rating = $6, display_order = $7, 
           is_approved = $8, display_location = $9
       WHERE id = $10`,
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
      'UPDATE testimonials SET is_approved = $1 WHERE id = $2',
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
    await db.run('DELETE FROM testimonials WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;