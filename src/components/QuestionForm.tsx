import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export default function QuestionForm() {
  const addQuestion = useGameStore((state) => state.addQuestion);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || options.some(opt => !opt.trim())) return;

    // addQuestion({
    //   question: question.trim(),
    //   options: options.map(opt => opt.trim()),
    //   correctAnswer
    // });

    // Reset form
    setQuestion('');
    setOptions(['', '', '', '']);
    setCorrectAnswer(0);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl h-full w-full">
      <h3 className="text-2xl font-bold text-miracle-darkBlue mb-2">Add New Question</h3>
      
      <div className="mb-2">
        <label htmlFor="question" className="block text-sm font-medium text-miracle-black mb-2">
          Question
        </label>
        <input
          type="text"
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="ring-2 text-miracle-black ring-[#00aae7]/50 bg-[#00aae7]/5 w-full px-4 py-2 rounded-lg focus:ring-0 outline-miracle-mediumBlue focus:ring-none focus:border-transparent transition-all duration-200"
          placeholder="Enter your question"
          required
        />
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium text-miracle-black mb-2">
          Options
        </label>
        <div className="grid grid-cols-2 gap-5 mb-4">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="radio"
                id={`option${index}`}
                name="correctAnswer"
                checked={correctAnswer === index}
                onChange={() => setCorrectAnswer(index)}
                className="w-5 h-5 text-[#00aae7] border-[#b7b2b3] focus:ring-none rounded-full"
              />
              <div className="relative flex-1">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="text-miracle-black w-full pl-4 pr-10 py-2 ring-2 ring-[#00aae7]/50 bg-[#00aae7]/5 rounded-lg outline-miracle-mediumBlue focus:ring-0 focus:ring-none focus:border-transparent transition-all duration-200"
                  placeholder={`Option ${index + 1}`}
                  required
                />
                {option && (
                  <button
                    type="button"
                    onClick={() => handleOptionChange(index, '')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#8c8c8c] hover:text-[#ef4048] transition-colors duration-200"
                    aria-label="Clear option"
                  >
                    <X className="w-5 h-5 text-miracle-red" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
        <div className='flex justify-end'>
          <button
                  type="submit"
                  className="flex items-center justify-center w-full sm:w-auto gap-2 bg-miracle-lightBlue text-[#ffffff] px-3 py-2 rounded-lg hover:bg-[#00aae7]/90 transition-all duration-200 shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  Add Question
                </button>
        </div>
      
    </form>
  );
}