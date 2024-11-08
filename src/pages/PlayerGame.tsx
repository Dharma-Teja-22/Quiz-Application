import { Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useGameStore } from '../store/gameStore';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function PlayerGame() {
  const { gameId } = useParams();
  const socket = useSocket();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const playerName = useGameStore((state) => state.playerName);

  useEffect(() => {
    if (!socket) return;

    socket.on('question', (question) => {
      setCurrentQuestion(question);
      setTimeLeft(20);
      setSelectedAnswer(null);
      setIsAnswerLocked(false);
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
    socket.emit('submit-answer', {
      gameId,
      questionId: currentQuestion?.id,
      answer: answerIndex,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-miracle-lightGrey/30 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-miracle-white rounded-lg shadow-lg p-6 mb-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-miracle-black">{playerName}</h2>
            
            </div>
            {gameStatus === 'playing' && (
              <div className="flex items-center gap-2 bg-miracle-lightBlue/20 px-4 py-2 rounded-full">
                <Timer className="w-4 h-4 text-miracle-darkBlue" />
                <span className="text-miracle-darkBlue font-medium">{timeLeft}s</span>
              </div>
            )}
          </div>

          {gameStatus === 'paused' ? (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold text-miracle-black">Game Paused</h3>
              <p className="text-miracle-darkGrey">Waiting for the host to resume...</p>
            </div>
          ) : currentQuestion ? (
            <>
              <h3 className="text-xl font-semibold text-miracle-black mb-6">
                {currentQuestion.question}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`p-4 rounded-lg text-left transition-all ${
                      selectedAnswer === index
                        ? 'bg-miracle-lightBlue text-white'
                        : 'bg-miracle-lightGrey/25 text-miracle-back hover:bg-miracle-lightGrey/20'
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
              <h3 className="text-xl font-semibold text-miracle-black">
                Waiting for the next question...
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}