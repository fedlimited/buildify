const { getDb } = require('../config/database');

const PayrollController = {
  getPayrollRecords: async (req, res) => {
    try {
      const db = await getDb();
      const { company_id } = req.user;
      const records = await db.all('SELECT * FROM payroll_records WHERE company_id = ? ORDER BY year DESC, week_number DESC', [company_id]);
      res.json(records.map(r => ({ ...r, entries: JSON.parse(r.entries || '[]') })));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  createPayrollRecord: async (req, res) => {
    try {
      const db = await getDb();
      const { company_id } = req.user;
      const { week_number, year, week_start, week_end, project_id, project_name, entries, total_gross_pay } = req.body;
      const result = await db.run(
        `INSERT INTO payroll_records (company_id, week_number, year, week_start, week_end, project_id, project_name, entries, total_gross_pay, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', datetime('now'))`,
        [company_id, week_number, year, week_start, week_end, project_id, project_name, JSON.stringify(entries || []), total_gross_pay || 0]
      );
      res.status(201).json({ id: result.lastID });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  updatePayrollRecord: async (req, res) => {
    try {
      const db = await getDb();
      const { company_id } = req.user;
      const { id } = req.params;
      const { status, entries, total_gross_pay } = req.body;
      const result = await db.run(
        'UPDATE payroll_records SET status = ?, entries = ?, total_gross_pay = ? WHERE id = ? AND company_id = ?',
        [status, JSON.stringify(entries || []), total_gross_pay, id, company_id]
      );
      res.json({ updated: result.changes });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  deletePayrollRecord: async (req, res) => {
    try {
      const db = await getDb();
      const { company_id } = req.user;
      const { id } = req.params;
      await db.run('DELETE FROM payroll_records WHERE id = ? AND company_id = ?', [id, company_id]);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
module.exports = PayrollController;