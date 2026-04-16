const { getDb } = require('../config/database');

const PurchaseOrderController = {
  // Get all purchase orders
  getPurchaseOrders: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;

      console.log('Fetching purchase orders for company:', company_id);

      const orders = await db.all(
        'SELECT * FROM purchase_orders WHERE company_id = ? ORDER BY order_date DESC',
        [company_id]
      );

      const parsedOrders = orders.map(order => ({
        ...order,
        items: order.items ? JSON.parse(order.items) : []
      }));

      res.json(parsedOrders);
    } catch (error) {
      console.error('Error in getPurchaseOrders:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get single purchase order
  getPurchaseOrderById: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;

      const order = await db.get(
        'SELECT * FROM purchase_orders WHERE id = ? AND company_id = ?',
        [id, company_id]
      );

      if (!order) {
        return res.status(404).json({ error: 'Purchase order not found' });
      }

      order.items = order.items ? JSON.parse(order.items) : [];
      res.json(order);
    } catch (error) {
      console.error('Error in getPurchaseOrderById:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Create purchase order
  createPurchaseOrder: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;

      console.log('Creating purchase order for company:', company_id);
      console.log('Request body:', req.body);

      const {
        order_number,
        supplier_id,
        supplier_name,
        project_id,
        project_name,
        order_date,
        expected_date,
        items,
        subtotal,
        vat,
        total,
        notes
      } = req.body;

      const result = await db.run(
        `INSERT INTO purchase_orders (
          company_id, order_number, supplier_id, supplier_name,
          project_id, project_name, order_date, expected_date,
          items, subtotal, vat, total, status, payment_status, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Ordered', 'Unpaid', ?, datetime('now'))`,
        [
          company_id, order_number, supplier_id, supplier_name,
          project_id, project_name, order_date, expected_date,
          JSON.stringify(items || []), subtotal || 0, vat || 0, total || 0, notes
        ]
      );

      const newOrder = await db.get(
        'SELECT * FROM purchase_orders WHERE id = ?',
        [result.lastID]
      );
      newOrder.items = newOrder.items ? JSON.parse(newOrder.items) : [];

      res.status(201).json(newOrder);
    } catch (error) {
      console.error('Error in createPurchaseOrder:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update purchase order
  updatePurchaseOrder: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;

      const { status, payment_status, notes } = req.body;

      const result = await db.run(
        `UPDATE purchase_orders SET status = ?, payment_status = ?, notes = ? WHERE id = ? AND company_id = ?`,
        [status, payment_status, notes, id, company_id]
      );

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Purchase order not found' });
      }

      const updatedOrder = await db.get(
        'SELECT * FROM purchase_orders WHERE id = ? AND company_id = ?',
        [id, company_id]
      );
      updatedOrder.items = updatedOrder.items ? JSON.parse(updatedOrder.items) : [];

      res.json(updatedOrder);
    } catch (error) {
      console.error('Error in updatePurchaseOrder:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete purchase order
  deletePurchaseOrder: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;

      const result = await db.run(
        'DELETE FROM purchase_orders WHERE id = ? AND company_id = ?',
        [id, company_id]
      );

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Purchase order not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error in deletePurchaseOrder:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update purchase order status and handle store transactions
  updatePurchaseOrderStatus: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      const { status, payment_status } = req.body;

      console.log('=== UPDATE PURCHASE ORDER STATUS ===');
      console.log('PO ID:', id);
      console.log('New status:', status);

      // Get the original purchase order
      const order = await db.get(
        'SELECT * FROM purchase_orders WHERE id = ? AND company_id = ?',
        [id, company_id]
      );

      if (!order) {
        return res.status(404).json({ error: 'Purchase order not found' });
      }

      console.log('Current status:', order.status);

      // Parse items
      let items = [];
      try {
        items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
        console.log('Items to process:', items.length);
      } catch (e) {
        console.error('Error parsing items:', e);
        items = [];
      }

      // Update the status
      await db.run(
        `UPDATE purchase_orders SET status = ?, payment_status = ? WHERE id = ? AND company_id = ?`,
        [status || order.status, payment_status || order.payment_status, id, company_id]
      );

      // If status changed to 'Supplied', create store transactions
      if (status === 'Supplied') {
        console.log('Creating store transactions for PO:', order.order_number);

        for (const item of items) {
          const itemName = item.name || item.itemName || item.description || 'Unknown Item';
          const quantity = Number(item.quantity) || 0;
          const unit = item.unit || 'piece';

          console.log(`Adding transaction: ${itemName} x ${quantity} ${unit}`);

          // Insert store transaction in the format your StoresModule expects
          await db.run(
            `INSERT INTO store_transactions (
              company_id, project_id, project_name, transaction_type,
              item_id, item_name, unit, category,
              quantity_supplied, quantity_issued, quantity_returned,
              balance, reference, date, notes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
            [
              company_id,
              order.project_id,
              order.project_name || 'General Store',
              'SUPPLY',
              null,
              itemName,
              unit,
              'Materials',
              quantity,      // quantity_supplied
              0,             // quantity_issued
              0,             // quantity_returned
              quantity,      // balance
              order.order_number,
              new Date().toISOString().split('T')[0],
              `Received from purchase order ${order.order_number}`
            ]
          );
          console.log(`  ✅ Store transaction created for ${itemName} x ${quantity}`);
        }
        console.log(`✅ Completed for PO: ${order.order_number}`);
      }

      // If payment_status changed to 'Paid', create expense record
      if (payment_status === 'Paid' && order.payment_status !== 'Paid') {
        console.log('Creating expense record for PO:', order.order_number);
        await db.run(
          `INSERT INTO expenses (
            company_id, project_id, project_name, date, category,
            description, amount, vat, payment_method, status, reference
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            company_id, order.project_id, order.project_name,
            new Date().toISOString().split('T')[0], 'Supplier',
            `Purchase Order ${order.order_number} - ${order.supplier_name}`,
            order.total, order.vat || 0, 'Bank Transfer', 'Paid',
            `PO-${order.order_number}`
          ]
        );
        console.log('Expense record created');
      }

      const updatedOrder = await db.get(
        'SELECT * FROM purchase_orders WHERE id = ? AND company_id = ?',
        [id, company_id]
      );

      if (updatedOrder && updatedOrder.items) {
        try {
          updatedOrder.items = typeof updatedOrder.items === 'string' ? JSON.parse(updatedOrder.items) : updatedOrder.items;
        } catch (e) {
          updatedOrder.items = [];
        }
      }

      res.json(updatedOrder);
    } catch (error) {
      console.error('Error in updatePurchaseOrderStatus:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = PurchaseOrderController;