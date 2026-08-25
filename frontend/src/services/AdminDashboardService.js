// ==========================================
// JanaoBangla — Admin Dashboard Frontend Service
// BRANCH: feature-admin-dashboard-and-system-monitoring
// Admin panel er shob API call ekhane thakbe
// Component e direct axios call korbo na — service diye call korbo
// ==========================================

import apiClient from './ApiService';

// ==========================================
// AdminDashboardService — Admin panel er REST API calls
// /api/admin/* endpoint e request pathabe
// ==========================================
const AdminDashboardService = {

  // System er overall stats fetch korbe (total users, reports, comments, SOS, pending, solved)
  getOverviewStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  // Admin panel er jonno users list fetch korbe (pagination + search support)
  getUsers: async (page = 1, limit = 10, search = '') => {
    const response = await apiClient.get('/admin/users', {
      params: { page, limit, search }
    });
    return response.data;
  },

  // Specific user er role change korbe (citizen <-> admin)
  updateUserRole: async (userId, role) => {
    const response = await apiClient.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  // User account active/deactivate toggle korbe
  updateUserStatus: async (userId, isActive) => {
    const response = await apiClient.patch(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  },

  // Admin view er jonno shob reports fetch korbe (public + private, filter support)
  getReports: async (page = 1, limit = 10, status = 'all', category = 'all') => {
    const response = await apiClient.get('/admin/reports', {
      params: { page, limit, status, category }
    });
    return response.data;
  },

  // Report er status update korbe (submitted -> under_review -> processing -> solved)
  updateReportStatus: async (reportId, status) => {
    const response = await apiClient.patch(`/admin/reports/${reportId}/status`, { status });
    return response.data;
  },

  // Spam/invalid report delete korbe
  deleteReport: async (reportId) => {
    const response = await apiClient.delete(`/admin/reports/${reportId}`);
    return response.data;
  },

  // Comments fetch korbe moderation er jonno
  getComments: async (page = 1, limit = 10, filter = 'flagged') => {
    const response = await apiClient.get('/admin/comments', {
      params: { page, limit, filter }
    });
    return response.data;
  },

  // Comment hide/unhide korbe (moderation action)
  moderateComment: async (commentId, isHidden) => {
    const response = await apiClient.patch(`/admin/comments/${commentId}/moderate`, { isHidden });
    return response.data;
  },

  // Inappropriate comment permanently delete korbe
  deleteComment: async (commentId) => {
    const response = await apiClient.delete(`/admin/comments/${commentId}`);
    return response.data;
  },

  // SOS Emergency requests fetch korbe monitoring er jonno
  getSosRequests: async (page = 1, limit = 10, status = 'all') => {
    const response = await apiClient.get('/admin/sos', {
      params: { page, limit, status }
    });
    return response.data;
  },

  // SOS Emergency request status update korbe (active -> resolved / cancelled)
  updateSosStatus: async (id, status) => {
    const response = await apiClient.patch(`/admin/sos/${id}/status`, { status });
    return response.data;
  },

  // Recent system activity logs fetch korbe
  getSystemLogs: async () => {
    const response = await apiClient.get('/admin/system-logs');
    return response.data;
  }
};

export default AdminDashboardService;
