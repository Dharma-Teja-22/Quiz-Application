import { Timer } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import { useGameStore } from '../store/gameStore'

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
}

export default function PlayerGame() {
  const { gameId } = useParams()
  const socket = useSocket()
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(20)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswerLocked, setIsAnswerLocked] = useState(false)
  const gameStatus = useGameStore((state) => state.gameStatus)
  const playerName = useGameStore((state) => state.playerName)
  
  const selectedAnswerRef = useRef(selectedAnswer);

  useEffect(() => {
    selectedAnswerRef.current = selectedAnswer;
  }, [selectedAnswer])

  useEffect(() => {
    console.log("Game status:", gameStatus);
    if (gameStatus === 'end') {
      console.log("Game has ended.");
    }
  }, [gameStatus]);
  
  useEffect(() => {
    if (!socket) return;

    socket.on('question', (question, timeLeft, type) => {
      if (type === "next") {
        setSelectedAnswer(null);
        setIsAnswerLocked(false);
      } else if (selectedAnswerRef.current === null) {
        setSelectedAnswer(null);
        setIsAnswerLocked(false);
      }
      setCurrentQuestion(question);
      setTimeLeft(timeLeft);
    });

    socket.on('timer', (time) => {
      setTimeLeft(time)
    })

    socket.on('game-paused', () => {
      useGameStore.getState().setGameStatus('paused')
    })
    socket.on('game-started', () => {
      useGameStore.getState().setGameStatus('playing')
    })

    socket.on('game-resumed', () => {
      useGameStore.getState().setGameStatus('playing')
    })

    socket.on('game-ended', ()=> {
      useGameStore.getState().setGameStatus('end')
    })

    return () => {
      socket.off('question')
      socket.off('timer')
      socket.off('game-paused')
      socket.off('game-resumed')
    }
  }, [socket])

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswerLocked || gameStatus !== 'playing') return;

    setSelectedAnswer(answerIndex)
    setIsAnswerLocked(true)
    socket.emit('submit-answer', {
      gameId,
      questionId: currentQuestion?.id,
      answer: answerIndex,
    })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl w-full p-8 bg-gray-100 rounded-3xl shadow-lg shadow-gray-400/50 neomorphic-effect text-center transform hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-col items-center gap-4 mb-8">
          <h2 className="text-2xl font-semibold text-[#232527]">{playerName}</h2>
          {gameStatus === 'playing' && (
            <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full shadow-inner">
              <Timer className="w-5 h-5 text-blue-500" />
              <span className="text-blue-500 font-medium">{timeLeft >= 0 ? timeLeft : 0}s</span>
            </div>
          )}
        </div>

        {gameStatus === 'paused' ? (
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold text-gray-800">Game Paused</h3>
            <p className="text-gray-500">Waiting for the host to resume...</p>
          </div>
        ) : gameStatus === 'end' ? (
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold text-gray-800">Thank you for joining the quiz</h3>
            <p className="text-gray-500">-- End --</p>
          </div>
        ) : currentQuestion ? (
          <>
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              {currentQuestion.question}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`p-4 rounded-lg text-left transition-all neomorphic-btn ${
                    selectedAnswer === index
                      ? 'bg-blue-600 text-white shadow-blue-300'
                      : 'bg-gray-200 hover:bg-gray-300'
                  } ${isAnswerLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                  disabled={isAnswerLocked}
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold text-gray-800">
              Waiting for the next question...
            </h3>
          </div>
        )}
      </div>
    </div>
  )
}
