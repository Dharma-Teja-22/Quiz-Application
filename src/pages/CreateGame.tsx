
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { ArrowRight } from 'lucide-react'

export default function CreateGame() {
  const navigate = useNavigate()
  const [gameId, setGameId] = useState('')
  const [error, setError] = useState('')
  const setIsAdmin = useGameStore((state) => state.setIsAdmin)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!gameId.trim()) {
      setError('Please enter a game ID')
      return
    }

    setIsAdmin(true)
    navigate(`/admin/${gameId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00aae7] to-[#0d416b] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md space-y-8 bg-[#ffffff]/90 p-6 sm:p-8 rounded-xl shadow-lg backdrop-blur-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#232527] mb-6">Create New Game</h1>
        
        <form onSubmit={handleCreate} className="space-y-6">
          <div>
            <label htmlFor="gameId" className="block text-sm font-medium text-[#232527] mb-1">
              Game ID
            </label>
            <input
              type="text"
              id="gameId"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="w-full px-4 py-2 border border-[#b7b2b3] rounded-lg focus:ring-2 focus:ring-[#00aae7] focus:border-transparent transition-all duration-200 ease-in-out"
              placeholder="Enter a unique game ID"
            />
            <p className="mt-1 text-sm text-[#8c8c8c]">
              This ID will be used by students to join your game
            </p>
          </div>

          {error && (
            <p className="text-[#ef4048] text-sm font-medium">{error}</p>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#0d416b] text-[#ffffff] py-3 rounded-lg font-semibold hover:bg-[#2368a0] transition-colors duration-200 ease-in-out"
          >
            Create Game
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}