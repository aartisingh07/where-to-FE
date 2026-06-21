import { useState, useEffect } from 'react';
import { FiMapPin, FiNavigation, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useGeolocation from '../hooks/useGeolocation';
import { placeService } from '../services/placeService';
import PlaceCard from '../components/places/PlaceCard';

// ─── Config Data ────────────────────────────────────────────────
const moods = [
  { id: 'chill',     emoji: '😌', label: 'Chill',     desc: 'Parks, cafes, lakesides' },
  { id: 'foodie',    emoji: '🍕', label: 'Foodie',    desc: 'Restaurants, cafes, bakeries' },
  { id: 'adventure', emoji: '🧗', label: 'Adventure', desc: 'Peaks, beaches, attractions' },
  { id: 'romantic',  emoji: '🌅', label: 'Romantic',  desc: 'Viewpoints, beaches, restaurants' },
  { id: 'study',     emoji: '📚', label: 'Study',     desc: 'Cafes, libraries, quiet spots' },
];

const distances = [
  { id: 2000,  label: 'Nearby',    desc: 'Within 2 km',   emoji: '🚶' },
  { id: 5000,  label: 'Mid-range', desc: 'Within 5 km',   emoji: '🛵' },
  { id: 10000, label: 'Anywhere',  desc: 'Within 10 km',  emoji: '🚗' },
];

// ─── Step Components ─────────────────────────────────────────────
const StepIndicator = ({ step, currentStep }) => (
  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300
    ${step < currentStep ? 'bg-primary-500 text-white' :
      step === currentStep ? 'bg-primary-500/20 border-2 border-primary-500 text-primary-300' :
      'bg-white/5 text-white/30'}`}
  >
    {step < currentStep ? '✓' : step}
  </div>
);

// ─── Skeleton Loader ─────────────────────────────────────────────
const PlaceSkeleton = () => (
  <div className="glass-card overflow-hidden">
    <div className="h-2 bg-white/5" />
    <div className="p-5 space-y-3">
      <div className="flex gap-3">
        <div className="w-8 h-8 skeleton rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 skeleton rounded w-3/4" />
          <div className="h-3 skeleton rounded w-1/4" />
        </div>
      </div>
      <div className="h-3 skeleton rounded w-1/2" />
      <div className="h-10 skeleton rounded-xl" />
    </div>
  </div>
);

// ─── Main Explore Page ───────────────────────────────────────────
const Explore = () => {
  const [step, setStep] = useState(1);        // 1=mood 1.5=customizer 2=distance 3=results
  const [mood, setMood] = useState(null);
  const [distance, setDistance] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationQuery, setLocationQuery] = useState('');
  const [resolvedLocationText, setResolvedLocationText] = useState('');
  const [subFilters, setSubFilters] = useState({
    diet: 'any',
    foodType: 'any',
    budget: 'any',
    adventureType: 'any'
  });

  const { location, loading: geoLoading, error: geoError, getLocation } = useGeolocation();

  // ── Step 1: Mood selected ──
  const handleMoodSelect = (moodId) => {
    setMood(moodId);
    if (moodId === 'foodie' || moodId === 'adventure') {
      setStep(1.5);
    } else {
      setStep(2);
    }
  };

  // ── Step 2: Distance selected → get location → fetch ──
  const handleDistanceSelect = async (dist) => {
    setDistance(dist);
    setStep(3);
    setLoading(true);
    setError(null);

    // Get location first
    if (!location.lat) {
      getLocation();
    }
  };

  // Automatically fetch places when Step 3 is reached and location is acquired
  useEffect(() => {
    if (step === 3 && location.lat && location.lng && distance && !locationQuery) {
      fetchPlaces(location.lat, location.lng);
    }
  }, [step, location.lat, location.lng, distance, mood, subFilters]);

  // Watch for location being fetched then call API
  const fetchPlaces = async (lat, lng, searchQuery = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await placeService.getNearbyPlaces({
        lat,
        lng,
        locationQuery: searchQuery,
        mood,
        distance,
        subFilters,
      });
      setPlaces(data.places);
      
      if (data.resolvedLocation) {
        setResolvedLocationText(data.resolvedLocation.address);
      } else {
        setResolvedLocationText('');
      }

      if (data.places.length === 0) {
        setError('No places found. Try a different mood, larger distance, or search query!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch places. Try again.');
      toast.error('Could not load places. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch once location is known
  const handleFetch = async () => {
    setLoading(true);
    setError(null);

    if (location.lat) {
      await fetchPlaces(location.lat, location.lng);
      return;
    }

    // Get location manually here and wait
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await fetchPlaces(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setError('Location access denied. Please allow location to find nearby places.');
        setLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!locationQuery.trim()) return;
    fetchPlaces(null, null, locationQuery);
  };

  const handleReset = () => {
    setStep(1);
    setMood(null);
    setDistance(null);
    setSubFilters({
      diet: 'any',
      foodType: 'any',
      budget: 'any',
      adventureType: 'any'
    });
    setPlaces([]);
    setLocationQuery('');
    setResolvedLocationText('');
    setError(null);
    setLoading(false);
  };

  const selectedMood = moods.find((m) => m.id === mood);
  const selectedDist = distances.find((d) => d.id === distance);

  return (
    <div className="min-h-screen bg-dark-900 bg-grid pt-24 pb-12 px-4">
      {/* Glow */}
      <div className="fixed top-20 left-1/4 w-96 h-96 bg-neon-teal/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-40 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-teal/10 border border-neon-teal/20 text-neon-teal text-sm font-medium mb-4">
            <FiMapPin size={14} />
            Solo Place Finder
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white mb-3">
            Where should you go?
          </h1>
          <p className="text-white/40 text-lg">
            Tell us your vibe — we'll find the spot.
          </p>
        </div>

        {/* Progress Steps */}
        {step <= 2 && (
          <div className="flex items-center justify-center gap-3 mb-10 animate-fade-in">
            {['Mood', 'Distance', 'Places'].map((label, i) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <StepIndicator step={i + 1} currentStep={step} />
                  <span className={`text-xs font-medium ${i + 1 === step ? 'text-primary-300' : i + 1 < step ? 'text-white/40' : 'text-white/20'}`}>
                    {label}
                  </span>
                </div>
                {i < 2 && <div className={`w-12 sm:w-20 h-px ${i + 1 < step ? 'bg-primary-500' : 'bg-white/10'} mb-4 transition-colors`} />}
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 1: Mood Selector ── */}
        {step === 1 && (
          <div className="animate-slide-up">
            <p className="text-center text-white/50 text-sm mb-6">What's the vibe today?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {moods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleMoodSelect(m.id)}
                  className="glass-card-hover p-5 text-center group cursor-pointer"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
                    {m.emoji}
                  </div>
                  <p className="font-display font-semibold text-white text-sm mb-1">{m.label}</p>
                  <p className="text-white/30 text-xs leading-relaxed">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 1.5: Vibe Customizer (Sub-filters) ── */}
        {step === 1.5 && (
          <div className="animate-slide-up max-w-lg mx-auto glass-card p-6 border-white/5 space-y-6">
            <div className="text-center">
              <span className="text-3xl mb-2 block">{selectedMood?.emoji}</span>
              <h3 className="font-display font-bold text-xl text-white">Customize Your {selectedMood?.label} Vibe</h3>
              <p className="text-white/40 text-xs mt-1">Refine your suggestions below</p>
            </div>

            {mood === 'foodie' && (
              <div className="space-y-4">
                {/* Diet Selector */}
                <div>
                  <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                    Diet Preference
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'any', label: '🍔 Any Food' },
                      { id: 'veg', label: '🥗 Veg Only' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSubFilters(prev => ({ ...prev, diet: opt.id }))}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer
                          ${subFilters.diet === opt.id
                            ? 'bg-primary-500/25 border-primary-500 text-primary-300'
                            : 'bg-white/3 border-white/5 text-white/50 hover:bg-white/8'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Food Type Selector */}
                <div>
                  <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                    Food Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'any', label: '🍽️ All Options' },
                      { id: 'junk_food', label: '🍟 Junk Food' },
                      { id: 'cuisine', label: '🍷 Fine Dining' },
                      { id: 'food_cart', label: '🚚 Street Carts / Trucks' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSubFilters(prev => ({ ...prev, foodType: opt.id }))}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer
                          ${subFilters.foodType === opt.id
                            ? 'bg-primary-500/25 border-primary-500 text-primary-300'
                            : 'bg-white/3 border-white/5 text-white/50 hover:bg-white/8'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Selector */}
                <div>
                  <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                    Budget
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'any', label: 'All' },
                      { id: 'cheap', label: '$' },
                      { id: 'moderate', label: '$$' },
                      { id: 'expensive', label: '$$$' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSubFilters(prev => ({ ...prev, budget: opt.id }))}
                        className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer
                          ${subFilters.budget === opt.id
                            ? 'bg-primary-500/25 border-primary-500 text-primary-300'
                            : 'bg-white/3 border-white/5 text-white/50 hover:bg-white/8'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {mood === 'adventure' && (
              <div className="space-y-4">
                {/* Adventure Type */}
                <div>
                  <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                    Adventure Type
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'any', label: '🧗 Any Adventure' },
                      { id: 'nature', label: '🌳 Nature & Forest Trails' },
                      { id: 'beach', label: '🌊 Beaches & Lakes' },
                      { id: 'mountains', label: '🏔️ Mountain Peaks' },
                      { id: 'sports', label: '⚽ Sports Centers' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSubFilters(prev => ({ ...prev, adventureType: opt.id }))}
                        className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all text-left flex justify-between items-center cursor-pointer
                          ${subFilters.adventureType === opt.id
                            ? 'bg-primary-500/25 border-primary-500 text-primary-300 font-bold'
                            : 'bg-white/3 border-white/5 text-white/50 hover:bg-white/8'}`}
                      >
                        <span>{opt.label}</span>
                        {subFilters.adventureType === opt.id && <span className="text-primary-400 font-bold">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step Navigation Buttons */}
            <div className="flex gap-3 pt-4 border-t border-white/5">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all cursor-pointer"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 btn-primary py-2.5 rounded-xl text-xs font-bold shadow-glow-purple-sm cursor-pointer"
              >
                Choose Distance →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Distance Selector ── */}
        {step === 2 && (
          <div className="animate-slide-up">
            <p className="text-center text-white/50 text-sm mb-6">
              {selectedMood?.emoji} {selectedMood?.label} vibes — how far can you go?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {distances.map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleDistanceSelect(d.id)}
                  className="glass-card-hover p-6 text-center group cursor-pointer"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
                    {d.emoji}
                  </div>
                  <p className="font-display font-semibold text-white mb-1">{d.label}</p>
                  <p className="text-white/30 text-sm">{d.desc}</p>
                </button>
              ))}
            </div>
            <div className="text-center mt-6">
              <button onClick={() => {
                if (mood === 'foodie' || mood === 'adventure') {
                  setStep(1.5);
                } else {
                  setStep(1);
                }
              }} className="text-white/30 hover:text-white/60 text-sm transition-colors cursor-pointer">
                ← Change mood / filters
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Results ── */}
        {step === 3 && (
          <div className="animate-fade-in">
            {/* Summary bar */}
            <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-6 animate-slide-up">
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                <span>{selectedMood?.emoji} <span className="text-white font-medium">{selectedMood?.label}</span></span>
                <span className="text-white/20">·</span>
                <span>{selectedDist?.emoji} <span className="text-white font-medium">{selectedDist?.label}</span></span>
                {resolvedLocationText && (
                  <>
                    <span className="text-white/20">·</span>
                    <span className="text-white font-medium">📍 {resolvedLocationText}</span>
                  </>
                )}
                {places.length > 0 && (
                  <>
                    <span className="text-white/20">·</span>
                    <span className="text-neon-teal font-medium">{places.length} places found</span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Search new location..."
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs placeholder-white/20 focus:outline-none focus:border-primary-500/40 focus:bg-white/8 transition-all flex-1 md:w-40"
                  />
                  <button
                    type="submit"
                    disabled={!locationQuery.trim()}
                    className="bg-primary-500/20 border border-primary-500/25 hover:bg-primary-500/35 text-primary-300 font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Go
                  </button>
                </form>
                <button onClick={handleReset} className="btn-ghost text-xs flex items-center gap-1.5 !px-3 !py-2">
                  <FiRefreshCw size={12} />
                  Start over
                </button>
              </div>
            </div>

            {/* Auto-fetch or search query trigger */}
            {!loading && places.length === 0 && !error && (
              <div className="glass-card max-w-md mx-auto p-8 text-center animate-slide-up">
                <div className="text-5xl mb-4">📍</div>
                <h3 className="font-display font-bold text-white text-lg mb-2">Find Places</h3>
                <p className="text-white/40 text-xs mb-6">
                  Allow location access or search for any location (city, area, state) below.
                </p>
                
                <div className="space-y-4">
                  <button
                    onClick={handleFetch}
                    className="btn-primary flex items-center justify-center gap-2 w-full"
                  >
                    <FiNavigation size={16} />
                    Use My Current Location
                  </button>

                  <div className="flex items-center justify-center gap-3 py-1">
                    <div className="h-px bg-white/10 flex-1" />
                    <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">or search place</span>
                    <div className="h-px bg-white/10 flex-1" />
                  </div>

                  <form onSubmit={handleSearchSubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Dadar, Gujarat, Thane"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-primary-500/40 focus:bg-white/8 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!locationQuery.trim()}
                      className="btn-secondary !px-4 !py-2 text-sm disabled:opacity-50"
                    >
                      Search
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Loading skeletons */}
            {loading && (
              <div>
                <p className="text-center text-white/40 text-sm mb-6 animate-pulse">
                  📡 Finding places near you...
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => <PlaceSkeleton key={i} />)}
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="glass-card p-8 text-center animate-slide-up">
                <FiAlertCircle className="text-accent-400 mx-auto mb-3" size={32} />
                <p className="text-white/70 mb-4">{error}</p>
                <button onClick={handleFetch} className="btn-secondary flex items-center gap-2 mx-auto">
                  <FiRefreshCw size={16} />
                  Try again
                </button>
              </div>
            )}

            {/* Places grid */}
            {!loading && places.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {places.map((place) => (
                  <PlaceCard key={place.osmId} place={place} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
