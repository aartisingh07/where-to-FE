import api from './api';

export const memoryService = {
  uploadMemory: async (formData) => {
    const response = await api.post('/memories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getMemories: async (userId) => {
    const response = await api.get(`/memories/user/${userId}`);
    return response.data;
  },

  getFeed: async () => {
    const response = await api.get('/memories/feed');
    return response.data;
  },

  deleteMemory: async (memoryId) => {
    const response = await api.delete(`/memories/${memoryId}`);
    return response.data;
  }
};
