import { useEffect, useState } from 'react';
import { FiPlay, FiPause, FiRotateCcw, FiCoffee, FiBookOpen } from 'react-icons/fi';
import { toast } from 'react-toastify';

const PomodoroTimer = ({ socket, roomId }) => {
  const [timerState, setTimerState] = useState({
    timeLeft: 1500,
    duration: 1500,
    isRunning: false,
    mode: 'work',
    workDuration: 1500,
    breakDuration: 300,
  });

  const handleSetDuration = (workMin, breakMin) => {
    socket?.emit('set-timer-duration', {
      roomId,
      workDuration: workMin,
      breakDuration: breakMin,
    });
  };

  useEffect(() => {
    if (!socket || !roomId) return;

    // Get current timer state from server
    socket.emit('get-timer-state', { roomId });

    socket.on('timer-update', (state) => {
      setTimerState(state);
    });

    socket.on('timer-cycle-complete', ({ mode }) => {
      toast.success(
        mode === 'work'
          ? '💪 Break finished! Time to lock in!'
          : '☕ Work session complete! Take a break.'
      );
    });

    return () => {
      socket.off('timer-update');
      socket.off('timer-cycle-complete');
    };
  }, [socket, roomId]);

  const handleStart = () => {
    socket?.emit('start-timer', { roomId });
  };

  const handlePause = () => {
    socket?.emit('pause-timer', { roomId });
  };

  const handleReset = () => {
    socket?.emit('reset-timer', { roomId });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const { timeLeft, duration, isRunning, mode, workDuration, breakDuration } = timerState;

  // Calculate SVG stroke offset
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const percentage = duration > 0 ? (timeLeft / duration) : 0;
  const strokeDashoffset = circumference - percentage * circumference;

  const isWork = mode === 'work';

  return (
    <div className="glass-card p-6 flex flex-col items-center text-center justify-center max-w-sm w-full mx-auto relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] pointer-events-none transition-all duration-500
        ${isWork ? 'bg-primary-500/10' : 'bg-neon-teal/10'}`}
      />

      <div className="flex items-center gap-1.5 mb-6">
        {isWork ? (
          <span className="inline-flex items-center gap-1 bg-primary-500/15 border border-primary-500/25 text-primary-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <FiBookOpen size={10} /> Focus Session
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 bg-neon-teal/15 border border-neon-teal/25 text-neon-teal text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <FiCoffee size={10} /> Short Break
          </span>
        )}
      </div>

      {/* SVG Progress Ring */}
      <div className="relative w-52 h-52 mb-6">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* Background track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="8"
          />
          {/* Active progress */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke={isWork ? '#7c3aed' : '#0df2c9'}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>

        {/* Center Countdown Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-mono font-black text-white tracking-tight leading-none mb-1">
            {formatTime(timeLeft)}
          </span>
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
            {isRunning ? 'Locked In' : 'Paused'}
          </span>
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center gap-4 relative z-10 w-full justify-center">
        <button
          onClick={handleReset}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/55 hover:bg-white/10 hover:text-white transition-all duration-200"
          title="Reset Timer"
        >
          <FiRotateCcw size={15} />
        </button>

        {!isRunning ? (
          <button
            onClick={handleStart}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-glow-sm transition-all duration-200 transform hover:scale-105 active:scale-95
              ${isWork
                ? 'bg-primary-500 hover:bg-primary-600 hover:shadow-glow-purple'
                : 'bg-neon-teal hover:bg-emerald-500 hover:shadow-glow-green'}`}
            title="Start Timer"
          >
            <FiPlay size={20} className="ml-0.5" />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/15 transition-all duration-200 transform hover:scale-105 active:scale-95"
            title="Pause Timer"
          >
            <FiPause size={20} />
          </button>
        )}
      </div>
      {/* Custom Duration Configuration */}
      <div className="mt-8 pt-4 border-t border-white/5 flex gap-4 w-full justify-center relative z-10">
        <div className="flex flex-col items-start gap-1">
          <label className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Work Session</label>
          <select
            value={Math.round((workDuration || 1500) / 60)}
            onChange={(e) => handleSetDuration(parseInt(e.target.value), Math.round((breakDuration || 300) / 60))}
            className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-white text-xs outline-none focus:border-primary-500/40 focus:bg-dark-800 transition-all cursor-pointer"
          >
            <option value="5" className="bg-dark-800 text-white">5 mins</option>
            <option value="10" className="bg-dark-800 text-white">10 mins</option>
            <option value="15" className="bg-dark-800 text-white">15 mins</option>
            <option value="25" className="bg-dark-800 text-white">25 mins</option>
            <option value="40" className="bg-dark-800 text-white">40 mins</option>
            <option value="60" className="bg-dark-800 text-white">60 mins</option>
          </select>
        </div>

        <div className="flex flex-col items-start gap-1">
          <label className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Break Session</label>
          <select
            value={Math.round((breakDuration || 300) / 60)}
            onChange={(e) => handleSetDuration(Math.round((workDuration || 1500) / 60), parseInt(e.target.value))}
            className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-white text-xs outline-none focus:border-primary-500/40 focus:bg-dark-800 transition-all cursor-pointer"
          >
            <option value="3" className="bg-dark-800 text-white">3 mins</option>
            <option value="5" className="bg-dark-800 text-white">5 mins</option>
            <option value="10" className="bg-dark-800 text-white">10 mins</option>
            <option value="15" className="bg-dark-800 text-white">15 mins</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
