import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatService } from '../services/chatService';
import { toast } from 'react-toastify';
import { FiSend, FiUser, FiMessageSquare, FiClock, FiPlusCircle, FiCheck, FiX, FiTrash2, FiEdit2 } from 'react-icons/fi';

const DirectMessages = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [activeChats, setActiveChats] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // { user: { _id, username, avatar } }
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Edit State
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const messagesEndRef = useRef(null);

  const fetchChatsAndRequests = useCallback(async () => {
    try {
      const [chats, requests] = await Promise.all([
        chatService.getActiveChats(),
        chatService.getPendingRequests()
      ]);
      setActiveChats(chats || []);
      setPendingRequests(requests || []);
    } catch (err) {
      console.error('Failed to fetch DMs or requests:', err);
    } finally {
      setLoadingChats(false);
    }
  }, []);

  const fetchMessages = useCallback(async (otherUserId) => {
    setLoadingMessages(true);
    try {
      const data = await chatService.getMessageHistory(otherUserId);
      setMessages(data || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      toast.error('Failed to load message history');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const handleSearchUser = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (searchQuery.trim().toLowerCase() === user?.username?.toLowerCase()) {
      setSearchError('You cannot search for yourself');
      setSearchResult(null);
      return;
    }

    setSearching(true);
    setSearchError('');
    setSearchResult(null);
    try {
      const data = await chatService.searchUser(searchQuery);
      setSearchResult(data);
    } catch (err) {
      setSearchError(err.response?.data?.message || 'User not found');
    } finally {
      setSearching(false);
    }
  };

  const handleSendChatRequest = async () => {
    if (!searchResult) return;
    try {
      const response = await chatService.sendRequest(searchResult.user._id);
      setSearchResult((prev) => ({
        ...prev,
        relationship: 'pending_sent',
        requestId: response._id
      }));
      setSearchQuery('');
      toast.success('Chat request sent successfully!');
    } catch (err) {
      toast.error('Failed to send chat request');
    }
  };

  const handleAcceptSearchRequest = async (requestId) => {
    try {
      await chatService.handleRequest(requestId, 'accept');
      setSearchResult((prev) => ({ ...prev, relationship: 'accepted' }));
      toast.success('Chat request accepted!');
      fetchChatsAndRequests();
    } catch (err) {
      toast.error('Failed to accept request');
    }
  };

  const handleRejectSearchRequest = async (requestId) => {
    try {
      await chatService.handleRequest(requestId, 'reject');
      setSearchResult((prev) => ({ ...prev, relationship: 'none', requestId: null }));
      toast.info('Chat request ignored');
      fetchChatsAndRequests();
    } catch (err) {
      toast.error('Failed to ignore request');
    }
  };

  // Fetch lists on mount
  useEffect(() => {
    fetchChatsAndRequests();
  }, [fetchChatsAndRequests]);

  const handleMarkAsRead = useCallback(async (senderId) => {
    try {
      await chatService.markAsRead(senderId);
      setActiveChats((prev) =>
        prev.map((c) => (c.user._id === senderId ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  }, []);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.user._id);
      handleMarkAsRead(activeChat.user._id);
    } else {
      setMessages([]);
    }
  }, [activeChat, fetchMessages, handleMarkAsRead]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !user?._id) return;

    const messageEvent = `direct-message-${user._id}`;
    const relationshipEvent = `chat-relationship-updated-${user._id}`;
    const messageUpdateEvent = `direct-message-updated-${user._id}`;
    const messageDeleteEvent = `direct-message-deleted-${user._id}`;
    const conversationDeleteEvent = `direct-conversation-deleted-${user._id}`;

    const handleNewMessage = (newMsg) => {
      // If the message is part of our active conversation
      if (activeChat && (newMsg.sender === activeChat.user._id || newMsg.receiver === activeChat.user._id)) {
        setMessages((prev) => [...prev, newMsg]);
        
        // Mark as read if the other user sent it
        if (newMsg.sender === activeChat.user._id) {
          handleMarkAsRead(activeChat.user._id);
        }
      }
      
      // Refresh the chat lists so last message snippet is updated
      fetchChatsAndRequests();
    };

    const handleMessageUpdate = (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === updatedMsg.messageId
            ? { ...m, content: updatedMsg.content, isEdited: true }
            : m
        )
      );
      fetchChatsAndRequests();
    };

    const handleMessageDelete = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      fetchChatsAndRequests();
    };

    const handleConversationDelete = ({ otherUserId }) => {
      if (activeChat && activeChat.user._id === otherUserId) {
        setMessages([]);
      }
      fetchChatsAndRequests();
    };

    const handleRelationshipUpdate = ({ otherUserId, status }) => {
      fetchChatsAndRequests();
      
      // If the currently active chat connection was closed
      if (activeChat && activeChat.user._id === otherUserId && status !== 'accepted') {
        setActiveChat(null);
        toast.info('Chat connection was updated.');
      }
    };

    socket.on(messageEvent, handleNewMessage);
    socket.on(relationshipEvent, handleRelationshipUpdate);
    socket.on(messageUpdateEvent, handleMessageUpdate);
    socket.on(messageDeleteEvent, handleMessageDelete);
    socket.on(conversationDeleteEvent, handleConversationDelete);

    return () => {
      socket.off(messageEvent, handleNewMessage);
      socket.off(relationshipEvent, handleRelationshipUpdate);
      socket.off(messageUpdateEvent, handleMessageUpdate);
      socket.off(messageDeleteEvent, handleMessageDelete);
      socket.off(conversationDeleteEvent, handleConversationDelete);
    };
  }, [socket, user?._id, activeChat, fetchChatsAndRequests, handleMarkAsRead]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartEdit = (msgId, content) => {
    setEditingMessageId(msgId);
    setEditingText(content);
  };

  const handleSaveEdit = async (msgId) => {
    if (!editingText.trim()) return;
    try {
      await chatService.editMessage(msgId, editingText.trim());
      setEditingMessageId(null);
      toast.success('Message updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to edit message');
    }
  };

  const handleDeleteMsg = async (msgId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await chatService.deleteMessage(msgId);
      toast.success('Message deleted');
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  const handleDeleteConversation = async () => {
    if (!activeChat) return;
    if (!window.confirm(`Are you sure you want to clear your chat history with ${activeChat.user.username}? This will delete all messages permanently.`)) return;
    try {
      await chatService.deleteConversation(activeChat.user._id);
      toast.success('Conversation history cleared');
    } catch (err) {
      toast.error('Failed to clear conversation');
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeChat) return;
    const targetUserId = activeChat.user._id;
    const contentToSend = messageInput.trim();
    setMessageInput(''); // Clear immediately for snappy UX

    try {
      const response = await chatService.sendMessage(targetUserId, contentToSend);
      // Local socket listener will append and refresh chats list
    } catch (err) {
      toast.error('Failed to send message');
      setMessageInput(contentToSend); // Restore text on failure
    }
  };

  const handleAcceptRequest = async (requestId, requesterName) => {
    try {
      await chatService.handleRequest(requestId, 'accept');
      toast.success(`Chat request accepted. You can now chat with ${requesterName}!`);
      fetchChatsAndRequests();
    } catch (err) {
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await chatService.handleRequest(requestId, 'reject');
      toast.info('Chat request ignored');
      fetchChatsAndRequests();
    } catch (err) {
      toast.error('Failed to ignore request');
    }
  };

  return (
    <div className="h-screen bg-dark-900 flex overflow-hidden pt-16">
      {/* 1. Sidebar - Chat List & Requests */}
      <div className="w-80 border-r border-white/5 bg-dark-950 flex flex-col flex-shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between flex-shrink-0 bg-dark-900/40">
          <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
            <FiMessageSquare className="text-primary-400" />
            Direct Messages
          </h2>
        </div>

        {/* Sidebar Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          
          {/* User Search Box inside DM Sidebar */}
          <div className="pb-3 border-b border-white/5 space-y-2">
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold px-2">
              Find Users to Chat
            </p>
            <form onSubmit={handleSearchUser} className="flex gap-1.5 px-2">
              <input
                type="text"
                placeholder="Search username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white
                           placeholder-white/20 focus:outline-none focus:border-primary-500/40
                           transition-all"
              />
              <button
                type="submit"
                disabled={searching}
                className="px-3 py-1.5 rounded-lg bg-primary-500/25 border border-primary-500/25 hover:bg-primary-500/40 text-primary-300 hover:text-white text-xs transition-colors flex-shrink-0 cursor-pointer"
              >
                {searching ? '...' : 'Search'}
              </button>
            </form>

            {searchResult && (
              <div className="mx-2 p-2.5 rounded-xl border border-white/5 bg-white/3 flex items-center justify-between gap-2 animate-fade-in">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-0.5 flex-shrink-0">
                    <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center overflow-hidden">
                      {searchResult.user.avatar ? (
                        <img src={searchResult.user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-[10px] font-bold">{searchResult.user.username[0]?.toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-[11px] truncate leading-tight">{searchResult.user.username}</p>
                    <p className="text-[9px] text-white/30 truncate leading-none mt-0.5">Found profile</p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {searchResult.relationship === 'none' && (
                    <button
                      onClick={handleSendChatRequest}
                      className="px-2 py-1 rounded bg-primary-500/20 border border-primary-500/25 hover:bg-primary-500/45 text-primary-300 hover:text-white text-[10px] transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  )}
                  {searchResult.relationship === 'pending_sent' && (
                    <span className="text-[9px] text-white/40 bg-white/5 border border-white/10 px-1.5 py-1 rounded">
                      Sent
                    </span>
                  )}
                  {searchResult.relationship === 'pending_received' && (
                    <div className="flex gap-0.5">
                      <button
                        onClick={() => handleAcceptSearchRequest(searchResult.requestId)}
                        className="p-1 rounded bg-neon-green/20 hover:bg-neon-green/30 text-neon-green transition-colors cursor-pointer"
                        title="Accept"
                      >
                        <FiCheck size={11} />
                      </button>
                      <button
                        onClick={() => handleRejectSearchRequest(searchResult.requestId)}
                        className="p-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors cursor-pointer"
                        title="Ignore"
                      >
                        <FiX size={11} />
                      </button>
                    </div>
                  )}
                  {searchResult.relationship === 'accepted' && (
                    <button
                      onClick={() => {
                        setActiveChat(searchResult);
                        setSearchResult(null);
                        setSearchQuery('');
                      }}
                      className="px-2 py-1 rounded bg-neon-green/20 border border-neon-green/25 hover:bg-neon-green/35 text-neon-green text-[10px] font-semibold transition-colors cursor-pointer"
                    >
                      Chat
                    </button>
                  )}
                </div>
              </div>
            )}

            {searchError && (
              <p className="text-red-400 text-[10px] mt-1 px-3">{searchError}</p>
            )}
          </div>
          
          {/* Incoming Requests Section */}
          {pendingRequests.length > 0 && (
            <div className="space-y-2">
              <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold px-2">
                Chat Requests ({pendingRequests.length})
              </p>
              <div className="space-y-1">
                {pendingRequests.map((req) => (
                  <div key={req._id} className="glass-card p-3 flex items-center justify-between gap-2 border-primary-500/20 bg-primary-500/5">
                    <Link to={`/profile/${req.sender._id}`} className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity" title="View Profile">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-0.5 flex-shrink-0">
                        <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center overflow-hidden">
                          {req.sender.avatar ? (
                            <img src={req.sender.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white text-xs font-bold">{req.sender.username[0]?.toUpperCase()}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-white text-xs font-semibold truncate">{req.sender.username}</span>
                    </Link>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleAcceptRequest(req._id, req.sender.username)}
                        className="w-6 h-6 rounded bg-neon-green/20 hover:bg-neon-green/30 text-neon-green flex items-center justify-center transition-colors cursor-pointer"
                        title="Accept"
                      >
                        <FiCheck size={14} />
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req._id)}
                        className="w-6 h-6 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                        title="Ignore"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Chats Section */}
          <div className="space-y-1">
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold px-2 mb-2">
              Conversations
            </p>
            {loadingChats ? (
              <div className="text-center py-6">
                <div className="w-5 h-5 border border-white/20 border-t-primary-500 rounded-full animate-spin mx-auto" />
              </div>
            ) : activeChats.length === 0 ? (
              <p className="text-white/20 text-xs text-center py-8">
                No conversations yet. Search for a user on the homepage to start chatting!
              </p>
            ) : (
              activeChats.map((chat) => {
                const isActive = activeChat && activeChat.user._id === chat.user._id;
                return (
                  <button
                    key={chat.user._id}
                    onClick={() => setActiveChat(chat)}
                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all duration-200 cursor-pointer
                      ${isActive 
                        ? 'bg-primary-500/10 border border-primary-500/20 text-white shadow-glow-purple-sm' 
                        : chat.unreadCount > 0
                          ? 'bg-primary-500/5 border border-primary-500/15 text-white shadow-glow-purple-sm'
                          : 'border border-transparent hover:bg-white/3 hover:border-white/5 text-white/70 hover:text-white'}`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-0.5 flex-shrink-0">
                      <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center overflow-hidden">
                        {chat.user.avatar ? (
                          <img src={chat.user.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold">{chat.user.username[0]?.toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                    {/* Username & Last Msg */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-semibold text-xs truncate ${chat.unreadCount > 0 && !isActive ? 'text-primary-300' : ''}`}>
                          {chat.user.username}
                        </p>
                        {chat.unreadCount > 0 && !isActive && (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                        )}
                      </div>
                      <p className={`text-[10px] truncate mt-0.5 ${chat.unreadCount > 0 && !isActive ? 'text-white font-medium' : 'text-white/30'}`}>
                        {chat.lastMessage ? chat.lastMessage.content : 'No messages yet'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

        </div>
      </div>

      {/* 2. Main DM Workspace */}
      <div className="flex-1 flex flex-col bg-dark-900">
        {activeChat ? (
          <>
            {/* Active Chat Header */}
            <div className="px-6 py-4 border-b border-white/5 bg-dark-950/40 flex items-center justify-between flex-shrink-0">
              <Link to={`/profile/${activeChat.user._id}`} className="flex items-center gap-3 group" title="View Profile">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-0.5 group-hover:scale-105 transition-transform duration-200">
                  <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center overflow-hidden">
                    {activeChat.user.avatar ? (
                      <img src={activeChat.user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold">{activeChat.user.username[0]?.toUpperCase()}</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="font-display font-bold text-white text-sm leading-tight group-hover:text-primary-300 transition-colors">{activeChat.user.username}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-neon-green font-semibold mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                    Active connection &middot; View Profile &rarr;
                  </span>
                </div>
              </Link>

              <button
                onClick={handleDeleteConversation}
                className="px-3 py-1.5 rounded-xl border border-red-500/10 bg-red-500/5 hover:bg-red-500/15 hover:border-red-500/30 text-red-400 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                title="Clear Chat History"
              >
                <FiTrash2 size={13} />
                <span>Clear Chat</span>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-primary-500 rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-white/20">
                  <FiMessageSquare size={36} className="mb-2 animate-bounce" />
                  <p className="text-sm font-medium">Say hello! 👋</p>
                  <p className="text-xs mt-1 text-white/10">Start the conversation with {activeChat.user.username}.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender.toString() === user?._id.toString();
                  const isEditable = Date.now() - new Date(msg.createdAt).getTime() < 30 * 60 * 1000;

                  return (
                    <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative mb-2`}>
                      <div className={`flex items-center gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        
                        {/* Action buttons (only for own messages) */}
                        {isMe && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-0.5 bg-dark-950/60 border border-white/5 rounded-lg p-0.5 shadow-sm flex-shrink-0">
                            {isEditable && (
                              <button
                                onClick={() => handleStartEdit(msg._id, msg.content)}
                                className="p-1 text-white/40 hover:text-primary-300 rounded hover:bg-white/5 transition-colors cursor-pointer"
                                title="Edit message"
                              >
                                <FiEdit2 size={11} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteMsg(msg._id)}
                              className="p-1 text-white/40 hover:text-red-400 rounded hover:bg-white/5 transition-colors cursor-pointer"
                              title="Delete message"
                            >
                              <FiTrash2 size={11} />
                            </button>
                          </div>
                        )}

                        {/* Message content bubble */}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm break-words leading-relaxed shadow-sm
                          ${isMe
                            ? 'bg-primary-500/20 text-white rounded-tr-sm border border-primary-500/25 shadow-glow-purple-sm'
                            : 'bg-white/5 text-white/80 rounded-tl-sm border border-white/5'
                          }`}>
                          {editingMessageId === msg._id ? (
                            <div className="flex flex-col gap-1.5 min-w-[200px]">
                              <input
                                type="text"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="w-full bg-dark-900/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary-500 transition-all"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit(msg._id);
                                  if (e.key === 'Escape') setEditingMessageId(null);
                                }}
                              />
                              <div className="flex gap-1.5 justify-end">
                                <button onClick={() => setEditingMessageId(null)} className="px-2 py-0.5 rounded hover:bg-white/5 text-[9px] text-white/40">
                                  Cancel
                                </button>
                                <button onClick={() => handleSaveEdit(msg._id)} className="px-2 py-0.5 rounded bg-primary-500/20 text-[9px] text-primary-300 font-semibold">
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              {msg.content}
                              {msg.isEdited && (
                                <span className="text-[9px] text-white/20 italic ml-1.5 font-normal" title="Edited message">(edited)</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="text-[9px] text-white/20 font-mono mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-white/5 bg-dark-950/20 flex-shrink-0">
              <div className="flex gap-2 max-w-4xl mx-auto">
                <input
                  type="text"
                  placeholder={`Message ${activeChat.user.username}...`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  maxLength={1000}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm
                             placeholder-white/20 focus:outline-none focus:border-primary-500/40 focus:bg-white/8
                             transition-all"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="w-11 h-11 rounded-xl bg-primary-500/25 border border-primary-500/25 flex items-center justify-center
                             text-primary-300 hover:bg-primary-500/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <FiSend size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-grid-large">
            <div className="w-16 h-16 rounded-3xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-4 text-primary-400">
              <FiMessageSquare size={32} />
            </div>
            <h3 className="font-display font-bold text-white text-xl mb-1">Your Direct Messages</h3>
            <p className="text-white/40 text-sm max-w-sm leading-relaxed">
              Select an active conversation from the sidebar or find a user on the homepage to start chatting privately!
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default DirectMessages;
