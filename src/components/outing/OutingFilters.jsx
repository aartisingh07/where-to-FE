import { useState, useEffect } from 'react';
import useGeolocation from '../../hooks/useGeolocation';
import { FiMapPin, FiCompass, FiUsers, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const MOODS = [
  { id: 'chill', label: 'Chill 🌳' },
  { id: 'foodie', label: 'Foodie 🍔' },
  { id: 'adventure', label: 'Adventure 🏂' },
  { id: 'romantic', label: 'Romantic 🌅' },
  { id: 'study', label: 'Study 📚' },
];

const OutingFilters = ({ socket, roomId, isHost, submissions = [], onFindPlaces }) => {
  const { location, loading: geoLoading, error: geoError, getLocation } = useGeolocation();
  const [mood, setMood] = useState('chill');
  const [distance, setDistance] = useState(5000);
  const [submitted, setSubmitted] = useState(false);

  // Automatically fetch location on mount
  useEffect(() => {
    getLocation();
  }, []);

  const handleSubPreference = () => {
    if (!location.lat || !location.lng) {
      toast.error('Location coordinates not acquired yet. Please check permissions.');
      return;
    }

    socket?.emit('submit-outing-pref', {
      roomId,
      pref: {
        lat: location.lat,
        lng: location.lng,
        mood,
        distance,
      },
    });

    setSubmitted(true);
    toast.success('Your preferences submitted! 📍');
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-6 animate-slide-up pb-8">
      {/* 1. Selection & Submission Panel */}
      <div className="flex-1 glass-card p-6 border-white/5">
        <h3 className="font-display font-semibold text-white text-base mb-6 flex items-center gap-2">
          <FiMapPin className="text-primary-400" /> Set Your Preference
        </h3>

        <div className="space-y-5">
          {/* Location Status */}
          <div>
            <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">
              Your Coordinates
            </label>
            <div className="flex items-center gap-3 bg-white/3 rounded-xl p-3 border border-white/5">
              {geoLoading ? (
                <div className="flex items-center gap-2 text-xs text-white/45">
                  <div className="w-4 h-4 border border-white/30 border-t-primary-500 rounded-full animate-spin" />
                  <span>Acquiring location...</span>
                </div>
              ) : location.lat ? (
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-neon-green flex items-center gap-1.5 font-medium">
                    <FiCheckCircle /> Location Acquired
                  </span>
                  <span className="text-[10px] text-white/30 font-mono">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
                  <span className="text-xs text-red-400 leading-tight">
                    {geoError || 'Location permissions needed.'}
                  </span>
                  <button
                    onClick={getLocation}
                    className="text-xs font-bold text-primary-400 hover:text-primary-300 underline text-left"
                  >
                    Grant Access
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mood Selector */}
          <div>
            <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">
              Select Mood
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  disabled={submitted}
                  onClick={() => setMood(m.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200
                    ${mood === m.id
                      ? 'bg-primary-500/25 border-primary-500 text-primary-300'
                      : 'bg-white/3 border-white/5 text-white/50 hover:bg-white/8'
                    }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Distance Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-white/40 uppercase tracking-wider">Search Radius</span>
              <span className="text-primary-300">{(distance / 1000).toFixed(1)} km</span>
            </div>
            <input
              type="range"
              min="1000"
              max="20000"
              step="500"
              disabled={submitted}
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>

          {/* Submit preferences */}
          <button
            onClick={handleSubPreference}
            disabled={submitted || geoLoading || !location.lat}
            className="w-full btn-primary py-2.5 rounded-xl text-xs font-bold"
          >
            {submitted ? 'Preferences Logged' : 'Submit Preference'}
          </button>
        </div>
      </div>

      {/* 2. Group Submission Progress */}
      <div className="w-full md:w-80 glass-card p-6 border-white/5 flex flex-col justify-between">
        <div>
          <h3 className="font-display font-semibold text-white text-base mb-6 flex items-center gap-2">
            <FiUsers className="text-primary-400" /> Group Status
          </h3>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {submissions.length === 0 ? (
              <p className="text-white/20 text-xs italic">Waiting for submissions...</p>
            ) : (
              submissions.map((sub) => (
                <div key={sub.userId} className="flex items-center justify-between p-2 rounded-lg bg-white/2 border border-white/3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary-500/10 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                      {(sub.username || 'U')[0]}
                    </div>
                    <span className="text-xs text-white/70 font-medium truncate max-w-[120px]">{sub.username || 'Squad Member'}</span>
                  </div>
                  <span className="text-[10px] bg-neon-green/10 text-neon-green px-2 py-0.5 rounded-full font-bold">
                    Acquired
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Host controls */}
        {isHost && (
          <div className="border-t border-white/5 pt-4 mt-6">
            <button
              onClick={onFindPlaces}
              disabled={submissions.length === 0}
              className="w-full btn-primary py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-neon-green to-emerald-500 hover:from-neon-green hover:to-emerald-600 hover:shadow-glow-green text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Aggregate Midpoint & Search
            </button>
            <p className="text-[10px] text-white/20 text-center mt-2 leading-tight">
              Combines everyone's location to search places fair to all.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutingFilters;
