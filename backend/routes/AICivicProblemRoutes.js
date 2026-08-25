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

// Authenticated users can access AI moderation & recognition routes
router.use(requireAuthentication);

// 1. Evidence Image Safety & Nudity Scan
router.post('/moderate-image', upload.single('image'), AICivicProblemController.moderateImage);

// 2. Evidence Image AI Recognition & Suggestions
router.post('/analyze-image', upload.single('image'), AICivicProblemController.analyzeImage);

// 3. Category Suggestion & Smart Improvements
router.post('/suggest-content', AICivicProblemController.suggestCategoryAndImprovement);

// 4. AI Duplicate Detection
router.post('/detect-duplicates', AICivicProblemController.detectDuplicates);

module.exports = router;
