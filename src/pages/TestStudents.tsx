'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Player } from '@/store/gameStore'

type Student = {
  id: number
  name: string
  score: number
}

export default function QuizAdminDashboard({students}:{students : Player []}) {
  // const [students, setStudents] = useState<Student[]>([
  //   { id : 1,name: "David Williams", score: 88 },
  //   { id : 2,name: "Emma Davis", score: 91 },
  //   { id : 3,name: "Fiona Clark", score: 76 },
  //   { id : 4,name: "George Miller", score: 84 },
  //   { id : 5,name: "Hannah Moore", score: 95 },
  //   { id : 6,name: "Isaac Taylor", score: 80 },
  //   { id : 7,name: "Julia Anderson", score: 89 },
  //   { id : 8,name: "Kevin Thompson", score: 93 },
  //   { id : 9,name: "Lily Harris", score: 90 },
  //   { id : 10,name: "Mason Lee", score: 79 },
  //   { id : 11,name: "Nina Young", score: 83 },
  //   { id : 12,name: "Oscar Martin", score: 87 },
  //   { id : 13,name: "Paul Walker", score: 77 },
  //   { id : 14,name: "Quincy Scott", score: 82 },
  //   { id : 15,name: "Rachel Adams", score: 86 },
  //   { id : 16,name: "Sam Wilson", score: 94 },
  //   { id : 17,name: "Tina Green", score: 81 },
  // ])

  const [newName, setNewName] = useState('')
  const [newScore, setNewScore] = useState('')

  // const addOrUpdateStudent = (e: React.FormEvent) => {
  //   e.preventDefault()
  //   const score = parseInt(newScore)
  //   if (!newName || isNaN(score)) return

  //   const existingStudentIndex = students.findIndex(s => s.name.toLowerCase() === newName.toLowerCase())
  //   if (existingStudentIndex !== -1) {
  //     // Update existing student's score
  //     const updatedStudents = [...students]
  //     updatedStudents[existingStudentIndex].score = score
  //     setStudents(updatedStudents)
  //   } else {
  //     // Add new student
  //     setStudents([...students, { id: Date.now(), name: newName, score }])
  //   }

  //   setNewName('')
  //   setNewScore('')
  // }

  const sortedStudents = [...students].sort((a, b) => b.score - a.score)

  return (

      <div className="flex w-full">
        {/* <Card className="mb-6 w-1/3">
          <CardHeader>
            <CardTitle>Add/Update Student</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addOrUpdateStudent} className="space-y-4">
              <div>
                <Label htmlFor="name">Student Name</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter student name"
                />
              </div>
              <div>
                <Label htmlFor="score">Score</Label>
                <Input
                  id="score"
                  type="number"
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                  placeholder="Enter score"
                />
              </div>
              <Button type="submit">Add/Update Student</Button>
            </form>
          </CardContent>
        </Card> */}

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
                      <img
                        src={`https://avatar.iran.liara.run/username?username=${student.name}`}
                        alt="avatar" width={30}
                        className='mr-2'/>
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
