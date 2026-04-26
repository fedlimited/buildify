const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');

// Submit a testimonial (public)
router.post('/submit', async (req, res) => {
  try {
    const db = getDb();
    const { name, role, company, text, rating } = req.body;
    
    if (!name || !text) {
      return res.status(400).json({ error: 'Name and testimonial text are required' });
    }
    
    const result = await db.run(
      `INSERT INTO testimonials (name, role, company, text, rating) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, role || '', company || '', text, rating || 5]
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

// Get approved testimonials (public)
router.get('/approved', async (req, res) => {
  try {
    const db = getDb();
    const testimonials = await db.all(
      'SELECT * FROM testimonials WHERE is_approved = true ORDER BY created_at DESC LIMIT 10'
    );
    res.json(testimonials);
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ error: 'Failed to load testimonials' });
  }
});

// Get all testimonials (super admin)
router.get('/all', async (req, res) => {
  try {
    const db = getDb();
    const testimonials = await db.all(
      'SELECT * FROM testimonials ORDER BY created_at DESC'
    );
    res.json(testimonials);
  } catch (error) {
    console.error('Get all testimonials error:', error);
    res.status(500).json({ error: 'Failed to load testimonials' });
  }
});

// Approve/reject testimonial (super admin)
router.put('/:id/approve', async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { is_approved } = req.body;
    
    await db.run(
      'UPDATE testimonials SET is_approved = ? WHERE id = ?',
      [is_approved ? true : false, id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Approve testimonial error:', error);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

module.exports = router;