
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Player } from '@/store/gameStore'
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


export default function StudentList({students}:{students : Player []}) {

  const sortedStudents = [...students].sort((a, b) => b.score - a.score)

  return (

      <div className="flex w-full">
        <Card className="mb-6 overflow-scroll h-[500px] border-0 no-scrollbar">
          <CardContent className='p-0 '>
            <div className='flex w-full items-start flex-wrap gap-2'>
            <AnimatePresence>
              {sortedStudents.map((student) => (
                <motion.div
                  key={student.name}
                  layout
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.5 }}
                  className={`p-3 mb-2 rounded-lg w-[100%] md:w-[49%] bg-gray-100 dark:bg-gray-800`}
                >
                  <div className="flex justify-between items-center">
                  
                    <span className="font-semibold flex items-center">
                     <span className=''>
                     {/* <Skeleton className="w-[30px] h-[30px] mr-2 rounded-full absolute -z-10 top-3" />
                     <img
                        src={`https://avatar.iran.liara.run/username?username=${student.name}`}
                        alt="avatar" width={30}
                        className='mr-2'/> */}
                        <Avatar className='h-8 w-8 mr-2'>
                            <AvatarImage src={`https://avatar.iran.liara.run/username?username=${student.name}`} />
                            <AvatarFallback></AvatarFallback>
                        </Avatar>
                     </span>
                      {student.name}
                    </span>
                    <motion.span
                      key={student.score}
                      initial={{ scale: 1 }}
                      animate={{ scale: 1.2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                      className="text-lg font-bold text-miracle-black"
                    >
                      {student.score}
                    </motion.span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            </div>

          </CardContent>
        </Card>
      </div>
  )
}
