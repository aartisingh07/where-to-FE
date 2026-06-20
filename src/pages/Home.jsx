import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiArrowRight, FiMapPin, FiUsers, FiZap, FiHeart,
  FiCompass, FiHash, FiUser, FiSunrise, FiExternalLink, FiClock
} from 'react-icons/fi';
import { outingPlanService } from '../services/outingPlanService';

// ─── Logged-OUT landing page ────────────────────────────────────
const GuestHome = () => {
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
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
            Built for your friend group
          </div>

          <h1 className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl leading-tight mb-6 animate-slide-up">
            Stop asking.
            <br />
            <span className="text-gradient">Start going.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            The app that kills the "bhai kahan jaayein?" loop forever.
            Find places, plan hangouts, or just vibe with your squad — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/explore" className="btn-primary text-lg !px-8 !py-4 flex items-center gap-2 group">
              <FiCompass size={20} />
              Explore Places
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </Link>
            <Link to="/register" className="btn-secondary text-lg !px-8 !py-4 flex items-center gap-2">
              <FiUsers size={20} />
              Create an account
            </Link>
          </div>
        </div>
      </section>

      {/* Mode Cards */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          <Link to="/explore" className="group block">
            <div className="glass-card p-8 h-full transition-all duration-500 hover:border-neon-teal/30 hover:shadow-glow-teal group-hover:-translate-y-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-neon-teal/10 flex items-center justify-center text-2xl">📍</div>
                <span className="badge-teal text-xs">No account needed</span>
              </div>
              <h2 className="font-display font-bold text-2xl text-white mb-3">Solo Place Finder</h2>
              <p className="text-white/40 leading-relaxed mb-6">
                You're out with your squad and nobody can decide where to go.
                Set your mood and distance — get real nearby spots instantly.
              </p>
              <div className="flex flex-wrap gap-2">
                {['☕ Cafes', '🌊 Beaches', '🌅 Sunsets', '🍕 Food', '📚 Study Spots'].map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-lg bg-white/5 text-white/50 text-sm">{tag}</span>
                ))}
              </div>
            </div>
          </Link>

          <Link to="/register" className="group block">
            <div className="glass-card p-8 h-full transition-all duration-500 hover:border-primary-500/30 hover:shadow-glow-purple group-hover:-translate-y-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-2xl">🏠</div>
                <span className="badge-purple text-xs">Sign up to unlock</span>
              </div>
              <h2 className="font-display font-bold text-2xl text-white mb-3">Online Hangout Rooms</h2>
              <p className="text-white/40 leading-relaxed mb-6">
                Friends aren't together? Create a room, share the code.
                Play games, watch movies, plan outings, or study together — all in real time.
              </p>
              <div className="flex flex-wrap gap-2">
                {['🎮 Play', '🎬 Watch', '📍 Plan', '📚 Study', '💬 Chat'].map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-lg bg-white/5 text-white/50 text-sm">{tag}</span>
                ))}
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              Why <span className="text-gradient">Where To?</span>
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Because every friend group deserves better than 47 messages that end with "chal tu hi decide kar."
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="glass-card-hover p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-2">{feature.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center glass-card p-10">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-3">
            Ready to stop asking?
          </h2>
          <p className="text-white/40 mb-8">Create a free account and start deciding.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="btn-primary flex items-center gap-2">
              <FiUser size={16} />
              Sign up — it's free
            </Link>
            <Link to="/login" className="btn-ghost">
              Already have an account →
            </Link>
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
          <p className="text-white/30 text-sm">Built with ❤️ for indecisive friend groups everywhere.</p>
        </div>
      </footer>
    </div>
  );
};

// ─── Logged-IN dashboard ────────────────────────────────────────
const UserHome = ({ user }) => {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
    'Good evening';

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await outingPlanService.getMyPlans();
        setPlans(data);
      } catch (err) {
        console.error('Failed to fetch scheduled outings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const getCountdownString = (dateTimeString) => {
    const diff = new Date(dateTimeString) - new Date();
    if (diff <= 0) return 'Happening now!';
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `Starts in ${days} day${days > 1 ? 's' : ''} ${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `Starts in ${hours} hour${hours > 1 ? 's' : ''} ${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`;
    } else {
      return `Starts in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  };

  const quickActions = [
    {
      emoji: '📍',
      label: 'Find a place',
      desc: 'Discover spots near you right now',
      to: '/explore',
      color: 'hover:border-neon-teal/30 hover:shadow-glow-teal',
      badge: <span className="badge-teal text-xs">No code needed</span>,
    },
    {
      emoji: '🏠',
      label: 'Create a room',
      desc: 'Start a hangout, invite your squad',
      to: '/create-room',
      color: 'hover:border-primary-500/30 hover:shadow-glow-purple',
      badge: <span className="badge-purple text-xs">Real-time</span>,
    },
    {
      emoji: '🔑',
      label: 'Join a room',
      desc: 'Enter a 6-digit code to join friends',
      to: '/join-room',
      color: 'hover:border-accent-500/30 hover:shadow-glow-pink',
      badge: <span className="badge-pink text-xs">Use code</span>,
    },
    {
      emoji: '❤️',
      label: 'Saved places',
      desc: 'View your bookmarked spots',
      to: '/profile',
      color: 'hover:border-neon-orange/30',
      badge: <span className="badge bg-neon-orange/20 text-neon-orange border border-neon-orange/20 text-xs">Your list</span>,
    },
  ];

  return (
    <div className="min-h-screen bg-dark-900 bg-grid">
      {/* Greeting hero */}
      <section className="relative pt-28 pb-12 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-accent-500/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Greeting row */}
          <div className="flex items-center gap-4 mb-6 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-0.5 flex-shrink-0">
              <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center overflow-hidden">
                {user?.avatar
                  ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  : <FiUser size={24} className="text-white/40" />}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-white/40 text-sm mb-1">
                <FiSunrise size={14} />
                <span>{greeting}</span>
              </div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
                {user?.username} 👋
              </h1>
            </div>
          </div>

          {/* Sub-heading */}
          <p className="text-white/40 text-lg mb-2 animate-slide-up">
            So... <span className="text-gradient font-semibold">where to?</span>
          </p>
          <p className="text-white/25 text-sm mb-10">Pick what you want to do today.</p>

          {/* Quick Actions grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up">
            {quickActions.map((action) => (
              <Link key={action.to} to={action.to} className="group block">
                <div className={`glass-card p-6 flex items-center gap-4 transition-all duration-300 ${action.color} group-hover:-translate-y-1`}>
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    {action.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-display font-semibold text-white">{action.label}</p>
                      {action.badge}
                    </div>
                    <p className="text-white/40 text-sm truncate">{action.desc}</p>
                  </div>
                  <FiArrowRight className="text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all flex-shrink-0" size={18} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Scheduled Outings */}
      <section className="py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
            <span>📅</span> Upcoming Outings
          </h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-white/20 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : plans.length === 0 ? (
            <div className="glass-card p-6 text-center text-white/30 text-sm">
              No scheduled outings yet. Propose one in an outing lounge!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <div key={plan._id} className="glass-card p-5 border-neon-green/10 hover:border-neon-green/30 shadow-glow-green-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-neon-green">
                        Confirmed Outing
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-white/40 font-medium">
                        <FiClock size={11} className="text-neon-green animate-pulse" />
                        <span>{getCountdownString(plan.dateTime)}</span>
                      </div>
                    </div>

                    <h3 className="font-display font-bold text-white text-base mb-1 truncate">
                      {plan.placeName}
                    </h3>
                    {plan.address && (
                      <p className="text-white/40 text-xs line-clamp-2 mb-3 leading-relaxed">
                        📍 {plan.address}
                      </p>
                    )}
                    <p className="text-white/60 text-xs font-medium mb-4 flex items-center gap-1.5">
                      <span>⏰</span>
                      {new Date(plan.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-auto">
                    <span className="text-[10px] text-white/30">
                      Room: <span className="font-semibold text-white/50">{plan.roomName || 'Hangout'}</span>
                    </span>
                    {plan.mapsLink && (
                      <a
                        href={plan.mapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-neon-green hover:underline flex items-center gap-1 font-semibold"
                      >
                        Get Directions
                        <FiExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Activity strip */}
      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-6">
            <p className="text-white/30 text-xs uppercase tracking-widest font-semibold mb-4">Today's mood?</p>
            <div className="flex flex-wrap gap-3">
              {[
                { emoji: '😌', label: 'Chill', mood: 'chill' },
                { emoji: '🍕', label: 'Foodie', mood: 'foodie' },
                { emoji: '🧗', label: 'Adventure', mood: 'adventure' },
                { emoji: '🌅', label: 'Romantic', mood: 'romantic' },
                { emoji: '📚', label: 'Study', mood: 'study' },
              ].map((m) => (
                <Link
                  key={m.mood}
                  to={`/explore`}
                  state={{ mood: m.mood }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 
                             text-white/60 text-sm hover:bg-primary-500/10 hover:border-primary-500/20 
                             hover:text-primary-300 transition-all duration-200"
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-4 mt-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span className="font-display font-bold text-gradient">Where To?</span>
          </div>
          <p className="text-white/20 text-sm">Built with ❤️ for indecisive friend groups.</p>
        </div>
      </footer>
    </div>
  );
};

// ─── Root: switch between Guest and User views ───────────────────
const Home = () => {
  const { isAuthenticated, user } = useAuth();
  return isAuthenticated ? <UserHome user={user} /> : <GuestHome />;
};

export default Home;
