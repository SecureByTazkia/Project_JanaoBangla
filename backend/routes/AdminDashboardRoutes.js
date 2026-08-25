// ==========================================
// JanaoBangla — Admin Dashboard Routes
// BRANCH: feature-admin-dashboard-and-system-monitoring
// Admin API endpoints definition (/api/admin/*)
// requireAuthentication ar AdminAuthorizationMiddleware strictly access verify korbe
// ==========================================

const express = require('express');
const router = express.Router();
const AdminDashboardController = require('../controllers/AdminDashboardController');
const { requireAuthentication } = require('../middleware/UserAuthenticationMiddleware');
const AdminAuthorizationMiddleware = require('../middleware/AdminAuthorizationMiddleware');

// Sob admin route e JWT authentication + Admin role guard mandatory
router.use(requireAuthentication);
router.use(AdminAuthorizationMiddleware);

// Admin Dashboard Overview Statistics
router.get('/stats', AdminDashboardController.getOverviewStats);

// User Management Routes
router.get('/users', AdminDashboardController.getUsers);
router.patch('/users/:userId/role', AdminDashboardController.updateUserRole);
router.patch('/users/:userId/status', AdminDashboardController.updateUserStatus);

// Report Management Routes
router.get('/reports', AdminDashboardController.getReports);
router.patch('/reports/:id/status', AdminDashboardController.updateReportStatus);
router.delete('/reports/:id', AdminDashboardController.deleteReport);

// Comment Moderation Routes
router.get('/comments', AdminDashboardController.getComments);
router.patch('/comments/:id/moderate', AdminDashboardController.moderateComment);
router.delete('/comments/:id', AdminDashboardController.deleteComment);

// SOS Requests Monitoring Routes
router.get('/sos', AdminDashboardController.getSosRequests);
router.patch('/sos/:id/status', AdminDashboardController.updateSosStatus);

// System Logs & Monitoring Routes
router.get('/system-logs', AdminDashboardController.getSystemLogs);

module.exports = router;
