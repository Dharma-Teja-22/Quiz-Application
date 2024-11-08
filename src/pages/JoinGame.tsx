import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import { useGameStore } from '../store/gameStore'
import { ArrowRight } from 'lucide-react'

export default function JoinGame() {
  const navigate = useNavigate()
  const socket = useSocket()
  const [gameId, setGameId] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const setPlayerName = useGameStore((state) => state.setPlayerName)

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!gameId.trim() || !name.trim()) {
      setError('Please fill in all fields')
      return
    }

    socket.emit('join-game', { gameId, playerName: name }, (response: { success: boolean, error?: string }) => {
      if (response.success) {
        setPlayerName(name)
        navigate(`/play/${gameId}`)
      } else {
        setError(response.error || 'Failed to join game')
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00aae7] to-[#0d416b] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md space-y-8 bg-[#ffffff]/90 p-6 sm:p-8 rounded-xl shadow-lg backdrop-blur-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0d416b] mb-6">Join Quiz</h1>
        
        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label htmlFor="gameId" className="block text-sm font-medium text-[#232527] mb-1">
              Game Code
            </label>
            <input
              type="text"
              id="gameId"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="w-full px-4 py-2 border border-[#b7b2b3] rounded-lg focus:ring-2 focus:ring-[#00aae7] focus:border-transparent transition-all duration-200 ease-in-out"
              placeholder="Enter game code"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#232527] mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-[#b7b2b3] rounded-lg focus:ring-2 focus:ring-[#00aae7] focus:border-transparent transition-all duration-200 ease-in-out"
              placeholder="Enter your name"
            />
          </div>

          {error && (
            <p className="text-[#ef4048] text-sm font-medium">{error}</p>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#0d416b] text-[#ffffff] py-3 rounded-lg font-semibold hover:bg-[#2368a0] transition-colors duration-200 ease-in-out"
          >
            Join Game
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}