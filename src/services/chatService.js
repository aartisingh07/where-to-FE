import api from './api';

export const chatService = {
  searchUser: async (username) => {
    const response = await api.get(`/chats/search?username=${encodeURIComponent(username)}`);
    return response.data;
  },

  sendRequest: async (receiverId) => {
    const response = await api.post('/chats/request', { receiverId });
    return response.data;
  },

  handleRequest: async (requestId, action) => {
    const response = await api.post(`/chats/request/${requestId}`, { action });
    return response.data;
  },

  getActiveChats: async () => {
    const response = await api.get('/chats/active');
    return response.data;
  },

  getPendingRequests: async () => {
    const response = await api.get('/chats/requests');
    return response.data;
  },

  getMessageHistory: async (otherUserId) => {
    const response = await api.get(`/chats/messages/${otherUserId}`);
    return response.data;
  },

  sendMessage: async (otherUserId, content) => {
    const response = await api.post(`/chats/messages/${otherUserId}`, { content });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/chats/unread-count');
    return response.data;
  },

  markAsRead: async (senderId) => {
    const response = await api.post(`/chats/mark-read/${senderId}`);
    return response.data;
  },
};
