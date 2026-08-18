// ==========================================
// JanaoBangla — Notification Routes
// BRANCH: feature-women-safety-sos-and-emergency-notifications
// Ei file ta /api/notifications er sob routes define korbe
// Sob route e JWT authentication required
// ==========================================

const express = require('express');
const router  = express.Router();

// JWT authentication middleware import kora hocche
const { requireAuthentication } = require('../middleware/UserAuthenticationMiddleware');

// Notification controller import kora hocche
const NotificationController = require('../controllers/NotificationController');

// ==========================================
// NOTIFICATION ROUTES — Sob route e login required
// Note: named routes MUST come before /:id parameterized routes
// ==========================================

// GET /api/notifications — User er sob notifications fetch
router.get('/', requireAuthentication, NotificationController.getNotifications);

// GET /api/notifications/unread-count — Shudhu unread count (navbar badge er jonno)
router.get('/unread-count', requireAuthentication, NotificationController.getUnreadCount);

// PUT /api/notifications/read-all — Sob notifications read mark kora
router.put('/read-all', requireAuthentication, NotificationController.markAllAsRead);

// PUT /api/notifications/:id/read — Specific notification read mark kora
router.put('/:id/read', requireAuthentication, NotificationController.markAsRead);

// DELETE /api/notifications/:id — Specific notification delete kora
router.delete('/:id', requireAuthentication, NotificationController.deleteNotification);

module.exports = router;
