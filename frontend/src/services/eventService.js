import api from './api';

export const eventService = {
  getAllEvents: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    
    const response = await api.get(`/events?${params.toString()}`);
    return response.data.data || [];
  },

  getEventById: async (eventId) => {
    const response = await api.get(`/events/${eventId}`);
    return response.data.data;
  },

  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  updateEvent: async (eventId, eventData) => {
    const response = await api.put(`/events/${eventId}`, eventData);
    return response.data;
  },

  approveEvent: async (eventId) => {
    const response = await api.put(`/events/${eventId}/approve`);
    return response.data;
  },

  rejectEvent: async (eventId, reason) => {
    const response = await api.put(`/events/${eventId}/reject`, { reason });
    return response.data;
  },

  registerForEvent: async (eventId) => {
    const response = await api.post(`/events/${eventId}/register`);
    return response.data;
  },

  unregisterFromEvent: async (eventId) => {
    const response = await api.post(`/events/${eventId}/unregister`);
    return response.data;
  },

  getUserRegisteredEvents: async () => {
    const response = await api.get('/events/user/registered');
    return response.data.data || [];
  },

  getEventsBySpeaker: async (speakerId) => {
    const response = await api.get(`/events/speaker/${speakerId}`);
    return response.data.data || [];
  },

  getSpeakerPendingEvents: async () => {
    const response = await api.get('/events/speaker/pending/assignments');
    return response.data.data || [];
  },

  uploadAudioTranscription: async (eventId, audioFile) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    const response = await api.post(`/events/${eventId}/transcribe-audio`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2 min timeout for large audio
    });
    return response.data;
  },

  addTranscriptionText: async (eventId, transcription) => {
    const response = await api.post(`/events/${eventId}/transcription-text`, { transcription });
    return response.data;
  },
};
