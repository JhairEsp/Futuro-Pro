'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, X } from 'lucide-react'

interface Classroom {
  id: string
  name: string
  subject: string
  year: number
  description: string
}

const SUBJECTS = [
  'Matemática',
  'Comunicación',
  'Ciencias Sociales',
  'Inglés',
  'Arte',
  'Educación Física',
]

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    subject: 'Matemática',
    year: new Date().getFullYear(),
    description: '',
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClassrooms()
  }, [])

  const fetchClassrooms = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching classrooms:', error)
      setError('No se pudieron cargar los salones')
    } else {
      setClassrooms(data || [])
    }
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      subject: 'Matemática',
      year: new Date().getFullYear(),
      description: '',
    })
    setShowForm(false)
    setEditingId(null)
    setError(null)
  }

  const handleCreateOrUpdateClassroom = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    try {
      if (editingId) {
        // Update existing classroom
        const { error } = await supabase
          .from('classrooms')
          .update(formData)
          .eq('id', editingId)
          .eq('teacher_id', user.id)

        if (error) throw error
      } else {
        // Create new classroom
        const { error } = await supabase.from('classrooms').insert({
          teacher_id: user.id,
          ...formData,
        })

        if (error) throw error
      }

      resetForm()
      fetchClassrooms()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error')
    }
  }

  const handleEditClassroom = (classroom: Classroom) => {
    setFormData({
      name: classroom.name,
      subject: classroom.subject,
      year: classroom.year,
      description: classroom.description,
    })
    setEditingId(classroom.id)
    setShowForm(true)
    setError(null)
  }

  const handleDeleteClassroom = async (id: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este salón?')) return

    const supabase = createClient()
    try {
      const { error } = await supabase.from('classrooms').delete().eq('id', id)

      if (error) throw error
      fetchClassrooms()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  return (
    <DashboardLayout role="teacher" title="Mis Salones">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-slate-900">Gestión de Salones</h3>
          {!showForm && (
            <Button 
              onClick={() => {
                setEditingId(null)
                setFormData({
                  name: '',
                  subject: 'Matemática',
                  year: new Date().getFullYear(),
                  description: '',
                })
                setShowForm(true)
                setError(null)
              }} 
              className="flex items-center gap-2"
            >
              <Plus size={20} />
              Nuevo Salón
            </Button>
          )}
        </div>

        {showForm && (
          <Card className="p-6 border-2 border-blue-200 bg-blue-50">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-slate-900">
                {editingId ? 'Editar Salón' : 'Crear Nuevo Salón'}
              </h4>
              <button
                onClick={resetForm}
                className="text-slate-600 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateClassroom} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre del Salón*
                  </label>
                  <Input
                    placeholder="Ej: 5to A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Materia*
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {SUBJECTS.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Año
                  </label>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    min={2024}
                    max={2050}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descripción
                </label>
                <textarea
                  placeholder="Descripción del salón (opcional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingId ? 'Guardar Cambios' : 'Crear Salón'}
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
        ) : classrooms.length === 0 ? (
          <Card className="p-8 text-center text-slate-600">
            No hay salones. Crea uno para empezar.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map((classroom) => (
              <Card key={classroom.id} className="p-6 hover:shadow-lg transition">
                <h4 className="text-lg font-semibold text-slate-900">{classroom.name}</h4>
                <p className="text-sm font-medium text-blue-600 mt-1">{classroom.subject}</p>
                <p className="text-xs text-slate-500 mt-2">
                  Año: {classroom.year}
                </p>
                {classroom.description && (
                  <p className="text-sm text-slate-700 mt-3 line-clamp-2">{classroom.description}</p>
                )}
                <div className="mt-4 pt-4 border-t border-slate-200 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-1"
                    onClick={() => handleEditClassroom(classroom)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteClassroom(classroom.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
