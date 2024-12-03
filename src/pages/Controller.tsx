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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { formatName } from './AdminGame'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button";

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
  const [answerIndex, setAnswerIndex] = useState<number>(1);
  const [totalPlayers, setTotalPlayers] = useState<number | null>(null)
  const ToppersButtonRef = useRef<HTMLButtonElement>(null);
  const [students,setStudents] = useState<Player[] | null>(null)
  // const [students, setStudents] = useState<Player[]>([
  //   { name: "Emma Davis", score: 91 },
  //   { name: "Fiona Clark", score: 76 },
  //   { name: "George Miller", score: 84 },
  //   { name: "Hannah Moore", score: 85 },
  //   { name: "Isaac Taylor", score: 90 },
  //   { name: "George Millerh", score: 84 },
  //   { name: "Hannah Mooreh", score: 85 },
  //   { name: "Isaac Taylorh", score: 90 },
  //   { name: "George Millerh", score: 84 },
  //   { name: "Hannah Mooreh", score: 85 },
  //   { name: "Isaac Taylorh", score: 90 },
  //   { name: "George Millerh", score: 84 },
  //   { name: "Hannah Mooreh", score: 85 },
  //   { name: "Isaac Taylorh", score: 90 },
  // ]);
  const [runConfetti, setRunConfetti] = useState(false);

  // useEffect(() => {
  //   console.log(students)
  // }, [students])

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
    if(localStudents){
      setStudents(JSON.parse(localStudents));
    }
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
          duration: 2000
        })
      }
    });

    socket.on("question", (question, timeLeft, type, isFinalQuestion, quizId) => {
      if (quizId === gameId) {
        setTotalPlayers(null);
        setAnswerIndex(-1);
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

  const sortedStudents = students && students.sort((a, b) => b.score - a.score)


  return (
    <div className="h-full relative overflow-hidden bg-[url('./assets/bgController.png')] bg-cover flex items-center justify-center">
      <Confetti
        className='w-screen h-screen z-50'
        colors={['#00aae7', '#2368a0', '#0d416b', '#ef4048', '#232527']}
        numberOfPieces={1500}
        recycle={false}
        run={runConfetti}
      />
      <div className="w-full h-full bg-black absolute opacity-30"></div>
      <div className="max-w-2xl relative w-[90%] h-full overflow-hidden flex justify-center items-center">
        <div className="bg-miracle-white w-full rounded-lg border border-gray-200 px-6 pb-5">
          <div className=" ">
            <div className="flex justify-between">
              <div className="flex flex-col justify-center">
                <h5 className=" text-miracle-black font-bold text-2xl">
                  {useGameStore.getState().gameStatus === "finished" ? "Leaderboard" : <span>Quiz ID  <br />  <p className="text-gray-400">{gameId}</p></span>}
                </h5>
              </div>
              <img src={dsLogo} width={100} alt="" />
            </div>

            {
              timeLeft > 0 && <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className={`bg-miracle-lightBlue h-2.5 rounded-full transition-all duration-1000 ease-linear`} style={{ width: (timeLeft * 10) + "%" }} ></div>
              </div>
            }
          </div>

          <hr></hr>
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
              <h3 className="text-xl font-semibold text-miracle-black py-3">
                {currentQuestion.question}
              </h3>
              <div className="grid md:grid-cols-2 grid-cols-1 gap-4 pb-5">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    disabled={answerIndex === -1 ? false :  answerIndex !== index}
                    className={`p-6 relative text-left text-white transition-all ${answerIndex === index && "animate-bounce"} rounded-sm ring-[#00aae7]/70 ${index == 0 && "bg-[#e21b3c]"} ${index == 1 && "bg-[#1368ce]"} ${index == 2 && "bg-[#D89E02]"} ${index == 3 && "bg-[#27890d]"}`}
                  >
                    {/* <div style={{ width: (totalPlayers !== null && totalPlayers !== 0) ? ((option.count / totalPlayers) * 100).toFixed(2) + "%" : "0%" }} className={`absolute  rounded-sm transition-all duration-1000 ease-in-out bg-miracle-lightBlue/30 w-0 h-full top-0 left-0`}>
                    </div> */}
                    <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center text-white">
                      <div className="ml-2">
                      {String.fromCharCode(65 + index) + "."} {option.content}
                      </div>
                      <div className="mr-2">
                        {totalPlayers !== null && totalPlayers !== 0 && Number(((option.count / totalPlayers) * 100).toFixed(2)) + "%"}
                      </div>
                    </div>
                  </Button>
                  
                ))}
              </div>
               { answerIndex>=0 && <div className=" bg-miracle-darkBlue text-white text-center w-full p-2 italic font-semibold text-2xl">Correct Answer is : Option {String.fromCharCode(65 + answerIndex) }</div>}
              <div>
                {
                  timeLeft === 0 && useGameStore.getState().gameStatus === "finished" && <button onClick={handleToppers} className="p-2 mt-5 bg-miracle-darkBlue text-white rounded-lg">
                    Leaderboard
                  </button>
                }

              </div>
            </>
          ) : (
            <div className="text-center  ">
              <h3 className="text-xl font-semibold ">
                {useGameStore.getState().gameStatus === "finished" || isLastQuestion ? (
                  <div className="flex flex-col pb-2 h-[350px] overflow-auto no-scrollbar">


                    <div className="bg-white w-full   text-xl rounded-lg py-2 px-1 transition-all duration-200  max-h-[53px] pointer-events-none">
                      <hr></hr>
                      <div className="flex items-center   justify-between">
                        <Table className="">
                          <TableHeader>
                            <TableRow className="bg-black ">
                              <TableHead className="w-[100px] font-bold text-white">Rank</TableHead>
                              <TableHead className="text-left font-bold text-white">Name</TableHead>
                              <TableHead className="w-[70px] text-right font-bold text-white">Score</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedStudents && sortedStudents.slice(0, 10).map((player: Player, index) =>
                              <TableRow className={`${index % 2 == 0 ? "text-white bg-miracle-lightBlue " : "text-white bg-miracle-darkBlue "}`}>
                                <TableCell className="font-bold text-left">#{index + 1}</TableCell>
                                <TableCell className="text-left">{player.name}</TableCell>
                                <TableCell className="text-left">{player.score}</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>



                  </div>
                ) : (
                  "Waiting for the next question..."
                )}
              </h3>
            </div>
          ) : <h3 className="text-xl flex items-center justify-center font-semibold text-center text-miracle-darkGrey h-24">Get ready! The quiz is about to start...</h3>}
        </div>
      </div>
    </div>
  );
}
