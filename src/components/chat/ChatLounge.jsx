import { FiUsers } from 'react-icons/fi';

const ChatLounge = ({ socket, roomId, isHost, onlineUsers = [] }) => {
  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto max-w-5xl mx-auto w-full justify-center items-center relative min-h-[500px]">
      
      {/* Background ambient glowing circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/3 left-1/3 w-[250px] h-[250px] bg-accent-500/10 rounded-full blur-[80px] animate-bounce-slow" />
      </div>

      <div className="text-center mb-8 relative z-10">
        <h2 className="font-display font-bold text-2xl text-white mb-2 flex items-center justify-center gap-2">
          <span>💬</span> Just Chat
        </h2>
        <p className="text-white/40 text-sm max-w-md mx-auto">
          Hang out with the squad, chat, and chill.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex justify-center w-full relative z-10">
        
        {/* Presence / Online Members Panel */}
        <div className="glass-card p-6 border-white/5 w-full max-w-xs h-[320px] flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-white text-sm flex items-center gap-2 mb-4">
              <FiUsers size={16} className="text-primary-400" />
              <span>Squad Presence</span>
            </h3>
            
            <div className="space-y-3 overflow-y-auto max-h-[190px] pr-1">
              {onlineUsers.length === 0 ? (
                <p className="text-white/20 text-xs italic">Waiting for others to join...</p>
              ) : (
                onlineUsers.map((user) => (
                  <div key={user.socketId || user.userId} className="flex items-center gap-2.5 bg-white/3 border border-white/5 p-2 rounded-xl">
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                        {user.username[0]}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-neon-green border-2 border-dark-900 rounded-full" />
                    </div>
                    <span className="text-white text-xs font-medium truncate">{user.username}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-[10px] text-white/30 flex items-center justify-between">
            <span>Online: {onlineUsers.length}</span>
            <span className="w-2 h-2 bg-neon-green rounded-full animate-ping" />
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ChatLounge;

