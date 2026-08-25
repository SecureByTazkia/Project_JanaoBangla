// ==========================================
// JanaoBangla — AI Civic Problem Frontend Service
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// React frontend theke AI REST API endpoints e request pathanor central service
// Component e direct axios call kora hobe na — service diye call hobe
// ==========================================

import apiClient from './ApiService';

const AICivicProblemService = {

  // ==========================================
  // analyzeUploadedImage — Upload kora evidence image backend AI engine e pathay
  // ==========================================
  analyzeUploadedImage: async (imageFile, additionalContext = {}) => {
    // Ei function FormData banaye backend e image upload kore AI recognition result niye ashe
    const formData = new FormData();
    formData.append('image', imageFile);

    if (additionalContext.title) formData.append('title', additionalContext.title);
    if (additionalContext.description) formData.append('description', additionalContext.description);
    if (additionalContext.address) formData.append('address', additionalContext.address);
    if (additionalContext.latitude) formData.append('latitude', additionalContext.latitude);
    if (additionalContext.longitude) formData.append('longitude', additionalContext.longitude);

    const response = await apiClient.post('/ai/analyze-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // ==========================================
  // getSmartSuggestions — Title / description / location theke smart suggestions fetch kore
  // ==========================================
  getSmartSuggestions: async ({ text, title, description, category, address }) => {
    // Ei function text based AI suggestions ar category recommendations pabar jonno call kora hoy
    const response = await apiClient.post('/ai/suggest', {
      text,
      title,
      description,
      category,
      address
    });
    return response.data;
  },

  // ==========================================
  // checkDuplicateReports — Submit korar age similar problem search kore
  // ==========================================
  checkDuplicateReports: async ({ title, description, category, latitude, longitude }) => {
    // Ei function database er existing report er sathe duplicate check kore
    const response = await apiClient.post('/ai/detect-duplicates', {
      title,
      description,
      category,
      latitude,
      longitude
    });
    return response.data;
  }
};

export default AICivicProblemService;
