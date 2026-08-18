// ==========================================
// JanaoBangla — Women Safety SOS Service (Frontend)
// BRANCH: feature-women-safety-sos-and-emergency-notifications
// Ei file ta SOS-related sob API request handle korbe
// Component e direct API call korbo na, ei service use korbo
// ==========================================

import { sosApi, emergencyContactApi } from './ApiService';

// ==========================================
// triggerSOS — SOS alert trigger korar jonno backend e request pathano
// Location data sহ POST request jabe /api/sos/trigger e
// ==========================================
export async function triggerSOS(locationData) {
  // SOS trigger request pathano hocche
  const response = await sosApi.trigger(locationData);
  return response.data;
}

// ==========================================
// resolveSOS — Active SOS resolve korar jonno request pathano
// User safe ache, SOS close korte chaiche
// ==========================================
export async function resolveSOS(requestId) {
  // SOS resolve request pathano hocche
  const response = await sosApi.resolve(requestId);
  return response.data;
}

// ==========================================
// cancelSOS — Active SOS cancel korar jonno request pathano
// False alarm, SOS cancel korte chaiche
// ==========================================
export async function cancelSOS(requestId) {
  // SOS cancel request pathano hocche
  const response = await sosApi.cancel(requestId);
  return response.data;
}

// ==========================================
// getSOSHistory — User er SOS history fetch kora
// SOS page e history section e dekhabe
// ==========================================
export async function getSOSHistory(limit = 10, offset = 0) {
  // SOS history fetch request pathano hocche
  const response = await sosApi.getHistory({ limit, offset });
  return response.data;
}

// ==========================================
// getActiveSOSStatus — User er active SOS ache kina check kora
// SOS button enable/disable korar jonno use hobe
// ==========================================
export async function getActiveSOSStatus() {
  // Active SOS status check request pathano hocche
  const response = await sosApi.getActiveStatus();
  return response.data;
}

// ==========================================
// getCurrentLocation — Browser Geolocation API theke GPS newa
// Promise-based wrapper, error handle sহ
// ==========================================
export function getCurrentLocation(options = {}) {
  return new Promise((resolve, reject) => {
    // Browser geolocation support ache kina check kora hocche
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    // Default options set kora hocche high accuracy GPS er jonno
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout:            10000,  // 10 second wait
      maximumAge:         30000   // 30 second old cached location accept korbe
    };

    // GPS position newa hocche
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success: coordinates return kora hocche
        resolve({
          latitude:  position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy:  position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        // Error: geolocation fail hoile friendly message pathano hocche
        let errorMessage = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please allow location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
        reject(new Error(errorMessage));
      },
      { ...defaultOptions, ...options }
    );
  });
}

// ==========================================
// Emergency Contact API wrappers
// Emergency contact CRUD ekhane wrap kora hocche
// ==========================================

export async function getEmergencyContacts() {
  // User er sob emergency contacts fetch kora hocche
  const response = await emergencyContactApi.getAll();
  return response.data;
}

export async function addEmergencyContact(contactData) {
  // Notun emergency contact add korar request pathano hocche
  const response = await emergencyContactApi.create(contactData);
  return response.data;
}

export async function updateEmergencyContact(contactId, contactData) {
  // Existing emergency contact update korar request pathano hocche
  const response = await emergencyContactApi.update(contactId, contactData);
  return response.data;
}

export async function deleteEmergencyContact(contactId) {
  // Emergency contact delete korar request pathano hocche
  const response = await emergencyContactApi.delete(contactId);
  return response.data;
}
