import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { notificationService } from '../../services/notificationService';
import { toast } from 'react-toastify';
import { HiMenu, HiX } from 'react-icons/hi';
import { FiLogOut, FiUser, FiCompass, FiUsers, FiBell, FiCheck } from 'react-icons/fi';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      setNotifications([]);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();
  }, [isAuthenticated, user?._id]);

  useEffect(() => {
    if (!socket || !user?._id) return;

    const eventName = `notification-${user._id}`;
    const handleNewNotification = (notification) => {
      toast.info(`🔔 ${notification.title}: ${notification.message}`);
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on(eventName, handleNewNotification);

    return () => {
      socket.off(eventName, handleNewNotification);
    };
  }, [socket, user?._id]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationService.clearNotifications();
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/explore', label: 'Explore', icon: <FiCompass size={18} /> },
    { path: '/join-room', label: 'Join Room', icon: <FiUsers size={18} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl">📍</span>
            <span className="font-display font-bold text-xl text-gradient">
              Where To?
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive(link.path)
                    ? 'bg-primary-500/20 text-primary-300'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <FiBell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white leading-none">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 glass-card p-4 border-white/10 shadow-glow-purple/20 max-h-96 overflow-y-auto animate-slide-up z-50 text-left">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                      <span className="font-display font-semibold text-white text-sm">Notifications</span>
                      {notifications.length > 0 && (
                        <button
                          onClick={handleClearAll}
                          className="text-white/40 hover:text-red-400 text-xs transition-colors"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    
                    {notifications.length === 0 ? (
                      <p className="text-white/30 text-xs text-center py-4">No notifications yet</p>
                    ) : (
                      <div className="space-y-2">
                        {notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`p-2.5 rounded-xl border transition-all text-xs flex justify-between items-start gap-2
                              ${n.isRead 
                                ? 'bg-dark-800/20 border-white/5 opacity-60' 
                                : 'bg-primary-500/10 border-primary-500/20 shadow-glow-purple-sm'}`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-white truncate">{n.title}</p>
                              <p className="text-white/60 mt-0.5 leading-relaxed">{n.message}</p>
                              <span className="text-[10px] text-white/30 mt-1 block font-mono">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {!n.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(n._id)}
                                className="text-primary-400 hover:text-neon-green p-1 rounded hover:bg-white/5 transition-colors flex-shrink-0"
                                title="Mark as read"
                              >
                                <FiCheck size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/profile"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200
                      ${isActive('/profile')
                        ? 'bg-primary-500/20 text-primary-300'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="w-6 h-6 rounded-full" />
                    ) : (
                      <FiUser size={18} />
                    )}
                    <span className="font-medium">{user?.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/40 
                             hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                  >
                    <FiLogOut size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="btn-ghost text-sm">
                    Log in
                  </Link>
                  <Link to="/register" className="btn-primary text-sm !px-4 !py-2">
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-800/95 backdrop-blur-xl border-t border-white/5 animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive(link.path)
                    ? 'bg-primary-500/20 text-primary-300'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            <div className="pt-3 mt-3 border-t border-white/5">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="w-6 h-6 rounded-full" />
                    ) : (
                      <FiUser size={18} />
                    )}
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <FiLogOut size={18} />
                    <span>Log out</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn-secondary text-center text-sm"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn-primary text-center text-sm"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
