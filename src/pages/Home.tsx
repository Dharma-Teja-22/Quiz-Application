import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Users } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">QuizMaster</h1>
          <p className="text-white/80">Create or join interactive quizzes in real-time!</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/create')}
            className="w-full flex items-center justify-center gap-3 bg-white text-purple-600 p-4 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
          >
            <Gamepad2 className="w-5 h-5" />
            Create New Game
          </button>
          
          <button
            onClick={() => navigate('/join')}
            className="w-full flex items-center justify-center gap-3 bg-purple-700 text-white p-4 rounded-lg font-semibold hover:bg-purple-800 transition-colors"
          >
            <Users className="w-5 h-5" />
            Join Game
          </button>
        </div>
      </div>
    </div>
  );
}