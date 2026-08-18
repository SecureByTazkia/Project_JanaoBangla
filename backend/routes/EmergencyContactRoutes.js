// ==========================================
// JanaoBangla — Emergency Contact Routes
// BRANCH: feature-women-safety-sos-and-emergency-notifications
// Ei file ta /api/emergency-contacts er sob routes define korbe
// Sob route e JWT authentication required
// ==========================================

const express = require('express');
const router  = express.Router();

// JWT authentication middleware import kora hocche
const { requireAuthentication } = require('../middleware/UserAuthenticationMiddleware');

// Emergency contact controller import kora hocche
const EmergencyContactController = require('../controllers/EmergencyContactController');

// ==========================================
// EMERGENCY CONTACT ROUTES — Sob route e login required
// ==========================================

// GET /api/emergency-contacts — User er sob emergency contacts list
router.get('/', requireAuthentication, EmergencyContactController.getContacts);

// POST /api/emergency-contacts — Notun contact add kora
router.post('/', requireAuthentication, EmergencyContactController.addContact);

// PUT /api/emergency-contacts/:id — Existing contact update kora
router.put('/:id', requireAuthentication, EmergencyContactController.updateContact);

// DELETE /api/emergency-contacts/:id — Contact delete kora
router.delete('/:id', requireAuthentication, EmergencyContactController.deleteContact);

module.exports = router;
