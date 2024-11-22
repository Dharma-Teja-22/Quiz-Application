import { Timer } from 'lucide-react'

export default function TimerUI({timeLeft} : {timeLeft : number}) {
  return (
    <div className="flex items-center gap-2 bg-miracle-mediumBlue px-4 py-2 rounded-full w-[80px]">
                    <Timer className="w-5 h-5 text-miracle-white" />
                    <span className="text-miracle-white font-medium">{timeLeft}s</span>
                  </div>
  )
}
