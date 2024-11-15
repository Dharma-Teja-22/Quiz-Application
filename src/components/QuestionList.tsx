import { Ban, SkipForward, Trash2 } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import UploadExcelButton from "./UploadExcelButton";
import { useEffect, useRef,useState } from "react";

export default function QuestionList({
  currentQuestionIndex,
  handleGameControl,
  timeLeft,
  handleTimeLeft,
  isGameStarted
}: {
  currentQuestionIndex: number;
  handleGameControl : (action: "start" | "pause" | "next" | "end") => void,
  timeLeft : number,
  handleTimeLeft : (time : number) => void;
  isGameStarted : boolean
}) {
  const questions = useGameStore((state) => state.questions);
  const lastQuestionRef = useRef<HTMLDivElement | null>(null);
  const nextBtnRef = useRef<HTMLButtonElement | null>(null);
  const gameStatus = useGameStore((state) => state.gameStatus)
  const [fileName,setFileName] = useState<string>("");
  const [error,setError] = useState<string | null>(null)

  const revealAnswer = () => {
    const newQuestions = questions.map((question,index) => index === currentQuestionIndex ? ({...question,showAnswer : true}) : question);
    localStorage.setItem("localQuestions",JSON.stringify(newQuestions));
    useGameStore.getState().setQuestions(newQuestions);
  }

  const handleError = (msg : string | null) => {
    setError(msg)
  }

  useEffect(() => {
    if(timeLeft == 0){
      revealAnswer();
      nextBtnRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  },[timeLeft])

  useEffect(() => {
    if(lastQuestionRef){
      lastQuestionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  },[currentQuestionIndex])

  const handleFileName = (name : string) => {
    setFileName(name)
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 rounded-xl h-full w-full flex flex-col justify-center items-center">
        <div className="text-miracle-darkGrey font-bold sm:text-base">
          Add questions to start the Quiz!
        </div>
        <div className="mt-3">
          <UploadExcelButton handleError={handleError} handleFileName={handleFileName} />
        </div>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <>
    {
      isGameStarted
      ?     <div className="space-y-2">
      {questions.slice(0, currentQuestionIndex + 1).map((question, index) => (
        <div
          key={index}
          ref={index === currentQuestionIndex ? lastQuestionRef : null}
          className="group rounded-xl hover:shadow-lg transition-all duration-200 p-3"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3 flex-1">
                <span
                  className={`flex-shrink-0 w-8 h-8 rounded-full bg-[#00aae7] flex items-center justify-center text-miracle-white font-semibold`}
                >
                  {index + 1}
                </span>
                <h4 className="font-semibold text-miracle-black text-lg leading-tight pt-1">
                  {question.question}
                </h4>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {question.options.map((option, optIndex) => (
                <div
                  key={optIndex}
                  className={`relative p-2 rounded-xl transition-all duration-200 bg-[#00aae7]/5 text-miracle-black ring-2 ring-[#00aae7]/50 ${optIndex === question.correctAnswer && question.showAnswer && "bg-miracle-lightBlue/50"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium text-miracle-black">
                      {String.fromCharCode(65 + optIndex) + "."}
                    </span>
                    <span
                    >
                      {option}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      { timeLeft === 0 &&
        <div className="flex justify-center">
        {currentQuestionIndex !== questions.length - 1 ? (
          <button
            ref={nextBtnRef}
            onClick={() => {
              revealAnswer();
              handleGameControl("next");
              handleTimeLeft(10)
            }}
            className="flex items-center gap-2 bg-[#2368a0] text-[#ffffff] px-3 py-2 rounded-lg hover:bg-[#2368a0]/90 transition-all duration-200 shadow-md"
          >
            <SkipForward className="w-5 h-5" />
            Next Question
          </button>
        ) : (
          !(gameStatus === "finished") && <button
            ref={nextBtnRef}
            onClick={() => handleGameControl("end")}
            className="flex items-center gap-2 bg-miracle-red/80 text-[#ffffff] px-3 py-2 rounded-lg hover:bg-miracle-red/90 transition-all duration-200 shadow-md"
          >
            <Ban className="w-5 h-5" />
            End Quiz
          </button>
        )}
      </div>
      }


    </div>
    :
    <div className="text-center py-8 rounded-xl h-full w-full flex flex-col justify-center items-center">
        <div className="text-miracle-darkGrey font-bold sm:text-base p-4 md:p-0">
          <p>
          <span className="text-miracle-black">File Uploaded : {fileName}</span> <br />
          Click Start Quiz to reveal the quiz questions.
          </p>
        </div>
      </div>
    }
    </>

  );
}
