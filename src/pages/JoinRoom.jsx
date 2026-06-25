import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHash, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { roomService } from '../services/roomService';

const JoinRoom = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [activeRooms, setActiveRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const inputs = useRef([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const rooms = await roomService.getMyRooms();
        setActiveRooms(rooms || []);
      } catch (err) {
        console.error('Failed to fetch user rooms:', err);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);


  const handleChange = (index, value) => {
    const v = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!v && !code[index]) return;

    const newCode = [...code];
    newCode[index] = v.slice(-1);
    setCode(newCode);

    // Auto-advance
    if (v && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (code[index]) {
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      } else if (index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const newCode = [...code];
    pasted.split('').forEach((char, i) => { newCode[i] = char; });
    setCode(newCode);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleJoin = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      toast.error('Enter the full 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const room = await roomService.joinRoom(fullCode);
      toast.success(`Joined ${room.name || 'room'}! 🎉`);
      navigate(`/room/${room._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired code');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 bg-grid flex items-center justify-center px-4 pt-16">
      <div className="fixed top-20 right-1/4 w-80 h-80 bg-accent-500/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-20 left-1/4 w-80 h-80 bg-primary-500/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card p-8 animate-slide-up text-center">
          <div className="text-5xl mb-4">🔑</div>
          <h1 className="font-display font-bold text-2xl text-white mb-2">Join a Room</h1>
          <p className="text-white/40 text-sm mb-10">
            Enter the 6-character code your friend shared
          </p>

          {/* OTP-style code input */}
          <div className="flex justify-center gap-2 mb-8" onPaste={handlePaste}>
            {code.map((char, i) => (
              <input
                key={i}
                ref={(el) => (inputs.current[i] = el)}
                type="text"
                inputMode="text"
                maxLength={1}
                value={char}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-12 h-14 rounded-xl text-center text-xl font-display font-bold
                  bg-dark-800 border-2 text-white outline-none transition-all duration-200
                  ${char
                    ? 'border-primary-500 text-primary-300'
                    : 'border-white/10 focus:border-primary-500/50'
                  }`}
              />
            ))}
          </div>

          <button
            onClick={handleJoin}
            disabled={loading || code.join('').length < 6}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FiHash size={18} />
                Join Room
                <FiArrowRight size={16} />
              </>
            )}
          </button>

          <p className="text-white/20 text-xs mt-4">
            The code is 6 characters — letters and numbers only
          </p>

          {/* Recent active rooms section */}
          {!loadingRooms && activeRooms.length > 0 && (
            <div className="mt-10 border-t border-white/5 pt-8 text-left animate-slide-up">
              <h3 className="font-display font-semibold text-white/50 text-xs uppercase tracking-wider mb-4 pl-1 flex items-center gap-1.5">
                <span>🏠</span> Recent active lobbies
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {activeRooms.map((room) => {
                  const isHost = room.host?._id === room.members.find(m => m === room.host?._id) || false; // wait, simple host tag check is fine
                  return (
                    <button
                      key={room._id}
                      onClick={() => navigate(`/room/${room._id}`)}
                      className="w-full text-left bg-white/3 border border-white/5 p-4 rounded-xl hover:border-primary-500/30 hover:bg-white/5 transition-all duration-300 flex items-center justify-between group cursor-pointer"
                    >
                      <div className="min-w-0 pr-3">
                        <p className="font-display font-semibold text-white text-sm truncate">
                          {room.name}
                        </p>
                        <p className="text-white/30 text-xs mt-1 truncate">
                          Code: <span className="font-mono text-primary-300 font-bold">{room.code}</span> · Host: {room.host?.username || 'You'}
                        </p>
                      </div>
                      <FiArrowRight
                        className="text-white/20 group-hover:text-primary-300 group-hover:translate-x-1 transition-all flex-shrink-0"
                        size={16}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
