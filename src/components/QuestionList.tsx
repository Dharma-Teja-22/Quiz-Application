import { Trash2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export default function QuestionList() {
  const questions = useGameStore((state) => state.questions);
  const removeQuestion = useGameStore((state) => state.removeQuestion);

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 bg-miracle-lightGrey/80 rounded-lg">
        <p className="text-miracle-black font-bold">No questions added yet. Add some questions to start the game!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <div key={question.id} className="bg-miracle-white rounded-lg shadow p-4 border border-b-miracle-lightGrey">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-medium text-miracle-darkGrey mb-2">
                {index + 1}. {question.question}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {question.options.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className={`p-2 rounded ${
                      optIndex === question.correctAnswer
                        ? 'bg-miracle-lightBlue/20 text-miracle-darkBlue'
                        : 'bg-gray-100 text-miracle-darkGrey'
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => removeQuestion(question.id)}
              className="ml-4 p-2 text-miracle-red hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}