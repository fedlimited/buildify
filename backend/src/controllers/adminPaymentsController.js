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
      
      // Use created_at as the date column
      const subscriptionResult = await db.query(
        `DELETE FROM subscription_payments 
         WHERE DATE(created_at) BETWEEN $1 AND $2 
         AND status IN ($3, $4, $5)`,
        [startDate, endDate, 'completed', 'failed', 'test']
      );
      
      res.json({
        success: true,
        message: `Cleared ${subscriptionResult.rowCount || 0} subscription payments`,
        details: {
          subscriptionPaymentsDeleted: subscriptionResult.rowCount || 0,
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
      
      const subscriptionResult = await db.query(`DELETE FROM subscription_payments`);
      
      res.json({
        success: true,
        message: `Cleared ${subscriptionResult.rowCount || 0} subscription payments`,
        details: {
          subscriptionPaymentsDeleted: subscriptionResult.rowCount || 0
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
      
      const result = await db.query(
        `DELETE FROM subscription_payments WHERE id = $1`,
        [id]
      );
      
      if (result.rowCount === 0) {
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
      
      const stats = await db.query(`
        SELECT 
          COUNT(*) as total_payments,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
          COUNT(CASE WHEN status = 'test' THEN 1 END) as test_count,
          MIN(created_at) as earliest_payment,
          MAX(created_at) as latest_payment
        FROM subscription_payments
      `);
      
      const result = stats.rows[0] || { total_payments: 0 };
      
      res.json({
        total_payments: parseInt(result.total_payments) || 0,
        completed_count: parseInt(result.completed_count) || 0,
        failed_count: parseInt(result.failed_count) || 0,
        test_count: parseInt(result.test_count) || 0,
        earliest_payment: result.earliest_payment,
        latest_payment: result.latest_payment
      });
      
    } catch (error) {
      console.error('Error getting payment stats:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = adminPaymentsController;