const { getDb } = require('../config/database');

const InvoiceController = {
  // Get all invoices for the company
  getInvoices: async (req, res) => {
    try {
      // Debug logging
      console.log('=== GET INVOICES DEBUG ===');
      console.log('req.user:', req.user);
      console.log('req.user keys:', req.user ? Object.keys(req.user) : 'No user');
      
      const db = await getDb();
      
      // Try to get company_id from different possible locations
      const company_id = req.user?.companyId || req.user?.company_id || req.user?.company?.id;
      
      console.log('Found company_id:', company_id);
      
      if (!company_id) {
        console.error('No company_id found!');
        return res.status(400).json({ error: 'Company ID not found', debug: { user: req.user } });
      }
      
      const invoices = await db.all(
        'SELECT * FROM invoices WHERE company_id = ? ORDER BY date DESC',
        [company_id]
      );
      
      console.log(`Found ${invoices.length} invoices`);
      
      const parsedInvoices = invoices.map(inv => ({
        ...inv,
        items: inv.items ? JSON.parse(inv.items) : []
      }));
      res.json(parsedInvoices);
    } catch (error) {
      console.error('Error in getInvoices:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get single invoice by ID
  getInvoiceById: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id || req.user?.company?.id;
      const { id } = req.params;
      
      if (!company_id) {
        return res.status(400).json({ error: 'Company ID not found' });
      }
      
      const invoice = await db.get(
        'SELECT * FROM invoices WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      
      invoice.items = invoice.items ? JSON.parse(invoice.items) : [];
      res.json(invoice);
    } catch (error) {
      console.error('Error in getInvoiceById:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Create new invoice
  createInvoice: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id || req.user?.company?.id;
      
      if (!company_id) {
        console.error('No company_id found for create');
        return res.status(400).json({ error: 'Company ID not found' });
      }
      
      console.log('Creating invoice for company:', company_id);
      
      const {
        invoice_number,
        project_id,
        project_name,
        client_name,
        date,
        due_date,
        items,
        subtotal,
        vat,
        total,
        status,
        notes
      } = req.body;
      
      const finalInvoiceNumber = invoice_number || `INV-${Date.now()}`;
      
      const result = await db.run(
        `INSERT INTO invoices (
          company_id, invoice_number, project_id, project_name,
          client_name, date, due_date, items, subtotal,
          vat, total, status, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          company_id,
          finalInvoiceNumber, 
          project_id, 
          project_name,
          client_name, 
          date, 
          due_date, 
          JSON.stringify(items || []),
          subtotal || 0, 
          vat || 0, 
          total || 0, 
          status || 'Draft', 
          notes
        ]
      );
      
      const newInvoice = await db.get(
        'SELECT * FROM invoices WHERE id = ?',
        [result.lastID]
      );
      newInvoice.items = newInvoice.items ? JSON.parse(newInvoice.items) : [];
      
      res.status(201).json(newInvoice);
    } catch (error) {
      console.error('Error in createInvoice:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update invoice
  updateInvoice: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id || req.user?.company?.id;
      const { id } = req.params;
      
      if (!company_id) {
        return res.status(400).json({ error: 'Company ID not found' });
      }
      
      const {
        invoice_number,
        project_id,
        project_name,
        client_name,
        date,
        due_date,
        items,
        subtotal,
        vat,
        total,
        status,
        notes
      } = req.body;
      
      const result = await db.run(
        `UPDATE invoices SET
          invoice_number = ?, project_id = ?, project_name = ?,
          client_name = ?, date = ?, due_date = ?, items = ?,
          subtotal = ?, vat = ?, total = ?, status = ?, notes = ?
        WHERE id = ? AND company_id = ?`,
        [
          invoice_number, project_id, project_name, client_name,
          date, due_date, JSON.stringify(items || []), subtotal,
          vat, total, status, notes, id, company_id
        ]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      
      const updatedInvoice = await db.get(
        'SELECT * FROM invoices WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      updatedInvoice.items = updatedInvoice.items ? JSON.parse(updatedInvoice.items) : [];
      res.json(updatedInvoice);
    } catch (error) {
      console.error('Error in updateInvoice:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete invoice
  deleteInvoice: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id || req.user?.company?.id;
      const { id } = req.params;
      
      if (!company_id) {
        return res.status(400).json({ error: 'Company ID not found' });
      }
      
      const result = await db.run(
        'DELETE FROM invoices WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteInvoice:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update invoice status only
  updateInvoiceStatus: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id || req.user?.company?.id;
      const { id } = req.params;
      const { status } = req.body;
      
      if (!company_id) {
        return res.status(400).json({ error: 'Company ID not found' });
      }
      
      const result = await db.run(
        'UPDATE invoices SET status = ? WHERE id = ? AND company_id = ?',
        [status, id, company_id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      res.json({ message: 'Invoice status updated', status });
    } catch (error) {
      console.error('Error in updateInvoiceStatus:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = InvoiceController;