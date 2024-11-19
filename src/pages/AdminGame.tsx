import { useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
// import { useSocket } from '../context/SocketContext';
import { Play, Pause, SkipForward, Users, Timer, Ban, User , MedalIcon } from 'lucide-react';
import { Question, useGameStore,Player } from '../store/gameStore';
import QuestionList from '../components/QuestionList';
import { SocketContext } from '../context/SocketContext';
import Student from './Student'
import ToppersModal from './ToppersModal'
import Confetti from 'react-confetti'


export const formatName = (name : string) => {
  return name.length > 10 ? name.substring(0, 10) + '...' : name;
}

export default function AdminGame() {
  const { gameId } = useParams();
  const socket = useContext(SocketContext);
  // const [students, setStudents] = useState<Player[]>([]);
  const [students, setStudents] = useState<Player[]>([
    { name: "Rachel Adams", score: 86 },
    { name: "Sam Wilson", score: 94 },
    { name: "Tina Green", score: 81 },
    { name: "Alice Johnson", score: 85 },
    { name: "Bob Smith", score: 92 },
    { name: "Charlie Brown", score: 78 },
    { name: "David Williams", score: 88 },
    { name: "Emma Davis", score: 91 },
    { name: "Fiona Clark", score: 76 },
    { name: "George Miller", score: 84 },
    { name: "Hannah Moore", score: 95 },
    { name: "Isaac Taylor", score: 80 },
    { name: "Julia Anderson", score: 89 },
    { name: "Kevin Thompson", score: 93 },
    { name: "Lily Harris", score: 90 },
    { name: "Mason Lee", score: 79 },
    { name: "Nina Young", score: 83 },
    { name: "Oscar Martin", score: 87 },
    { name: "Paul Walker", score: 77 },
    { name: "Quincy Scott", score: 82 },
    { name: "Rachel Adams", score: 86 },
    { name: "Sam Wilson", score: 94 },
    { name: "Tina Green", score: 81 },
    
  ]);

  const gameStatus = useGameStore((state) => state.gameStatus);
  const setGameStatus = useGameStore((state) => state.setGameStatus);
  const questions = useGameStore((state) => state.questions);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const countRef = useRef<number>(0);
  const [isGameStarted,setIsGameStarted] = useState(false);
  const [runConfetti,setRunConfetti] = useState(false);
  const ToppersButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const localGameStatus = localStorage.getItem("localGameStatus") as "waiting" | "playing" | "paused" | "finished" | null;
    const localQuestions = localStorage.getItem("localQuestions");
    // console.log(localQuestions)
    const localStudents = localStorage.getItem("localStudents");
    const localcurrentQuestion = localStorage.getItem("localcurrentQuestion");
    const localTimerValue = localStorage.getItem("localTimerValue");
    const localIsGameStarted = localStorage.getItem("localIsGameStarted");

    if(localIsGameStarted){
      setIsGameStarted(JSON.parse(localIsGameStarted))
    }

    if(localTimerValue){
      setTimeLeft(JSON.parse(localTimerValue))
    }

    if(localGameStatus){
      useGameStore.getState().setGameStatus(localGameStatus);
    }
    if(localQuestions){
      useGameStore.getState().setQuestions(JSON.parse(localQuestions));
    }
    if(localStudents){
      setStudents(JSON.parse(localStudents));
    }
    if(localcurrentQuestion){
      countRef.current = JSON.parse(localcurrentQuestion);
    }
  },[])

  const handleTimeLeft= (time : number) => {
    setTimeLeft(time)
  }

  const handleToppers = () => {
    ToppersButtonRef.current?.click();
    setRunConfetti(true);
  }

  useEffect(()  => {
    if(timeLeft === 0 && countRef.current === questions.length - 1){
      handleToppers();
    }
  },[timeLeft])

  useEffect(() => {
    if (!socket) return;

    socket.on('player-joined', (playerData,quizId) => {
      console.log(playerData,quizId)
      if(quizId === gameId){
        setStudents((current) => {
          const newStudents = [...current, playerData];
          localStorage.setItem("localStudents",JSON.stringify(newStudents))
          return newStudents;
      });
      }
    });

    socket.on('player-left', (playerId) => {
      setStudents((current) => current.filter(p => p.name !== playerId));
    });

    socket.on('score-update', ({ playerName, newScore },quizId) => {
      if(quizId === gameId){
      console.log("updated score")
      setStudents((current) => {
        const newStudents = current.map(p => p.name === playerName ? { ...p, score: newScore } : p)
        .sort((a, b) => b.score - a.score);
        localStorage.setItem("localStudents",JSON.stringify(newStudents))
        return newStudents;
      }
      );
      
    }
    });

    socket.on('timer', (time,quizId) => {
      if(quizId === gameId){
        // console.log(time);
        localStorage.setItem("localTimerValue",time+"");
        setTimeLeft(time);
      }
    });

    return () => {
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('score-update');
    };
  }, [socket, gameId, questions]);


  const handleGameControl = (action: 'start' | 'pause' | 'next' | 'end') => {
    console.log(questions.length,socket)
    if (!socket || questions.length === 0) return;

    if(action !== "end"){
      setIsGameStarted(true);
      localStorage.setItem("localIsGameStarted","true");
    }

    switch (action) {
      case 'start':
        socket.emit('game-action', { gameId, action: 'start' });
        localStorage.setItem("localGameStatus","playing");
        setGameStatus('playing');
        break;
      case 'pause':
        socket.emit('game-action', { gameId, action: 'pause' });
        localStorage.setItem("localGameStatus","paused");
        setGameStatus('paused');
        break;
      case 'next':
        countRef.current+=1;
        setGameStatus('playing')
        localStorage.setItem("localGameStatus","playing");
        localStorage.setItem("localcurrentQuestion",countRef.current+"");
        socket.emit('game-action', { gameId, action: 'next' });
        break;
      case 'end':
        socket.emit('game-action', { gameId, action: 'end' });
        useGameStore.getState().setGameStatus("finished");
        break;
    }
  };

  return (
    <div className='h-full bg-[#EEF7FF]'>
          <div className="overflow-auto w-full h-full lg:grid mx-auto lg:grid-cols-2 lg:grid-rows-1 gap-3 p-2">

            <div className="h-fit grid md:grid-rows-8 grid-rows-5 md:h-full bg-white mb-3 p-2 xl:p-5 col-span-1 rounded-lg border border-gray-200 md:mb-0">
              <div className="flex flex-col row-span-1 md:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-miracle-darkBlue">Quiz Control Panel</h1>
                  <p className="text-miracle-darkGrey">Quiz ID: {gameId}</p>
                  
                  <ToppersModal ToppersButtonRef={ToppersButtonRef} students={students} />
                </div>
                <div className="flex items-start h-full gap-2">
                  {questions.length > 0 && gameStatus !== "finished" && (
                    <>
                      {gameStatus === 'playing' ? (
                        <button
                          onClick={() => handleGameControl('pause')}
                          className="flex w-[150px] items-center gap-2 bg-miracle-darkGrey text-[#ffffff] px-2 py-2 rounded-lg hover:bg-miracle-darkGrey/90 transition-all duration-200 shadow-md"
                        >
                          <Pause className="w-5 h-5" />
                          Pause Quiz
                        </button>
                      ) : isGameStarted ? (
                        <button
                          onClick={() => handleGameControl('start')}
                          className="flex items-center gap-2 bg-[#00aae7] text-[#ffffff] px-2 py-2 rounded-lg hover:bg-[#00aae7]/90 transition-all duration-200 shadow-md"
                        >
                          <Play className="w-5 h-5" />
                          Resume Quiz
                        </button>
                      ) : <button
                      onClick={() => handleGameControl('start')}
                      className="flex items-center gap-2 bg-[#00aae7] text-[#ffffff] px-2 py-2 rounded-lg hover:bg-[#00aae7]/90 transition-all duration-200 shadow-md"
                    >
                      <Play className="w-5 h-5" />
                      Start Quiz
                    </button>}
                    </>
                  )}
                    {
                        gameStatus === 'finished' && <button className='flex items-center gap-2 bg-[#e79600] text-[#ffffff] px-2 py-2 rounded-lg hover:bg-[#e79600]/90 transition-all duration-200 shadow-md' onClick={handleToppers}> <MedalIcon /> Leader Board</button>
                    }
                </div>
              </div>
              <div className="rounded-lg md:row-span-7 row-span-4 overflow-hidden p-2 px-0">
                <div className="flex flex-row items-center justify-between gap-4 mb-2">
                  <div className='flex gap-2 items-center'>
                    <Users className="w-5 h-5 text-miracle-black" />
                    <h2 className="text-md font-semibold text-miracle-black">
                      Students ({students.length})
                    </h2>
                  </div>
                  {
                    isGameStarted && gameStatus !== "finished" && <div className="flex items-center gap-2 bg-miracle-mediumBlue px-4 py-2 rounded-full">
                    <Timer className="w-5 h-5 text-miracle-white" />
                    <span className="text-miracle-white font-medium">{timeLeft}s</span>
                  </div>
                  }
                  
                </div>
                {students.length > 0 ? (
                  <div className="flex flex-wrap overflow-scroll md:h-[95%] h-[350px] pb-2 w-full no-scrollbar gap-2">
                    {students.map((player : Player) => (
                      <Student player={player} />
                    ))}
                  </div>
                ) : <div className='flex justify-center md:h-[350px] text-miracle-darkGrey font-bold items-center'>Waiting for Students to join...</div> }
              </div>
            </div>
            <Confetti
                className='w-screen h-screen z-50'
                colors={['#00aae7','#2368a0','#0d416b','#ef4048','#232527']}
                numberOfPieces={2000}
                recycle={false}
                run={runConfetti}
                />
            <div className='h-full max-h-[500px] md:max-h-full overflow-scroll no-scrollbar pb-2 border rounded-lg border-gray-200 bg-white'>
              <QuestionList currentQuestionIndex={countRef.current} handleGameControl={handleGameControl} timeLeft={timeLeft} handleTimeLeft={handleTimeLeft} isGameStarted={isGameStarted}/>
            </div>
          </div>
    </div>
  );
}