// ==========================================
// JanaoBangla — Duplicate Report Detection Routes
// BRANCH: feature-duplicate-civic-problem-report-detection
// Express.js route definitions for duplicate detection, checking, linking, and linked reports
// ==========================================

const express = require('express');
const router = express.Router();
const DuplicateReportDetectionController = require('../controllers/DuplicateReportDetectionController');
const { requireAuthentication } = require('../middleware/UserAuthenticationMiddleware');

// ==========================================
// 1. Duplicate Check Route (Public / Semi-Public)
// Form theke user type korar shomoy ba submit er age duplicates detect korar jonno
// ==========================================
router.post('/check', DuplicateReportDetectionController.checkDuplicates);
router.post('/detect', DuplicateReportDetectionController.checkDuplicates); // Alias route

// ==========================================
// 2. Linked Reports Details Route (Public)
// Ekta report er sathe linked duplicate reports list dekhar jonno
// ==========================================
router.get('/linked/:reportId', DuplicateReportDetectionController.getLinkedReports);

// ==========================================
// 3. All Duplicate Clusters Summary (Public / Monitoring)
// ==========================================
router.get('/clusters', DuplicateReportDetectionController.getAllDuplicateClusters);

// ==========================================
// 4. Authenticated Routes (Requires Login)
// Duplicate report link kora ebong unlink kora
// ==========================================
router.use(requireAuthentication);

// Report link korar route
router.post('/link', DuplicateReportDetectionController.linkDuplicateReport);

// Report unlink korar route
router.delete('/link/:reportId', DuplicateReportDetectionController.unlinkDuplicateReport);

module.exports = router;
