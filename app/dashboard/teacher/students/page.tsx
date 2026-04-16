'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, X, Search, Users, UserPlus, BookOpen, Mail, CheckCircle2 } from 'lucide-react'

interface Student {
  id: string
  email: string
  first_name: string
  last_name: string
  enrollment_number: string
}

interface Classroom {
  id: string
  name: string
  subject: string
}

interface Enrollment {
  id: string
  student_id: string
  classroom_id: string
  student: Student
  classroom: Classroom
}

export default function StudentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedClassroom, setSelectedClassroom] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()

    try {
      // Fetch classrooms
      const { data: classroomsData, error: classroomsError } = await supabase
        .from('classrooms')
        .select('id, name, subject')
        .order('created_at', { ascending: false })

      if (classroomsError) throw classroomsError
      setClassrooms(classroomsData || [])

      // Fetch all students using API endpoint (bypasses RLS)
      const studentsResponse = await fetch('/api/students/list')
      if (!studentsResponse.ok) {
        throw new Error(`Error fetching students: ${studentsResponse.statusText}`)
      }
      const studentsData = await studentsResponse.json()
      setAllStudents(studentsData || [])

      // Fetch enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          id,
          student_id,
          classroom_id,
          student:students(id, email, first_name, last_name, enrollment_number),
          classroom:classrooms(id, name, subject)
        `)

      if (enrollmentsError) throw enrollmentsError
      setEnrollments(enrollmentsData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = searchTerm
    ? allStudents.filter(
        (student) =>
          student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allStudents

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClassroom || !selectedStudent) {
      setError('Por favor selecciona un salon y un estudiante')
      return
    }

    const supabase = createClient()

    try {
      // Check if student is already enrolled in this classroom
      const { data: existing } = await supabase
        .from('enrollments')
        .select('id')
        .eq('classroom_id', selectedClassroom)
        .eq('student_id', selectedStudent.id)
        .single()

      if (existing) {
        setError('Este estudiante ya esta inscrito en este salon')
        return
      }

      const { error: enrollError } = await supabase.from('enrollments').insert({
        classroom_id: selectedClassroom,
        student_id: selectedStudent.id,
      })

      if (enrollError) throw enrollError

      // Reset form
      setSelectedStudent(null)
      setSelectedClassroom('')
      setSearchTerm('')
      setShowForm(false)
      setError(null)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar estudiante')
    }
  }

  const handleRemoveStudent = async (enrollmentId: string) => {
    if (!window.confirm('Esta seguro de remover este estudiante?')) return

    const supabase = createClient()
    try {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollmentId)

      if (error) throw error
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al remover')
    }
  }

  const resetForm = () => {
    setSelectedStudent(null)
    setSelectedClassroom('')
    setSearchTerm('')
    setShowForm(false)
    setError(null)
  }

  return (
    <DashboardLayout role="teacher" title="Gestion de Estudiantes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Estudiantes Inscritos</h3>
            <p className="text-sm text-muted-foreground mt-1">Administra las inscripciones de tus estudiantes</p>
          </div>
          {!showForm && (
            <Button 
              onClick={() => setShowForm(true)} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-5 glow-button group transition-all duration-300"
            >
              <UserPlus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Agregar Estudiante
            </Button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <Card className="glass-card border-primary/20 p-6 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-lg font-semibold text-foreground">Agregar Estudiante al Salon</h4>
                <p className="text-sm text-muted-foreground">Selecciona un salon y un estudiante</p>
              </div>
              <button onClick={resetForm} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-5">
              {/* Classroom selection */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Seleccionar Salon*
                </label>
                <select
                  value={selectedClassroom}
                  onChange={(e) => setSelectedClassroom(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary/50 border border-border/50 rounded-xl text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  required
                >
                  <option value="" className="bg-card text-foreground">-- Selecciona un salon --</option>
                  {classrooms.map((classroom) => (
                    <option key={classroom.id} value={classroom.id} className="bg-card text-foreground">
                      {classroom.name} - {classroom.subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student search */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Seleccionar Estudiante*
                </label>

                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 rounded-xl"
                  />
                </div>

                {/* Selected student */}
                {selectedStudent && (
                  <div className="mb-3 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between animate-scale-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {selectedStudent.first_name} {selectedStudent.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{selectedStudent.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedStudent(null)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Student list */}
                <div className="border border-border/50 rounded-xl max-h-64 overflow-y-auto bg-secondary/30 custom-scrollbar">
                  {filteredStudents.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                      {searchTerm ? 'No se encontraron estudiantes' : 'No hay estudiantes disponibles'}
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {filteredStudents.map((student) => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => {
                            setSelectedStudent(student)
                            setSearchTerm('')
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-primary/5 transition-all duration-200 flex items-center gap-3 ${
                            selectedStudent?.id === student.id ? 'bg-primary/10' : ''
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                            <Users className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive animate-fade-in">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-5 glow-button"
                  disabled={!selectedClassroom || !selectedStudent}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Agregar Estudiante
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1 border-border/50 text-foreground hover:bg-secondary rounded-xl py-5">
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="relative inline-flex">
                <div className="w-12 h-12 rounded-full border-4 border-secondary" />
                <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
              <p className="text-muted-foreground mt-4">Cargando estudiantes...</p>
            </div>
          </div>
        ) : enrollments.length === 0 ? (
          <Card className="glass-card p-12 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">Sin estudiantes</h4>
            <p className="text-muted-foreground mb-6">No hay estudiantes inscritos aun.</p>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 glow-button"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Agregar Estudiante
            </Button>
          </Card>
        ) : (
          <Card className="glass-card overflow-hidden animate-fade-in">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead className="bg-secondary/50 border-b border-border/50">
                  <tr>
                    <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-foreground">Estudiante</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-foreground hidden md:table-cell">Email</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-foreground hidden lg:table-cell">Materia</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-foreground">Salon</th>
                    <th className="px-4 lg:px-6 py-4 text-center text-sm font-semibold text-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment, index) => (
                    <tr 
                      key={enrollment.id} 
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors duration-200 animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {enrollment.student.first_name} {enrollment.student.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground md:hidden">{enrollment.student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          {enrollment.student.email}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <BookOpen className="w-4 h-4" />
                          {enrollment.classroom.subject}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {enrollment.classroom.name}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 rounded-lg"
                          onClick={() => handleRemoveStudent(enrollment.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
