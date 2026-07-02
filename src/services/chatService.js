import api from './api';

export const chatService = {
  getRelationships: async () => {
    const response = await api.get('/chats/relationships');
    return response.data;
  },

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

  editMessage: async (messageId, content) => {
    const response = await api.put(`/chats/message/${messageId}`, { content });
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await api.delete(`/chats/message/${messageId}`);
    return response.data;
  },

  deleteConversation: async (otherUserId) => {
    const response = await api.delete(`/chats/conversation/${otherUserId}`);
    return response.data;
  },

  removeConnection: async (otherUserId) => {
    const response = await api.delete(`/chats/connection/${otherUserId}`);
    return response.data;
  },
};
