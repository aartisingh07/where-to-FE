import { FiPlay, FiUsers } from 'react-icons/fi';

const games = [
  {
    id: 'skribbl',
    name: 'Skribbl.io',
    emoji: '🎨',
    desc: 'Draw and guess words in real-time. Hilarious and perfect for any group size!',
    players: '2-12 Players',
    link: 'https://skribbl.io/',
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'gartic',
    name: 'Gartic.io',
    emoji: '✏️',
    desc: 'Another classic drawing and guessing game, with customizable rooms and themes.',
    players: '2-50 Players',
    link: 'https://gartic.io/',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'codenames',
    name: 'Codenames',
    emoji: '🕵️',
    desc: 'Work in spy teams to find your secret agents based on one-word clues.',
    players: '4-12 Players',
    link: 'https://codenames.game/',
    color: 'from-red-500 to-rose-500',
  },
  {
    id: 'chess',
    name: 'Chess.com',
    emoji: '👑',
    desc: 'Challenge a room member to a classic chess duel, or watch others play.',
    players: '2 Players',
    link: 'https://www.chess.com/',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'ludo',
    name: 'Ludo King',
    emoji: '🎲',
    desc: 'The popular online board game of tokens, paths, and lucky dice rolls.',
    players: '2-6 Players',
    link: 'https://ludoking.com/',
    color: 'from-blue-500 to-cyan-500',
  },
];

const GameList = ({ onPropose }) => {
  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto max-w-4xl mx-auto w-full">
      <div className="text-center mb-8">
        <h2 className="font-display font-bold text-2xl text-white mb-2">🎮 Game Lounge</h2>
        <p className="text-white/40 text-sm">
          Select a browser game to suggest and vote with your group.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
        {games.map((game) => (
          <div
            key={game.id}
            className="glass-card overflow-hidden group hover:border-white/20 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Header with cover color gradient */}
            <div className={`h-24 bg-gradient-to-r ${game.color} p-4 flex items-end justify-between relative`}>
              <div className="absolute top-4 right-4 text-4xl transform group-hover:scale-110 transition-transform duration-300">
                {game.emoji}
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-black/30 text-white backdrop-blur-sm mb-1.5">
                  <FiUsers className="inline" /> {game.players}
                </span>
                <h3 className="font-display font-bold text-white text-lg drop-shadow-md">
                  {game.name}
                </h3>
              </div>
            </div>

            {/* Description and Actions */}
            <div className="p-4 flex-1 flex flex-col justify-between gap-4">
              <p className="text-white/60 text-xs leading-relaxed">
                {game.desc}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => onPropose(game)}
                  className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-primary-500/20 text-primary-300 border border-primary-500/20 hover:bg-primary-500 hover:text-white hover:border-transparent transition-all duration-200 flex items-center justify-center gap-1.5"
                >
                  <FiPlay size={12} />
                  Propose to Group
                </button>
                <a
                  href={game.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-lg text-xs font-medium bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  Quick Link
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameList;
