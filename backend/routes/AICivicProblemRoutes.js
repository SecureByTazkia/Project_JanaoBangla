// ==========================================
// JanaoBangla — AI Content Safety Routes
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// Express.js AI REST API routes (/api/ai/*) for image safety and moderation
// ==========================================

const express = require('express');
const router = express.Router();
const AICivicProblemController = require('../controllers/AICivicProblemController');
const { requireAuthentication } = require('../middleware/UserAuthenticationMiddleware');
const upload = require('../middleware/FileUploadMiddleware');

// Authenticated users can access AI moderation routes
router.use(requireAuthentication);

// 1. Evidence Image Safety & Nudity Scan
router.post('/moderate-image', upload.single('image'), AICivicProblemController.moderateImage);

module.exports = router;
