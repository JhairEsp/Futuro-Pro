'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, X, Search } from 'lucide-react'

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
      setError('Por favor selecciona un salón y un estudiante')
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
        setError('Este estudiante ya está inscrito en este salón')
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
    if (!window.confirm('¿Está seguro de remover este estudiante?')) return

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
    <DashboardLayout role="teacher" title="Gestión de Estudiantes">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-slate-900">Estudiantes Inscritos</h3>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus size={20} />
              Agregar Estudiante
            </Button>
          )}
        </div>

        {showForm && (
          <Card className="p-6 border-2 border-blue-200 bg-blue-50">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-slate-900">Agregar Estudiante al Salón</h4>
              <button onClick={resetForm} className="text-slate-600 hover:text-slate-900">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Seleccionar Salón*
                </label>
                <select
                  value={selectedClassroom}
                  onChange={(e) => setSelectedClassroom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">-- Selecciona un salón --</option>
                  {classrooms.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Seleccionar Estudiante*
                </label>

                <div className="relative mb-2">
                  <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {selectedStudent && (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                    <div className="text-sm text-green-700">
                      <div className="font-medium">
                        {selectedStudent.first_name} {selectedStudent.last_name}
                      </div>
                      <div className="text-xs text-green-600">{selectedStudent.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedStudent(null)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div className="border border-slate-300 rounded-lg max-h-64 overflow-y-auto bg-white">
                  {filteredStudents.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-sm">
                      {searchTerm ? 'No se encontraron estudiantes' : 'No hay estudiantes disponibles'}
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {filteredStudents.map((student) => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => {
                            setSelectedStudent(student)
                            setSearchTerm('')
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition ${
                            selectedStudent?.id === student.id ? 'bg-blue-100' : ''
                          }`}
                        >
                          <div className="font-medium text-slate-900">
                            {student.first_name} {student.last_name}
                          </div>
                          <div className="text-xs text-slate-600">{student.email}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!selectedClassroom || !selectedStudent}
                >
                  Agregar Estudiante
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-8 text-slate-600">Cargando...</div>
        ) : enrollments.length === 0 ? (
          <Card className="p-8 text-center text-slate-600">
            No hay estudiantes inscritos aún.
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Estudiante</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Materia</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Salón</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {enrollment.student.first_name} {enrollment.student.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{enrollment.student.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{enrollment.classroom.subject}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{enrollment.classroom.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleRemoveStudent(enrollment.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
