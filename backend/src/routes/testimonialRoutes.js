const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');

// ============ PUBLIC ROUTES ============

// Submit a testimonial (public)
router.post('/submit', async (req, res) => {
  try {
    const db = getDb();
    const { name, role, company, text, rating } = req.body;
    
    if (!name || !text) {
      return res.status(400).json({ error: 'Name and testimonial text are required' });
    }
    
    const result = await db.run(
      `INSERT INTO testimonials (name, role, company, text, rating, is_approved) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, role || '', company || '', text, rating || 5, 0]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Thank you! Your testimonial has been submitted for review.',
      id: result.lastID 
    });
  } catch (error) {
    console.error('Submit testimonial error:', error);
    res.status(500).json({ error: 'Failed to submit testimonial' });
  }
});

// Get approved testimonials (public) - with optional location filter
router.get('/approved', async (req, res) => {
  try {
    const db = getDb();
    const { location } = req.query; // 'landing', 'login'
    
    let locationFilter = '';
    if (location === 'landing') {
      locationFilter = "AND display_location IN ('landing', 'both')";
    } else if (location === 'login') {
      locationFilter = "AND display_location IN ('login', 'both')";
    } else {
      locationFilter = "AND display_location IN ('landing', 'login', 'both')";
    }
    
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
    res.status(500).json({ error: 'Failed to load testimonials' });
  }
});

// ============ SUPER ADMIN ROUTES ============

// Get all testimonials (including pending)
router.get('/admin/all', async (req, res) => {
  try {
    const db = getDb();
    const testimonials = await db.all(
      `SELECT t.*, 
              CASE WHEN t.edited_text IS NOT NULL THEN t.edited_text ELSE t.text END as display_text
       FROM testimonials t 
       ORDER BY t.is_approved DESC, t.created_at DESC`
    );
    res.json({ success: true, testimonials });
  } catch (error) {
    console.error('Get all testimonials error:', error);
    res.status(500).json({ error: 'Failed to load testimonials' });
  }
});

// Add testimonial manually (super admin)
router.post('/admin', async (req, res) => {
  const db = getDb();
  const { name, role, company, text, edited_text, rating, display_order, display_location, is_approved } = req.body;
  
  if (!name || !text) {
    return res.status(400).json({ error: 'Name and testimonial text are required' });
  }
  
  try {
    const result = await db.run(
      `INSERT INTO testimonials (name, role, company, text, edited_text, rating, display_order, is_approved, display_location) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, role || '', company || '', text, edited_text || null, rating || 5, display_order || 0, is_approved ? 1 : 0, display_location || 'both']
    );
    res.json({ success: true, id: result.lastID });
  } catch (error) {
    console.error('Add testimonial error:', error);
    res.status(500).json({ error: 'Failed to add testimonial' });
  }
});

// Update testimonial (super admin)
router.put('/admin/:id', async (req, res) => {
  const db = getDb();
  const { name, role, company, text, edited_text, rating, display_order, is_approved, display_location } = req.body;
  
  try {
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
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

// Quick approve/reject testimonial (super admin)
router.put('/admin/:id/approve', async (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { is_approved } = req.body;
  
  try {
    await db.run(
      'UPDATE testimonials SET is_approved = ? WHERE id = ?',
      [is_approved ? 1 : 0, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Approve testimonial error:', error);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

// Delete testimonial (super admin)
router.delete('/admin/:id', async (req, res) => {
  const db = getDb();
  try {
    await db.run('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

module.exports = router;