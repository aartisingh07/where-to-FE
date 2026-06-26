import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { memoryService } from '../services/memoryService';
import { roomService } from '../services/roomService';
import { 
  FiUser, FiHeart, FiMessageSquare, FiSend, FiRefreshCw, FiImage, 
  FiMapPin, FiClock, FiPlus, FiArrowRight 
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const Feed = () => {
  const { user } = useAuth();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRooms, setActiveRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Local interaction states
  const [likedPosts, setLikedPosts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [comments, setComments] = useState({});
  const [newCommentText, setNewCommentText] = useState({});

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const data = await memoryService.getFeed();
      setFeed(data || []);
      
      // Initialize mock likes count based on creation time or randomly to look natural
      const initialLikes = {};
      data.forEach(post => {
        // Deterministic mock likes count
        const charSum = post._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        initialLikes[post._id] = (charSum % 45) + 3;
      });
      setLikeCounts(initialLikes);
    } catch (err) {
      console.error('Failed to load feed:', err);
      toast.error('Failed to load community feed');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      const data = await roomService.getMyRooms();
      setActiveRooms(data || []);
    } catch (err) {
      console.error('Failed to load lobbies:', err);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
    fetchRooms();
  }, [fetchFeed, fetchRooms]);

  const handleLikeToggle = (postId) => {
    const isLiked = likedPosts[postId];
    setLikedPosts(prev => ({ ...prev, [postId]: !isLiked }));
    setLikeCounts(prev => ({
      ...prev,
      [postId]: isLiked ? prev[postId] - 1 : prev[postId] + 1
    }));
    
    if (!isLiked) {
      toast.success('Added to favorites!', { autoClose: 1000, hideProgressBar: true });
    }
  };

  const handleAddComment = (postId, e) => {
    e.preventDefault();
    const text = newCommentText[postId]?.trim();
    if (!text) return;

    const newComment = {
      id: Date.now(),
      username: user?.username || 'You',
      text
    };

    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));

    setNewCommentText(prev => ({
      ...prev,
      [postId]: ''
    }));
  };

  return (
    <div className="min-h-screen bg-dark-900 bg-grid pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: Feed and Stories */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top Stories / Active Members Bar */}
            <div className="glass-card p-4 flex items-center gap-4 overflow-x-auto scrollbar-none animate-slide-up">
              <div className="flex flex-col items-center flex-shrink-0 relative group">
                <Link to="/profile" className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-0.5 relative">
                  <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="You" className="w-full h-full object-cover" />
                    ) : (
                      <FiUser size={24} className="text-white/40" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center border border-dark-900">
                    <FiPlus size={10} className="text-white" />
                  </div>
                </Link>
                <span className="text-[10px] text-white/50 mt-1 font-medium truncate w-14 text-center">Your Story</span>
              </div>

              {/* Unique users in the feed (for story rings) */}
              {Array.from(new Map(feed.map(p => [p.user?._id, p.user])).values())
                .filter(u => u && u._id !== user?._id)
                .slice(0, 7)
                .map(u => (
                  <div key={u._id} className="flex flex-col items-center flex-shrink-0">
                    <Link to={`/profile/${u._id}`} className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 p-0.5 active:scale-95 transition-transform duration-200">
                      <div className="w-full h-full rounded-full bg-dark-900 border-2 border-dark-900 overflow-hidden">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" />
                        ) : (
                          <FiUser size={24} className="text-white/40" />
                        )}
                      </div>
                    </Link>
                    <span className="text-[10px] text-white/60 mt-1 font-medium truncate w-14 text-center">{u.username}</span>
                  </div>
                ))}
            </div>

            {/* Feed Section Header */}
            <div className="flex items-center justify-between animate-fade-in">
              <h1 className="font-display font-extrabold text-2xl text-white flex items-center gap-2">
                <span>📸</span> Community Feed
              </h1>
              <button
                onClick={fetchFeed}
                disabled={loading}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                title="Refresh Feed"
              >
                <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Posts Stream */}
            {loading ? (
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 skeleton rounded-full" />
                      <div className="space-y-2 flex-1">
                        <div className="h-3 skeleton rounded w-1/4" />
                        <div className="h-2.5 skeleton rounded w-1/12" />
                      </div>
                    </div>
                    <div className="h-72 skeleton rounded-xl" />
                    <div className="h-4 skeleton rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : feed.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <FiImage className="text-white/15 mx-auto mb-4" size={48} />
                <h3 className="font-display font-bold text-lg text-white mb-2">No Posts in Feed</h3>
                <p className="text-white/40 text-sm max-w-sm mx-auto mb-6">
                  Be the first to share a travel memory or trip photo! Head to your profile to upload.
                </p>
                <Link to="/profile" className="btn-primary text-xs !px-5 !py-2.5 inline-flex items-center gap-1.5">
                  Go to Profile <FiArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {feed.map((post) => {
                  const isLiked = likedPosts[post._id];
                  const postLikes = likeCounts[post._id] || 0;
                  const postComments = comments[post._id] || [];

                  return (
                    <div key={post._id} className="glass-card overflow-hidden animate-slide-up">
                      {/* Post Header */}
                      <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <Link to={post.user?._id ? `/profile/${post.user._id}` : '#'} className="flex items-center gap-3 group">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-0.5 group-hover:scale-105 transition-transform duration-200">
                            <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center overflow-hidden">
                              {post.user?.avatar ? (
                                <img src={post.user.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <FiUser size={16} className="text-white/40" />
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-xs text-white group-hover:text-primary-300 transition-colors leading-tight">
                              {post.user?.username || 'Unknown User'}
                            </p>
                            <span className="text-[9px] text-white/30 font-mono leading-none">
                              {new Date(post.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
                            </span>
                          </div>
                        </Link>
                      </div>

                      {/* Post Body (Image) */}
                      <div className="relative bg-dark-950 border-y border-white/5 aspect-[4/3] sm:aspect-video flex items-center justify-center overflow-hidden group">
                        <img 
                          src={post.imageUrl} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700" 
                        />
                      </div>

                      {/* Post Actions & Details */}
                      <div className="p-4 space-y-3.5">
                        {/* Action Buttons */}
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleLikeToggle(post._id)}
                            className={`p-1.5 rounded-lg transition-all duration-200 hover:bg-white/5 active:scale-90 cursor-pointer
                              ${isLiked ? 'text-red-500' : 'text-white/60 hover:text-white'}`}
                          >
                            <FiHeart size={20} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'animate-heart-pop' : ''} />
                          </button>
                          
                          <button
                            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 active:scale-90 cursor-pointer"
                            onClick={() => {
                              const inputEl = document.getElementById(`comment-input-${post._id}`);
                              inputEl?.focus();
                            }}
                          >
                            <FiMessageSquare size={20} />
                          </button>
                        </div>

                        {/* Likes Count */}
                        <p className="text-xs font-bold text-white px-0.5">
                          {postLikes.toLocaleString()} like{postLikes !== 1 ? 's' : ''}
                        </p>

                        {/* Caption */}
                        <div className="px-0.5 text-xs leading-relaxed">
                          <p className="text-white/80">
                            <Link to={post.user?._id ? `/profile/${post.user._id}` : '#'} className="font-bold text-white hover:text-primary-300 mr-2">
                              {post.user?.username || 'unknown'}
                            </Link>
                            {post.caption || <span className="text-white/20 italic font-normal">No caption</span>}
                          </p>
                        </div>

                        {/* Comments Section */}
                        {postComments.length > 0 && (
                          <div className="pt-2 border-t border-white/5 space-y-2">
                            {postComments.map(c => (
                              <div key={c.id} className="text-xs">
                                <span className="font-bold text-white mr-1.5">{c.username}</span>
                                <span className="text-white/70">{c.text}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comment Input Form */}
                        <form onSubmit={(e) => handleAddComment(post._id, e)} className="flex gap-2 pt-2.5 border-t border-white/5">
                          <input
                            id={`comment-input-${post._id}`}
                            type="text"
                            placeholder="Add a comment..."
                            value={newCommentText[post._id] || ''}
                            onChange={(e) => setNewCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                            className="flex-1 bg-white/3 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-primary-500/30 focus:bg-white/5 transition-all"
                          />
                          <button
                            type="submit"
                            disabled={!newCommentText[post._id]?.trim()}
                            className="text-primary-400 hover:text-primary-300 text-xs font-bold px-2 disabled:opacity-30 disabled:hover:text-primary-400 cursor-pointer"
                          >
                            Post
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Suggestions & Quick Navigation */}
          <div className="lg:col-span-4 hidden lg:block space-y-6 sticky top-24">
            
            {/* User Profile Summary */}
            <div className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FiUser size={20} className="text-white/40" />
                    )}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white truncate leading-tight">{user?.username}</p>
                  <p className="text-white/40 text-[10px] truncate leading-tight mt-0.5">{user?.email}</p>
                </div>
              </div>
              <Link to="/profile" className="text-[10px] text-primary-400 hover:text-primary-300 font-bold uppercase tracking-wider">
                Profile
              </Link>
            </div>

            {/* Quick Actions Card */}
            <div className="glass-card p-5">
              <h3 className="font-display font-semibold text-xs text-white/50 uppercase tracking-widest mb-3.5">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link to="/profile" className="flex items-center gap-3 p-2.5 rounded-xl bg-white/3 border border-white/5 hover:border-primary-500/20 hover:bg-white/5 transition-all text-xs font-semibold text-white">
                  <span className="w-6 h-6 rounded-lg bg-primary-500/10 flex items-center justify-center text-sm">📸</span>
                  <span>Share a Trip Memory</span>
                </Link>
                <Link to="/explore" className="flex items-center gap-3 p-2.5 rounded-xl bg-white/3 border border-white/5 hover:border-neon-teal/20 hover:bg-white/5 transition-all text-xs font-semibold text-white">
                  <span className="w-6 h-6 rounded-lg bg-neon-teal/10 flex items-center justify-center text-sm">📍</span>
                  <span>Find Nearby Spots</span>
                </Link>
              </div>
            </div>

            {/* Active Lobbies Recommendation */}
            <div className="glass-card p-5">
              <h3 className="font-display font-semibold text-xs text-white/50 uppercase tracking-widest mb-3">
                Active Squad Lobbies
              </h3>
              {loadingRooms ? (
                <div className="space-y-2">
                  {[1, 2].map(i => <div key={i} className="h-10 skeleton rounded-xl animate-pulse" />)}
                </div>
              ) : activeRooms.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-white/30 text-xs">No active lobbies.</p>
                  <Link to="/create-room" className="text-[10px] text-primary-400 hover:underline mt-1.5 font-bold inline-block">
                    Create one now +
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                  {activeRooms.map(room => (
                    <div key={room._id} className="flex items-center justify-between p-2 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-all">
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-xs truncate">{room.name}</p>
                        <p className="text-white/40 text-[9px]">Code: <span className="font-mono text-primary-300 font-bold">{room.code}</span></p>
                      </div>
                      <Link to={`/room/${room._id}`} className="p-1 text-primary-400 hover:text-white text-xs font-bold flex items-center gap-0.5">
                        Enter <FiArrowRight size={10} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Feed;
