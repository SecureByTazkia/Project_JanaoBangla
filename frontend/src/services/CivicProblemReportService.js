import api from './ApiService';

const CivicProblemReportService = {
  // Ei function user er theke form data niye backend e submit korbe
  submitReport: async (formData) => {
    try {
      const response = await api.post('/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // File upload er jonno multipart use kora hocche
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Ei function current user er submit kora shob report gulo pabe
  getMyReports: async () => {
    try {
      const response = await api.get('/reports/my-reports');
      return response.data.reports;
    } catch (error) {
      throw error;
    }
  },

  // Ei function shob public report gulo publically show korar jonno pabe
  getPublicReports: async () => {
    try {
      const response = await api.get('/reports/public');
      return response.data.reports;
    } catch (error) {
      throw error;
    }
  },

  // Ei function specific ekta report er details pabar jonno use hobe
  getReportDetails: async (reportId) => {
    try {
      const response = await api.get(`/reports/${reportId}`);
      return response.data.report;
    } catch (error) {
      throw error;
    }
  }
};

export default CivicProblemReportService;
