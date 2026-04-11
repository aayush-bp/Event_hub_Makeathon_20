import api from './api';

export const aiService = {
  generateEventDetails: async (eventName) => {
    const response = await api.post('/ai/generate-event', { eventName });
    return response.data.data;
  },
};
