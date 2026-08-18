// ==========================================
// JanaoBangla — API Service (Axios Configuration)
// BRANCH: main
// Sob API call ekhane define kora hobe
// Component e direct axios call korbo na
// ==========================================

import axios from 'axios';

// ==========================================
// BASE API INSTANCE CREATE
// Vite proxy diye /api route backend e jabe
// Token automatically header e jog hobe
// ==========================================
const apiClient = axios.create({
  baseURL: '/api',      // Vite vite.config.js e proxy set kora ache backend e pathano jonno
  timeout: 15000,       // 15 second er moddhe response na ashle timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// ==========================================
// REQUEST INTERCEPTOR
// Sob request pathano er age JWT token header e jog kora hobe
// LocalStorage theke token newa hocche
// ==========================================
apiClient.interceptors.request.use(
  (config) => {
    // LocalStorage theke saved token newa hocche
    const token = localStorage.getItem('jb_access_token');
    if (token) {
      // Bearer token header e set kora hocche
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Request pathate problem hole error return kora hocche
    return Promise.reject(error);
  }
);

// ==========================================
// RESPONSE INTERCEPTOR
// Sob response aste r age process kora hobe
// 401 hoile token clear kore login page e niye jabe
// ==========================================
apiClient.interceptors.response.use(
  (response) => {
    // Successful response directly return kora hocche
    return response;
  },
  (error) => {
    // 401 Unauthorized — token invalid/expired hoile logout korbe
    if (error.response && error.response.status === 401) {
      // Token clear kora hocche LocalStorage theke
      localStorage.removeItem('jb_access_token');
      localStorage.removeItem('jb_user');

      // Login page e redirect kora hocche (window.location use kora hocche React context er baire theke)
      // Phase 2 e proper redirect add hobe
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// HEALTH CHECK API
// Server ar database status check korar jonno
// ==========================================
export const healthApi = {
  // Server ar database ki thik ache check korbe
  checkHealth: () => apiClient.get('/health')
};

// ==========================================
// PLACEHOLDER API ENDPOINTS
// Porer phase e ei sections fill hobe
// Ekhane structure ready rakhchi
// ==========================================

// ==========================================
// Phase 2 — Authentication API
// ==========================================
export const authApi = {
  // Noya user register korar jonno
  register: (data) => apiClient.post('/auth/register', data),

  // User login korar jonno
  login: (data) => apiClient.post('/auth/login', data),

  // Current logged in user er profile data
  getProfile: () => apiClient.get('/auth/profile'),

  // Profile data update korar jonno
  updateProfile: (data) => apiClient.put('/auth/profile', data),

  // Email verification OTP submit korar jonno (Step 2 registration or authenticated)
  verifyEmail: (data) => {
    const payload = typeof data === 'string' ? { otp: data } : data;
    return apiClient.post('/auth/verify-email', payload);
  },

  // OTP resend korar jonno
  resendVerification: (data) => {
    const payload = typeof data === 'string' ? { email: data } : (data || {});
    return apiClient.post('/auth/resend-verification', payload);
  },

  // Forgot password email request pathanor jonno
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),

  // Reset token diye password update korar jonno
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),

  // Logged-in user er password change korar jonno
  changePassword: (data) => apiClient.put('/auth/change-password', data)
};

// Phase 3 — Reports
export const reportApi = {};

// Phase 4 — Location/Map
export const locationApi = {};

// Phase 5 — Community
export const communityApi = {};

// Phase 6 — Duplicates
export const duplicateApi = {};

// Phase 7 — SOS Emergency
export const sosApi = {};

// Phase 8 — Admin Dashboard API
export const adminApi = {
  // System overview stats fetch
  getStats: () => apiClient.get('/admin/stats'),
  // Users list pagination ar search সহ
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  // User role update
  updateUserRole: (userId, role) => apiClient.patch(`/admin/users/${userId}/role`, { role }),
  // User status toggle
  updateUserStatus: (userId, isActive) => apiClient.patch(`/admin/users/${userId}/status`, { isActive }),
  // Reports list with filters
  getReports: (params) => apiClient.get('/admin/reports', { params }),
  // Report status update
  updateReportStatus: (id, status) => apiClient.patch(`/admin/reports/${id}/status`, { status }),
  // Report delete
  deleteReport: (id) => apiClient.delete(`/admin/reports/${id}`),
  // Flagged comments fetch
  getFlaggedComments: () => apiClient.get('/admin/comments'),
  // Comment moderation
  moderateComment: (id, isHidden) => apiClient.patch(`/admin/comments/${id}/moderate`, { isHidden }),
  // System logs
  getSystemLogs: () => apiClient.get('/admin/system-logs')
};

// Phase 9 — Search & Analytics
export const searchApi = {};
export const analyticsApi = {};

// Phase 10 — AI
export const aiApi = {
  analyzeImage: (formData) => apiClient.post('/ai/analyze-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getSuggestions: (data) => apiClient.post('/ai/suggest', data),
  detectDuplicates: (data) => apiClient.post('/ai/detect-duplicates', data)
};

// Default export hisebe apiClient export kora hocche
export default apiClient;
