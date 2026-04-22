const express = require('express');
const router = express.Router();
const SuperAdminController = require('../controllers/superAdminController');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

// All routes require authentication AND super admin status
router.use(authenticateToken);
router.use(requireSuperAdmin);

// System statistics
router.get('/stats', SuperAdminController.getSystemStats);

// Company management
router.get('/companies', SuperAdminController.getAllCompanies);
router.get('/companies/:companyId', SuperAdminController.getCompanyDetails);

// User management (across all companies)
router.get('/users', SuperAdminController.getAllUsers);
router.put('/users/:userId/toggle-super-admin', SuperAdminController.toggleSuperAdmin);

// Subscription management
router.get('/subscriptions', SuperAdminController.getAllSubscriptions);

// Payment management
router.get('/payments', SuperAdminController.getAllPayments);

module.exports = router;