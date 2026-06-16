import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight, FiMapPin, FiUsers, FiZap, FiHeart, FiCompass } from 'react-icons/fi';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <FiMapPin className="text-neon-teal" size={24} />,
      title: 'Real Places',
      desc: 'Discover actual nearby spots — cafes, parks, viewpoints — based on your location.',
    },
    {
      icon: <FiUsers className="text-accent-400" size={24} />,
      title: 'Group Rooms',
      desc: 'Create rooms, invite friends with a code, and decide things together in real time.',
    },
    {
      icon: <FiZap className="text-neon-yellow" size={24} />,
      title: 'Instant Decisions',
      desc: 'Vote on games, movies, or hangout spots — no more "I don\'t know, you decide" loops.',
    },
    {
      icon: <FiHeart className="text-accent-500" size={24} />,
      title: 'Save Favourites',
      desc: 'Bookmark places you love and come back to them whenever the mood hits.',
    },
  ];

  return (
    <div className="min-h-screen bg-dark-900 bg-grid">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
            Built for your friend group
          </div>

          {/* Main heading */}
          <h1 className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl leading-tight mb-6 animate-slide-up">
            Stop asking.
            <br />
            <span className="text-gradient">Start going.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            The app that kills the "bhai kahan jaayein?" loop forever.
            Find places, plan hangouts, or just vibe with your squad — all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/explore" className="btn-primary text-lg !px-8 !py-4 flex items-center gap-2 group">
              <FiCompass size={20} />
              Explore Places
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </Link>
            <Link
              to={isAuthenticated ? '/create-room' : '/register'}
              className="btn-secondary text-lg !px-8 !py-4 flex items-center gap-2"
            >
              <FiUsers size={20} />
              Create a Room
            </Link>
          </div>
        </div>
      </section>

      {/* Mode Cards */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Mode 1 — Solo Place Finder */}
            <Link to="/explore" className="group block">
              <div className="glass-card p-8 h-full transition-all duration-500 hover:border-neon-teal/30 hover:shadow-glow-teal group-hover:-translate-y-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-neon-teal/10 flex items-center justify-center text-2xl">
                    📍
                  </div>
                  <div>
                    <span className="badge-teal text-xs">No account needed</span>
                  </div>
                </div>
                <h2 className="font-display font-bold text-2xl text-white mb-3">
                  Solo Place Finder
                </h2>
                <p className="text-white/40 leading-relaxed mb-6">
                  You're out with your squad and nobody can decide where to go.
                  Set your mood, group type, and distance — get real nearby spots instantly.
                  Cafes, parks, viewpoints, sunset spots — all with Google Maps directions.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['☕ Cafes', '🌊 Beaches', '🌅 Sunsets', '🍕 Food', '📚 Study Spots'].map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-lg bg-white/5 text-white/50 text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>

            {/* Mode 2 — Online Hangout Rooms */}
            <Link to={isAuthenticated ? '/create-room' : '/register'} className="group block">
              <div className="glass-card p-8 h-full transition-all duration-500 hover:border-primary-500/30 hover:shadow-glow-purple group-hover:-translate-y-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-2xl">
                    🏠
                  </div>
                  <div>
                    <span className="badge-purple text-xs">Account required</span>
                  </div>
                </div>
                <h2 className="font-display font-bold text-2xl text-white mb-3">
                  Online Hangout Rooms
                </h2>
                <p className="text-white/40 leading-relaxed mb-6">
                  Friends aren't together physically? Create a room, share the code.
                  Decide what to do as a group — play a game, watch a movie,
                  plan an outing, or study together with a shared Pomodoro timer.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['🎮 Play', '🎬 Watch', '📍 Plan', '📚 Study', '💬 Chat'].map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-lg bg-white/5 text-white/50 text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              Why <span className="text-gradient">Where To?</span>
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Because every friend group deserves better than 47 messages that end with "chal tu hi decide kar."
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card-hover p-6 text-center"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">📍</span>
            <span className="font-display font-bold text-gradient">Where To?</span>
          </div>
          <p className="text-white/30 text-sm">
            Built with ❤️ for indecisive friend groups everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
