const { getDb } = require('../config/database');

class Project {
  static async findAll() {
    const db = getDb();
    return await db.all('SELECT * FROM projects ORDER BY created_at DESC');
  }

  static async findById(id) {
    const db = getDb();
    return await db.get('SELECT * FROM projects WHERE id = ?', [id]);
  }

  static async create(data) {
    const db = getDb();
    const result = await db.run(
      `INSERT INTO projects (name, client, contract_sum, location, start_date, end_date, status, project_manager, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.name, data.client, data.contract_sum, data.location, data.start_date, data.end_date, data.status, data.project_manager, data.description, new Date().toISOString()]
    );
    return await this.findById(result.lastID);
  }

  static async update(id, data) {
    const db = getDb();
    await db.run(
      `UPDATE projects SET name = ?, client = ?, contract_sum = ?, location = ?, start_date = ?, end_date = ?, status = ?, project_manager = ?, description = ?
       WHERE id = ?`,
      [data.name, data.client, data.contract_sum, data.location, data.start_date, data.end_date, data.status, data.project_manager, data.description, id]
    );
    return await this.findById(id);
  }

  static async delete(id) {
    const db = getDb();
    await db.run('DELETE FROM projects WHERE id = ?', [id]);
    return true;
  }
}

module.exports = Project;