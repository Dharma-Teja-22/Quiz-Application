import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useSocket } from '../context/SocketContext';
import { useGameStore } from '../store/gameStore';
import { ArrowRight } from 'lucide-react';
import { SocketContext } from '../context/SocketContext';


export default function JoinGame() {
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const [gameId, setGameId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const setPlayerName = useGameStore((state) => state.setPlayerName);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId.trim() || !name.trim()) {
      setError('Please fill in all fields');
      return;
    }

    socket && socket.emit('join-quiz', { gameId, playerName: name }, (response: { success: boolean, error?: string }) => {
      if (response.success) {
        setPlayerName(name);
        navigate(`/play/${gameId}`);
      } else {
        setError(response.error || 'Failed to join quiz');
      }
    });
  };

  return (
    <div className="min-h-full bg-[#EEF7FF] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 shadow-xl p-8">
        <h1 className="text-2xl font-bold text-miracle-darkBlue mb-6">Join quiz</h1>
        
        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label htmlFor="gameId" className="block text-sm font-medium text-miracle-darkGrey mb-1">
              Quiz Code
            </label>
            <input
              type="text"
              id="gameId"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
              placeholder="Enter Quiz code"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-miracle-darkGrey mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-transparent"
              placeholder="Enter your name"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-miracle-darkBlue hover:bg-miracle-darkBlue/70 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Join Quiz
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}