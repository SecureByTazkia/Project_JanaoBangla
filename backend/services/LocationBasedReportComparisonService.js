// ==========================================
// JanaoBangla — Location-Based Report Comparison Service
// BRANCH: feature-duplicate-civic-problem-report-detection
// Ei service report-gular latitude ebong longitude compare kore
// Haversine formula diye distance calculate kore ebong proximity score ber kore
// ==========================================

class LocationBasedReportComparisonService {

  // ==========================================
  // calculateDistanceInKm — Duita GPS coordinates er moddhe distance (Kilometer e) calculate kore
  // ==========================================
  static calculateDistanceInKm(lat1, lon1, lat2, lon2) {
    // Ei function duita latitude ar longitude niye Haversine formula diye distance km e hisab kore
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;

    const p1Lat = parseFloat(lat1);
    const p1Lon = parseFloat(lon1);
    const p2Lat = parseFloat(lat2);
    const p2Lon = parseFloat(lon2);

    if (isNaN(p1Lat) || isNaN(p1Lon) || isNaN(p2Lat) || isNaN(p2Lon)) return null;

    const earthRadiusKm = 6371; // Prithibir radius kilometer e
    const dLat = (p2Lat - p1Lat) * (Math.PI / 180);
    const dLon = (p2Lon - p1Lon) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(p1Lat * (Math.PI / 180)) *
      Math.cos(p2Lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = earthRadiusKm * c;

    return parseFloat(distanceKm.toFixed(3));
  }

  // ==========================================
  // calculateDistanceInMeters — Duita GPS coordinates er moddhe distance (Meter e) calculate kore
  // ==========================================
  static calculateDistanceInMeters(lat1, lon1, lat2, lon2) {
    // Ei function duita location er moddhe koto meter durotwo ache ta hisab kore
    const km = this.calculateDistanceInKm(lat1, lon1, lat2, lon2);
    if (km === null) return null;
    return Math.round(km * 1000);
  }

  // ==========================================
  // calculateProximityScore — Distance er upor bhitti kore geographic proximity score (0-100) dey
  // ==========================================
  static calculateProximityScore(distanceMeters) {
    // Ei function distance joto kom hobe toto beshi score dibe:
    // <= 50 meter: 100% proximity score
    // <= 150 meter: 90% proximity score
    // <= 300 meter: 80% proximity score
    // <= 500 meter: 65% proximity score
    // <= 1000 meter (1km): 40% proximity score
    // <= 2000 meter (2km): 20% proximity score
    // > 2000 meter: 0% proximity score
    if (distanceMeters === null || distanceMeters === undefined) return 0;

    if (distanceMeters <= 50) return 100;
    if (distanceMeters <= 150) return 90;
    if (distanceMeters <= 300) return 80;
    if (distanceMeters <= 500) return 65;
    if (distanceMeters <= 1000) return 40;
    if (distanceMeters <= 2000) return 20;
    return 0;
  }

  // ==========================================
  // isWithinRadius — Duita point ki nirdishto radius er bhetore ache kina check kore
  // ==========================================
  static isWithinRadius(lat1, lon1, lat2, lon2, maxRadiusMeters = 1000) {
    // Ei function check kore duita report ek i elakar moddhe (default 1km) ache kina
    const dist = this.calculateDistanceInMeters(lat1, lon1, lat2, lon2);
    if (dist === null) return false;
    return dist <= maxRadiusMeters;
  }

  // ==========================================
  // formatDistance — Human readable text format e distance display kore
  // ==========================================
  static formatDistance(distanceMeters) {
    // Ei function meter ba kilometer e user-friendly text banay (e.g., '150 m' ba '1.2 km')
    if (distanceMeters === null || distanceMeters === undefined) return 'Unknown distance';
    if (distanceMeters < 1000) {
      return `${distanceMeters} m`;
    }
    const km = (distanceMeters / 1000).toFixed(1);
    return `${km} km`;
  }
}

module.exports = LocationBasedReportComparisonService;
