// ==========================================
// JanaoBangla — AI Content Safety Frontend Service
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// Uploaded media safety (nudity, NSFW, adult content moderation) API client
// ==========================================

import apiClient from './ApiService';

const AICivicProblemService = {

  // ==========================================
  // moderateUploadedImage — Upload kora image AI diye scan kore nudity/adult content detect kore
  // ==========================================
  moderateUploadedImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await apiClient.post('/ai/moderate-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default AICivicProblemService;
