import { useNavigate } from "react-router-dom"
import { Gamepad2, Users } from "lucide-react"

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d416b] to-[#0d416b] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md space-y-8 bg-[#ffffff]/90 p-6 sm:p-8 rounded-xl shadow-lg backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0d416b] mb-2">
            Quiz Master
          </h1>
          <p className="text-[#8c8c8c] text-sm sm:text-base">Fun quizzes for students!</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/create")}
            className="w-full flex items-center justify-center gap-3 bg-[#2368a0] text-[#ffffff] p-3 sm:p-4 rounded-lg font-semibold hover:bg-[#0d416b] transition-colors duration-200 ease-in-out"
          >
            <Gamepad2 className="w-5 h-5" />
            Create New Quiz
          </button>

          <button
            onClick={() => navigate("/join")}
            className="w-full flex items-center justify-center gap-3 text-miracle-darkBlue border-[#2368a0] border-2 p-3 sm:p-4 rounded-lg font-semibold hover:bg-miracle-darkBlue/80 hover:text-[#ffffff] transition-colors duration-200 ease-in-out"
          >
            <Users className="w-5 h-5" />
            Join Quiz
          </button>
        </div>
      </div>
    </div>
  )
}