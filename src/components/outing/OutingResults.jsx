import { FiMapPin, FiNavigation, FiPlay, FiRefreshCw } from 'react-icons/fi';

const categoryEmoji = {
  Cafe: '☕',
  Restaurant: '🍽️',
  'Fast Food': '🍕',
  'Food Court': '🛒',
  Park: '🌳',
  Beach: '🌊',
  Viewpoint: '🌅',
  Attraction: '🎡',
  Library: '📚',
  'Study Space': '🎓',
  Bakery: '🥐',
  Sports: '⚽',
  'Lake / Water': '🏞️',
  Place: '📍',
};

const OutingResults = ({ places = [], midpoint, mood, radius, onPropose, onReset, isHost }) => {
  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto max-w-5xl mx-auto w-full animate-slide-up">
      <div className="text-center mb-8 flex-shrink-0">
        <h2 className="font-display font-bold text-2xl text-white mb-2">📍 Midpoint Results</h2>
        <p className="text-white/40 text-xs max-w-md mx-auto">
          Calculated centroid midpoint for the squad. Found {places.length} places matching the vibe:
          <span className="text-primary-300 font-bold ml-1 uppercase">{mood}</span> within{' '}
          <span className="text-primary-300 font-bold">{(radius / 1000).toFixed(1)} km</span>.
        </p>
      </div>

      {places.length === 0 ? (
        <div className="text-center py-12 glass-card p-8 border-white/5 max-w-sm mx-auto">
          <p className="text-white/40 text-xs italic mb-4">No places found near the group midpoint.</p>
          <button onClick={onReset} className="btn-secondary text-xs">
            Try Different Locations
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
          {places.map((place) => {
            const emoji = categoryEmoji[place.category] || categoryEmoji.Place;
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;

            return (
              <div
                key={place.osmId}
                className="glass-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-white/20 flex flex-col justify-between"
              >
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-start gap-2.5 mb-2.5">
                      <span className="text-2xl mt-0.5">{emoji}</span>
                      <div className="min-w-0">
                        <h4 className="font-display font-bold text-white text-sm truncate leading-snug" title={place.name}>
                          {place.name}
                        </h4>
                        <span className="inline-block text-[9px] font-bold text-primary-300 bg-primary-500/10 border border-primary-500/20 px-2 py-0.5 rounded-full uppercase mt-1">
                          {place.category}
                        </span>
                      </div>
                    </div>

                    {/* Address & distance from midpoint */}
                    <div className="flex items-center gap-1.5 text-white/40 text-[10px] mb-3">
                      <FiMapPin size={11} className="flex-shrink-0" />
                      <span>{place.distance} km from midpoint</span>
                    </div>

                    {place.address && (
                      <p className="text-white/30 text-[10px] leading-relaxed line-clamp-2 mb-4 bg-white/1.5 border border-white/3 p-2 rounded-lg">
                        {place.address}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t border-white/5 pt-3">
                    <button
                      onClick={() => onPropose({
                        id: place.osmId,
                        name: place.name,
                        title: place.name,
                        emoji: emoji,
                        desc: place.address || 'Proposed meeting place',
                        link: mapsUrl,
                        type: 'outing',
                        lat: place.lat,
                        lng: place.lng,
                      })}
                      className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-primary-500/25 text-primary-300 border border-primary-500/25 hover:bg-primary-500 hover:text-white hover:border-transparent transition-all duration-200 flex items-center justify-center gap-1"
                    >
                      <FiPlay size={10} /> Propose Place
                    </button>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-2.5 rounded-lg text-[10px] font-medium bg-white/5 border border-white/10 text-white/55 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center"
                      title="Google Maps"
                    >
                      <FiNavigation size={11} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Host resets */}
      {isHost && (
        <div className="text-center mt-4 pb-8 flex-shrink-0">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 bg-white/3 border border-white/5 px-4 py-2 rounded-xl transition-all"
          >
            <FiRefreshCw size={12} /> Reset Location Preferences
          </button>
        </div>
      )}
    </div>
  );
};

export default OutingResults;
