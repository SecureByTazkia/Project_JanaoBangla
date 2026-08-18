// ==========================================
// JanaoBangla — Live Location Sharing Service
// BRANCH: feature-women-safety-sos-and-emergency-notifications
// Ei service ta user er GPS location theke shareable link tৈri korbe
// Google Maps link generate korbe ar address string format korbe
// ==========================================

// ==========================================
// buildGoogleMapsLink — Lat/lng theke Google Maps link banano
// Emergency alert e click kore location dekhte parbe
// ==========================================
function buildGoogleMapsLink(latitude, longitude) {
  // Latitude ba longitude na thakle null return kora hocche
  if (!latitude || !longitude) return null;

  // Google Maps URL tৈri kora hocche
  return `https://maps.google.com/?q=${latitude},${longitude}&z=16`;
}

// ==========================================
// buildLocationString — Location er human-readable string banano
// Address, lat/lng — ja available tা use korbe
// ==========================================
function buildLocationString(latitude, longitude, address) {
  // Address thakle seta use kora hocche
  if (address && address.trim()) {
    return address.trim();
  }

  // Address na thakle coordinates string banano hocche
  if (latitude && longitude) {
    return `Coordinates: ${parseFloat(latitude).toFixed(6)}, ${parseFloat(longitude).toFixed(6)}`;
  }

  return 'Location unavailable';
}

// ==========================================
// parseLocationFromRequest — Request body theke location data extract kora
// SOS request er body theke lat/lng/address parse kora hobe
// ==========================================
function parseLocationFromRequest(body) {
  // Location data request body theke newa hocche
  const latitude  = body.latitude  ? parseFloat(body.latitude)  : null;
  const longitude = body.longitude ? parseFloat(body.longitude) : null;
  const address   = body.locationAddress || body.address || null;

  // Valid coordinates check kora hocche (-90 to 90 lat, -180 to 180 lng)
  let validCoords = false;
  if (latitude !== null && longitude !== null) {
    validCoords = (
      latitude  >= -90  && latitude  <= 90 &&
      longitude >= -180 && longitude <= 180
    );
  }

  return {
    latitude:        validCoords ? latitude  : null,
    longitude:       validCoords ? longitude : null,
    locationAddress: address,
    googleMapsLink:  validCoords ? buildGoogleMapsLink(latitude, longitude) : null,
    locationString:  buildLocationString(
      validCoords ? latitude  : null,
      validCoords ? longitude : null,
      address
    )
  };
}

// ==========================================
// formatCoordinatesForDisplay — Lat/lng display format kora
// UI te dekhanor jonno nice format
// ==========================================
function formatCoordinatesForDisplay(latitude, longitude) {
  // Coordinates na thakle 'N/A' return kora hocche
  if (!latitude || !longitude) return 'N/A';

  // North/South ar East/West direction determine kora hocche
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';

  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}

module.exports = {
  buildGoogleMapsLink,
  buildLocationString,
  parseLocationFromRequest,
  formatCoordinatesForDisplay
};
