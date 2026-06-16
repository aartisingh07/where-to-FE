const Room = () => {
  return (
    <div className="min-h-screen bg-dark-900 bg-grid pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="glass-card p-12 animate-slide-up">
          <h1 className="font-display font-bold text-3xl text-white mb-3">
            🏠 Hangout Room
          </h1>
          <p className="text-white/40 max-w-md mx-auto mb-2">
            Real-time chat, voting, and activities with your squad.
          </p>
          <p className="text-primary-400 text-sm font-medium">
            🚧 Coming in Phase 3
          </p>
        </div>
      </div>
    </div>
  );
};

export default Room;
