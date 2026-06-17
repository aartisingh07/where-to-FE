import PomodoroTimer from './PomodoroTimer';
import TodoList from './TodoList';

const StudyLounge = ({ socket, roomId }) => {
  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto max-w-5xl mx-auto w-full justify-center">
      <div className="text-center mb-8 flex-shrink-0">
        <h2 className="font-display font-bold text-2xl text-white mb-2">📚 Study Lounge</h2>
        <p className="text-white/40 text-sm">
          Run Pomodoro cycles together with your squad and check off your study goals.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-stretch justify-center pb-8">
        <div className="flex-1 flex items-center justify-center">
          <PomodoroTimer socket={socket} roomId={roomId} />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <TodoList />
        </div>
      </div>
    </div>
  );
};

export default StudyLounge;
