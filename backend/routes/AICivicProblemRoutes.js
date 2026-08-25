// ==========================================
// JanaoBangla — AI Civic Problem Routes
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// Express.js AI REST API routes (/api/ai/*)
// ==========================================

const express = require('express');
const router = express.Router();
const AICivicProblemController = require('../controllers/AICivicProblemController');
const { requireAuthentication } = require('../middleware/UserAuthenticationMiddleware');
const upload = require('../middleware/FileUploadMiddleware');

// Shob AI route authenticated user access korte parbe
router.use(requireAuthentication);

// 1. Evidence Image Upload & AI Problem Recognition
router.post('/analyze-image', upload.single('image'), AICivicProblemController.analyzeImage);

// 2. Smart Category & Report Content Suggestion
router.post('/suggest', AICivicProblemController.suggestCategoryAndImprovement);

// 3. Advanced Duplicate Detection
router.post('/detect-duplicates', AICivicProblemController.detectDuplicates);

module.exports = router;
