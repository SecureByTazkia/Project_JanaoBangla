// ==========================================
// JanaoBangla — Civic Report Search & Filter Routes
// BRANCH: feature-civic-report-search-filter-and-analytics
// Ei file ta /api/search er endpoints define korbe
// Public search & filter routes
// ==========================================

const express = require('express');
const router = express.Router();
const CivicReportSearchController = require('../controllers/CivicReportSearchController');

// GET /api/search/metadata — Filter options & distinct counts
router.get('/metadata', CivicReportSearchController.getSearchFilterMetadata);

// GET /api/search — Main advanced search, filter, and sort endpoint
router.get('/', CivicReportSearchController.searchReports);

module.exports = router;
