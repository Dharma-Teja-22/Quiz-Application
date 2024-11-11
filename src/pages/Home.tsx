import { useNavigate } from 'react-router-dom';
import { Gamepad2, Users } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-[#EEF7FF] flex items-center justify-center p-4">
      <div className="max-w-md bg-white w-full space-y-8 shadow-xl border border-gray-200 p-8 rounded-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-miracle-darkBlue mb-2">QuizMaster</h1>
          <p className="text-miracle-darkBlue/80">Create or join interactive quizzes in real-time!</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/create')}
            className="w-full flex items-center rounded-lg justify-center gap-3 bg-miracle-lightBlue text-miracle-white p-4 font-semibold hover:bg-miracle-lightBlue/70 transition-colors"
          >
            <Gamepad2 className="w-5 h-5" />
            Create New Quiz
          </button>
          
          <button
            onClick={() => navigate('/join')}
            className="w-full flex rounded-lg items-center justify-center gap-3 bg-miracle-darkBlue text-white p-4 font-semibold hover:bg-miracle-darkBlue/70 transition-colors"
          >
            <Users className="w-5 h-5" />
            Join Quiz
          </button>
        </div>
      </div>
    </div>
  );
}