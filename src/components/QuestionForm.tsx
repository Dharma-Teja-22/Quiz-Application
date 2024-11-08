 
import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { useGameStore } from '../store/gameStore'

export default function QuestionForm() {
  const addQuestion = useGameStore((state) => state.addQuestion)
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || options.some(opt => !opt.trim())) return

    addQuestion({
      question: question.trim(),
      options: options.map(opt => opt.trim()),
      correctAnswer
    })

    // Reset form
    setQuestion('')
    setOptions(['', '', '', ''])
    setCorrectAnswer(0)
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#ffffff] rounded-lg shadow-lg p-4 sm:p-6 mb-6">
      <h3 className="text-xl font-semibold text-[#232527] mb-4">Add New Question</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-[#232527] mb-1">
          Question
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full px-4 py-2 border border-[#8c8c8c] rounded-lg focus:ring-2 focus:ring-[#00aae7] focus:border-transparent transition-all duration-200 ease-in-out"
          placeholder="Enter your question"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-[#232527] mb-2">
          Options
        </label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="radio"
                name="correctAnswer"
                checked={correctAnswer === index}
                onChange={() => setCorrectAnswer(index)}
                className="w-4 h-4 text-[#00aae7] border-[#8c8c8c] focus:ring-[#00aae7]"
              />
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="flex-1 px-4 py-2 border border-[#b7b2b3] rounded-lg focus:ring-2 focus:ring-[#00aae7] focus:border-transparent transition-all duration-200 ease-in-out"
                placeholder={`Option ${index + 1}`}
                required
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="flex items-center gap-2 bg-[#00aae7] text-[#ffffff] px-4 py-2 rounded-lg hover:bg-[#2368a0] transition-colors duration-200 ease-in-out"
      >
        <Plus className="w-4 h-4" />
        Add Question
      </button>
    </form>
  )
}