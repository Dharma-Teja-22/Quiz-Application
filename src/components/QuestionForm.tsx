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

    addQuestion({
      question: question.trim(),
      options: options.map(opt => opt.trim()),
      correctAnswer
    });

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
    <form onSubmit={handleSubmit} className="bg-miracle-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-miracle-black mb-4">Add New Question</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-miracle-black  mb-1">
          Question
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full px-4 py-2 border border-miracle-darkGrey rounded-lg  focus:border-transparent"
          placeholder="Enter your question"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-miracle-black mb-2">
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
                className="w-4 h-4 text-miracle-lightBlue"
              />
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="flex-1 px-4 py-2 border border-miracle-lightGrey rounded-lg  focus:border-transparent"
                placeholder={`Option ${index + 1}`}
                required
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="flex items-center gap-2 bg-miracle-lightBlue text-miracle-white px-4 py-2 rounded-lg hover:bg-miracle-lightBlue"
      >
        <Plus className="w-4 h-4" />
        Add Question
      </button>
    </form>
  );
}