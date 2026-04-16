const { getDb } = require('../config/database');

class WorkerCategoryController {
  static async getCategories(req, res) {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      const categories = await db.all(
        'SELECT * FROM worker_categories WHERE company_id = ? ORDER BY name',
        [company_id]
      );
      res.json(categories);
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async createCategory(req, res) {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { name, dayRate, color, isActive } = req.body;
      
      console.log('Creating category:', { name, dayRate, color });
      
      // Use dayRate from request, not hardcoded value
      const result = await db.run(
        `INSERT INTO worker_categories (company_id, name, day_rate, color, is_active)
         VALUES (?, ?, ?, ?, ?)`,
        [company_id, name, dayRate || 800, color || '#3b82f6', isActive !== false ? 1 : 0]
      );

      const category = await db.get(
        'SELECT * FROM worker_categories WHERE id = ?',
        [result.lastID]
      );
      res.status(201).json(category);
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateCategory(req, res) {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { name, dayRate, color, isActive } = req.body;

      console.log('Updating category:', { id: req.params.id, name, dayRate, color });

      const result = await db.run(
        `UPDATE worker_categories SET name = ?, day_rate = ?, color = ?, is_active = ?
         WHERE id = ? AND company_id = ?`,
        [name, dayRate, color, isActive ? 1 : 0, req.params.id, company_id]
      );

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      const category = await db.get(
        'SELECT * FROM worker_categories WHERE id = ? AND company_id = ?',
        [req.params.id, company_id]
      );
      res.json(category);
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteCategory(req, res) {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      const result = await db.run(
        'DELETE FROM worker_categories WHERE id = ? AND company_id = ?',
        [req.params.id, company_id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = WorkerCategoryController;