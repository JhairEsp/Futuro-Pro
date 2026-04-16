'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Grade {
  id: string
  exam_number: number
  score: number | null
  enrollment_id: string
}

interface StudentGrades {
  enrollment_id: string
  student_name: string
  classroom_name: string
  grades: Grade[]
}

export default function GradesPage() {
  const [gradesData, setGradesData] = useState<StudentGrades[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClassroom, setSelectedClassroom] = useState('')
  const [classrooms, setClassrooms] = useState<any[]>([])

  useEffect(() => {
    fetchClassrooms()
  }, [])

  const fetchClassrooms = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('classrooms')
      .select('id, name')
      .order('created_at', { ascending: false })

    setClassrooms(data || [])
    if (data && data.length > 0) {
      setSelectedClassroom(data[0].id)
      await fetchGrades(data[0].id)
    } else {
      setLoading(false)
    }
  }

  const fetchGrades = async (classroomId: string) => {
    const supabase = createClient()
    
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select(`
        id,
        student:students(first_name, last_name),
        classroom:classrooms(name)
      `)
      .eq('classroom_id', classroomId)

    if (!enrollments) {
      setGradesData([])
      setLoading(false)
      return
    }

    // Fetch grades for each enrollment
    const gradesDataPromises = enrollments.map(async (enrollment: any) => {
      const { data: grades } = await supabase
        .from('grades')
        .select('*')
        .eq('enrollment_id', enrollment.id)
        .order('exam_number', { ascending: true })

      return {
        enrollment_id: enrollment.id,
        student_name: `${enrollment.student.first_name} ${enrollment.student.last_name}`,
        classroom_name: enrollment.classroom.name,
        grades: grades || Array.from({ length: 7 }, (_, i) => ({
          id: `${enrollment.id}-${i + 1}`,
          exam_number: i + 1,
          score: null,
          enrollment_id: enrollment.id,
        })),
      }
    })

    const allGrades = await Promise.all(gradesDataPromises)
    setGradesData(allGrades)
    setLoading(false)
  }

  const handleGradeChange = async (enrollmentId: string, examNumber: number, score: string) => {
    const supabase = createClient()
    const scoreNum = score ? parseFloat(score) : null

    if (scoreNum && (scoreNum < 0 || scoreNum > 100)) {
      alert('La calificación debe estar entre 0 y 100')
      return
    }

    const { data: existing } = await supabase
      .from('grades')
      .select('id')
      .eq('enrollment_id', enrollmentId)
      .eq('exam_number', examNumber)
      .single()

    if (existing) {
      if (scoreNum === null) {
        await supabase.from('grades').delete().eq('id', existing.id)
      } else {
        await supabase
          .from('grades')
          .update({ score: scoreNum, exam_date: new Date().toISOString() })
          .eq('id', existing.id)
      }
    } else if (scoreNum !== null) {
      await supabase.from('grades').insert({
        enrollment_id: enrollmentId,
        exam_number: examNumber,
        score: scoreNum,
        exam_date: new Date().toISOString(),
      })
    }

    fetchGrades(selectedClassroom)
  }

  return (
    <DashboardLayout role="teacher" title="Gestión de Calificaciones">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-slate-900">Calificaciones por Examen</h3>
          {classrooms.length > 0 && (
            <select
              value={selectedClassroom}
              onChange={(e) => {
                setSelectedClassroom(e.target.value)
                fetchGrades(e.target.value)
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {classrooms.map(classroom => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : gradesData.length === 0 ? (
          <Card className="p-8 text-center text-slate-600">
            No hay estudiantes en este salón.
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Estudiante</th>
                  {[1, 2, 3, 4, 5, 6, 7].map(exam => (
                    <th key={exam} className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                      Ex. {exam}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {gradesData.map(student => {
                  const scores = student.grades
                    .map(g => g.score)
                    .filter((s): s is number => s !== null)
                  const average = scores.length > 0
                    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
                    : '-'

                  return (
                    <tr key={student.enrollment_id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {student.student_name}
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7].map(examNum => {
                        const grade = student.grades.find(g => g.exam_number === examNum)
                        return (
                          <td key={examNum} className="px-4 py-4 text-center">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={grade?.score ?? ''}
                              onChange={(e) => handleGradeChange(student.enrollment_id, examNum, e.target.value)}
                              className="w-16 text-center"
                              placeholder="-"
                            />
                          </td>
                        )
                      })}
                      <td className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                        {average}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
