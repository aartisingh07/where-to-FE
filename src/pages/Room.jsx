import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiSend, FiLogOut, FiHash, FiUsers, FiMessageCircle, FiExternalLink, FiClock, FiTrash2, FiEdit2, FiUserPlus, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { roomService } from '../services/roomService';
import { outingPlanService } from '../services/outingPlanService';
import { chatService } from '../services/chatService';
import GameList from '../components/games/GameList';
import GameVoting from '../components/games/GameVoting';
import WatchLounge from '../components/movies/WatchLounge';
import StudyLounge from '../components/study/StudyLounge';
import OutingLounge from '../components/outing/OutingLounge';
import ChatLounge from '../components/chat/ChatLounge';

// ─── Activity Selector ──────────────────────────────────────────
const activities = [
  { id: 'game',   emoji: '🎮', label: 'Play a Game',       desc: 'Pick and vote on browser games' },
  { id: 'watch',  emoji: '🎬', label: 'Watch Something',   desc: 'Find movies or shows to watch' },
  { id: 'outing', emoji: '📍', label: 'Plan an Outing',    desc: 'Find a spot everyone can go to' },
  { id: 'study',  emoji: '📚', label: 'Study Together',    desc: 'Shared Pomodoro + to-do lists' },
  { id: 'chat',   emoji: '💬', label: 'Just Chat',         desc: 'Hang out and talk' },
];

const ActivitySelector = ({ currentActivity, onSelect }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-6">
    <p className="text-white/30 text-xs uppercase tracking-widest mb-2 font-semibold">
      Propose an activity to the group
    </p>
    <h2 className="font-display font-bold text-2xl text-white mb-8 text-center">Choose an activity</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-2xl">
      {activities.map((act) => (
        <button
          key={act.id}
          onClick={() => onSelect(act.id)}
          className={`glass-card p-5 text-left transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:border-primary-500/30 hover:shadow-glow-purple
            ${currentActivity === act.id ? 'border-primary-500/40 shadow-glow-purple' : ''}`}
        >
          <div className="text-3xl mb-3">{act.emoji}</div>
          <p className="font-display font-semibold text-white text-sm mb-1">{act.label}</p>
          <p className="text-white/30 text-xs leading-relaxed">{act.desc}</p>
        </button>
      ))}
    </div>
  </div>
);

// ─── Activity Panels (Phase 4–6 placeholders) ──────────────────
const ComingSoon = ({ activity }) => {
  const act = activities.find((a) => a.id === activity);
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4">{act?.emoji}</div>
      <h3 className="font-display font-bold text-xl text-white mb-2">{act?.label}</h3>
      <p className="text-white/40 text-sm mb-4">This feature is coming in the next phase!</p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm">
        🚧 Phase 4+ feature
      </div>
    </div>
  );
};

// ─── Main Room Page ────────────────────────────────────────────
const Room = () => {
  const { roomId: id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [activity, setActivity] = useState('none');
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [membersOpen, setMembersOpen] = useState(false);

  // Voting States
  const [activeVote, setActiveVote] = useState(null);
  const [myVote, setMyVote] = useState(null);
  const [voteTallies, setVoteTallies] = useState({ yes: 0, no: 0, maybe: 0 });
  const [voteResult, setVoteResult] = useState(null);

  // Outing Plan State
  const [scheduledPlan, setScheduledPlan] = useState(null);

  // Message Edit State
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Chat Relationships State
  const [relationships, setRelationships] = useState({});

  // Load chat relationships
  useEffect(() => {
    const fetchRelationships = async () => {
      try {
        const data = await chatService.getRelationships();
        setRelationships(data);
      } catch (err) {
        console.error('Failed to fetch relationships:', err);
      }
    };
    if (user) {
      fetchRelationships();
    }
  }, [user]);

  const messagesEndRef = useRef(null);

  const isHost = room?.host?._id === user?._id || room?.host === user?._id;

  const fetchRoomPlan = useCallback(async () => {
    if (!id) return;
    try {
      const plan = await outingPlanService.getPlanForRoom(id);
      setScheduledPlan(plan);
    } catch (err) {
      console.error('Failed to fetch room plan:', err);
    }
  }, [id]);

  const handlePlanScheduled = useCallback(async () => {
    await fetchRoomPlan();
    socket?.emit('plan-scheduled', { roomId: id });
  }, [fetchRoomPlan, socket, id]);

  useEffect(() => {
    fetchRoomPlan();
  }, [id]);

  const getCountdownString = (dateTimeString) => {
    const diff = new Date(dateTimeString) - new Date();
    if (diff <= 0) return 'Happening now!';
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  const handleDeleteRoom = async () => {
    if (!window.confirm("Are you sure you want to delete this room? This will kick everyone out and deactivate the room.")) return;
    try {
      await roomService.deleteRoom(id);
      toast.success("Room deleted successfully");
      navigate('/');
    } catch (err) {
      toast.error("Failed to delete room");
    }
  };

  // Load room data
  useEffect(() => {
    const load = async () => {
      try {
        const [roomData, msgs] = await Promise.all([
          roomService.getRoom(id),
          roomService.getMessages(id),
        ]);
        setRoom(roomData);
        setMessages(msgs);
        setActivity(roomData.activity);
        setLoading(false);
      } catch {
        toast.error('Room not found or expired');
        navigate('/');
      }
    };
    load();
  }, [id]);

  // Socket events
  useEffect(() => {
    if (!socket || !room) return;

    socket.emit('join-room', { roomId: id });

    socket.on('new-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('message-updated', ({ messageId, content, isEdited }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, content, isEdited } : m
        )
      );
    });

    socket.on('message-deleted', ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    });

    socket.on('room-users-update', (users) => {
      setOnlineUsers(users);
    });

    socket.on('activity-changed', ({ activity: newActivity }) => {
      setActivity(newActivity);
      setActiveVote(null);
      setVoteResult(null);
    });

    socket.on('vote-started', ({ item, endTime, tallies }) => {
      setActiveVote({ item, endTime });
      setMyVote(null);
      setVoteTallies(tallies || { yes: 0, no: 0, maybe: 0 });
      setVoteResult(null);
      toast.info(`🗳️ Vote started: ${item.name || item.title}`);
    });

    socket.on('vote-update', ({ votes, tallies }) => {
      setVoteTallies(tallies);
      if (votes && votes[user?._id]) {
        setMyVote(votes[user?._id]);
      }
    });

    socket.on('vote-result', async (result) => {
      setActiveVote(null);
      setVoteResult(result);
      if (result.result === 'approved') {
        toast.success(`🎉 Passed: ${result.item.name || result.item.title}`);
        if (result.item?.type === 'activity' && isHost) {
          try {
            await roomService.setActivity(id, result.item.id);
            socket.emit('set-activity', { roomId: id, activity: result.item.id });
          } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to set proposed activity';
            toast.error(`Failed to set proposed activity: ${errorMsg}`);
            console.error('API Error in vote-result transition:', err);
          }
        }
      } else {
        toast.error(`❌ Rejected: ${result.item.name || result.item.title}`);
      }
    });

    socket.on('outing-plan-scheduled', () => {
      fetchRoomPlan();
    });

    socket.on('outing-plan-cancelled', () => {
      setScheduledPlan(null);
      toast.info("The upcoming outing plan has been cancelled by the host.");
    });

    socket.on(`chat-relationship-updated-${user?._id}`, ({ otherUserId, status, requestId }) => {
      setRelationships((prev) => ({
        ...prev,
        [otherUserId]: {
          status,
          requestId: requestId || prev[otherUserId]?.requestId
        }
      }));
    });

    return () => {
      socket.emit('leave-room', { roomId: id });
      socket.off('new-message');
      socket.off('message-updated');
      socket.off('message-deleted');
      socket.off('room-users-update');
      socket.off('activity-changed');
      socket.off('vote-started');
      socket.off('vote-update');
      socket.off('vote-result');
      socket.off('outing-plan-scheduled');
      socket.off('outing-plan-cancelled');
      socket.off(`chat-relationship-updated-${user?._id}`);
    };
  }, [socket, room, id, user?._id, fetchRoomPlan]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendChatRequest = async (receiverId, receiverName) => {
    try {
      const response = await chatService.sendRequest(receiverId);
      setRelationships((prev) => ({
        ...prev,
        [receiverId.toString()]: {
          status: 'pending_sent',
          requestId: response._id
        }
      }));
      toast.success(`Chat request sent to ${receiverName}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send chat request');
    }
  };

  const handleAcceptChatRequest = async (requestId, senderId, senderName) => {
    try {
      await chatService.handleRequest(requestId, 'accept');
      setRelationships((prev) => ({
        ...prev,
        [senderId.toString()]: {
          status: 'accepted',
          requestId
        }
      }));
      toast.success(`Accepted chat request from ${senderName}!`);
    } catch (err) {
      toast.error('Failed to accept chat request');
    }
  };

  const renderChatRequestButton = (senderId, senderName) => {
    if (!senderId || senderId.toString() === user?._id?.toString()) return null;

    const rel = relationships[senderId.toString()];
    const status = rel?.status || 'none';
    const requestId = rel?.requestId;

    if (status === 'accepted') {
      return null;
    }

    if (status === 'pending_sent') {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] text-white/40 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full font-sans">
          <FiClock size={9} className="animate-pulse" />
          Requested
        </span>
      );
    }

    if (status === 'pending_received') {
      return (
        <button
          onClick={() => handleAcceptChatRequest(requestId, senderId, senderName)}
          className="inline-flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all font-sans cursor-pointer font-semibold"
        >
          <FiCheck size={9} />
          Accept Request
        </button>
      );
    }

    return (
      <button
        onClick={() => handleSendChatRequest(senderId, senderName)}
        className="inline-flex items-center gap-1 text-[9px] text-primary-300 bg-primary-500/10 border border-primary-500/20 px-1.5 py-0.5 rounded-full hover:bg-primary-500/20 hover:border-primary-500/30 hover:shadow-glow-purple-sm transition-all font-sans cursor-pointer font-semibold"
      >
        <FiUserPlus size={9} />
        Connect
      </button>
    );
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !socket) return;
    socket.emit('send-message', { roomId: id, content: messageInput.trim() });
    setMessageInput('');
  };

  const handleStartEdit = (msgId, content) => {
    setEditingMessageId(msgId);
    setEditingText(content);
  };

  const handleSaveEdit = (msgId) => {
    if (!editingText.trim() || !socket) return;
    socket.emit('edit-message', { roomId: id, messageId: msgId, content: editingText.trim() });
    setEditingMessageId(null);
  };

  const handleDeleteMsg = (msgId) => {
    if (!window.confirm('Are you sure you want to delete this message?') || !socket) return;
    socket.emit('delete-message', { roomId: id, messageId: msgId });
  };

  const handlePropose = (item) => {
    if (!socket) return;
    socket.emit('start-vote', { roomId: id, item });
  };

  const handleProposeActivity = (activityId) => {
    if (!socket) return;
    const act = activities.find((a) => a.id === activityId);
    if (!act) return;
    socket.emit('start-vote', {
      roomId: id,
      item: {
        type: 'activity',
        id: activityId,
        name: act.label,
        emoji: act.emoji,
        desc: act.desc,
      },
    });
  };

  const handleVote = (vote) => {
    if (!socket) return;
    socket.emit('cast-vote', { roomId: id, vote });
    setMyVote(vote);
  };

  const handleEndVote = () => {
    if (!socket) return;
    socket.emit('end-vote', { roomId: id });
  };

  const handleClearVoteResult = () => {
    setVoteResult(null);
  };

  const handleSetActivity = async (newActivity) => {
    try {
      await roomService.setActivity(id, newActivity);
      socket?.emit('set-activity', { roomId: id, activity: newActivity });
      setActivity(newActivity);
    } catch {
      toast.error('Could not change activity');
    }
  };

  const handleCancelPlan = async () => {
    if (!window.confirm("Are you sure you want to cancel this outing plan? This will notify all room participants.")) return;
    try {
      await outingPlanService.deletePlan(scheduledPlan._id);
      toast.success("Outing plan cancelled successfully");
      setScheduledPlan(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to cancel outing plan";
      toast.error(`Failed to cancel outing plan: ${errorMsg}`);
    }
  };

  const handleLeave = async () => {
    try {
      socket?.emit('leave-room', { roomId: id });
      await roomService.leaveRoom(id);
      navigate('/');
      toast.info('Left the room');
    } catch {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40">Loading room...</p>
        </div>
      </div>
    );
  }

  const allMembers = room?.members || [];

  return (
    <div className="h-screen bg-dark-900 flex flex-col overflow-hidden pt-16">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-dark-900/80 backdrop-blur-lg flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
            <FiHash className="text-primary-400" size={16} />
          </div>
          <div>
            <p className="font-display font-semibold text-white text-sm">{room?.name}</p>
            <p className="text-white/30 text-xs">{room?.code} · {onlineUsers.length} online</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile toggles */}
          <button
            onClick={() => setMembersOpen(!membersOpen)}
            className={`lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors
              ${membersOpen ? 'bg-primary-500/20 text-primary-300' : 'bg-white/5 text-white/40 hover:text-white'}`}
          >
            <FiUsers size={16} />
          </button>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors
              ${chatOpen ? 'bg-primary-500/20 text-primary-300' : 'bg-white/5 text-white/40 hover:text-white'}`}
          >
            <FiMessageCircle size={16} />
          </button>

          {/* Activity reset */}
          {isHost && activity !== 'none' && (
            <button
              onClick={() => handleSetActivity('none')}
              className="text-white/30 hover:text-white/60 text-xs px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
            >
              ← Change activity
            </button>
          )}

          {isHost && (
            <button
              onClick={handleDeleteRoom}
              className="flex items-center gap-1.5 text-red-500 hover:text-red-400 text-sm px-3 py-1.5 rounded-lg hover:bg-red-500/10 border border-red-500/20 transition-all"
            >
              <span className="hidden sm:inline">Delete Room</span>
            </button>
          )}

          <button
            onClick={handleLeave}
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
          >
            <FiLogOut size={15} />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* Members sidebar */}
        <div className={`${membersOpen || 'hidden'} lg:flex flex-col w-52 border-r border-white/5 bg-dark-900/50 flex-shrink-0`}>
          <div className="p-4 border-b border-white/5">
            <p className="text-white/30 text-xs uppercase tracking-widest font-semibold">
              Members · {allMembers.length}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {allMembers.map((member) => {
              const memberId = member._id || member;
              const memberUsername = member.username || memberId;
              const isOnline = onlineUsers.some((u) => u.userId === memberId);
              const isRoomHost = memberId === (room?.host?._id || room?.host);
              return (
                <Link
                  key={memberId}
                  to={`/profile/${memberId}`}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/3 transition-colors cursor-pointer"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white">
                      {memberUsername[0]?.toUpperCase()}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-dark-900 ${isOnline ? 'bg-neon-green' : 'bg-white/20'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{memberUsername}</p>
                    {isRoomHost && <p className="text-primary-400 text-[10px]">Host</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {scheduledPlan && (
            <div className="bg-neon-green/10 border-b border-neon-green/20 px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-slide-up">
              <div className="flex items-center gap-3">
                <span className="text-xl">📅</span>
                <div className="text-left">
                  <p className="text-xs text-neon-green font-bold uppercase tracking-wider">Upcoming Outing Scheduled!</p>
                  <h4 className="text-sm font-bold text-white mt-0.5">
                    {scheduledPlan.placeName} &middot; <span className="font-mono text-xs text-white/70">{new Date(scheduledPlan.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </h4>
                  {scheduledPlan.address && (
                    <p className="text-[11px] text-white/40 truncate max-w-lg mt-0.5">📍 {scheduledPlan.address}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs font-mono text-white/50 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                  <FiClock size={11} className="text-neon-green animate-pulse" />
                  {getCountdownString(scheduledPlan.dateTime)}
                </span>
                {scheduledPlan.mapsLink && (
                  <a
                    href={scheduledPlan.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-neon-green hover:underline flex items-center gap-1 font-semibold"
                  >
                    Directions
                    <FiExternalLink size={12} />
                  </a>
                )}
                {(scheduledPlan.creator === user?._id || scheduledPlan.creator?._id === user?._id) && (
                  <button
                    onClick={handleCancelPlan}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors font-semibold flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    Cancel Outing
                  </button>
                )}
              </div>
            </div>
          )}

          {activity === 'none' && (
            (activeVote || voteResult) ? (
              <GameVoting
                activeVote={activeVote}
                tallies={voteTallies}
                userVote={myVote}
                onVote={handleVote}
                isHost={isHost}
                onEnd={handleEndVote}
                voteResult={voteResult}
                onClear={handleClearVoteResult}
                onPlanScheduled={handlePlanScheduled}
              />
            ) : (
              <ActivitySelector currentActivity={activity} onSelect={handleProposeActivity} />
            )
          )}
          {activity === 'game' && (
            (activeVote || voteResult) ? (
              <GameVoting
                activeVote={activeVote}
                tallies={voteTallies}
                userVote={myVote}
                onVote={handleVote}
                isHost={isHost}
                onEnd={handleEndVote}
                voteResult={voteResult}
                onClear={handleClearVoteResult}
                onPlanScheduled={handlePlanScheduled}
              />
            ) : (
              <GameList onPropose={handlePropose} />
            )
          )}
          {activity === 'watch' && (
            (activeVote || voteResult) ? (
              <GameVoting
                activeVote={activeVote}
                tallies={voteTallies}
                userVote={myVote}
                onVote={handleVote}
                isHost={isHost}
                onEnd={handleEndVote}
                voteResult={voteResult}
                onClear={handleClearVoteResult}
                onPlanScheduled={handlePlanScheduled}
              />
            ) : (
              <WatchLounge onPropose={handlePropose} />
            )
          )}
          {activity === 'study' && (
            <StudyLounge socket={socket} roomId={id} isHost={isHost} />
          )}
          {activity === 'chat' && (
            <ChatLounge
              socket={socket}
              roomId={id}
              isHost={isHost}
              onlineUsers={onlineUsers}
            />
          )}
          {activity === 'outing' && (
            (activeVote || voteResult) ? (
              <GameVoting
                activeVote={activeVote}
                tallies={voteTallies}
                userVote={myVote}
                onVote={handleVote}
                isHost={isHost}
                onEnd={handleEndVote}
                voteResult={voteResult}
                onClear={handleClearVoteResult}
                roomId={id}
                onPlanScheduled={handlePlanScheduled}
              />
            ) : (
              <OutingLounge
                socket={socket}
                roomId={id}
                isHost={isHost}
                onPropose={handlePropose}
              />
            )
          )}
          {activity !== 'none' && activity !== 'game' && activity !== 'watch' && activity !== 'study' && activity !== 'outing' && activity !== 'chat' && (
            <ComingSoon activity={activity} />
          )}
        </div>

        {/* Chat panel */}
        <div className={`${chatOpen ? 'flex' : 'hidden'} lg:flex flex-col w-72 border-l border-white/5 bg-dark-900/50 flex-shrink-0`}>
          {/* Chat header */}
          <div className="p-4 border-b border-white/5 flex-shrink-0">
            <p className="text-white/30 text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <FiMessageCircle size={12} /> Chat
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
              <p className="text-white/20 text-xs text-center py-6">No messages yet. Say hi! 👋</p>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.sender?.toString() === user?._id?.toString();
              const isSystem = msg.type === 'system';

              if (isSystem) {
                return (
                  <p key={i} className="text-white/25 text-xs text-center py-1 italic">
                    {msg.content}
                  </p>
                );
              }

              const isEditable = Date.now() - new Date(msg.createdAt).getTime() < 30 * 60 * 1000;

              return (
                <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative mb-1.5`}>
                  {!isMe && (
                    <div className="flex items-center gap-2 mb-1 px-1 flex-wrap">
                      <Link to={`/profile/${msg.sender}`} className="text-white/40 hover:text-primary-300 text-[10px] font-medium transition-colors cursor-pointer">
                        {msg.senderName}
                      </Link>
                      {renderChatRequestButton(msg.sender, msg.senderName)}
                    </div>
                  )}

                  <div className={`flex items-center gap-1.5 max-w-[90%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Action buttons (only for own messages) */}
                    {isMe && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-0.5 bg-dark-950/60 border border-white/5 rounded-lg p-0.5 shadow-sm flex-shrink-0">
                        {isEditable && (
                          <button
                            onClick={() => handleStartEdit(msg._id, msg.content)}
                            className="p-1 text-white/40 hover:text-primary-300 rounded hover:bg-white/5 transition-colors cursor-pointer"
                            title="Edit message"
                          >
                            <FiEdit2 size={10} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMsg(msg._id)}
                          className="p-1 text-white/40 hover:text-red-400 rounded hover:bg-white/5 transition-colors cursor-pointer"
                          title="Delete message"
                        >
                          <FiTrash2 size={10} />
                        </button>
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className={`px-3 py-2 rounded-2xl text-xs sm:text-sm break-words
                      ${isMe
                        ? 'bg-primary-500/20 text-white rounded-tr-sm border border-primary-500/20 shadow-glow-purple-sm'
                        : 'bg-white/5 text-white/80 rounded-tl-sm border border-white/5'
                      }`}>
                      {editingMessageId === msg._id ? (
                        <div className="flex flex-col gap-1 min-w-[160px]">
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full bg-dark-900/60 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-primary-500 transition-all"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(msg._id);
                              if (e.key === 'Escape') setEditingMessageId(null);
                            }}
                          />
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => setEditingMessageId(null)} className="px-1.5 py-0.5 rounded hover:bg-white/5 text-[9px] text-white/40">
                              Cancel
                            </button>
                            <button onClick={() => handleSaveEdit(msg._id)} className="px-1.5 py-0.5 rounded bg-primary-500/20 text-[9px] text-primary-300 font-semibold">
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {msg.content}
                          {msg.isEdited && (
                            <span className="text-[9px] text-white/20 italic ml-1.5" title="Edited message">(edited)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-white/20 text-[10px] mt-0.5 px-1 font-mono">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/5 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                maxLength={500}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm
                           placeholder-white/20 focus:outline-none focus:border-primary-500/40 focus:bg-white/8
                           transition-all"
              />
              <button
                onClick={sendMessage}
                disabled={!messageInput.trim()}
                className="w-9 h-9 rounded-xl bg-primary-500/20 border border-primary-500/20 flex items-center justify-center
                           text-primary-400 hover:bg-primary-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <FiSend size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
