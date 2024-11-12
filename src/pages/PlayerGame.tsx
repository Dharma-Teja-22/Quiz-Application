import { Timer } from 'lucide-react';
import { useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
// import { useSocket } from '../context/SocketContext';
import { useGameStore } from '../store/gameStore';
import { SocketContext } from '../context/SocketContext';
import dsLogo from '../assets/Digital_Summit_24_Logo_Dark.svg'

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

    socket.on('end',() => {
      useGameStore.getState().setGameStatus('finished');
    })

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
    <div className="min-h-full bg-[#EEF7FF] flex items-center justify-center relative">
      <div className="max-w-2xl w-[90%] z-10 ">
        <div className="bg-miracle-white rounded-lg border border-gray-200 shadow-xl p-6 mb-4">
          <div className="flex justify-between items-center mb-6">
            <div className='w-full'>
            <div className='flex justify-center'>
              <img src={dsLogo} width={100} alt="" />
            </div>
              <h2 className="text-xl font-semibold text-miracle-darkBlue text-center">{playerName.charAt(0).toLocaleUpperCase() + playerName.substring(1)}</h2>
              <h5 className='text-center text-miracle-darkGrey'>Quiz Id : {gameId}</h5>
            </div>
            {gameStatus === 'playing' && (
              <div className="flex items-center gap-2 bg-miracle-lightBlue px-4 py-2 rounded-full">
                <Timer className="w-4 h-4 text-miracle-white" />
                <span className="text-miracle-white font-medium">{timeLeft}s</span>
              </div>
            )}
          </div>

          {gameStatus === 'paused' ? (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold text-miracle-darkGrey">Quiz Paused</h3>
              <p className="text-miracle-darkGrey">Waiting for the host to resume...</p>
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
                      selectedAnswerRef.current === index
                        ? 'bg-miracle-lightBlue text-white'
                        : 'ring-2 ring-[#00aae7]/50 text-black bg-[#00aae7]/5'
                    } ${(isAnswerLocked || timeLeft === 0) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    disabled={isAnswerLocked || timeLeft === 0}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold text-miracle-lightGrey">
                {
                  gameStatus === 'finished' ? <h2>Quiz completed <br/>  Thanks for participating</h2> : "Waiting for the next question..."
                }
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}