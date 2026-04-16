const { getDb } = require('../config/database');
const bcrypt = require('bcryptjs');

class UserController {
  static async getUsers(req, res) {
    try {
      const db = getDb();
      const users = await db.all(
        'SELECT id, name, email, role, permissions, is_active, created_at FROM users WHERE company_id = ? ORDER BY created_at DESC',
        [req.user.companyId]
      );
      res.json(users);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async createUser(req, res) {
    try {
      const db = getDb();
      const { name, email, password, role, permissions } = req.body;
      
      // Check if user already exists in this company
      const existing = await db.get(
        'SELECT * FROM users WHERE company_id = ? AND email = ?',
        [req.user.companyId, email]
      );
      if (existing) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await db.run(
        `INSERT INTO users (company_id, name, email, password, role, permissions, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.user.companyId, name, email, hashedPassword, role, JSON.stringify(permissions || []), new Date().toISOString()]
      );
      
      const user = await db.get(
        'SELECT id, name, email, role, permissions, is_active, created_at FROM users WHERE id = ?',
        [result.lastID]
      );
      res.status(201).json(user);
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateUser(req, res) {
    try {
      const db = getDb();
      const { name, role, permissions, is_active } = req.body;
      
      // Prevent admin from demoting themselves
      if (req.params.id == req.user.id && role !== 'admin') {
        return res.status(400).json({ error: 'You cannot remove your own admin privileges' });
      }
      
      await db.run(
        `UPDATE users SET name = ?, role = ?, permissions = ?, is_active = ?
         WHERE id = ? AND company_id = ?`,
        [name, role, JSON.stringify(permissions || []), is_active ? 1 : 0, req.params.id, req.user.companyId]
      );
      
      const user = await db.get(
        'SELECT id, name, email, role, permissions, is_active, created_at FROM users WHERE id = ?',
        [req.params.id]
      );
      res.json(user);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteUser(req, res) {
    try {
      const db = getDb();
      
      // Prevent admin from deleting themselves
      if (req.params.id == req.user.id) {
        return res.status(400).json({ error: 'You cannot delete your own account' });
      }
      
      await db.run(
        'DELETE FROM users WHERE id = ? AND company_id = ?',
        [req.params.id, req.user.companyId]
      );
      res.status(204).send();
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = UserController;