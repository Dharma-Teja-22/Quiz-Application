import { useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
// import { useSocket } from '../context/SocketContext';
import { Play, Pause, SkipForward, Users, Timer, Ban, User } from 'lucide-react';
import { Question, useGameStore } from '../store/gameStore';
import QuestionList from '../components/QuestionList';
import { SocketContext } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/API';


interface Player {
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
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const countRef = useRef<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    socket.on('player-joined', (playerData) => {
      setStudents((current) => [...current, playerData]);
    });

    socket.on('player-left', (playerId) => {
      setStudents((current) => current.filter(p => p.name !== playerId));
    });

    socket.on('score-update', ({ playerName, newScore }) => {
      console.log("updated score")
      setStudents((current) =>
        current.map(p => p.name === playerName ? { ...p, score: newScore } : p)
        .sort((a, b) => b.score - a.score)
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

  const fetchQuestions = async () => {
    console.log("hello")
    try{
      if(gameId){
        const result = await API.get.getQuestions(gameId);
        if(result){
          // console.log(response)
          useGameStore.getState().setQuestions(result.map((question : Question) => ({...question,showAnswer : false})));
        }
      }
    }
    catch(err){
      console.log(err);
    }
  }

  useEffect(() => {
    fetchQuestions();
  },[])

  const handleGameControl = (action: 'start' | 'pause' | 'next' | 'end') => {
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
        countRef.current+=1;
        setGameStatus('playing')
        socket.emit('game-action', { gameId, action: 'next',isLastQuestion : countRef.current === questions.length-1 });
        break;
      case 'end':
        socket.emit('game-action', { gameId, action: 'end' });
        navigate('/')
        break;
    }
  };

  return (
    <div className='h-full bg-[#EEF7FF]'>
          <div className="overflow-auto w-full h-full lg:grid mx-auto lg:grid-cols-2 lg:grid-rows-1 gap-3 p-2">

            <div className="h-fit md:h-full bg-white mb-3 p-2 xl:p-5 col-span-1 rounded-lg border border-gray-200 shadow-lg md:mb-0">
              <div className="flex flex-col md:flex-row justify-between items-start sm:items-center gap-4 mb-3 row-span-2">
                <div>
                  <h1 className="text-2xl font-bold text-miracle-darkBlue">Quiz Control Panel</h1>
                  <p className="text-miracle-darkGrey">Quiz ID: {gameId}</p>
                </div>
                <div className="flex items-start h-full gap-2">
                  {questions.length > 0 &&  (
                    <>
                      {gameStatus === 'playing' ? (
                        <button
                          onClick={() => handleGameControl('pause')}
                          className="flex items-center gap-2 bg-miracle-darkGrey text-[#ffffff] px-2 py-2 rounded-lg hover:bg-miracle-darkGrey/90 transition-all duration-200 shadow-md"
                        >
                          <Pause className="w-5 h-5" />
                          Pause Quiz
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGameControl('start')}
                          className="flex items-center gap-2 bg-[#00aae7] text-[#ffffff] px-2 py-2 rounded-lg hover:bg-[#00aae7]/90 transition-all duration-200 shadow-md"
                        >
                          <Play className="w-5 h-5" />
                          Start Quiz
                        </button>
                      )}
                      
                    </>
                  )}
                </div>
              </div>
              <div className="rounded-lg row-span-8 overflow-hidden p-2 px-0">
                <div className="flex flex-row items-center justify-between gap-4 mb-2">
                  <div className='flex gap-2 items-center'>
                    <Users className="w-5 h-5 text-miracle-black" />
                    <h2 className="text-md font-semibold text-miracle-black">
                      Students ({students.length})
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 bg-miracle-lightBlue px-4 py-2 rounded-full">
                    <Timer className="w-5 h-5 text-miracle-white" />
                    <span className="text-miracle-white font-medium">{timeLeft}s</span>
                  </div>
                </div>
                {students.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 h-[300px] md:h-full overflow-scroll no-scrollbar pb-5 md:pb-12">
                    {students.map((player) => (
                      <div
                        key={player.name}
                        className="bg-white rounded-lg py-2 px-1 transition-all duration-200 border border-gray-200 shadow-lg max-h-[70px]"
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-miracle-lightBlue p-2 rounded-full">
                            <User className="w-5 h-5 text-miracle-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-miracle-black">{(player.name.charAt(0).toLocaleUpperCase() + player.name.substring(1)).substring(0,10)}</h3>
                            <div className="flex items-center mt-1">
                              <span className="text-black text-sm">Score:</span>
                              <span className="text-miracle-black px-2 rounded-full text-sm font-medium">
                                {player.score}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className='flex justify-center md:h-[350px] text-miracle-darkGrey font-bold items-center'>Waiting for Students to join...</div> }
              </div>
            </div>

            <div className='h-full max-h-[500px] md:max-h-full overflow-scroll no-scrollbar pb-2 border rounded-lg border-gray-200 bg-white shadow-lg'>
              <QuestionList currentQuestionIndex={countRef.current} handleGameControl={handleGameControl} timeLeft={timeLeft}/>
            </div>
          </div>
    </div>
  );
}