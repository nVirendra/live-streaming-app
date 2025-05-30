import api from './api';

export const streamingAPI = {
  // Get live streams
  getLiveStreams: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    return await api.get(`/streams/live?${params}`);
  },

  // Get specific stream
  getStreams: async () => {
    return await api.get(`/streams`);
  },

  // Create new stream
  createStream: async (streamData) => {
    return await api.post('/streams', streamData);
  },

  // Update stream
  updateStream: async (streamId, updates) => {
    return await api.put(`/streams/${streamId}`, updates);
  },

  // Delete stream
  deleteStream: async (streamId) => {
    return await api.delete(`/streams/${streamId}`);
  },

  // Like/unlike stream
  toggleLike: async (streamId) => {
    return await api.post(`/streams/${streamId}/like`);
  },

  // Get stream analytics
  getStreamAnalytics: async (streamId) => {
    return await api.get(`/streams/${streamId}/analytics`);
  },

  // Search streams
  searchStreams: async (query, filters = {}) => {
    const params = new URLSearchParams({ q: query });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    return await api.get(`/streams/search?${params}`);
  }
};