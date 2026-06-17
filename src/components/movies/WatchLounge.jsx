import { useState, useEffect } from 'react';
import MovieFilters from './MovieFilters';
import MovieCard from './MovieCard';
import { movieService } from '../../services/movieService';
import { toast } from 'react-toastify';

const WatchLounge = ({ onPropose }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Initial load with default filters
  useEffect(() => {
    handleSearch({ genres: [], mood: 'feel-good', language: 'en' });
  }, []);

  const handleSearch = async (filters) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await movieService.discoverMovies(filters);
      setMovies(data.movies || []);
    } catch (err) {
      toast.error('Failed to retrieve movies. Using fallback suggestions.');
      // If server error, get fallback from controller or hardcode stub
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto max-w-5xl mx-auto w-full">
      <div className="text-center mb-8">
        <h2 className="font-display font-bold text-2xl text-white mb-2">🎬 Watch Lounge</h2>
        <p className="text-white/40 text-sm">
          Discover films or TV shows, and vote on what to watch next together.
        </p>
      </div>

      {/* Filters */}
      <MovieFilters onSearch={handleSearch} loading={loading} />

      {/* Results */}
      {loading ? (
        /* Loading Skeletons */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-52 w-full animate-pulse" />
          ))}
        </div>
      ) : movies.length > 0 ? (
        /* Results Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onPropose={onPropose} />
          ))}
        </div>
      ) : hasSearched ? (
        /* Empty State */
        <div className="text-center py-12 glass-card p-8 border-white/5">
          <p className="text-white/40 text-sm">No results match your selected filters.</p>
          <button
            onClick={() => handleSearch({ genres: [], mood: 'feel-good', language: 'en' })}
            className="mt-4 text-xs font-semibold text-primary-400 hover:text-primary-300"
          >
            Reset Filters
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default WatchLounge;
