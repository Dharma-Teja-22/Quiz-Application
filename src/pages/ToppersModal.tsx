import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import {Player} from '../store/gameStore'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import {formatName} from './AdminGame'
import { Medal } from 'lucide-react';

  
export default function ToppersModal({ToppersButtonRef,students} : {ToppersButtonRef : React.RefObject<HTMLButtonElement>,students : Player[]}) {
  return (
    <Dialog >
        <DialogTrigger className="hidden" ref={ToppersButtonRef}></DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle className="text-2xl">Congratulations Toppers</DialogTitle>
            <DialogDescription>
            <div className="flex justify-evenly items-end mb-4 border-b-2 border-gray-300">
          {/* Display top 3 students with height proportional to their scores */}
          {/* {students.slice(0, 3).map((player: Player, index: number) => (
            <div
              key={player.name}
              className={`relative flex flex-col items-center justify-end bg-white rounded-lg transition-all duration-200 border border-gray-200 shadow-md`}
              style={{
                height: `${player.score * 2}px`, // Adjust height based on score (2px for each score point)
                width: "80px",
              }}
            >
              <span className="absolute top-0 text-lg font-bold text-miracle-black mt-2">{index + 1}</span>
              <div className="flex flex-col items-center justify-center mb-2">
                <img
                  src={`https://avatar.iran.liara.run/username?username=${player.name}`}
                  alt="avatar"
                  width={40}
                  className="rounded-full mb-1"
                />
                <h3 className="font-medium text-miracle-black">{formatName(player.name)}</h3>
                <span className="text-lg font-bold text-miracle-black">{player.score}</span>
              </div>
              {index === 0 && (
                <Medal className="absolute bottom-2 text-orange-400 w-6 h-6" />
              )}
            </div>
          ))} */}
          <div className="flex items-center flex-col">
                  <img
                    src={`https://avatar.iran.liara.run/username?username=${students[1].name}`}
                    alt="avatar"
                    width={90}
                  />
                  <p className="text-center text-miracle-black font-semibold text-xl mt-2">
                    <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <h3 className="font-medium ml-2 text-miracle-black flex items-center">
                          {formatName(students[1].name)}
                        </h3>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{students[1].name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  </p>
                  <p className="text-center text-miracle-black justify-center items-center font-semibold text-xl flex border bg-gray-100 h-[50px] w-[100px] rounded-t-lg">{students[1].score}</p>
          </div>
          <div className="flex items-center flex-col">
                  <img
                    src={`https://avatar.iran.liara.run/username?username=${students[0].name}`}
                    alt="avatar"
                    width={100}
                  />
                  <p className="text-center text-miracle-black font-semibold text-xl mt-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <h3 className="font-medium ml-2 text-miracle-black flex items-center">
                          {formatName(students[0].name)}
                        </h3>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{students[0].name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  </p>
                  <p className="text-center text-miracle-black justify-center items-center font-semibold text-xl flex border bg-gray-100 h-[70px] w-[100px] rounded-t-lg">{students[0].score}</p>
          </div>
          <div className="flex items-center flex-col">
                  <img
                    src={`https://avatar.iran.liara.run/username?username=${students[2].name}`}
                    alt="avatar"
                    width={80}
                  />
                  <p className="text-center text-miracle-black font-semibold text-xl mt-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <h3 className="font-medium ml-2 text-miracle-black flex items-center">
                          {formatName(students[2].name)}
                        </h3>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{students[2].name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  </p>
                  <p className="text-center text-miracle-black justify-center items-center font-semibold text-xl flex border bg-gray-100 h-[40px] w-[100px] rounded-t-lg">{students[2].score}</p>
          </div>
            </div>

        {/* Display remaining students normally */}
        <div className="h-[300px] overflow-scroll no-scrollbar">
        {students.slice(3, 10).map((player: Player) => (
          <div
            key={player.name}
            className="bg-white w-full mt-2 text-xl rounded-lg py-2 px-1 transition-all duration-200 border border-gray-200 shadow-md max-h-[53px]"
          >
            <div className="flex items-center gap-3 justify-between">
              <div className="flex items-center">
                <div className="rounded-full">
                  <img
                    src={`https://avatar.iran.liara.run/username?username=${player.name}`}
                    alt="avatar"
                    width={30}
                  />
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h3 className="font-medium ml-2 text-miracle-black flex items-center">
                        {formatName(player.name)}
                      </h3>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{player.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex justify-between items-center h-full">
                <div className="flex items-center">
                  <span className="text-lg font-bold text-miracle-black">
                    {player.score}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>

            </DialogDescription>
            </DialogHeader>
        </DialogContent>
    </Dialog>
  )
}
