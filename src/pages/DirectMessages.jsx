import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatService } from '../services/chatService';
import { toast } from 'react-toastify';
import { FiSend, FiUser, FiMessageSquare, FiClock, FiPlusCircle, FiCheck, FiX } from 'react-icons/fi';

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

  // Fetch lists on mount
  useEffect(() => {
    fetchChatsAndRequests();
  }, [fetchChatsAndRequests]);

  const handleMarkAsRead = useCallback(async (senderId) => {
    try {
      await chatService.markAsRead(senderId);
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

    return () => {
      socket.off(messageEvent, handleNewMessage);
      socket.off(relationshipEvent, handleRelationshipUpdate);
    };
  }, [socket, user?._id, activeChat, fetchChatsAndRequests, handleMarkAsRead]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
          
          {/* Incoming Requests Section */}
          {pendingRequests.length > 0 && (
            <div className="space-y-2">
              <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold px-2">
                Chat Requests ({pendingRequests.length})
              </p>
              <div className="space-y-1">
                {pendingRequests.map((req) => (
                  <div key={req._id} className="glass-card p-3 flex items-center justify-between gap-2 border-primary-500/20 bg-primary-500/5">
                    <div className="flex items-center gap-2 min-w-0">
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
                    </div>
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
                      <p className="font-semibold text-xs truncate">{chat.user.username}</p>
                      <p className="text-[10px] text-white/30 truncate mt-0.5">
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
            <div className="px-6 py-4 border-b border-white/5 bg-dark-950/40 flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-0.5">
                <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center overflow-hidden">
                  {activeChat.user.avatar ? (
                    <img src={activeChat.user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold">{activeChat.user.username[0]?.toUpperCase()}</span>
                  )}
                </div>
              </div>
              <div>
                <p className="font-display font-bold text-white text-sm leading-tight">{activeChat.user.username}</p>
                <span className="inline-flex items-center gap-1 text-[10px] text-neon-green font-semibold mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                  Active connection
                </span>
              </div>
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
                  return (
                    <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm break-words leading-relaxed shadow-sm
                        ${isMe
                          ? 'bg-primary-500/20 text-white rounded-tr-sm border border-primary-500/25 shadow-glow-purple-sm'
                          : 'bg-white/5 text-white/80 rounded-tl-sm border border-white/5'
                        }`}>
                        {msg.content}
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
