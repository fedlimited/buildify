const { getDb } = require('../config/database');

const PurchaseOrderController = {
  // Get all purchase orders
  getPurchaseOrders: async (req, res) => {
    try {
      const db = getDb();
      const company_id = req.user?.companyId || req.user?.company_id;

      console.log('Fetching purchase orders for company:', company_id);

      const orders = await db.all(
        'SELECT * FROM purchase_orders WHERE company_id = ? ORDER BY order_date DESC',
        [company_id]
      );

      const parsedOrders = orders.map(order => ({
        ...order,
        items: order.items ? (typeof order.items === 'string' ? JSON.parse(order.items) : order.items) : []
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
      const db = getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;

      const order = await db.get(
        'SELECT * FROM purchase_orders WHERE id = ? AND company_id = ?',
        [id, company_id]
      );

      if (!order) {
        return res.status(404).json({ error: 'Purchase order not found' });
      }

      order.items = order.items ? (typeof order.items === 'string' ? JSON.parse(order.items) : order.items) : [];
      res.json(order);
    } catch (error) {
      console.error('Error in getPurchaseOrderById:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Create purchase order
  createPurchaseOrder: async (req, res) => {
    try {
      const db = getDb();
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Ordered', 'Unpaid', ?, CURRENT_TIMESTAMP) RETURNING id`,
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

      if (newOrder && newOrder.items) {
        try {
          newOrder.items = typeof newOrder.items === 'string' ? JSON.parse(newOrder.items) : newOrder.items;
        } catch (e) {
          newOrder.items = [];
        }
      }

      res.status(201).json(newOrder);
    } catch (error) {
      console.error('Error in createPurchaseOrder:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update purchase order
  updatePurchaseOrder: async (req, res) => {
    try {
      const db = getDb();
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

      if (updatedOrder && updatedOrder.items) {
        try {
          updatedOrder.items = typeof updatedOrder.items === 'string' ? JSON.parse(updatedOrder.items) : updatedOrder.items;
        } catch (e) {
          updatedOrder.items = [];
        }
      }

      res.json(updatedOrder);
    } catch (error) {
      console.error('Error in updatePurchaseOrder:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete purchase order
  deletePurchaseOrder: async (req, res) => {
    try {
      const db = getDb();
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
      const db = getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { id } = req.params;
      const { status, payment_status } = req.body;

      console.log('=== UPDATE PURCHASE ORDER STATUS ===');
      console.log('PO ID:', id);
      console.log('New status:', status);

      const order = await db.get(
        'SELECT * FROM purchase_orders WHERE id = ? AND company_id = ?',
        [id, company_id]
      );

      if (!order) {
        return res.status(404).json({ error: 'Purchase order not found' });
      }

      let items = [];
      try {
        if (typeof order.items === 'string') {
          items = JSON.parse(order.items);
        } else if (Array.isArray(order.items)) {
          items = order.items;
        }
        console.log('Items to process:', items.length);
      } catch (e) {
        console.error('Error parsing items:', e);
        items = [];
      }

      await db.run(
        `UPDATE purchase_orders SET status = ?, payment_status = ? WHERE id = ? AND company_id = ?`,
        [status || order.status, payment_status || order.payment_status, id, company_id]
      );

      if (status === 'Supplied') {
        console.log('Creating store transactions for PO:', order.order_number);
        const currentDate = new Date().toISOString().split('T')[0];

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const itemName = item.itemName || item.name || 'Unknown Item';
          const quantity = item.quantity || 0;
          const unit = item.unit || 'piece';
          const category = 'Materials';

          console.log(`Processing item ${i + 1}: ${itemName}, Quantity: ${quantity}`);

          if (quantity <= 0) {
            console.log(`Skipping ${itemName} - quantity is 0`);
            continue;
          }

          try {
            await db.run(
              `INSERT INTO store_transactions (
                company_id, project_id, project_name, transaction_type,
                item_id, item_name, unit, category,
                quantity_supplied, quantity_issued, quantity_returned,
                balance, reference, date, notes, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
              [
                company_id, order.project_id, order.project_name || 'General Store',
                'SUPPLY', item.itemId || null, itemName, unit, category,
                quantity, 0, 0, quantity, order.order_number, currentDate,
                `Received from PO ${order.order_number}`
              ]
            );
            console.log(`Added to store: ${itemName} x ${quantity}`);
          } catch (insertError) {
            console.error(`Failed to insert ${itemName}:`, insertError.message);
          }
        }
      }

      if (payment_status === 'Paid' && order.payment_status !== 'Paid') {
        await db.run(
          `INSERT INTO expenses (
            company_id, project_id, project_name, date, category,
            description, amount, vat, payment_method, status, reference, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [
            company_id, order.project_id, order.project_name,
            new Date().toISOString().split('T')[0], 'Supplier',
            `PO ${order.order_number} - ${order.supplier_name}`,
            order.total, order.vat || 0, 'Bank Transfer', 'Paid',
            `PO-${order.order_number}`
          ]
        );
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