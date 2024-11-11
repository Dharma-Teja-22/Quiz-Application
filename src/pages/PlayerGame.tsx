import { Timer } from 'lucide-react';
import { useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
// import { useSocket } from '../context/SocketContext';
import { useGameStore } from '../store/gameStore';
import { SocketContext } from '../context/SocketContext';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;

}

export default function PlayerGame() {
  const { gameId } = useParams();
  const socket = useContext(SocketContext);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const playerName = useGameStore((state) => state.playerName);

  const selectedAnswerRef = useRef(selectedAnswer);

  useEffect(() => {
    selectedAnswerRef.current = selectedAnswer;
  },[selectedAnswer])

  useEffect(() => {
    if (!socket) return;

    socket.on('question', (question,timeLeft,type) => {
      if(type === "next"){
        setSelectedAnswer(null);
        setIsAnswerLocked(false);
      }
      else if(selectedAnswerRef.current === null){
        setSelectedAnswer(null);
        setIsAnswerLocked(false);
      }
      console.log("selectedAnswer : "+selectedAnswerRef.current)
      setCurrentQuestion(question);
      setTimeLeft(timeLeft);
    });

    socket.on('timer', (time) => {
      setTimeLeft(time);
    });

    socket.on('game-paused', () => {
      useGameStore.getState().setGameStatus('paused');
    });
    socket.on('game-started', () => {
      useGameStore.getState().setGameStatus('playing');
    });

    socket.on('game-resumed', () => {
      useGameStore.getState().setGameStatus('playing');
    });

    return () => {
      socket.off('question');
      socket.off('timer');
      socket.off('game-paused');
      socket.off('game-resumed');
    };
  }, [socket]);


  const handleAnswerSelect = (answerIndex: number) => {
    console.log(answerIndex,isAnswerLocked ,gameStatus)
    if (isAnswerLocked || gameStatus !== 'playing') return;

    setSelectedAnswer(answerIndex);
    setIsAnswerLocked(true);
    socket && socket.emit('submit-answer', {
      gameId,
      questionId: currentQuestion?.id,
      answer: answerIndex,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-miracle-darkBlue to-miracle-black p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-opacity-10 backdrop-blur-lg backdrop-filter bg-miracle-white rounded-xl shadow-lg p-6 mb-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-miracle-white">{playerName}</h2>
            
            </div>
            {gameStatus === 'playing' && (
              <div className="flex items-center gap-2 bg-miracle-lightBlue/55 px-4 py-2 rounded-full">
                <Timer className="w-4 h-4 text-miracle-white" />
                <span className="text-miracle-white font-medium">{timeLeft}s</span>
              </div>
            )}
          </div>

          {gameStatus === 'paused' ? (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold text-miracle-white">Game Paused</h3>
              <p className="text-miracle-white">Waiting for the host to resume...</p>
            </div>
          ) : currentQuestion ? (
            <>
              <h3 className="text-xl font-semibold text-miracle-white mb-6">
                {currentQuestion.question}
              </h3>
              <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`p-4 text-left transition-all text-white rounded-full ${
                      selectedAnswerRef.current === index
                        ? 'bg-miracle-lightBlue'
                        : 'bg-[#00aae7]/20 hover:bg-[#00aae7]/40 ring-2 ring-[#00aae7]/50'
                    } ${isAnswerLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    disabled={isAnswerLocked}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold text-miracle-lightGrey">
                Waiting for the next question...
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}