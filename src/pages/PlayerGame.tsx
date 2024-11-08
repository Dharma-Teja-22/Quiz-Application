import { Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (!socket) return

    socket.on('question', (question) => {
      setCurrentQuestion(question)
      setTimeLeft(20)
      setSelectedAnswer(null)
      setIsAnswerLocked(false)
    })

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

    return () => {
      socket.off('question')
      socket.off('timer')
      socket.off('game-paused')
      socket.off('game-resumed')
    }
  }, [socket])

  const handleAnswerSelect = (answerIndex: number) => {
    console.log(answerIndex, isAnswerLocked, gameStatus)
    if (isAnswerLocked || gameStatus !== 'playing') return

    setSelectedAnswer(answerIndex)
    setIsAnswerLocked(true)
    socket.emit('submit-answer', {
      gameId,
      questionId: currentQuestion?.id,
      answer: answerIndex,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00aae7] to-[#0d416b] p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#ffffff] rounded-lg shadow-lg p-4 sm:p-6 mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-lg font-semibold text-[#232527]">{playerName}</h2>
            </div>
            {gameStatus === 'playing' && (
              <div className="flex items-center gap-2 bg-[#00aae7]/20 px-4 py-2 rounded-full">
                <Timer className="w-4 h-4 text-[#0d416b]" />
                <span className="text-[#0d416b] font-medium">{timeLeft}s</span>
              </div>
            )}
          </div>

          {gameStatus === 'paused' ? (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold text-[#232527]">Game Paused</h3>
              <p className="text-[#8c8c8c]">Waiting for the host to resume...</p>
            </div>
          ) : currentQuestion ? (
            <>
              <h3 className="text-xl font-semibold text-[#232527] mb-6">
                {currentQuestion.question}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`p-4 rounded-lg text-left transition-all ${
                      selectedAnswer === index
                        ? 'bg-[#2368a0] text-[#ffffff]'
                        : 'bg-[#b7b2b3]/25 text-[#232527] hover:bg-[#b7b2b3]/40'
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
              <h3 className="text-xl font-semibold text-[#232527]">
                Waiting for the next question...
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}