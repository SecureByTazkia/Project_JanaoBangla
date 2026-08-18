// ==========================================
// JanaoBangla — Health Check Routes
// BRANCH: main
// /api/health endpoint define kora hocche ekhane
// Server ar database status check korar jonno
// ==========================================

const express = require('express');
const router  = express.Router();
const { getHealthStatus } = require('../controllers/HealthCheckController');

// GET /api/health — Server ar database er status check korbe
// Frontend ba monitoring tool theke ei route call korbe
router.get('/', getHealthStatus);

module.exports = router;
