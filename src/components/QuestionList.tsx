import { Trash2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export default function QuestionList({currentQuestionIndex} : {currentQuestionIndex : number}) {
  const questions = useGameStore((state) => state.questions);
  const removeQuestion = useGameStore((state) => state.removeQuestion);

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 rounded-xl h-full w-full flex justify-center items-center">
        <div className="text-miracle-darkGrey font-bold sm:text-base">
          No questions added yet. <br /> Add some questions to start the quiz!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {questions.map((question, index) => (
        <div 
          key={question.id} 
          className="group rounded-xl hover:shadow-lg transition-all duration-200 p-3"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3 flex-1">
                <span className={`flex-shrink-0 w-8 h-8 rounded-full ${currentQuestionIndex === index && "bg-miracle-darkBlue"} bg-[#00aae7] flex items-center justify-center text-miracle-white font-semibold`}>
                  {index + 1}
                </span>
                <h4 className="font-semibold text-miracle-black text-lg leading-tight pt-1">
                  {question.question}
                </h4>
              </div>
              <button
                onClick={() => removeQuestion(question.id)}
                className="flex-shrink-0 p-2 text-[#8c8c8c] hover:text-[#ef4048] hover:bg-[#ef4048]/10 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                aria-label={`Remove question: ${question.question}`}
              >
                <Trash2 className="w-5 h-5 text-red-400" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {question.options.map((option, optIndex) => (
                <div
                  key={optIndex}
                  className={`relative p-2 rounded-xl transition-all duration-200 bg-[#00aae7]/5 text-miracle-black ${
                    optIndex === question.correctAnswer
                      ? 'ring-2 ring-[#00aae7]/50'
                      : 'ring-2 ring-[#00aae7]/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium text-miracle-black">
                      {String.fromCharCode(65 + optIndex)+"."}
                    </span>
                    <span className={`${
                      optIndex === question.correctAnswer ? 'font-medium' : ''
                    }`}>
                      {option}
                    </span>
                  </div>
                  {optIndex === question.correctAnswer && (
                    <span className="absolute top-2 right-2 text-xs font-medium text-black">
                      Correct Answer
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}