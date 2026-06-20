import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { placeService } from '../services/placeService';
import { authService } from '../services/authService';
import { FiUser, FiCalendar, FiMapPin, FiLogOut, FiTrash2, FiNavigation } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      await authService.deleteAccount();
      toast.success('Account successfully deleted');
      logout();
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };


  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const places = await placeService.getSavedPlaces();
        setSavedPlaces(places);
      } catch (err) {
        console.error('Failed to load saved places');
      } finally {
        setLoadingPlaces(false);
      }
    };
    if (user) fetchPlaces();
  }, [user]);

  const handleDelete = async (id) => {
    try {
      await placeService.deleteSavedPlace(id);
      setSavedPlaces((prev) => prev.filter((p) => p._id !== id));
      toast.success('Place removed');
    } catch {
      toast.error('Could not remove place');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-dark-900 bg-grid pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Profile Card */}
        <div className="glass-card p-8 text-center mb-6 animate-slide-up">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-0.5">
              <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center overflow-hidden">
                {user.avatar
                  ? <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                  : <FiUser size={40} className="text-white/40" />}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-neon-green rounded-full border-2 border-dark-800" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white mb-1">{user.username}</h1>
          <p className="text-white/40 text-sm">{user.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
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
            <p className="text-white font-medium text-sm">{savedPlaces.length} places</p>
          </div>
        </div>

        {/* Saved Places */}
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
            <FiMapPin className="text-accent-400" size={18} />
            Saved Places
          </h2>

          {loadingPlaces ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 skeleton rounded-xl" />
              ))}
            </div>
          ) : savedPlaces.length === 0 ? (
            <div className="text-center py-8">
              <FiMapPin className="text-white/20 mx-auto mb-3" size={32} />
              <p className="text-white/30 text-sm mb-4">No saved places yet</p>
              <button onClick={() => navigate('/explore')} className="btn-primary text-sm !px-4 !py-2">
                Explore places
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedPlaces.map((place) => (
                <div key={place._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <FiMapPin className="text-primary-400" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{place.name}</p>
                    <p className="text-white/30 text-xs">{place.category}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400 hover:bg-primary-500/20 transition-colors"
                    >
                      <FiNavigation size={14} />
                    </a>
                    <button
                      onClick={() => handleDelete(place._id)}
                      className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions (Logout & Delete Account) */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 text-white/40 hover:text-white px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium w-full sm:w-auto"
          >
            <FiLogOut size={16} />
            Log out
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center justify-center gap-2 text-red-400 hover:text-red-300 px-5 py-2.5 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:border-red-500/20 transition-all text-sm font-medium w-full sm:w-auto"
          >
            <FiTrash2 size={16} />
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm animate-fade-in animate-duration-200">
          <div className="glass-card border-red-500/20 shadow-glow-red/5 p-6 max-w-md w-full animate-scale-up animate-duration-200">
            <h3 className="font-display font-bold text-white text-lg mb-2 flex items-center gap-2">
              <span className="text-red-500">⚠️</span> Permanent Account Deletion
            </h3>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              Are you absolutely sure you want to delete your account? This action is **irreversible** and will permanently delete all your user profile data, saved places, chat messages, active outing meetups, and notifications.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
