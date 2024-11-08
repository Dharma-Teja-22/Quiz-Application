import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Play, Pause, SkipForward, Users } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import QuestionForm from '../components/QuestionForm';
import QuestionList from '../components/QuestionList';

interface Player {
  id: string;
  name: string;
  score: number;
}

export default function AdminGame() {
  const { gameId } = useParams();
  const socket = useSocket();
  const [students, setStudents] = useState<Player[]>([]);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const setGameStatus = useGameStore((state) => state.setGameStatus);
  const questions = useGameStore((state) => state.questions);

  useEffect(() => {
    if (!socket) return;

    socket.emit('create-game', { gameId, questions });

    socket.on('player-joined', (playerData) => {
      setStudents((current) => [...current, playerData]);
    });

    socket.on('player-left', (playerId) => {
      setStudents((current) => current.filter(p => p.id !== playerId));
    });

    socket.on('score-update', ({ playerId, newScore }) => {
      setStudents((current) =>
        current.map(p => p.id === playerId ? { ...p, score: newScore } : p)
      );
    });

    return () => {
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('score-update');
    };
  }, [socket, gameId, questions]);

  const handleGameControl = (action: 'start' | 'pause' | 'next') => {
    console.log(questions.length,socket)
    if (!socket || questions.length === 0) return;

    switch (action) {
      case 'start':
        socket.emit('game-action', { gameId, action: 'start' });
        setGameStatus('playing');
        break;
      case 'pause':
        socket.emit('game-action', { gameId, action: 'pause' });
        setGameStatus('paused');
        break;
      case 'next':
        socket.emit('game-action', { gameId, action: 'next' });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-[#ffffff] rounded-lg shadow-lg p-4 sm:p-6 border border-[#b7b2b3]/20">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
                <div>
                  <h1 className="text-2xl font-bold text-[#0d416b]">Game Control Panel</h1>
                  <p className="text-[#8c8c8c]">Game ID: {gameId}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  {questions.length > 0 && (
                    <>
                      {gameStatus === 'playing' ? (
                        <button
                          onClick={() => handleGameControl('pause')}
                          className="flex items-center gap-2 bg-[#2368a0] text-[#ffffff] px-4 py-2 rounded-lg hover:bg-[#0d416b] transition-colors duration-200"
                        >
                          <Pause className="w-5 h-5" />
                          Pause Game
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGameControl('start')}
                          className="flex items-center gap-2 bg-[#00aae7] text-[#ffffff] px-4 py-2 rounded-lg hover:bg-[#2368a0] transition-colors duration-200"
                        >
                          <Play className="w-5 h-5" />
                          Start Game
                        </button>
                      )}
                      <button
                        onClick={() => handleGameControl('next')}
                        className="flex items-center gap-2 bg-[#0d416b] text-[#ffffff] px-4 py-2 rounded-lg hover:bg-[#2368a0] transition-colors duration-200"
                      >
                        <SkipForward className="w-5 h-5" />
                        Next Question
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-[#f5f5f5] rounded-lg p-4 sm:p-6 border border-[#b7b2b3]/20">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-[#2368a0]" />
                  <h2 className="text-xl font-semibold text-[#0d416b]">
                    Students ({students.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {students.map((player) => (
                    <div
                      key={player.id}
                      className="bg-[#ffffff] p-4 rounded-lg shadow border border-[#b7b2b3]/25"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-[#232527]">{player.name}</span>
                        <span className="bg-[#00aae7]/10 text-[#0d416b] px-3 py-1 rounded-full text-sm font-semibold">
                          Score: {player.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <QuestionForm />
            <QuestionList />
          </div>
        </div>
      </div>
    </div>
  );
}