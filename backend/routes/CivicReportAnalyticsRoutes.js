// ==========================================
// JanaoBangla — Civic Report Analytics Routes
// BRANCH: feature-civic-report-search-filter-and-analytics
// Ei file ta /api/analytics er endpoints define korbe
// Statistics, category trends, timeline, and area analysis
// ==========================================

const express = require('express');
const router = express.Router();
const CivicReportAnalyticsController = require('../controllers/CivicReportAnalyticsController');

// GET /api/analytics/overview — High-level summary metrics
router.get('/overview', CivicReportAnalyticsController.getOverviewStatistics);

// GET /api/analytics/categories — Category distribution & resolution
router.get('/categories', CivicReportAnalyticsController.getCategoryAnalytics);

// GET /api/analytics/trends — Reports timeline trends
router.get('/trends', CivicReportAnalyticsController.getTimelineTrends);

// GET /api/analytics/areas — Area/Division problem distribution & hotspots
router.get('/areas', CivicReportAnalyticsController.getAreaAnalytics);

// GET /api/analytics/priority-status — Priority and status breakdowns
router.get('/priority-status', CivicReportAnalyticsController.getPriorityAndStatusDistribution);

module.exports = router;
