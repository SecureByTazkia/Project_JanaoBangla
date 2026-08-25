// ==========================================
// JanaoBangla — Location Service
// BRANCH: feature-location-and-civic-problem-map-visualization
// Map ar location endpoints calling frontend service
// ==========================================

import apiService from './ApiService';

class LocationService {

  // Ei function map viewer public reports fetching korbe (with category/status filters)
  static async getMapReports(params = {}) {
    const response = await apiService.get('/location/reports', { params });
    return response.data;
  }

  // Ei function user lat/lng position matching radius nearby reports get korbe
  static async getNearbyReports(latitude, longitude, radius = 10, filters = {}) {
    const params = {
      latitude,
      longitude,
      radius,
      ...filters
    };
    const response = await apiService.get('/location/nearby', { params });
    return response.data;
  }

  // Ei function lat/lng reverse geocoding reverse address string fetching korbe
  static async reverseGeocode(lat, lng) {
    const response = await apiService.get('/location/reverse-geocode', {
      params: { lat, lng }
    });
    return response.data;
  }
}

export default LocationService;
