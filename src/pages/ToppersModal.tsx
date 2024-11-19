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
        <DialogTrigger ref={ToppersButtonRef}></DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle className="text-2xl">Congratulations Toppers</DialogTitle>
            <DialogDescription>
            {students.slice(0,10).map((player : Player,index : number) => (
                      <div
                      key={player.name}
                      className="bg-white w-full mt-2 text-xl rounded-lg py-2 px-1 transition-all duration-200 border border-gray-200 shadow-md max-h-[53px]"
                    >
                      <div className="flex items-center gap-3 justify-between">
                        <div className='flex items-center'>
                          <div className="rounded-full">
                            <img
                              src={`https://avatar.iran.liara.run/username?username=${player.name}`}
                              alt="avatar" width={30}/>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                              <h3 className="font-medium ml-2 text-miracle-black flex items-center">{formatName(player.name)} {index === 0 && <Medal className="h-5 ml-3 text-orange-400 w-5" /> }</h3>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{player.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                        </div>
                        <div className="flex justify-between items-center h-full">
                          <div className="flex items-center">
                          Score: {player.score}
                            {/* <span className="text-miracle-black px-2 rounded-full text-sm font-medium"> */}
                            
                            {/* </span> */}
                          </div>
                        </div>
                      </div>
                    </div>
                    ))}
            </DialogDescription>
            </DialogHeader>
        </DialogContent>
    </Dialog>
  )
}
