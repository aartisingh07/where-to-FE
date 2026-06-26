import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { placeService } from '../services/placeService';
import { authService } from '../services/authService';
import { memoryService } from '../services/memoryService';
import { 
  FiUser, FiCalendar, FiMapPin, FiLogOut, FiTrash2, FiNavigation, 
  FiCamera, FiGlobe, FiLock, FiUsers, FiImage, FiPlus, FiArrowLeft
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams();
  
  const isOwnProfile = !userId || userId === user?._id;

  const [profileUser, setProfileUser] = useState(null);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Memories State
  const [memories, setMemories] = useState([]);
  const [loadingMemories, setLoadingMemories] = useState(true);

  // Upload State
  const [newPhoto, setNewPhoto] = useState(null);
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchProfileAndPlaces = useCallback(async () => {
    try {
      setLoadingPlaces(true);
      if (isOwnProfile) {
        setProfileUser(user);
        const places = await placeService.getSavedPlaces();
        setSavedPlaces(places || []);
      } else {
        const publicUser = await authService.getUserProfile(userId);
        setProfileUser(publicUser);
        setSavedPlaces({ length: publicUser.savedPlacesCount || 0 });
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
      toast.error('Failed to load user profile');
    } finally {
      setLoadingPlaces(false);
    }
  }, [userId, isOwnProfile, user]);

  const fetchMemories = useCallback(async () => {
    if (!profileUser?._id) return;
    setLoadingMemories(true);
    try {
      const data = await memoryService.getMemories(profileUser._id);
      setMemories(data || []);
    } catch (err) {
      console.error('Failed to load memories:', err);
      toast.error('Failed to load memories');
    } finally {
      setLoadingMemories(false);
    }
  }, [profileUser?._id]);

  useEffect(() => {
    if (user) {
      fetchProfileAndPlaces();
    }
  }, [user, fetchProfileAndPlaces]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

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

  const handleDeletePlace = async (id) => {
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadMemory = async (e) => {
    e.preventDefault();
    if (!newPhoto) {
      toast.warn('Please select a photo first');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('photo', newPhoto);
    formData.append('caption', caption);
    formData.append('visibility', visibility);

    try {
      const created = await memoryService.uploadMemory(formData);
      setMemories((prev) => [created, ...prev]);
      toast.success('Memory uploaded successfully!');
      setNewPhoto(null);
      setCaption('');
      setVisibility('public');
      setPreviewUrl('');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload memory');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMemory = async (memoryId) => {
    if (!window.confirm('Are you sure you want to delete this memory?')) return;
    try {
      await memoryService.deleteMemory(memoryId);
      setMemories((prev) => prev.filter((m) => m._id !== memoryId));
      toast.success('Memory removed');
    } catch (err) {
      console.error(err);
      toast.error('Could not delete memory');
    }
  };

  if (!user || !profileUser) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const memberSince = new Date(profileUser.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-dark-900 bg-grid pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Back navigation button (Only when viewing other users) */}
        {!isOwnProfile && (
          <div className="mb-6 animate-fade-in">
            <button
              onClick={() => navigate('/messages')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <FiArrowLeft size={14} /> Back to Chats
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SIDEBAR: Profile Card, Stats, Saved Places, Actions */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Profile Card */}
            <div className="glass-card p-6 text-center animate-slide-up">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center overflow-hidden">
                    {profileUser.avatar
                      ? <img src={profileUser.avatar} alt={profileUser.username} className="w-full h-full object-cover" />
                      : <FiUser size={40} className="text-white/40" />}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-neon-green rounded-full border-2 border-dark-800" />
              </div>
              <h1 className="font-display font-bold text-xl text-white mb-1">{profileUser.username}</h1>
              {isOwnProfile && <p className="text-white/40 text-xs truncate">{profileUser.email}</p>}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="glass-card p-4 text-center">
                <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center mx-auto mb-2">
                  <FiCalendar className="text-primary-400" size={16} />
                </div>
                <p className="text-white/40 text-[10px] mb-0.5">Member since</p>
                <p className="text-white font-medium text-xs truncate">{memberSince}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center mx-auto mb-2">
                  <FiMapPin className="text-accent-400" size={16} />
                </div>
                <p className="text-white/40 text-[10px] mb-0.5">Saved places</p>
                <p className="text-white font-medium text-xs">{savedPlaces.length} places</p>
              </div>
            </div>

            {/* Saved Places (Only for own profile) */}
            {isOwnProfile && (
              <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <h2 className="font-display font-semibold text-sm text-white mb-4 flex items-center gap-2">
                  <FiMapPin className="text-accent-400" size={16} />
                  Saved Places
                </h2>

                {loadingPlaces ? (
                  <div className="space-y-2.5">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-12 skeleton rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : savedPlaces.length === 0 ? (
                  <div className="text-center py-6">
                    <FiMapPin className="text-white/20 mx-auto mb-2" size={24} />
                    <p className="text-white/30 text-xs mb-3">No saved places yet</p>
                    <button onClick={() => navigate('/explore')} className="btn-primary text-[10px] !px-3 !py-1.5 cursor-pointer">
                      Explore places
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {savedPlaces.map((place) => (
                      <div key={place._id} className="flex items-center gap-2.5 p-2 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                          <FiMapPin className="text-primary-400" size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-xs truncate">{place.name}</p>
                          <p className="text-white/30 text-[10px]">{place.category}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400 hover:bg-primary-500/20 transition-colors"
                          >
                            <FiNavigation size={12} />
                          </a>
                          <button
                            onClick={() => handleDeletePlace(place._id)}
                            className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions (Logout & Delete Account) (Only for own profile) */}
            {isOwnProfile && (
              <div className="flex flex-col gap-2.5 pt-2 animate-slide-up">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 text-white/40 hover:text-white py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-xs font-semibold w-full cursor-pointer"
                >
                  <FiLogOut size={14} />
                  Log out
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center justify-center gap-2 text-red-400 hover:text-red-300 py-2.5 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:border-red-500/20 transition-all text-xs font-semibold w-full cursor-pointer"
                >
                  <FiTrash2 size={14} />
                  Delete Account
                </button>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Trip Memories Diary */}
          <div className="lg:col-span-8">
            
            {/* Memory Diary Card */}
            <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="font-display font-semibold text-lg text-white mb-6 flex items-center gap-2">
                <FiCamera className="text-primary-400" size={18} />
                Trip Memories Diary
              </h2>

              {/* Photo Uploader Form (Only for own profile) */}
              {isOwnProfile && (
                <form onSubmit={handleUploadMemory} className="p-4 rounded-xl border border-white/5 bg-white/3 mb-8 space-y-4">
                  <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Share a new memory</p>
                  
                  {/* Photo selector area */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <label className="w-full sm:w-48 h-32 rounded-xl border border-dashed border-white/15 hover:border-primary-500/40 bg-white/5 hover:bg-white/8 transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <FiImage size={24} className="text-white/30 group-hover:text-primary-400 transition-colors mb-2" />
                          <span className="text-[10px] text-white/35 font-medium">Select photo</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>

                    <div className="flex-1 w-full space-y-3">
                      <input
                        type="text"
                        placeholder="Add a caption about your trip..."
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder-white/20 focus:outline-none focus:border-primary-500/40 transition-all"
                      />
                      
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <select
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-500/40 transition-all appearance-none cursor-pointer"
                          >
                            <option value="public" className="bg-dark-900 text-white">🌍 Public (Everyone)</option>
                            <option value="connections" className="bg-dark-900 text-white">👥 Connections Only</option>
                            <option value="private" className="bg-dark-900 text-white">🔒 Private (Only Me)</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          disabled={uploading || !newPhoto}
                          className="btn-primary text-xs !px-4 !py-2 flex-shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploading ? 'Uploading...' : 'Upload Memory'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* Memories Grid list */}
              {loadingMemories ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-48 skeleton rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : memories.length === 0 ? (
                <div className="text-center py-12">
                  <FiImage className="text-white/15 mx-auto mb-3" size={36} />
                  <p className="text-white/30 text-sm">No memories shared yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {memories.map((memory) => (
                    <div key={memory._id} className="p-3 rounded-2xl border border-white/5 bg-white/3 group relative flex flex-col justify-between overflow-hidden">
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-dark-950">
                        <img src={memory.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        
                        {/* Visibility badge */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-900/80 backdrop-blur-md border border-white/10 text-[9px] text-white/80 font-bold font-display uppercase tracking-widest">
                          {memory.visibility === 'public' && (
                            <><FiGlobe size={10} className="text-neon-teal" /> Public</>
                          )}
                          {memory.visibility === 'connections' && (
                            <><FiUsers size={10} className="text-primary-400" /> Connections</>
                          )}
                          {memory.visibility === 'private' && (
                            <><FiLock size={10} className="text-neon-yellow" /> Private</>
                          )}
                        </div>

                        {/* Delete button for own profile */}
                        {isOwnProfile && (
                          <button
                            onClick={() => handleDeleteMemory(memory._id)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/85 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                            title="Delete Memory"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        )}
                      </div>

                      <div className="px-1 flex-1 flex flex-col justify-between">
                        <p className="text-white/80 text-xs leading-relaxed font-medium line-clamp-2">
                          {memory.caption || <span className="text-white/20 italic font-normal">No caption</span>}
                        </p>
                        <p className="text-[10px] text-white/25 mt-3 font-mono">
                          {new Date(memory.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

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
              Are you absolutely sure you want to delete your account? This action is **irreversible** and will permanently delete all your user profile data, saved places, chat messages, active outing meetups, memories, and notifications.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
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
