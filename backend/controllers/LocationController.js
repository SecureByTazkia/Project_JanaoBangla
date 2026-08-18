// ==========================================
// JanaoBangla — Location Controller
// BRANCH: feature-location-and-civic-problem-map-visualization
// Map ar location search API request response handle kora hocche
// Native fetch API use kora hocche OpenStreetMap reverse geocoding API call korar jonno
// ==========================================

const LocationModel = require('../models/LocationModel');

class LocationController {

  // Ei function map e display korar jonno public reports fetch korbe
  // Query parameters: category, status, minLat, maxLat, minLng, maxLng
  static async getMapReports(req, res, next) {
    try {
      const { category, status, minLat, maxLat, minLng, maxLng } = req.query;

      const reports = await LocationModel.getMapReports({
        category,
        status,
        minLat: minLat ? parseFloat(minLat) : undefined,
        maxLat: maxLat ? parseFloat(maxLat) : undefined,
        minLng: minLng ? parseFloat(minLng) : undefined,
        maxLng: maxLng ? parseFloat(maxLng) : undefined
      });

      return res.status(200).json({
        success: true,
        count: reports.length,
        data: reports
      });
    } catch (error) {
      console.error('Error fetching map reports:', error);
      next(error);
    }
  }

  // Ei function user lat/lng coordinate center dhore specify radius (km) e nearby reports fetch korbe
  static async getNearbyReports(req, res, next) {
    try {
      const { latitude, longitude, radius, category, status } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          error: 'Latitude and longitude parameters are required for nearby reports search.'
        });
      }

      const nearbyReports = await LocationModel.getNearbyReports({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radiusKm: radius ? parseFloat(radius) : 10,
        category,
        status
      });

      return res.status(200).json({
        success: true,
        count: nearbyReports.length,
        userLocation: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        },
        data: nearbyReports
      });
    } catch (error) {
      console.error('Error fetching nearby reports:', error);
      next(error);
    }
  }

  // Ei function reverse geocoding request process korbe (lat, lng to readable address string)
  // Native Node.js fetch API use kora hocche OpenStreetMap Nominatim reverse lookup er jonno
  static async reverseGeocode(req, res, next) {
    try {
      const { lat, lng } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          error: 'Latitude (lat) and longitude (lng) are required.'
        });
      }

      // OpenStreetMap Nominatim Reverse Geocoding API call with native fetch
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      
      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'JanaoBanglaCivicApp/1.0 (contact@janaobangla.org)'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          const addressDetails = data.address || {};
          return res.status(200).json({
            success: true,
            address: data.display_name,
            details: {
              road: addressDetails.road || addressDetails.pedestrian || '',
              suburb: addressDetails.suburb || addressDetails.neighbourhood || '',
              city: addressDetails.city || addressDetails.town || addressDetails.district || '',
              state: addressDetails.state || addressDetails.division || '',
              postcode: addressDetails.postcode || '',
              country: addressDetails.country || 'Bangladesh'
            }
          });
        }
      }

      return res.status(200).json({
        success: true,
        address: `Lat: ${parseFloat(lat).toFixed(4)}, Lng: ${parseFloat(lng).toFixed(4)}`,
        details: {}
      });
    } catch (error) {
      // Geocoding API failure hole fallback response dibe error na throw kore
      console.warn('Reverse geocode fallback:', error.message);
      return res.status(200).json({
        success: true,
        address: `Location (${req.query.lat}, ${req.query.lng})`,
        details: {}
      });
    }
  }
}

module.exports = LocationController;
