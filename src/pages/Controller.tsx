import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// import { useSocket } from '../context/SocketContext';
import { Option, useGameStore } from "../store/gameStore";
import { SocketContext } from "../context/SocketContext";
import dsLogo from "../assets/Digital_Summit_24_Logo_Dark.svg";
import gameCup from '../assets/cup.png';
import { useToast } from "@/hooks/use-toast";
import ToppersModal from './ToppersModal'
import Confetti from 'react-confetti'

import { formatName } from './AdminGame'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Question {
  id: number;
  question: string;
  options: Option[];
}

interface Player2 {
  rank: number,
  score: number
}

interface Player {
  name: string,
  score: number
}

export default function Controller() {
  const { gameId } = useParams();
  const socket = useContext(SocketContext);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const playerName = useGameStore((state) => state.playerName);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [playerStatus, setPlayerStatus] = useState<Player2 | null>({ score: 0, rank: 0 });
  const navigate = useNavigate();
  const { toast } = useToast();
  const [answerIndex, setAnswerIndex] = useState<number | null>(null);
  const [totalPlayers, setTotalPlayers] = useState<number | null>(null)
  const ToppersButtonRef = useRef<HTMLButtonElement>(null);
  // const [students,setStudents] = useState<Player[] | null>(null)
  const [students, setStudents] = useState<Player[]>([
    { name: "Emma Davis", score: 91 },
    { name: "Fiona Clark", score: 76 },
    { name: "George Miller", score: 84 },
    { name: "Hannah Moore", score: 85 },
    { name: "Isaac Taylor", score: 90 },
    { name: "George Millerh", score: 84 },
    { name: "Hannah Mooreh", score: 85 },
    { name: "Isaac Taylorh", score: 90 },
    { name: "George Millerh", score: 84 },
    { name: "Hannah Mooreh", score: 85 },
    { name: "Isaac Taylorh", score: 90 },
    { name: "George Millerh", score: 84 },
    { name: "Hannah Mooreh", score: 85 },
    { name: "Isaac Taylorh", score: 90 },
  ]);
  const [runConfetti, setRunConfetti] = useState(false);

  useEffect(() => {
    console.log(students)
  }, [students])

  const handleToppers = () => {
    ToppersButtonRef.current?.click();
    console.log(ToppersButtonRef.current)
    setRunConfetti(true);
    console.log("clicked")
  }

  useEffect(() => {
    const currentLocalQuestion = localStorage.getItem("currentLocalQuestion");
    const localGameStatus = localStorage.getItem("localGameStatus") as "waiting" | "playing" | "paused" | "finished" | null;
    const isGameStarted = localStorage.getItem("gameStarted");
    const localTimerVaue = localStorage.getItem("localTimerVaue");
    const localIsLastQuestion = localStorage.getItem("localIsLastQuestion");
    const localStudents = localStorage.getItem("localStudents");


    console.log(currentLocalQuestion, isGameStarted, localGameStatus)
    if (currentLocalQuestion && localTimerVaue && isGameStarted && localGameStatus && ["waiting", "playing", "paused", "finished"].includes(useGameStore.getState().gameStatus)) {
      console.log("entered");
      setCurrentQuestion(JSON.parse(currentLocalQuestion));
      useGameStore.getState().setGameStatus(localGameStatus);
      setGameStarted(JSON.parse(isGameStarted));
      setTimeLeft(JSON.parse(localTimerVaue))
    }
    // if(localStudents){
    //   setStudents(JSON.parse(localStudents));
    // }
    if (localIsLastQuestion) {
      setIsLastQuestion(JSON.parse(localIsLastQuestion));
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('player-joined', (playerData, quizId) => {
      console.log(playerData, quizId)
      if (quizId === gameId) {
        toast({
          title: playerData.name + " joined Quiz",
          duration: 1000
        })
      }
    });

    socket.on("question", (question, timeLeft, type, isFinalQuestion, quizId) => {
      if (quizId === gameId) {
        setTotalPlayers(null);
        setAnswerIndex(null);
        if (type === "next") {
          localStorage.setItem("localSelectedAnswer", "null");
          localStorage.setItem("localIsAnswerlocked", "false");
          localStorage.setItem("localIsLastQuestion", JSON.stringify(isFinalQuestion));
          setSelectedAnswer(null);
          setIsAnswerLocked(false);
          setIsLastQuestion(isFinalQuestion);
        }
        localStorage.setItem("currentLocalQuestion", JSON.stringify(question));
        setCurrentQuestion(question);
        setTimeLeft(timeLeft);
        setGameStarted(true)
        localStorage.setItem("gameStarted", "true");
      }

    });

    socket.on("end", (quizId) => {
      console.log(gameId)
      if (quizId === gameId) {
        console.log("ended")
        const localStudents = localStorage.getItem("localStudents");
        if (localStudents) {
          setStudents(JSON.parse(localStudents))
        }
        useGameStore.getState().setGameStatus("finished");
        handleToppers();
        // localStorage.clear();
        // navigate("/");
      }
    });

    socket.on("timer", (time, quizId) => {
      if (quizId === gameId) {
        setTimeLeft(time);
        localStorage.setItem("localTimerVaue", time + "")
      }
    });

    socket.on("game-paused", (quizId) => {
      if (quizId === gameId) {
        useGameStore.getState().setGameStatus("paused");
        localStorage.setItem('gameStatus', "paused");
      }
    });
    socket.on("game-started", (quizId) => {
      if (quizId === gameId) {
        useGameStore.getState().setGameStatus("playing");
        localStorage.setItem('gameStatus', "playing");
      }
    });

    socket.on("getAnswerIndex", (quizId, answerIndex) => {
      console.log("answer get")
      if (quizId === gameId) {
        console.log("getted ", answerIndex, quizId, gameId)
        setAnswerIndex(answerIndex)
      }
    })

    socket.on("game-resumed", (quizId) => {
      if (quizId === gameId) {
        useGameStore.getState().setGameStatus("playing");
        localStorage.setItem('gameStatus', "playing");
      }
    });

    return () => {
      socket.off("question");
      socket.off("timer");
      socket.off("game-paused");
      socket.off("game-resumed");
    };
  }, [socket]);

  // const revealAnswer = () => {
  //   console.log("reveal")
  //   socket?.emit('getAnswerIndex', { gameId, currentQuestion }, (response: { success: boolean,answerIndex : number}) => {
  //       if (response.success) {
  //         console.log(response)
  //         setAnswerIndex(response.answerIndex)

  //       }
  //     });
  // }

  useEffect(() => {
    if (timeLeft === 0 && currentQuestion) {
      console.log("status", gameId)
      socket?.emit('question-status', { gameId, currentQuestion }, (response: { success: boolean, question: Question, totalPlayers: number }) => {
        if (response.success) {
          console.log(response)
          setCurrentQuestion(response.question);
          setTotalPlayers(response.totalPlayers)
        }
        else {
          console.log("error")
        }
      });
    }
  }, [timeLeft])

  // useEffect(()  => {
  //   console.log(countRef.current,questions.length-1)
  //   if(timeLeft === 0 && countRef.current === questions.length - 1){
  //     setGameStatus("finished")
  //     handleToppers();
  //   }
  // },[timeLeft])

  return (
    <div className="h-full bg-[#EEF7FF] flex items-center justify-center">
      <Confetti
        className='w-screen h-screen z-50'
        colors={['#00aae7', '#2368a0', '#0d416b', '#ef4048', '#232527']}
        numberOfPieces={5000}
        recycle={false}
        run={runConfetti}
      />
      <div className="max-w-2xl w-[90%] h-full overflow-hidden flex justify-center items-center">
        <div className="bg-miracle-white w-full rounded-lg border border-gray-200 p-6">
          <div className=" mb-2">
            <div className="flex justify-between">
              <div className="flex flex-col justify-center">
                <h5 className=" text-miracle-black font-bold text-2xl">
                  {useGameStore.getState().gameStatus === "finished" ? "Congratulations" : <span>Quiz ID  <br />  <p className="text-gray-400">{gameId}</p></span>}
                </h5>
              </div>
              <img src={dsLogo} width={100} alt="" />
            </div>
            <hr></hr>
            {
              timeLeft > 0 && <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className={`bg-miracle-lightBlue h-2.5 rounded-full transition-all duration-1000 ease-linear`} style={{ width: (timeLeft * 10) + "%" }} ></div>
              </div>
            }
          </div>


          {gameStarted ? useGameStore.getState().gameStatus === "paused" ? (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold text-miracle-darkGrey">
                Quiz Paused
              </h3>
              <p className="text-miracle-darkGrey">
                Waiting for the host to resume...
              </p>
            </div>
          ) : currentQuestion && useGameStore.getState().gameStatus !== "finished" ? (
            <>
              <h3 className="text-xl font-semibold text-miracle-black mb-6">
                {currentQuestion.question}
              </h3>
              <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className={`p-6 relative text-left transition-all rounded-lg ring-2 ${answerIndex === index
                      ? " ring-green-400 bg-green-50"
                      : "ring-[#00aae7]/50 text-black bg-[#00aae7]/5"
                      }`}
                  >
                    <div style={{ width: (totalPlayers !== null && totalPlayers !== 0) ? ((option.count / totalPlayers) * 100).toFixed(2) + "%" : "0%" }} className={`absolute  rounded-lg transition-all duration-1000 ease-in-out ${answerIndex === index ? "bg-green-300" : "bg-miracle-lightBlue/30"} w-0 h-full top-0 left-0`}></div>
                    <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center">
                      <div className="ml-2">
                        {option.content}
                      </div>
                      <div className="mr-2">
                        {totalPlayers !== null && totalPlayers !== 0 && Number(((option.count / totalPlayers) * 100).toFixed(2)) + "%"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div>
                {
                  timeLeft === 0 && useGameStore.getState().gameStatus === "finished" && <button onClick={handleToppers} className="p-2 mt-5 bg-miracle-darkBlue text-white rounded-lg">
                    Leaderboard
                  </button>
                }

              </div>
            </>
          ) : (
            <div className="text-center py-2">
              <h3 className="text-xl font-semibold text-miracle-lightGrey">
                {useGameStore.getState().gameStatus === "finished" || isLastQuestion ? (
                  <div className="flex flex-col pb-2 h-[350px] overflow-auto no-scrollbar">

                    { students && students.slice(0, 10).map((player : Player) => <div
                        key={player.name}
                        className="bg-white w-full mt-2 text-xl rounded-lg py-2 px-1 transition-all duration-200 border border-gray-200 max-h-[53px]"
                      >
                        <div className="flex items-center gap-3 justify-between">
                          <div className="flex items-center">
                            <div className="rounded-full">
                              <img
                                src={`https://avatar.iran.liara.run/username?username=${player?.name}`}
                                alt="avatar"
                                width={30}
                              />
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <h3 className="font-medium ml-2 text-miracle-black flex items-center">
                                    {formatName(player?.name)}
                                  </h3>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{player.name}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="flex justify-between items-center h-full">
                            <div className="flex items-center">
                              <span className="text-lg font-bold text-miracle-black">
                                {player.score}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>) }
                  </div>
                ) : (
                  "Waiting for the next question..."
                )}
              </h3>
            </div>
          ) : <h3 className="text-xl font-semibold text-center text-miracle-darkGrey">Get ready! The quiz is about to start...</h3>}
        </div>
      </div>
    </div>
  );
}
