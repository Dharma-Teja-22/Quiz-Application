import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { ArrowRight } from 'lucide-react';

export default function CreateGame() {
  const navigate = useNavigate();
  const [gameId, setGameId] = useState('');
  const [error, setError] = useState('');
  const setIsAdmin = useGameStore((state) => state.setIsAdmin);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gameId.trim()) {
      setError('Please enter a game ID');
      return;
    }

    setIsAdmin(true);
    navigate(`/admin/${gameId}`);
  };

  return (
    <div className="min-h-full bg-[#EEF7FF] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg p-8 shadow-xl border border-gray-200">
        <h1 className="text-2xl font-bold text-miracle-darkBlue mb-6">Create New Quiz</h1>
        
        <form onSubmit={handleCreate} className="space-y-6">
          <div>
            <label htmlFor="gameId" className="block text-sm font-medium text-miracle-darkGrey mb-1">
              Quiz ID
            </label>
            <input
              type="text"
              id="gameId"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              placeholder="Enter a unique game ID"
            />
            <p className="mt-1 text-sm text-miracle-darkGrey">
              This ID will be used by students to join your Quiz
            </p>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-miracle-darkBlue text-white py-3 rounded-lg font-semibold hover:bg-miracle-darkBlue/70 transition-colors"
          >
            Create Quiz
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}