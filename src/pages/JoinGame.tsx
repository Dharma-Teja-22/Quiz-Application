import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useGameStore } from '../store/gameStore';
import { ArrowRight } from 'lucide-react';

export default function JoinGame() {
  const navigate = useNavigate();
  const socket = useSocket();
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

    socket.emit('join-game', { gameId, playerName: name }, (response: { success: boolean, error?: string }) => {
      if (response.success) {
        setPlayerName(name);
        navigate(`/play/${gameId}`);
      } else {
        setError(response.error || 'Failed to join game');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Join Game</h1>
        
        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label htmlFor="gameId" className="block text-sm font-medium text-gray-700 mb-1">
              Game Code
            </label>
            <input
              type="text"
              id="gameId"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter game code"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your name"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Join Game
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}