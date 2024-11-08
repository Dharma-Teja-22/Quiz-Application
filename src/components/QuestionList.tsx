import { Trash2 } from 'lucide-react'
import { useGameStore } from '../store/gameStore'

export default function QuestionList() {
  const questions = useGameStore((state) => state.questions)
  const removeQuestion = useGameStore((state) => state.removeQuestion)

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 bg-[#b7b2b3]/20 rounded-lg">
        <p className="text-[#232527] font-semibold">No questions added yet. Add some questions to start the quiz!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {questions.map((question, index) => (
        <div key={question.id} className="bg-[#ffffff] rounded-lg shadow-md p-4 sm:p-6 border border-[#b7b2b3]">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1 w-full">
              <h4 className="font-medium text-[#232527] mb-3 text-lg">
                <span className="text-[#2368a0]">{index + 1}.</span> {question.question}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {question.options.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className={`p-3 rounded-md text-sm sm:text-base transition-colors ${
                      optIndex === question.correctAnswer
                        ? 'bg-[#00aae7]/10 text-[#0d416b] font-medium'
                        : 'bg-[#b7b2b3]/10 text-[#8c8c8c]'
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => removeQuestion(question.id)}
              className="ml-auto p-2 text-[#ef4048] hover:bg-[#ef4048]/10 rounded-lg transition-colors"
              aria-label="Remove question"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}