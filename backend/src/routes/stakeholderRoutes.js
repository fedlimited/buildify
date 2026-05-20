const express = require('express');
const router = express.Router();
const stakeholderController = require('../controllers/stakeholderController');
const { authenticateToken } = require('../middleware/auth');

// Protected routes (require authentication)
router.get('/projects', authenticateToken, stakeholderController.getStakeholderProjects);
router.get('/projects/:projectId', authenticateToken, stakeholderController.getStakeholderProject);
router.post('/projects/:projectId/accept', authenticateToken, stakeholderController.acceptInvitation);
router.get('/projects/:projectId/financial-summary', authenticateToken, stakeholderController.getFinancialSummary);
router.get('/projects/:projectId/site-diaries', authenticateToken, stakeholderController.getSiteDiaries);
router.get('/projects/:projectId/meetings', authenticateToken, stakeholderController.getProjectMeetings);

// 📱 Mobile-specific endpoint (no authentication required for testing)
router.get('/mobile-stakeholder-projects', stakeholderController.getMobileStakeholderProjects);

module.exports = router;