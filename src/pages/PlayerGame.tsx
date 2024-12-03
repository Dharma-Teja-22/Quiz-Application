import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// import { useSocket } from '../context/SocketContext';
import { Option, useGameStore } from "../store/gameStore";
import { SocketContext } from "../context/SocketContext";
import dsLogo from "../assets/Digital_Summit_24_Logo_Dark.svg";
import { formatName } from "./AdminGame";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import gameCup from "../assets/cup.png";

interface Question {
  id: number;
  question: string;
  options: Option[];
  correctAnswer: number;
}

interface Player {
  rank: number;
  score: number;
}

export default function PlayerGame() {
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
  const [playerStatus, setPlayerStatus] = useState<Player | null>({
    score: 0,
    rank: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const currentLocalQuestion = localStorage.getItem("currentLocalQuestion");
    const currentPlayerName = localStorage.getItem("currentPlayerName");
    const localGameStatus = localStorage.getItem("gameStatus") as
      | "waiting"
      | "playing"
      | "paused"
      | "finished"
      | null;
    const isGameStarted = localStorage.getItem("gameStarted");
    const localTimerVaue = localStorage.getItem("localTimerVaue");
    const localIsAnswerlocked = localStorage.getItem("localIsAnswerlocked");
    const localSelectedAnswer = localStorage.getItem("localSelectedAnswer");
    const localIsLastQuestion = localStorage.getItem("localIsLastQuestion");
    if (currentPlayerName) {
      useGameStore.getState().setPlayerName(currentPlayerName);
    }
    if (
      currentLocalQuestion &&
      localTimerVaue &&
      isGameStarted &&
      localGameStatus &&
      ["waiting", "playing", "paused", "finished"].includes(gameStatus)
    ) {
      console.log("entered");
      setCurrentQuestion(JSON.parse(currentLocalQuestion));
      useGameStore.getState().setGameStatus(localGameStatus);
      setGameStarted(JSON.parse(isGameStarted));
      setTimeLeft(JSON.parse(localTimerVaue));
    }
    if (localSelectedAnswer && localIsAnswerlocked && localIsLastQuestion) {
      setIsAnswerLocked(JSON.parse(localIsAnswerlocked));
      setIsLastQuestion(JSON.parse(localIsLastQuestion));
      setSelectedAnswer(JSON.parse(localSelectedAnswer));
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit(
      "verify-room",
      gameId,
      (response: { success: boolean; error?: string }) => {
        console.log(response);
        if (!response.success) {
          console.log(response + " kl");
          localStorage.clear();
          navigate("/");
        }
      }
    );

    socket.on(
      "question",
      (question: Question, timeLeft, type, isFinalQuestion, quizId) => {
        if (quizId === gameId) {
          if (type === "next" || type === "start") {
            localStorage.setItem("localSelectedAnswer", "null");
            localStorage.setItem("localIsAnswerlocked", "false");
            localStorage.setItem(
              "localIsLastQuestion",
              JSON.stringify(isFinalQuestion)
            );
            setSelectedAnswer(null);
            setIsAnswerLocked(false);
            setIsLastQuestion(isFinalQuestion);
          }
          localStorage.setItem(
            "currentLocalQuestion",
            JSON.stringify(question)
          );
          setCurrentQuestion(question);
          setTimeLeft(timeLeft);
          setGameStarted(true);
          localStorage.setItem("gameStarted", "true");
        }
      }
    );

    socket.on("end", (quizId) => {
      if (quizId === gameId) {
        useGameStore.getState().setGameStatus("finished");
        localStorage.clear();
        // navigate("/");
      }
    });

    socket.on("timer", (time, quizId) => {
      if (quizId === gameId) {
        setTimeLeft(time);
        localStorage.setItem("localTimerVaue", time + "");
      }
    });

    socket.on("game-paused", (quizId) => {
      if (quizId === gameId) {
        useGameStore.getState().setGameStatus("paused");
        localStorage.setItem("gameStatus", "paused");
      }
    });
    socket.on("game-started", (quizId) => {
      if (quizId === gameId) {
        useGameStore.getState().setGameStatus("playing");
        localStorage.setItem("gameStatus", "playing");
      }
    });

    socket.on("game-resumed", (quizId) => {
      if (quizId === gameId) {
        useGameStore.getState().setGameStatus("playing");
        localStorage.setItem("gameStatus", "playing");
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
    if (timeLeft === 0 && isLastQuestion) {
      console.log("status", gameId);
      socket?.emit(
        "status",
        { gameId, playerName: playerName },
        (response: { success: boolean; player: Player }) => {
          if (response.success) {
            console.log(response);
            setPlayerStatus(response.player);
          }
        }
      );
    }
  }, [timeLeft]);

  const handleAnswerSelect = (answerIndex: number) => {
    console.log(answerIndex, isAnswerLocked, gameStatus);
    if (isAnswerLocked || gameStatus !== "playing") return;

    localStorage.setItem("localSelectedAnswer", answerIndex + "");
    localStorage.setItem("localIsAnswerlocked", "true");

    setSelectedAnswer(answerIndex);
    setIsAnswerLocked(true);
    socket &&
      socket.emit("submit-answer", {
        gameId,
        questionId: currentQuestion?.id,
        answer: answerIndex,
        playerName: playerName,
        timeLeft: timeLeft,
      });
  };

  return (
    <div className="min-h-full bg-[#EEF7FF] flex items-center justify-center relative">
      <div className="max-w-2xl w-[90%] z-10 ">
        <div className="bg-miracle-white rounded-lg border border-gray-200 shadow-xl p-6 mb-4">
          <div className=" mb-6">
            <div className="flex justify-between">
              <div className="flex flex-col justify-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h2 className="text-4xl font-bold text-miracle-darkBlue">
                        {formatName(playerName)}
                      </h2>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{playerName}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <h5 className=" text-miracle-darkGrey font-semibold mt-1">Quiz Id: {gameId}</h5>
              </div>
              <img src={dsLogo} width={100} alt="" />
            </div>
            <hr></hr>
            {timeLeft > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className={`bg-miracle-lightBlue h-2.5 rounded-full transition-all duration-1000 ease-linear`}
                  style={{ width: timeLeft * 10 + "%" }}
                ></div>
              </div>
            )}
          </div>

          {gameStarted ? (
            gameStatus === "paused" ? (
              <div className="text-center py-8">
                <h3 className="text-xl font-semibold text-miracle-darkGrey">
                  Quiz Paused
                </h3>
                <p className="text-miracle-darkGrey">
                  Waiting for the host to resume...
                </p>
              </div>
            ) : currentQuestion && timeLeft !== 0 ? (
              <>
                <h3 className="text-xl font-semibold text-miracle-black mb-6">
                  {currentQuestion.question}
                </h3>
                <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`p-4 text-left transition-all rounded-lg ${
                        selectedAnswer === index
                          ? "bg-miracle-lightBlue text-white"
                          : "ring-2 ring-[#00aae7]/50 text-black bg-[#00aae7]/5"
                      } ${
                        isAnswerLocked || timeLeft === 0
                          ? "cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                      disabled={isAnswerLocked || timeLeft === 0}
                    >
                      {String.fromCharCode(65 + index) + "."} {option.content}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <h3 className="text-xl font-semibold text-miracle-lightGrey">
                  {gameStatus === "finished" || isLastQuestion ? (
                    <div className="flex flex-col justify-center">
                      <img
                        src={gameCup}
                        width={150}
                        className="mx-auto"
                        alt=""
                      />
                      <p className="text-miracle-mediumBlue">
                        Rank : {playerStatus?.rank}
                      </p>
                      <p className="text-miracle-mediumBlue">
                        Score : {playerStatus?.score}
                      </p>
                      <p>
                        Well done! Your quiz is completed. <br /> Thanks for
                        joining us!
                      </p>
                    </div>
                  ) : (
                    "Waiting for the next question..."
                  )}
                </h3>
              </div>
            )
          ) : (
            <h3 className="text-xl font-semibold text-center text-miracle-darkGrey">
              Get ready! The quiz is about to start...
            </h3>
          )}
        </div>
      </div>
    </div>
  );
}
