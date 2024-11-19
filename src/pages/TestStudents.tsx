'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Student = {
  id: number
  name: string
  score: number
}

export default function QuizAdminDashboard() {
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: 'Alice', score: 85 },
    { id: 2, name: 'Bob', score: 78 },
    { id: 3, name: 'Charlie', score: 92 },
  ])

  const [newName, setNewName] = useState('')
  const [newScore, setNewScore] = useState('')

  const addOrUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault()
    const score = parseInt(newScore)
    if (!newName || isNaN(score)) return

    const existingStudentIndex = students.findIndex(s => s.name.toLowerCase() === newName.toLowerCase())
    if (existingStudentIndex !== -1) {
      // Update existing student's score
      const updatedStudents = [...students]
      updatedStudents[existingStudentIndex].score = score
      setStudents(updatedStudents)
    } else {
      // Add new student
      setStudents([...students, { id: Date.now(), name: newName, score }])
    }

    setNewName('')
    setNewScore('')
  }

  const sortedStudents = [...students].sort((a, b) => b.score - a.score)

  return (
    <div className="container mx-auto p-4 w-screen border">
      <h1 className="text-3xl font-bold mb-6">Quiz Admin Dashboard</h1>
      <div className='flex flex-grow h-full border '>
      <Card className="mb-6 h-full">
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
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {sortedStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
                className={`p-4 mb-2 rounded-lg ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-gray-100 dark:bg-gray-800'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{student.name}</span>
                  <span className="text-lg">{student.score}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>
      </div>
      
    </div>
  )
}