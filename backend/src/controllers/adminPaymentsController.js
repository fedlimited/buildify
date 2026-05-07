const { getDb } = require('../config/database');

const adminPaymentsController = {
  // Clear payments by date range
  clearPaymentsByDate: async (req, res) => {
    try {
      const db = await getDb();
      const { startDate, endDate, masterPassword } = req.body;
      
      // Verify master password
      if (masterPassword !== process.env.ADMIN_MASTER_PASSWORD) {
        return res.status(401).json({ error: 'Invalid master password' });
      }
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }
      
      console.log(`Clearing payments from ${startDate} to ${endDate}`);
      
      // Delete subscription payments
      const subscriptionResult = await db.run(
        `DELETE FROM subscription_payments 
         WHERE payment_date BETWEEN ? AND ? 
         AND status IN ('completed', 'failed', 'test')`,
        [startDate, endDate]
      );
      
      // Delete any test payments from other tables if they exist
      const testPaymentsResult = await db.run(
        `DELETE FROM payments 
         WHERE created_at BETWEEN ? AND ? 
         AND (status = 'test' OR payment_method IN ('test', 'sandbox'))`,
        [startDate, endDate]
      );
      
      res.json({
        success: true,
        message: `Cleared ${subscriptionResult.changes || 0} subscription payments and ${testPaymentsResult.changes || 0} test payments`,
        details: {
          subscriptionPaymentsDeleted: subscriptionResult.changes || 0,
          testPaymentsDeleted: testPaymentsResult.changes || 0,
          dateRange: { startDate, endDate }
        }
      });
      
    } catch (error) {
      console.error('Error clearing payments by date:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Clear all payments
  clearAllPayments: async (req, res) => {
    try {
      const db = await getDb();
      const { masterPassword, confirm } = req.body;
      
      // Verify master password
      if (masterPassword !== process.env.ADMIN_MASTER_PASSWORD) {
        return res.status(401).json({ error: 'Invalid master password' });
      }
      
      if (confirm !== 'DELETE_ALL_PAYMENTS') {
        return res.status(400).json({ error: 'Type DELETE_ALL_PAYMENTS to confirm' });
      }
      
      console.log('Clearing ALL payments...');
      
      // Delete all subscription payments
      const subscriptionResult = await db.run(`DELETE FROM subscription_payments`);
      
      // Delete all payments from other tables
      const paymentsResult = await db.run(`DELETE FROM payments`);
      
      res.json({
        success: true,
        message: `Cleared ${subscriptionResult.changes || 0} subscription payments and ${paymentsResult.changes || 0} other payments`,
        details: {
          subscriptionPaymentsDeleted: subscriptionResult.changes || 0,
          otherPaymentsDeleted: paymentsResult.changes || 0
        }
      });
      
    } catch (error) {
      console.error('Error clearing all payments:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Clear specific payment by ID
  clearPaymentById: async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      const { masterPassword } = req.body;
      
      // Verify master password
      if (masterPassword !== process.env.ADMIN_MASTER_PASSWORD) {
        return res.status(401).json({ error: 'Invalid master password' });
      }
      
      console.log(`Clearing payment with ID: ${id}`);
      
      // Try to delete from subscription_payments first
      let result = await db.run(
        `DELETE FROM subscription_payments WHERE id = ?`,
        [id]
      );
      
      if (result.changes === 0) {
        // Try payments table
        result = await db.run(
          `DELETE FROM payments WHERE id = ?`,
          [id]
        );
      }
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      res.json({
        success: true,
        message: `Payment ID ${id} cleared successfully`
      });
      
    } catch (error) {
      console.error('Error clearing payment by ID:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Get payment statistics
  getPaymentStats: async (req, res) => {
    try {
      const db = await getDb();
      
      const stats = await db.get(`
        SELECT 
          COUNT(*) as total_payments,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count,
          SUM(CASE WHEN status = 'test' THEN 1 ELSE 0 END) as test_count,
          MIN(payment_date) as earliest_payment,
          MAX(payment_date) as latest_payment
        FROM subscription_payments
      `);
      
      res.json(stats || { total_payments: 0 });
      
    } catch (error) {
      console.error('Error getting payment stats:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = adminPaymentsController;