import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Play, Pause, SkipForward, Users, Timer } from 'lucide-react';
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
  const [timeLeft, setTimeLeft] = useState<number>(20);

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
      console.log("updated score")
      setStudents((current) =>
        current.map(p => p.id === playerId ? { ...p, score: newScore } : p)
      );
    });

    socket.on('timer', (time) => {
      console.log(time);
      setTimeLeft(time);
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
          <div className="h-screen  overflow-auto md:grid max-w-[90rem] mx-auto md:grid-rows-12 md:grid-cols-12 gap-2 border border-black p-2 bg-slate-100">

            <div className="bg-[#ffffff] h-fit md:h-full mb-3 rounded-xl shadow-lg border p-2 md:row-start-1 md:row-end-7 md:col-start-1 md:col-end-7 md:grid md:grid-rows-10">
              <div className="flex sm:flex-row justify-between items-start sm:items-center gap-4 mb-3 row-span-2">
                <div>
                  <h1 className="text-xl font-bold text-[#0d416b]">Game Control Panel</h1>
                  <p className="text-[#8c8c8c]">Game ID: {gameId}</p>
                </div>
                <div className="flex items-center border gap-2">
                  {questions.length > 0 && (
                    <>
                      {gameStatus === 'playing' ? (
                        <button
                          onClick={() => handleGameControl('pause')}
                          className="flex items-center gap-2 bg-[#ef4048] text-[#ffffff] px-2 py-2 rounded-lg hover:bg-[#ef4048]/90 transition-all duration-200 shadow-md"
                        >
                          <Pause className="w-5 h-5" />
                          Pause Game
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGameControl('start')}
                          className="flex items-center gap-2 bg-[#00aae7] text-[#ffffff] px-2 py-2 rounded-lg hover:bg-[#00aae7]/90 transition-all duration-200 shadow-md"
                        >
                          <Play className="w-5 h-5" />
                          Start Game
                        </button>
                      )}
                      <button
                        onClick={() => handleGameControl('next')}
                        className="flex items-center gap-2 bg-[#2368a0] text-[#ffffff] px-2 py-2 rounded-lg hover:bg-[#2368a0]/90 transition-all duration-200 shadow-md"
                      >
                        <SkipForward className="w-5 h-5" />
                        Next Question
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className=" rounded-lg row-span-8 overflow-hidden p-2 px-0">
                <div className="flex flex-row items-center justify-between gap-4 mb-2">
                  <div className='flex gap-2 items-center'>
                    <Users className="w-6 h-6 text-[#2368a0]" />
                    <h2 className="text-xl font-semibold text-[#0d416b]">
                      Students ({students.length})
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 bg-[#00aae7]/20 px-4 py-2 rounded-full">
                    <Timer className="w-5 h-5 text-[#00aae7]" />
                    <span className="text-[#0d416b] font-medium">{timeLeft}s</span>
                  </div>
                </div>
                {students.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 h-full overflow-scroll no-scrollbar pb-12">
                    {students.map((player) => (
                      <div
                        key={player.id}
                        className="bg-[#ffffff] py-2 px-1 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-[#2368a0]/20 p-2 rounded-full">
                            <Users className="w-5 h-5 text-[#2368a0]" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-[#232527]">{player.name}</h3>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[#8c8c8c] text-sm">Score:</span>
                              <span className="bg-[#00aae7]/20 text-[#0d416b] px-2 py-1 rounded-full text-sm font-medium">
                                {player.score}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="h-fit md:h-full mb-3 md:row-start-7 md:row-end-13 md:col-start-1 md:col-end-7 overflow-auto shadow-lg rounded-xl border">
              <QuestionForm />
            </div>
            <div className='h-fit md:h-full md:row-span-full md:col-start-7 md:col-end-13 overflow-scroll no-scrollbar pb-2'>
              <QuestionList />
            </div>
          </div>
  );
}