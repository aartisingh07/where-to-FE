import { useState } from 'react';
import { FiMapPin, FiHeart, FiNavigation, FiX, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { placeService } from '../../services/placeService';

const categoryStyle = {
  'Food Cart': { emoji: '🛒', color: 'from-amber-400/20 to-yellow-400/10', badge: 'bg-amber-400/20 text-amber-300' },
  'Food Truck': { emoji: '🚚', color: 'from-amber-500/20 to-orange-500/10', badge: 'bg-amber-500/20 text-amber-300' },
  Cafe:        { emoji: '☕', color: 'from-amber-500/20 to-yellow-500/10', badge: 'bg-amber-500/20 text-amber-300' },
  Restaurant:  { emoji: '🍽️', color: 'from-orange-500/20 to-red-500/10',  badge: 'bg-orange-500/20 text-orange-300' },
  'Fast Food': { emoji: '🍕', color: 'from-red-500/20 to-orange-500/10',   badge: 'bg-red-500/20 text-red-300' },
  'Food Court':{ emoji: '🛒', color: 'from-rose-500/20 to-orange-500/10',    badge: 'bg-rose-500/20 text-rose-300' },
  Park:        { emoji: '🌳', color: 'from-green-500/20 to-emerald-500/10',badge: 'bg-green-500/20 text-green-300' },
  Beach:       { emoji: '🌊', color: 'from-blue-500/20 to-cyan-500/10',    badge: 'bg-blue-500/20 text-blue-300' },
  'Mountain Peak': { emoji: '🗻', color: 'from-indigo-500/20 to-cyan-500/10', badge: 'bg-indigo-500/20 text-indigo-300' },
  'Scenic Viewpoint': { emoji: '🌅', color: 'from-indigo-500/20 to-cyan-500/10', badge: 'bg-indigo-500/20 text-indigo-300' },
  'Adventure Spot': { emoji: '🧗', color: 'from-primary-500/20 to-accent-500/10', badge: 'bg-primary-500/20 text-primary-300' },
  'Sports Centre': { emoji: '⚽', color: 'from-teal-500/20 to-green-500/10',   badge: 'bg-teal-500/20 text-teal-300' },
  Library:     { emoji: '📚', color: 'from-indigo-500/20 to-blue-500/10',  badge: 'bg-indigo-500/20 text-indigo-300' },
  'Study Space':{ emoji: '🎓', color: 'from-blue-500/20 to-indigo-500/10',badge: 'bg-blue-500/20 text-blue-300' },
  Bakery:      { emoji: '🥐', color: 'from-yellow-500/20 to-amber-500/10', badge: 'bg-yellow-500/20 text-yellow-300' },
  'Lake / Water':{ emoji: '🏞️', color: 'from-cyan-500/20 to-blue-500/10', badge: 'bg-cyan-500/20 text-cyan-300' },
  Place:       { emoji: '📍', color: 'from-primary-500/20 to-accent-500/10', badge: 'bg-primary-500/20 text-primary-300' },
};

const PlaceCard = ({ place, onSave, isSaved = false }) => {
  const { isAuthenticated } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(isSaved);
  const [detailOpen, setDetailOpen] = useState(false);

  const style = categoryStyle[place.category] || categoryStyle['Place'];

  // Handle fallback travel times
  const travelTimes = place.travelTimes || (() => {
    if (!place.distance) return null;
    const dist = place.distance * 1.3;
    const walkTime = Math.max(1, Math.round((dist / 4.5) * 60));
    const bikeTime = Math.max(1, Math.round((dist / 15) * 60));
    const driveTime = Math.max(1, Math.round((dist / 35) * 60));
    let recommended = 'driving';
    let recommendedTime = driveTime;
    if (walkTime <= 15) {
      recommended = 'walking';
      recommendedTime = walkTime;
    } else if (bikeTime <= 15) {
      recommended = 'bicycling';
      recommendedTime = bikeTime;
    }
    return { walking: walkTime, bicycling: bikeTime, driving: driveTime, recommended, recommendedTime };
  })();

  const handleSave = async (e) => {
    e.stopPropagation(); // Prevent modal opening
    if (!isAuthenticated) {
      toast.info('Log in to save places 💜');
      return;
    }
    if (saved) return;

    setSaving(true);
    try {
      await placeService.savePlace({
        name: place.name,
        category: place.category,
        lat: place.lat,
        lng: place.lng,
        osmId: place.osmId,
        address: place.address,
      });
      setSaved(true);
      toast.success(`${place.name} saved! ❤️`);
      if (onSave) onSave(place);
    } catch (error) {
      if (error.response?.status === 400) {
        setSaved(true);
      } else {
        toast.error('Could not save place. Try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;

  const defaultPhoto = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';
  const defaultDesc = 'A wonderful place to explore, hang out, and vibe with your squad.';

  const recommendedLabel = {
    walking: '🚶 Walking',
    bicycling: '🚴 Bicycling',
    driving: '🚗 Driving',
  };

  const budgetLabels = {
    cheap: 'Cheap ($)',
    moderate: 'Moderate ($$)',
    expensive: 'Premium ($$$)',
  };

  return (
    <>
      {/* ── Place Card Item ── */}
      <div
        onClick={() => setDetailOpen(true)}
        className="glass-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover group cursor-pointer flex flex-col justify-between"
      >
        {/* illustrative header image */}
        <div className={`h-28 w-full overflow-hidden relative ${!place.photo ? `bg-gradient-to-br ${style.color} flex items-center justify-center` : ''}`}>
          {place.photo ? (
            <>
              <img
                src={place.photo}
                alt={place.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />
            </>
          ) : (
            <div className="text-4xl select-none opacity-40 group-hover:scale-110 transition-transform duration-300 mt-2">
              {style.emoji}
            </div>
          )}
          <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10 ${style.badge}`}>
            {style.emoji} {place.category}
          </span>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-2 mb-1">
              <h3 className="font-display font-bold text-white text-base leading-tight line-clamp-1">
                {place.name}
              </h3>

              {/* Heart Favorite button */}
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200
                  ${saved
                    ? 'bg-accent-500/20 text-accent-400'
                    : 'bg-white/5 text-white/30 hover:bg-accent-500/10 hover:text-accent-400'
                  }`}
              >
                <FiHeart size={13} className={saved ? 'fill-current' : ''} />
              </button>
            </div>

            <p className="text-white/40 text-xs truncate mb-3">
              {place.distance} km away · {place.budget ? `${budgetLabels[place.budget]} · ` : ''}{place.address || 'No address details'}
            </p>

            {travelTimes && (
              <div className="inline-flex items-center gap-1 text-xs bg-primary-500/10 border border-primary-500/25 text-primary-300 px-2 py-1 rounded-lg font-medium mb-3">
                <FiClock size={10} />
                <span>Fastest: {recommendedLabel[travelTimes.recommended]} ({travelTimes.recommendedTime}m)</span>
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setDetailOpen(true);
            }}
            className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-sm font-semibold transition-all duration-200"
          >
            Show Details & Photo
          </button>
        </div>
      </div>

      {/* ── Details Modal Overlay ── */}
      {detailOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl animate-slide-up">
            {/* Close Button */}
            <button
              onClick={() => setDetailOpen(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white/70 hover:text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors"
            >
              <FiX size={16} />
            </button>

            {/* Poster Header */}
            <div className={`h-48 w-full relative ${!place.photo ? `bg-gradient-to-br ${style.color} flex items-center justify-center` : ''}`}>
              {place.photo ? (
                <>
                  <img
                    src={place.photo}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent" />
                </>
              ) : (
                <div className="text-6xl select-none opacity-40 mb-8">
                  {style.emoji}
                </div>
              )}
              <div className="absolute bottom-4 left-4">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border border-white/15 ${style.badge}`}>
                  {style.emoji} {place.category}
                </span>
                <h2 className="font-display font-black text-2xl text-white mt-1.5 drop-shadow-md">
                  {place.name}
                </h2>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 space-y-5">
              {/* Blurb Description */}
              <p className="text-white/70 text-sm leading-relaxed">
                {place.description || defaultDesc}
              </p>

              {/* Address details */}
              <div className="flex items-start gap-2 text-white/40 text-sm">
                <FiMapPin className="text-primary-400 mt-0.5 flex-shrink-0" size={13} />
                <div>
                  <p className="font-medium text-white/70">{place.distance} km away</p>
                  <p className="text-xs text-white/30 leading-snug mt-0.5">{place.address || 'Address details not loaded'}</p>
                </div>
              </div>

              {place.budget && (
                <div className="flex items-center gap-2 text-white/40 text-sm">
                  <span className="text-primary-400">💰</span>
                  <div>
                    <span className="font-semibold text-white/70">Budget: </span>
                    <span className="text-primary-300 font-bold">{budgetLabels[place.budget] || place.budget}</span>
                  </div>
                </div>
              )}

              {/* Travel Times estimates */}
              {travelTimes && (
                <div className="bg-white/3 rounded-xl p-4 border border-white/5 space-y-2.5">
                  <p className="text-xs uppercase font-bold text-white/40 tracking-wider flex items-center gap-1.5">
                    <FiClock size={11} className="text-primary-400" /> Travel Duration Estimates
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className={`p-2 rounded-lg border ${travelTimes.recommended === 'walking' ? 'bg-neon-green/10 border-neon-green/20 text-neon-green' : 'bg-white/2 border-white/5 text-white/50'}`}>
                      <span className="block text-sm">🚶</span>
                      <span className="block font-bold mt-0.5">{travelTimes.walking}m</span>
                      <span className="text-[10px] opacity-60">Walk</span>
                    </div>
                    <div className={`p-2 rounded-lg border ${travelTimes.recommended === 'bicycling' ? 'bg-primary-500/20 border-primary-500/25 text-primary-300' : 'bg-white/2 border-white/5 text-white/50'}`}>
                      <span className="block text-sm">🚴</span>
                      <span className="block font-bold mt-0.5">{travelTimes.bicycling}m</span>
                      <span className="text-[10px] opacity-60">Cycle</span>
                    </div>
                    <div className={`p-2 rounded-lg border ${travelTimes.recommended === 'driving' ? 'bg-primary-500/20 border-primary-500/25 text-primary-300' : 'bg-white/2 border-white/5 text-white/50'}`}>
                      <span className="block text-sm">🚗</span>
                      <span className="block font-bold mt-0.5">{travelTimes.driving}m</span>
                      <span className="text-[10px] opacity-60">Drive</span>
                    </div>
                  </div>
                  <div className="text-xs text-primary-300 font-semibold bg-primary-500/10 p-2 rounded-lg border border-primary-500/15 text-center mt-1">
                    💡 Optimal Transport: {recommendedLabel[travelTimes.recommended]} takes less time!
                  </div>
                </div>
              )}

              {/* Navigation button */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving || saved}
                  className={`flex-1 py-2.5 rounded-xl border font-bold text-sm flex items-center justify-center gap-1.5 transition-all
                    ${saved
                      ? 'bg-accent-500/15 border-accent-500/25 text-accent-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <FiHeart size={14} className={saved ? 'fill-current' : ''} />
                  {saved ? 'Saved to Profile' : 'Save Place'}
                </button>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 btn-primary py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 shadow-glow-purple-sm"
                >
                  <FiNavigation size={14} />
                  Open in Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlaceCard;
