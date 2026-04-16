'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card } from '@/components/ui/card'
import { BookOpen, TrendingUp, Award } from 'lucide-react'

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

  const getGradeColor = (score: number | null) => {
    if (score === null) return 'bg-secondary text-muted-foreground'
    if (score >= 16) return 'bg-primary text-primary-foreground'
    if (score >= 12) return 'bg-primary/20 text-primary'
    if (score >= 11) return 'bg-warning/20 text-warning-foreground'
    return 'bg-destructive/20 text-destructive'
  }

  const getAverageColor = (avg: number | null) => {
    if (avg === null) return 'text-muted-foreground'
    if (avg >= 16) return 'text-primary'
    if (avg >= 12) return 'text-primary'
    if (avg >= 11) return 'text-warning'
    return 'text-destructive'
  }

  return (
    <DashboardLayout role="student" title="Mis Calificaciones">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Resumen de Calificaciones</h3>
            <p className="text-sm text-muted-foreground mt-1">Revisa tu progreso academico</p>
          </div>
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
        ) : courseGrades.length === 0 ? (
          <Card className="glass-card p-12 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">Sin cursos asignados</h4>
            <p className="text-muted-foreground">No estas inscrito en ningun curso aun.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {courseGrades.map((course, index) => (
              <Card
                key={course.classroom_id ?? `course-${index}`}
                className="glass-card p-4 sm:p-6 animate-fade-in-up card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Course header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {course.classroom_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {course.grades.filter(g => g.score !== null).length} de {course.grades.length} examenes completados
                      </p>
                    </div>
                  </div>

                  {/* Average badge */}
                  <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-secondary/50 border border-border/50">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Promedio</p>
                      <div className="flex items-center gap-2">
                        {course.average !== null && course.average >= 14 && (
                          <Award className="w-4 h-4 text-primary" />
                        )}
                        <p className={`text-2xl font-bold ${getAverageColor(course.average)}`}>
                          {course.average !== null ? course.average.toFixed(1) : '-'}
                        </p>
                      </div>
                    </div>
                    <TrendingUp className={`w-5 h-5 ${getAverageColor(course.average)}`} />
                  </div>
                </div>

                {/* Grades grid */}
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
                  {course.grades.map((grade) => (
                    <div
                      key={`grade-${course.classroom_id}-${grade.exam_number}`}
                      className="text-center group"
                    >
                      <p className="text-xs text-muted-foreground mb-2 truncate">
                        Ex. {grade.exam_number}
                      </p>
                      <div
                        className={`
                          py-2.5 sm:py-3 px-1 rounded-xl font-bold text-sm sm:text-base
                          transition-all duration-300 group-hover:scale-105
                          ${getGradeColor(grade.score)}
                        `}
                      >
                        {grade.score ?? '-'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mt-6 pt-4 border-t border-border/50">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Progreso del curso</span>
                    <span>{Math.round((course.grades.filter(g => g.score !== null).length / course.grades.length) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(course.grades.filter(g => g.score !== null).length / course.grades.length) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
