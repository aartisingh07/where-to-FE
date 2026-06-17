import { useState, useEffect } from 'react';
import OutingFilters from './OutingFilters';
import OutingResults from './OutingResults';
import { toast } from 'react-toastify';

const OutingLounge = ({ socket, roomId, isHost, onPropose }) => {
  const [submissions, setSubmissions] = useState([]);
  const [places, setPlaces] = useState([]);
  const [midpoint, setMidpoint] = useState(null);
  const [mood, setMood] = useState('chill');
  const [radius, setRadius] = useState(5000);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!socket || !roomId) return;

    // Fetch initial state
    socket.emit('get-outing-state', { roomId });

    socket.on('outing-state-update', ({ submissions: subs }) => {
      setSubmissions(subs || []);
    });

    socket.on('outing-places-found', ({ places: foundPlaces, midpoint: mid, mood: m, radius: r }) => {
      setPlaces(foundPlaces || []);
      setMidpoint(mid);
      setMood(m);
      setRadius(r);
      setLoading(false);
      toast.success('🎯 Midpoint calculated and places found!');
    });

    socket.on('outing-error', ({ message }) => {
      toast.error(message || 'Error occurred during calculation');
      setLoading(false);
    });

    return () => {
      socket.off('outing-state-update');
      socket.off('outing-places-found');
      socket.off('outing-error');
    };
  }, [socket, roomId]);

  const handleFindPlaces = () => {
    setLoading(true);
    socket?.emit('find-outing-places', { roomId });
  };

  const handleReset = () => {
    setPlaces([]);
    setMidpoint(null);
    socket?.emit('clear-outing-state', { roomId });
    toast.info('Preferences cleared. Set your location again.');
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="font-display font-bold text-white text-base mb-1">Calculating Midpoint Centroid...</p>
        <p className="text-white/40 text-xs">Finding matching spots fair to all squad members.</p>
      </div>
    );
  }

  return midpoint && places.length > 0 ? (
    <OutingResults
      places={places}
      midpoint={midpoint}
      mood={mood}
      radius={radius}
      onPropose={onPropose}
      onReset={handleReset}
      isHost={isHost}
    />
  ) : (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto max-w-4xl mx-auto w-full justify-center">
      <div className="text-center mb-8 flex-shrink-0">
        <h2 className="font-display font-bold text-2xl text-white mb-2">📍 Outing Lounge</h2>
        <p className="text-white/40 text-sm">
          Plan an outing! Everyone shares their location to find a midpoint spot fair to all.
        </p>
      </div>
      <OutingFilters
        socket={socket}
        roomId={roomId}
        isHost={isHost}
        submissions={submissions}
        onFindPlaces={handleFindPlaces}
      />
    </div>
  );
};

export default OutingLounge;
