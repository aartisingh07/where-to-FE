import { useEffect, useState } from 'react';
import { FiClock, FiThumbsUp, FiThumbsDown, FiHelpCircle, FiExternalLink, FiArrowLeft, FiAward } from 'react-icons/fi';
import { movieService } from '../../services/movieService';

const GameVoting = ({
  activeVote,
  tallies = { yes: 0, no: 0, maybe: 0 },
  userVote = null,
  onVote,
  isHost,
  onEnd,
  voteResult = null,
  onClear,
}) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

  useEffect(() => {
    if (voteResult && voteResult.result === 'approved' && voteResult.item?.type === 'movie') {
      const fetchProviders = async () => {
        setLoadingProviders(true);
        try {
          const data = await movieService.getWatchProviders(voteResult.item.id);
          setProviders(data.providers || []);
        } catch (err) {
          console.error('Failed to load watch providers:', err);
        } finally {
          setLoadingProviders(false);
        }
      };
      fetchProviders();
    }
  }, [voteResult]);

  // Timer logic for active voting
  useEffect(() => {
    if (!activeVote || voteResult) return;

    const calculateTime = () => {
      const difference = activeVote.endTime - Date.now();
      return Math.max(0, Math.round(difference / 1000));
    };

    setTimeLeft(calculateTime());

    const interval = setInterval(() => {
      const current = calculateTime();
      setTimeLeft(current);
      if (current <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeVote, voteResult]);

  const totalVotes = tallies.yes + tallies.no + tallies.maybe;
  const getPercentage = (value) => {
    if (totalVotes === 0) return 0;
    return Math.round((value / totalVotes) * 100);
  };

  // 1. --- Voting Result State ---
  if (voteResult) {
    const isApproved = voteResult.result === 'approved';
    const item = voteResult.item;
    const finalTallies = voteResult.tallies || { yes: 0, no: 0, maybe: 0 };

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto w-full animate-slide-up">
        {isApproved ? (
          <div className="glass-card p-8 border-neon-green/30 shadow-glow-green w-full">
            <div className="w-16 h-16 rounded-full bg-neon-green/10 flex items-center justify-center text-neon-green mx-auto mb-6 animate-bounce">
              <FiAward size={32} />
            </div>
            <p className="text-neon-green text-xs font-bold uppercase tracking-widest mb-1">
              Proposal Passed!
            </p>
            <h2 className="font-display font-black text-3xl text-white mb-4">
              {item.type === 'movie' ? `Watch ${item.name || item.title}?` : `Let's Play ${item.name || item.title}!`}
            </h2>
            <p className="text-white/50 text-sm mb-6">
              {item.type === 'movie'
                ? 'The group voted YES! Streaming source info is below.'
                : 'The group voted YES! Click the button below to join the game session.'}
            </p>

            {/* Movie Poster */}
            {item.type === 'movie' && item.poster && (
              <img
                src={item.poster}
                alt={item.title}
                className="w-24 h-36 object-cover rounded-lg mx-auto mb-4 border border-white/10"
              />
            )}

            {/* Watch Providers for Movie */}
            {item.type === 'movie' && (
              <div className="mb-6 bg-dark-800/40 rounded-xl p-4 border border-white/5">
                <p className="text-white/40 text-xs font-semibold mb-3">Available Stream Sources:</p>
                {loadingProviders ? (
                  <div className="flex justify-center py-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-primary-500 rounded-full animate-spin" />
                  </div>
                ) : providers.length > 0 ? (
                  <div className="flex flex-wrap gap-4 justify-center items-center">
                    {providers.map((p, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1.5">
                        {p.logo ? (
                          <img
                            src={p.logo}
                            alt={p.provider_name}
                            className="w-10 h-10 rounded-xl object-cover border border-white/10"
                            title={p.provider_name}
                          />
                        ) : (
                          <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-white">
                            {p.provider_name}
                          </div>
                        )}
                        <span className="text-[9px] text-white/30 truncate max-w-[65px]">{p.provider_name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/30 text-xs italic">No streaming providers found.</p>
                )}
              </div>
            )}

            {/* Voting summary */}
            <div className="bg-dark-800/50 rounded-xl p-4 border border-white/5 flex justify-around mb-8 text-sm">
              <div>
                <span className="block text-neon-green font-bold text-lg">{finalTallies.yes}</span>
                <span className="text-white/30 text-xs">Yes</span>
              </div>
              <div className="border-r border-white/5" />
              <div>
                <span className="block text-red-400 font-bold text-lg">{finalTallies.no}</span>
                <span className="text-white/30 text-xs">No</span>
              </div>
              <div className="border-r border-white/5" />
              <div>
                <span className="block text-white/50 font-bold text-lg">{finalTallies.maybe}</span>
                <span className="text-white/30 text-xs">Maybe</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {item.type !== 'movie' ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-gradient-to-r from-neon-green to-emerald-500 hover:from-neon-green hover:to-emerald-600 hover:shadow-glow-green text-white transition-all"
                >
                  Open Game
                  <FiExternalLink size={16} />
                </a>
              ) : (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 hover:shadow-glow-purple text-white transition-all"
                >
                  View Details on TMDB
                  <FiExternalLink size={16} />
                </a>
              )}
              <button
                onClick={onClear}
                className="w-full btn-secondary text-xs"
              >
                {item.type === 'movie' ? 'Back to Watch Lounge' : 'Back to Game Lounge'}
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 border-red-500/30 shadow-glow-red w-full">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 mx-auto mb-6">
              <FiThumbsDown size={30} />
            </div>
            <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">
              Proposal Failed
            </p>
            <h2 className="font-display font-bold text-2xl text-white mb-4">
              Voted Down
            </h2>
            <p className="text-white/50 text-sm mb-6">
              The group wasn't in the mood for {item.name || item.title}. Let's select something else!
            </p>

            {/* Voting summary */}
            <div className="bg-dark-800/50 rounded-xl p-4 border border-white/5 flex justify-around mb-8 text-sm">
              <div>
                <span className="block text-neon-green font-bold text-lg">{finalTallies.yes}</span>
                <span className="text-white/30 text-xs">Yes</span>
              </div>
              <div className="border-r border-white/5" />
              <div>
                <span className="block text-red-400 font-bold text-lg">{finalTallies.no}</span>
                <span className="text-white/30 text-xs">No</span>
              </div>
              <div className="border-r border-white/5" />
              <div>
                <span className="block text-white/50 font-bold text-lg">{finalTallies.maybe}</span>
                <span className="text-white/30 text-xs">Maybe</span>
              </div>
            </div>

            <button
              onClick={onClear}
              className="w-full btn-primary py-3 rounded-xl font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all flex items-center justify-center gap-1.5"
            >
              <FiArrowLeft size={16} />
              {item.type === 'movie' ? 'Try Another Movie' : 'Try Another Game'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // 2. --- Active Voting State ---
  const item = activeVote?.item;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full animate-slide-up">
      <div className="glass-card p-8 border-primary-500/30 w-full relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-1.5 text-xs text-white/40 font-medium">
            <FiClock className="animate-spin text-primary-400" />
            <span>Voting Closes in:</span>
            <span className="text-white font-bold font-mono text-sm ml-0.5">{timeLeft}s</span>
          </div>
          <span className="text-3xl">{item?.emoji}</span>
        </div>

        <p className="text-primary-400 text-xs font-bold uppercase tracking-widest mb-1">
          Group Vote Proposed
        </p>
        <h2 className="font-display font-black text-2xl text-white mb-2 truncate">
          Play {item?.name}?
        </h2>
        <p className="text-white/50 text-xs mb-8 leading-relaxed">
          {item?.desc}
        </p>

        {/* Voting Progress Bars */}
        <div className="space-y-4 mb-8">
          {/* YES Bar */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-neon-green flex items-center gap-1">
                <FiThumbsUp size={11} /> Yes ({tallies.yes})
              </span>
              <span className="text-white/50">{getPercentage(tallies.yes)}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-neon-green rounded-full transition-all duration-300"
                style={{ width: `${getPercentage(tallies.yes)}%` }}
              />
            </div>
          </div>

          {/* NO Bar */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-red-400 flex items-center gap-1">
                <FiThumbsDown size={11} /> No ({tallies.no})
              </span>
              <span className="text-white/50">{getPercentage(tallies.no)}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-400 rounded-full transition-all duration-300"
                style={{ width: `${getPercentage(tallies.no)}%` }}
              />
            </div>
          </div>

          {/* MAYBE Bar */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-white/65 flex items-center gap-1">
                <FiHelpCircle size={11} /> Maybe ({tallies.maybe})
              </span>
              <span className="text-white/50">{getPercentage(tallies.maybe)}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/30 rounded-full transition-all duration-300"
                style={{ width: `${getPercentage(tallies.maybe)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 mb-6">
          <button
            onClick={() => onVote('yes')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl border font-bold transition-all duration-200 text-xs
              ${userVote === 'yes'
                ? 'bg-neon-green/20 border-neon-green text-neon-green shadow-glow-green-sm'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
          >
            <FiThumbsUp size={16} className="mb-0.5" />
            Yes
          </button>

          <button
            onClick={() => onVote('no')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl border font-bold transition-all duration-200 text-xs
              ${userVote === 'no'
                ? 'bg-red-500/20 border-red-500 text-red-400 shadow-glow-red-sm'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
          >
            <FiThumbsDown size={16} className="mb-0.5" />
            No
          </button>

          <button
            onClick={() => onVote('maybe')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl border font-bold transition-all duration-200 text-xs
              ${userVote === 'maybe'
                ? 'bg-white/20 border-white text-white shadow-card-hover'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
          >
            <FiHelpCircle size={16} className="mb-0.5" />
            Maybe
          </button>
        </div>

        {/* Host controls */}
        {isHost && (
          <button
            onClick={onEnd}
            className="w-full text-center text-[10px] text-white/30 hover:text-red-400/70 py-1 transition-all uppercase tracking-widest font-bold"
          >
            Stop Vote Early
          </button>
        )}
      </div>
    </div>
  );
};

export default GameVoting;
