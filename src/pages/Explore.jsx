import { FiCompass } from 'react-icons/fi';

const Explore = () => {
  return (
    <div className="min-h-screen bg-dark-900 bg-grid pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="glass-card p-12 animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-neon-teal/10 flex items-center justify-center mx-auto mb-6">
            <FiCompass className="text-neon-teal" size={32} />
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-3">
            Explore Places
          </h1>
          <p className="text-white/40 max-w-md mx-auto mb-2">
            Set your mood, pick your vibe, and discover real nearby spots.
          </p>
          <p className="text-primary-400 text-sm font-medium">
            🚧 Coming in Phase 2 — Place Finder with Overpass API
          </p>
        </div>
      </div>
    </div>
  );
};

export default Explore;
