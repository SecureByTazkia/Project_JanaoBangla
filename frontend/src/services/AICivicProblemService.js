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
  },

  // ==========================================
  // analyzeEvidenceImage — Upload kora evidence image analyze kore problem + suggestions return kore
  // ==========================================
  analyzeEvidenceImage: async (imageFile, metadata = {}) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (metadata.title) formData.append('title', metadata.title);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.category) formData.append('category', metadata.category);
    if (metadata.address) formData.append('address', metadata.address);
    if (metadata.latitude) formData.append('latitude', metadata.latitude);
    if (metadata.longitude) formData.append('longitude', metadata.longitude);

    const response = await apiClient.post('/ai/analyze-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // ==========================================
  // suggestCategoryAndImprovement — Draft text theke smart suggestion banay
  // ==========================================
  suggestCategoryAndImprovement: async ({ text, title, description, category, address }) => {
    const response = await apiClient.post('/ai/suggest-content', {
      text,
      title,
      description,
      category,
      address
    });
    return response.data;
  }
};

export default AICivicProblemService;
