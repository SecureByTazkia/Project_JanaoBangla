// ==========================================
// JanaoBangla — Duplicate Report Detection Service
// BRANCH: feature-duplicate-civic-problem-report-detection
// React frontend theke duplicate detection, similarity check, ebong duplicate report linking API requests pathay
// ==========================================

import api from './ApiService';

const DuplicateReportDetectionService = {

  // ==========================================
  // checkDuplicates — Form data niye backend e duplicate & similarity check API call pathay
  // ==========================================
  checkDuplicates: async ({ title, description, category, latitude, longitude, excludeReportId }) => {
    // Ei function user er typed input backend e pathiye similar report khuje ber kore
    try {
      const response = await api.post('/duplicates/check', {
        title,
        description,
        category,
        latitude,
        longitude,
        excludeReportId
      });
      return response.data;
    } catch (error) {
      console.error('Duplicate detection request failed:', error);
      throw error;
    }
  },

  // ==========================================
  // linkDuplicateReport — Duita report ke original ebong duplicate hisebe database e link kore
  // ==========================================
  linkDuplicateReport: async ({ originalReportId, duplicateReportId, similarityScore }) => {
    // Ei function original ebong duplicate report ID niye backend link API te pathay
    try {
      const response = await api.post('/duplicates/link', {
        originalReportId,
        duplicateReportId,
        similarityScore
      });
      return response.data;
    } catch (error) {
      console.error('Report linking request failed:', error);
      throw error;
    }
  },

  // ==========================================
  // getLinkedReports — Ekta specific report er sathe linked sob duplicate reports fetch kore
  // ==========================================
  getLinkedReports: async (reportId) => {
    // Ei function report ID diye backend theke tar shob connected duplicate reports ene dey
    try {
      const response = await api.get(`/duplicates/linked/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch linked duplicate reports:', error);
      throw error;
    }
  },

  // ==========================================
  // unlinkDuplicateReport — Duplicate link cancel kore report ke independent kore
  // ==========================================
  unlinkDuplicateReport: async (reportId) => {
    // Ei function duplicate report link remove korar DELETE request pathay
    try {
      const response = await api.delete(`/duplicates/link/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to unlink duplicate report:', error);
      throw error;
    }
  },

  // ==========================================
  // getAllDuplicateClusters — Admin / system overview er jonno duplicate summary clusters fetch kore
  // ==========================================
  getAllDuplicateClusters: async () => {
    // Ei function shob duplicate groups list ane
    try {
      const response = await api.get('/duplicates/clusters');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch duplicate clusters:', error);
      throw error;
    }
  }
};

export default DuplicateReportDetectionService;
