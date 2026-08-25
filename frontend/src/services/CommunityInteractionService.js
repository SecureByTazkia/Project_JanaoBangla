// ==========================================
// JanaoBangla — Community Interaction Service
// BRANCH: feature-community-feed-comments-and-discussion
// React frontend theke community feed, discussion, comments, replies ar verification API request backend e pathay
// ==========================================

import apiClient from './ApiService';

const CommunityInteractionService = {

  // ==========================================
  // getCommunityFeed
  // Ei function ta backend theke public community feed er reports fetch kore
  // Params: { category, status, search, sortBy, page, limit }
  // ==========================================
  getCommunityFeed: async (params = {}) => {
    try {
      const response = await apiClient.get('/community/feed', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch community feed:', error);
      throw error;
    }
  },

  // ==========================================
  // getReportDiscussion
  // Ei function ta ekta specific report er full details, evidence, comments tree ar verification data niye ashe
  // ==========================================
  getReportDiscussion: async (reportId) => {
    try {
      const response = await apiClient.get(`/community/reports/${reportId}/discussion`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch discussion for report #${reportId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // getComments
  // Ei function ta shudhu report er comments tree fetch kore
  // ==========================================
  getComments: async (reportId) => {
    try {
      const response = await apiClient.get(`/community/reports/${reportId}/comments`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch comments for report #${reportId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // postComment
  // Ei function ta noya comment ba nested reply backend e submit kore
  // Payload: { content, parent_id, is_anonymous }
  // ==========================================
  postComment: async (reportId, commentData) => {
    try {
      const response = await apiClient.post(`/community/reports/${reportId}/comments`, commentData);
      return response.data;
    } catch (error) {
      console.error(`Failed to post comment on report #${reportId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // toggleProblemVerification
  // Ei function ta citizen er civic problem confirmation (verification) toggle kore ("Confirm Problem")
  // ==========================================
  toggleProblemVerification: async (reportId) => {
    try {
      const response = await apiClient.post(`/community/reports/${reportId}/verify`);
      return response.data;
    } catch (error) {
      console.error(`Failed to toggle verification on report #${reportId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // getVerificationStatus
  // Ei function ta check kore current user report verify koreche kina ar total verification count koto
  // ==========================================
  getVerificationStatus: async (reportId) => {
    try {
      const response = await apiClient.get(`/community/reports/${reportId}/verification-status`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get verification status for report #${reportId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // flagComment
  // Ei function ta inappropriate comment ke moderation er jonno flag/report kore
  // ==========================================
  flagComment: async (commentId) => {
    try {
      const response = await apiClient.post(`/community/comments/${commentId}/flag`);
      return response.data;
    } catch (error) {
      console.error(`Failed to flag comment #${commentId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // deleteComment
  // Ei function ta author ba admin er request e comment delete/remove kore
  // ==========================================
  deleteComment: async (commentId) => {
    try {
      const response = await apiClient.delete(`/community/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete comment #${commentId}:`, error);
      throw error;
    }
  }
};

export default CommunityInteractionService;
