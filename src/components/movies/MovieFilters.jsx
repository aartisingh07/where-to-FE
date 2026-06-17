import { useState } from 'react';
import { FiFilter, FiSearch } from 'react-icons/fi';

const GENRES = [
  { id: 'action', label: 'Action 💥' },
  { id: 'comedy', label: 'Comedy 😂' },
  { id: 'romance', label: 'Romance 💖' },
  { id: 'science_fiction', label: 'Sci-Fi 👽' },
  { id: 'horror', label: 'Horror 👻' },
  { id: 'drama', label: 'Drama 🎭' },
  { id: 'animation', label: 'Anime/Toon 🦄' },
];

const MOODS = [
  { id: 'feel-good', label: 'Feel-good', emoji: '☀️', desc: 'Chill, lighthearted, funny vibe' },
  { id: 'intense', label: 'Intense', emoji: '🔥', desc: 'Thrilling, spooky, action-packed' },
  { id: 'mind-bending', emoji: '🌀', label: 'Mind-bending', desc: 'Mysterious, sci-fi, twisty plots' },
  { id: 'classic', label: 'Classics', emoji: '🏆', desc: 'Critically acclaimed masterpieces' },
];

const LANGUAGES = [
  { id: 'en', label: 'English 🇺🇸' },
  { id: 'hi', label: 'Hindi 🇮🇳' },
  { id: 'ko', label: 'Korean 🇰🇷' },
  { id: 'es', label: 'Spanish 🇪🇸' },
  { id: 'all', label: 'Any Language 🌐' },
];

const MovieFilters = ({ onSearch, loading }) => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedMood, setSelectedMood] = useState('feel-good');
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const toggleGenre = (genreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleSubmit = () => {
    onSearch({
      genres: selectedGenres,
      mood: selectedMood,
      language: selectedLanguage,
    });
  };

  return (
    <div className="glass-card p-6 w-full max-w-4xl mx-auto mb-8 animate-slide-up">
      <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
        <FiFilter className="text-primary-400" />
        <h3 className="font-display font-semibold text-white text-sm">Find Movies & Shows</h3>
      </div>

      <div className="space-y-6">
        {/* 1. Genres */}
        <div>
          <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">
            Select Genres
          </label>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => {
              const active = selectedGenres.includes(genre.id);
              return (
                <button
                  key={genre.id}
                  onClick={() => toggleGenre(genre.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
                    ${active
                      ? 'bg-primary-500/20 border-primary-500 text-primary-300 shadow-glow-purple-sm'
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  {genre.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Moods & Languages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Moods Column */}
          <div className="md:col-span-2">
            <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">
              Vibe / Mood
            </label>
            <div className="grid grid-cols-2 gap-3">
              {MOODS.map((mood) => {
                const active = selectedMood === mood.id;
                return (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`p-3 text-left rounded-xl border transition-all duration-200 flex items-start gap-3
                      ${active
                        ? 'bg-primary-500/10 border-primary-500/50 text-white shadow-glow-purple-sm'
                        : 'bg-white/3 border-white/5 text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    <span className="text-2xl mt-0.5">{mood.emoji}</span>
                    <div>
                      <p className="text-xs font-bold">{mood.label}</p>
                      <p className="text-[10px] text-white/35 leading-tight mt-0.5">{mood.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Column */}
          <div>
            <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">
              Language
            </label>
            <div className="space-y-2">
              {LANGUAGES.map((lang) => {
                const active = selectedLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={`w-full p-2.5 text-left rounded-xl border text-xs font-medium transition-all duration-200
                      ${active
                        ? 'bg-primary-500/15 border-primary-500/30 text-primary-300'
                        : 'bg-white/3 border-white/5 text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full btn-primary flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <FiSearch size={16} />
              Search Watch Catalog
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MovieFilters;
