// ==========================================
// JanaoBangla — Women Safety SOS Routes
// BRANCH: feature-women-safety-sos-and-emergency-notifications
// Ei file ta /api/sos er sob routes define korbe
// Sob route e JWT authentication required
// ==========================================

const express = require('express');
const router  = express.Router();

// JWT authentication middleware import kora hocche
const { requireAuthentication } = require('../middleware/UserAuthenticationMiddleware');

// SOS controller import kora hocche
const WomenSafetySOSController = require('../controllers/WomenSafetySOSController');

// ==========================================
// ALL SOS ROUTES — Sob route e login required
// Authenticated user-i SOS use korte parbe
// ==========================================

// GET /api/sos/active — User er active SOS status check
// Note: Specific routes MUST come before /:id routes to avoid conflicts
router.get('/active', requireAuthentication, WomenSafetySOSController.getActiveSOSStatus);

// GET /api/sos/history — User er SOS history list
router.get('/history', requireAuthentication, WomenSafetySOSController.getSOSHistory);

// POST /api/sos/trigger — SOS trigger kora (main action)
router.post('/trigger', requireAuthentication, WomenSafetySOSController.triggerSOS);

// GET /api/sos/:id — Single SOS request detail
router.get('/:id', requireAuthentication, WomenSafetySOSController.getSOSById);

// PUT /api/sos/:id/resolve — SOS resolve kora (safe ache)
router.put('/:id/resolve', requireAuthentication, WomenSafetySOSController.resolveSOS);

// PUT /api/sos/:id/cancel — SOS cancel kora (false alarm)
router.put('/:id/cancel', requireAuthentication, WomenSafetySOSController.cancelSOS);

module.exports = router;
