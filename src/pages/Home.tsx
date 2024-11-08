import { useNavigate } from "react-router-dom";
import { Gamepad2, Users } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-miracle-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-miracle-lightGrey/25 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-miracle-darkBlue mb-2">
            QuizMaster
          </h1>
          <p className="text-gray-600">Fun quizzes for students!</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/create")}
            className="w-full flex items-center justify-center gap-3 bg-miracle-lightBlue/80 text-white p-4 rounded font-semibold hover:bg-miracle-lightBlue/100 transition-colors"
          >
            <Gamepad2 className="w-5 h-5" />
            Create New Quiz
          </button>

          <button
            onClick={() => navigate("/join")}
            className="w-full flex items-center justify-center gap-3 text-miracle-lightBlue/80 border-miracle-lightBlue/80 border-2  text-white p-4 rounded font-semibold hover:bg-miracle-lightBlue/20 transition-colors"
          >
            <Users className="w-5 h-5" />
            Join Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
