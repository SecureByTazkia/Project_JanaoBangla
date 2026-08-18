// ==========================================
// JanaoBangla — Location Routes
// BRANCH: feature-location-and-civic-problem-map-visualization
// /api/location endpoints define kora ache
// ==========================================

const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/LocationController');

// GET /api/location/reports — Map view er public reports return korbe
// Banglish: Map display er jonyo sob public reports anbe
router.get('/reports', LocationController.getMapReports);

// GET /api/location/nearby — User current lat/lng position around nearby reports get korbe
// Banglish: User location er pashe kache ache sob reports search korbe
router.get('/nearby', LocationController.getNearbyReports);

// GET /api/location/reverse-geocode — Coordinates take human readable address string e convert korbe
// Banglish: Lat/lng coordinates take address line e reverse lookup korbe
router.get('/reverse-geocode', LocationController.reverseGeocode);

module.exports = router;
