import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"

import { motion} from 'framer-motion';

import {Player} from '../store/gameStore'
import {formatName} from './AdminGame'

export default function StudentsList({player} : {player : Player}) {
  return (
        <motion.div
          key={player.name}
          layout
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className="bg-white w-full md:w-[49%] rounded-lg py-2 px-1 transition-all duration-200 border border-gray-200 shadow-md max-h-[53px]"
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
                  <h3 className="font-medium ml-2 text-miracle-black">{formatName(player.name)}</h3>
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
        </motion.div>
  )
}