import { FiStar, FiTv, FiFilm, FiPlay } from 'react-icons/fi';

const MovieCard = ({ movie, onPropose }) => {
  const ratingStars = Math.round(movie.rating / 2);

  return (
    <div className="glass-card overflow-hidden group hover:border-white/20 transition-all duration-300 flex flex-col sm:flex-row h-auto sm:h-52">
      {/* Poster */}
      <div className="w-full sm:w-36 h-52 sm:h-full flex-shrink-0 relative overflow-hidden">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Rating overlay for mobile */}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 flex items-center gap-1">
          <FiStar className="text-amber-400 fill-amber-400" size={10} />
          <span className="text-[10px] font-bold text-white">{movie.rating}</span>
        </div>
      </div>

      {/* Info Content */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3 min-w-0">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[9px] uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-white/40 font-bold">
              {movie.releaseYear}
            </span>
            <span className="text-[9px] uppercase tracking-wider bg-primary-500/10 border border-primary-500/20 px-2 py-0.5 rounded-full text-primary-300 font-bold flex items-center gap-1">
              {movie.mediaType === 'tv' ? <FiTv size={9} /> : <FiFilm size={9} />}
              {movie.mediaType === 'tv' ? 'TV Show' : 'Movie'}
            </span>
          </div>

          <h3 className="font-display font-bold text-white text-base truncate mb-1">
            {movie.title}
          </h3>

          <p className="text-white/40 text-xs line-clamp-3 leading-relaxed">
            {movie.overview}
          </p>
        </div>

        {/* Action Propose */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
          {/* Star ratings */}
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <FiStar
                key={i}
                size={12}
                className={i < ratingStars ? 'text-amber-400 fill-amber-400' : 'text-white/10'}
              />
            ))}
          </div>

          <button
            onClick={() => onPropose({
              id: movie.id,
              title: movie.title,
              name: movie.title, // socket uses item.name or item.title
              emoji: movie.mediaType === 'tv' ? '📺' : '🎬',
              desc: movie.overview,
              link: `https://www.themoviedb.org/movie/${movie.id}`, // fallback details
              type: 'movie',
              poster: movie.poster,
              rating: movie.rating,
              releaseYear: movie.releaseYear,
            })}
            className="py-1.5 px-3 rounded-lg text-[11px] font-semibold bg-primary-500/20 text-primary-300 border border-primary-500/20 hover:bg-primary-500 hover:text-white hover:border-transparent transition-all duration-200 flex items-center gap-1"
          >
            <FiPlay size={10} />
            Propose Movie
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
