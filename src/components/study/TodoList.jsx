import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const TodoList = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const storageKey = `whereto_todos_${user?._id || 'guest'}`;

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse saved todos:', err);
      }
    }
  }, [storageKey]);

  // Save to localStorage when todos state changes
  const saveTodos = (newTodos) => {
    setTodos(newTodos);
    localStorage.setItem(storageKey, JSON.stringify(newTodos));
  };

  const handleAdd = () => {
    if (!input.trim()) return;

    const newTodo = {
      id: Date.now().toString(),
      text: input.trim(),
      completed: false,
    };

    saveTodos([...todos, newTodo]);
    setInput('');
  };

  const handleToggle = (id) => {
    const updated = todos.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTodos(updated);
  };

  const handleDelete = (id) => {
    const filtered = todos.filter((t) => t.id !== id);
    saveTodos(filtered);
  };

  return (
    <div className="glass-card p-6 w-full max-w-sm mx-auto flex flex-col justify-start min-h-[350px] relative">
      <div className="flex items-center gap-1.5 mb-4 border-b border-white/5 pb-3 justify-between">
        <h3 className="font-display font-semibold text-white text-sm">📝 Personal Tasks</h3>
        <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-white/40">
          {todos.filter((t) => !t.completed).length} remaining
        </span>
      </div>

      {/* Task input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="What are you studying?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          maxLength={80}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs
                     placeholder-white/25 focus:outline-none focus:border-primary-500/40 focus:bg-white/8
                     transition-all"
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="w-8 h-8 rounded-xl bg-primary-500/20 border border-primary-500/25 flex items-center justify-center
                     text-primary-300 hover:bg-primary-500 hover:text-white hover:border-transparent transition-all duration-200 disabled:opacity-30"
        >
          <FiPlus size={14} />
        </button>
      </div>

      {/* List items */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[240px]">
        {todos.length === 0 ? (
          <p className="text-white/20 text-xs italic text-center py-8">No tasks yet. Plan your goals!</p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 group
                ${todo.completed
                  ? 'bg-white/1 border-white/3 text-white/30'
                  : 'bg-white/3 border-white/5 text-white/80 hover:border-white/10'
                }`}
            >
              <div
                onClick={() => handleToggle(todo.id)}
                className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
              >
                {/* Custom check marker */}
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200
                    ${todo.completed
                      ? 'bg-neon-green border-neon-green text-black'
                      : 'border-white/20 text-transparent hover:border-primary-500'
                    }`}
                >
                  <FiCheck size={10} className="stroke-[3]" />
                </div>
                <span className={`text-xs truncate ${todo.completed ? 'line-through' : ''}`}>
                  {todo.text}
                </span>
              </div>

              <button
                onClick={() => handleDelete(todo.id)}
                className="text-white/20 hover:text-red-400 p-1 rounded transition-colors"
                title="Delete Task"
              >
                <FiTrash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList;
