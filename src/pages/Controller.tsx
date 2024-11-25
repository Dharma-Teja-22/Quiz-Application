import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// import { useSocket } from '../context/SocketContext';
import { Option,useGameStore } from "../store/gameStore";
import { SocketContext } from "../context/SocketContext";
import dsLogo from "../assets/Digital_Summit_24_Logo_Dark.svg";
import gameCup from '../assets/cup.png';
import { useToast } from "@/hooks/use-toast";
import ToppersModal from './ToppersModal'


interface Question {
  id: number;
  question: string;
  options: Option[];
}

interface Player {
  rank : number,
  score : number
}

interface Player2 {
  name : string,
  score : number
}

export default function Controller() {
  const { gameId } = useParams();
  const socket = useContext(SocketContext);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const playerName = useGameStore((state) => state.playerName);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [gameStarted,setGameStarted] = useState<boolean>(false);
  const [playerStatus,setPlayerStatus] = useState<Player | null>({score : 0,rank : 0});
  const navigate = useNavigate();
  const { toast } = useToast();
  const [answerIndex,setAnswerIndex] = useState<number | null>(null);
  const [totalPlayers,setTotalPlayers] = useState<number | null>(null)
  const ToppersButtonRef = useRef<HTMLButtonElement>(null);
  const [students, setStudents] = useState<Player2[]>([
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

  useEffect(() => {
    const currentLocalQuestion = localStorage.getItem("currentLocalQuestion");
    const localGameStatus = localStorage.getItem("gameStatus") as "waiting" | "playing" | "paused" | "finished" | null;
    const isGameStarted =localStorage.getItem("gameStarted");
    const localTimerVaue = localStorage.getItem("localTimerVaue");
    const localIsLastQuestion = localStorage.getItem("localIsLastQuestion");

     if (currentLocalQuestion && localTimerVaue && isGameStarted && localGameStatus && ["waiting", "playing", "paused", "finished"].includes(gameStatus)) {
      console.log("entered");
      setCurrentQuestion(JSON.parse(currentLocalQuestion));
      useGameStore.getState().setGameStatus(localGameStatus);
      setGameStarted(JSON.parse(isGameStarted));
      setTimeLeft(JSON.parse(localTimerVaue))
    }
    if(localIsLastQuestion){
      setIsLastQuestion(JSON.parse(localIsLastQuestion));
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('player-joined', (playerData,quizId) => {
        console.log(playerData,quizId)
        if(quizId === gameId){
            toast({
                title: playerData.name + " joined Quiz",
                duration : 1000
            }) 
        }
      });

    socket.on("question", (question, timeLeft, type, isFinalQuestion,quizId) => {
      if(quizId === gameId){
        setTotalPlayers(null);
        setAnswerIndex(null);
        if (type === "next") {
          localStorage.setItem("localSelectedAnswer","null");
          localStorage.setItem("localIsAnswerlocked","false");
          localStorage.setItem("localIsLastQuestion",JSON.stringify(isFinalQuestion));
          setSelectedAnswer(null);
          setIsAnswerLocked(false);
          setIsLastQuestion(isFinalQuestion);
        }
        localStorage.setItem("currentLocalQuestion", JSON.stringify(question));
        setCurrentQuestion(question);
        setTimeLeft(timeLeft);
        setGameStarted(true)
        localStorage.setItem("gameStarted","true");
      }

    });

    socket.on("end", (quizId) => {
      if(quizId === gameId){
        useGameStore.getState().setGameStatus("finished");
        // localStorage.clear();
        // navigate("/");
      }
    });

    socket.on("timer", (time,quizId) => {
      if(quizId === gameId){
        setTimeLeft(time);
        localStorage.setItem("localTimerVaue",time+"")
      }
    });

    socket.on("game-paused", (quizId) => {
      if(quizId === gameId){
        useGameStore.getState().setGameStatus("paused");
        localStorage.setItem('gameStatus',"paused");
      }
    });
    socket.on("game-started", (quizId) => {
      if(quizId === gameId){
        useGameStore.getState().setGameStatus("playing");
        localStorage.setItem('gameStatus',"playing");
      }
    });

    socket.on("game-resumed", (quizId) => {
      if(quizId === gameId){
        useGameStore.getState().setGameStatus("playing");
        localStorage.setItem('gameStatus',"playing");
      }
    });

    return () => {
      socket.off("question");
      socket.off("timer");
      socket.off("game-paused");
      socket.off("game-resumed");
    };
  }, [socket]);

  const revealAnswer = () => {
    console.log("reveal")
    socket?.emit('getAnswerIndex', { gameId, currentQuestion }, (response: { success: boolean,answerIndex : number}) => {
        if (response.success) {
          console.log(response)
          setAnswerIndex(response.answerIndex)
          
        }
      });
  }
  const sortedStudents = [...students].sort((a, b) => b.score - a.score)

  useEffect(() => {
    if(timeLeft === 0){
      console.log("status",gameId)
      socket?.emit('question-status', { gameId, currentQuestion }, (response: { success: boolean, question : Question, totalPlayers : number  }) => {
        if (response.success) {
          console.log(response)
          setCurrentQuestion(response.question);
          setTotalPlayers(response.totalPlayers)
        }
        else{
            console.log("error")
        }
      });
    }
  },[timeLeft])



  return (
    <div className="min-h-full bg-[#EEF7FF] flex items-center justify-center relative">
      <div className="max-w-2xl w-[90%] z-10 ">
        <div className="bg-miracle-white rounded-lg border border-gray-200 shadow-xl p-6 mb-4">
          <div className=" mb-6">
            <div className="flex justify-between">
              <div className="flex flex-col justify-center">
                <h5 className=" text-miracle-black font-bold text-xl">Quiz ID <br />{gameId}</h5>
              </div>
              <img src={dsLogo} width={100} alt="" />
            </div>
            <hr></hr>
            {
              timeLeft > 0 && <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className={`bg-miracle-lightBlue h-2.5 rounded-full transition-all duration-1000 ease-linear`} style={{width:(timeLeft * 10)+"%"}} ></div>
                    </div>
            }
          </div>
          {
           gameStatus === 'finished' && <ToppersModal ToppersButtonRef={ToppersButtonRef} students={sortedStudents} />
          }
          {gameStarted ? gameStatus === "paused" ? (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold text-miracle-darkGrey">
                Quiz Paused
              </h3>
              <p className="text-miracle-darkGrey">
                Waiting for the host to resume...
              </p>
            </div>
          ) : currentQuestion ? (
            <>
              <h3 className="text-xl font-semibold text-miracle-black mb-6">
                {currentQuestion.question}
              </h3>
              <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className={`p-4 relative text-left transition-all rounded-lg ${
                      answerIndex === index
                        ? "bg-miracle-lightBlue text-white"
                        : "ring-2 ring-[#00aae7]/50 text-black bg-[#00aae7]/5"
                    }`}
                  >
                    <span>{option.content}</span><span className="absolute right-1">{totalPlayers && (Math.round(option.count/totalPlayers)*100) + "%"}</span>
                  </button>
                ))}
              </div>
              <div>
                <button onClick={revealAnswer} className="p-2 mt-5 bg-miracle-darkBlue text-white rounded-lg">
                    Reveal Answer
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-2">
              <h3 className="text-xl font-semibold text-miracle-lightGrey">
                {gameStatus === "finished" || isLastQuestion ? (
                  <div className="flex flex-col justify-center">
                    <img src={gameCup} width={150} className="mx-auto" alt="" />
                    <p className="text-miracle-mediumBlue">Rank : {playerStatus?.rank}</p>
                    <p className="text-miracle-mediumBlue">Score : {playerStatus?.score}</p>
                     <p>Well done! Your quiz is completed. <br /> Thanks for joining us!</p>
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
