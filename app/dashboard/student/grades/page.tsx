'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card } from '@/components/ui/card'

interface CourseGrades {
  classroom_name: string
  classroom_id: string | null
  grades: {
    exam_number: number
    score: number | null
  }[]
  average: number | null
}

export default function StudentGradesPage() {
  const [courseGrades, setCourseGrades] = useState<CourseGrades[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGrades()
  }, [])

  const fetchGrades = async () => {
    try {
      const response = await fetch('/api/student/grades')
      if (!response.ok) throw new Error('Error fetching grades')
      const data = await response.json()
      setCourseGrades(data || [])
    } catch (error) {
      console.error('Error fetching grades:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout role="student" title="Mis Calificaciones">
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : courseGrades.length === 0 ? (
          <Card className="p-8 text-center text-slate-600">
            No estás inscrito en ningún curso aún.
          </Card>
        ) : (
          <div className="space-y-4">
            {courseGrades.map((course, index) => (
              <Card
                key={course.classroom_id ?? `course-${index}`}
                className="p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {course.classroom_name}
                  </h3>

                  <div className="text-right">
                    <p className="text-sm text-slate-600">Promedio</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {course.average !== null ? course.average : '-'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {course.grades.map((grade) => (
                    <div
                      key={`grade-${course.classroom_id}-${grade.exam_number}`}
                      className="text-center"
                    >
                      <p className="text-xs text-slate-600 mb-1">
                        Ex. {grade.exam_number}
                      </p>

                      <div
                        className={`
                          py-2 px-1 rounded font-semibold text-sm
                          ${
                            grade.score === null
                              ? 'bg-slate-100 text-slate-600'
                              : grade.score >= 16
                              ? 'bg-green-600 text-white'
                              : grade.score >= 12
                              ? 'bg-green-100 text-green-700'
                              : grade.score >= 11
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }
                        `}
                      >
                        {grade.score ?? '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}