'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { BarChart3, Users, ChevronDown } from 'lucide-react'

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
      alert('La calificacion debe estar entre 0 y 100')
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

  const getScoreColor = (score: number | null) => {
    if (score === null) return ''
    if (score >= 16) return 'text-primary'
    if (score >= 12) return 'text-primary/70'
    if (score >= 11) return 'text-warning'
    return 'text-destructive'
  }

  return (
    <DashboardLayout role="teacher" title="Gestion de Calificaciones">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Calificaciones por Examen</h3>
            <p className="text-sm text-muted-foreground mt-1">Registra y actualiza las notas de tus estudiantes</p>
          </div>
          
          {classrooms.length > 0 && (
            <div className="relative">
              <select
                value={selectedClassroom}
                onChange={(e) => {
                  setSelectedClassroom(e.target.value)
                  fetchGrades(e.target.value)
                }}
                className="appearance-none px-4 py-2.5 pr-10 bg-secondary/50 border border-border/50 rounded-xl text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 cursor-pointer"
              >
                {classrooms.map(classroom => (
                  <option key={classroom.id} value={classroom.id} className="bg-card text-foreground">
                    {classroom.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="relative inline-flex">
                <div className="w-12 h-12 rounded-full border-4 border-secondary" />
                <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
              <p className="text-muted-foreground mt-4">Cargando calificaciones...</p>
            </div>
          </div>
        ) : gradesData.length === 0 ? (
          <Card className="glass-card p-12 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">Sin estudiantes</h4>
            <p className="text-muted-foreground">No hay estudiantes inscritos en este salon.</p>
          </Card>
        ) : (
          <Card className="glass-card overflow-hidden animate-fade-in">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead className="bg-secondary/50 border-b border-border/50">
                  <tr>
                    <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-foreground sticky left-0 bg-secondary/50 z-10">
                      Estudiante
                    </th>
                    {[1, 2, 3, 4, 5, 6, 7].map(exam => (
                      <th key={exam} className="px-2 lg:px-4 py-4 text-center text-sm font-semibold text-foreground whitespace-nowrap">
                        Ex. {exam}
                      </th>
                    ))}
                    <th className="px-4 lg:px-6 py-4 text-center text-sm font-semibold text-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Promedio
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {gradesData.map((student, index) => {
                    const scores = student.grades
                      .map(g => g.score)
                      .filter((s): s is number => s !== null)
                    const average = scores.length > 0
                      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
                      : '-'

                    return (
                      <tr 
                        key={student.enrollment_id} 
                        className="border-b border-border/50 hover:bg-secondary/30 transition-colors duration-200 animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-4 lg:px-6 py-4 text-sm font-medium text-foreground sticky left-0 bg-card/80 backdrop-blur-sm z-10">
                          {student.student_name}
                        </td>
                        {[1, 2, 3, 4, 5, 6, 7].map(examNum => {
                          const grade = student.grades.find(g => g.exam_number === examNum)
                          return (
                            <td key={examNum} className="px-2 lg:px-4 py-4 text-center">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={grade?.score ?? ''}
                                onChange={(e) => handleGradeChange(student.enrollment_id, examNum, e.target.value)}
                                className="w-14 lg:w-16 text-center bg-secondary/50 border-border/50 text-foreground focus:border-primary focus:ring-primary/20 rounded-lg"
                                placeholder="-"
                              />
                            </td>
                          )
                        })}
                        <td className={`px-4 lg:px-6 py-4 text-center text-sm font-bold ${getScoreColor(average !== '-' ? parseFloat(average) : null)}`}>
                          {average}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
