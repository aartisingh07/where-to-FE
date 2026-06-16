import { FiUsers } from 'react-icons/fi';

const CreateRoom = () => {
  return (
    <div className="min-h-screen bg-dark-900 bg-grid pt-24 pb-12 px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="glass-card p-12 animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-6">
            <FiUsers className="text-primary-400" size={32} />
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-3">
            Create a Room
          </h1>
          <p className="text-white/40 max-w-md mx-auto mb-2">
            Start a hangout room and invite your friends with a 6-digit code.
          </p>
          <p className="text-primary-400 text-sm font-medium">
            🚧 Coming in Phase 3 — Room System with Socket.io
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
