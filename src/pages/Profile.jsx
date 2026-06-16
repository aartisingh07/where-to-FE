import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiCalendar, FiMapPin, FiLogOut } from 'react-icons/fi';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-dark-900 bg-grid pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="glass-card p-8 text-center mb-8 animate-slide-up">
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-0.5">
              <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <FiUser size={40} className="text-white/40" />
                )}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-neon-green rounded-full border-2 border-dark-800" />
          </div>

          <h1 className="font-display font-bold text-2xl text-white mb-1">
            {user.username}
          </h1>
          <p className="text-white/40 text-sm">{user.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="glass-card p-5 text-center">
            <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center mx-auto mb-3">
              <FiCalendar className="text-primary-400" size={20} />
            </div>
            <p className="text-white/40 text-xs mb-1">Member since</p>
            <p className="text-white font-medium text-sm">{memberSince}</p>
          </div>
          <div className="glass-card p-5 text-center">
            <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center mx-auto mb-3">
              <FiMapPin className="text-accent-400" size={20} />
            </div>
            <p className="text-white/40 text-xs mb-1">Saved places</p>
            <p className="text-white font-medium text-sm">0 places</p>
          </div>
        </div>

        {/* Saved Places — placeholder for Phase 2 */}
        <div className="glass-card p-8 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <FiMapPin className="text-white/20 mx-auto mb-4" size={40} />
          <h3 className="font-display font-semibold text-lg text-white mb-2">
            No saved places yet
          </h3>
          <p className="text-white/30 text-sm mb-6">
            Explore nearby spots and save your favourites — they'll show up here.
          </p>
          <button
            onClick={() => navigate('/explore')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <FiMapPin size={16} />
            Start exploring
          </button>
        </div>

        {/* Logout */}
        <div className="mt-8 text-center">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-white/30 hover:text-red-400 
                       px-4 py-2 rounded-lg hover:bg-red-500/10 transition-all duration-200 text-sm"
          >
            <FiLogOut size={16} />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
