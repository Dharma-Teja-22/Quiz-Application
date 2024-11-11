import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import { useSocket } from '../context/SocketContext';
import { Play, Pause, SkipForward, Users, Timer } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import QuestionForm from '../components/QuestionForm';
import QuestionList from '../components/QuestionList';
import { SocketContext } from '../context/SocketContext';


interface Player {
  id: string;
  name: string;
  score: number;
}

export default function AdminGame() {
  const { gameId } = useParams();
  const socket = useContext(SocketContext);
  const [students, setStudents] = useState<Player[]>([]);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const setGameStatus = useGameStore((state) => state.setGameStatus);
  const questions = useGameStore((state) => state.questions);
  const [timeLeft, setTimeLeft] = useState<number>(20);

  useEffect(() => {
    if (!socket) return;

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
    <div className='h-screen bg-gradient-to-br from-miracle-darkBlue to-miracle-black '>
          <div className="overflow-auto w-full h-full lg:grid bg-opacity-10 backdrop-blur-lg backdrop-filter mx-auto lg:grid-rows-12 lg:grid-cols-12 gap-5 p-2 xl:p-8 rounded-xl">

            <div className="h-fit max-h-[500px] md:max-h-full mb-3 md:row-start-1 md:row-end-7 md:col-start-1 md:col-end-7 md:grid md:grid-rows-10 p-2 xl:p-5 rounded-xl bg-opacity-10 backdrop-blur-lg backdrop-filter shadow-xl bg-slate-100">
              <div className="flex flex-col md:flex-row justify-between items-start sm:items-center gap-4 mb-3 row-span-2">
                <div>
                  <h1 className="text-2xl font-bold text-miracle-white">Game Control Panel</h1>
                  <p className="text-miracle-lightGrey">Game ID: {gameId}</p>
                </div>
                <div className="flex items-start h-full gap-2">
                  {questions.length > 0 && (
                    <>
                      {gameStatus === 'playing' ? (
                        <button
                          onClick={() => handleGameControl('pause')}
                          className="flex items-center gap-2 bg-miracle-red/80 text-[#ffffff] px-2 py-2 rounded-full hover:bg-[#ef4048]/90 transition-all duration-200 shadow-md"
                        >
                          <Pause className="w-5 h-5" />
                          Pause Game
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGameControl('start')}
                          className="flex items-center gap-2 bg-[#00aae7] text-[#ffffff] px-2 py-2 rounded-full hover:bg-[#00aae7]/90 transition-all duration-200 shadow-md"
                        >
                          <Play className="w-5 h-5" />
                          Start Game
                        </button>
                      )}
                      <button
                        onClick={() => handleGameControl('next')}
                        className="flex items-center gap-2 bg-[#2368a0] text-[#ffffff] px-3 py-2 rounded-full hover:bg-[#2368a0]/90 transition-all duration-200 shadow-md"
                      >
                        <SkipForward className="w-5 h-5" />
                        Next Question
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="rounded-lg row-span-8 overflow-hidden p-2 px-0">
                <div className="flex flex-row items-center justify-between gap-4 mb-2">
                  <div className='flex gap-2 items-center'>
                    <Users className="w-5 h-5 text-miracle-white" />
                    <h2 className="text-md font-semibold text-miracle-white">
                      Students ({students.length})
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 bg-miracle-lightBlue/55 px-4 py-2 rounded-full">
                    <Timer className="w-5 h-5 text-miracle-white" />
                    <span className="text-miracle-white font-medium">{timeLeft}s</span>
                  </div>
                </div>
                {students.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 h-[300px] md:h-full overflow-scroll no-scrollbar pb-5 md:pb-12">
                    {students.map((player) => (
                      <div
                        key={player.id}
                        className="bg-[#ffffff] bg-opacity-10 backdrop-blur-lg backdrop-filter rounded-xl py-2 px-1 transition-all duration-200 hover:shadow-lg max-h-[70px]"
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-miracle-lightBlue/55 p-2 rounded-full">
                            <Users className="w-5 h-5 text-miracle-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-miracle-white">{player.name}</h3>
                            <div className="flex items-center mt-1">
                              <span className="text-[#d3d3d3] text-sm">Score:</span>
                              <span className="text-miracle-white px-2 rounded-full text-sm font-medium">
                                {player.score}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className='flex justify-center h-[90%] text-miracle-lightGrey items-center'>Waiting for Students to join...</div> }
              </div>
            </div>

            <div className="h-fit md:h-full mb-3 md:row-start-7 md:row-end-13 md:col-start-1 md:col-end-7 overflow-auto p-2 xl:p-5 rounded-xl bg-opacity-10 backdrop-blur-lg backdrop-filter shadow-xl bg-slate-100">
              <QuestionForm />
            </div>
            <div className='h-full max-h-[500px] md:max-h-full md:row-span-full md:col-start-7 md:col-end-13 overflow-scroll no-scrollbar pb-2 rounded-xl bg-opacity-10 backdrop-blur-lg backdrop-filter shadow-xl bg-slate-100'>
              <QuestionList />
            </div>
          </div>
    </div>
  );
}