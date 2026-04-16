'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, X, BookOpen, Calendar, Edit3 } from 'lucide-react'

interface Classroom {
  id: string
  name: string
  subject: string
  year: number
  description: string
}

const SUBJECTS = [
  'Matematica',
  'Comunicacion',
  'Ciencias Sociales',
  'Ingles',
  'Arte',
  'Educacion Fisica',
]

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    subject: 'Matematica',
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
      subject: 'Matematica',
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
      setError(err instanceof Error ? err.message : 'Ocurrio un error')
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
    if (!window.confirm('Esta seguro de que desea eliminar este salon?')) return

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Gestion de Salones</h3>
            <p className="text-sm text-muted-foreground mt-1">Administra tus clases y estudiantes</p>
          </div>
          {!showForm && (
            <Button 
              onClick={() => {
                setEditingId(null)
                setFormData({
                  name: '',
                  subject: 'Matematica',
                  year: new Date().getFullYear(),
                  description: '',
                })
                setShowForm(true)
                setError(null)
              }} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-5 glow-button group transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Nuevo Salon
            </Button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <Card className="glass-card border-primary/20 p-6 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-lg font-semibold text-foreground">
                  {editingId ? 'Editar Salon' : 'Crear Nuevo Salon'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {editingId ? 'Modifica los datos del salon' : 'Completa los datos para crear un salon'}
                </p>
              </div>
              <button
                onClick={resetForm}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateClassroom} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Nombre del Salon*
                  </label>
                  <Input
                    placeholder="Ej: 5to A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Materia*
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 bg-secondary/50 border border-border/50 rounded-xl text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  >
                    {SUBJECTS.map((subject) => (
                      <option key={subject} value={subject} className="bg-card text-foreground">
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Ano
                  </label>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    min={2024}
                    max={2050}
                    className="bg-secondary/50 border-border/50 text-foreground focus:border-primary focus:ring-primary/20 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Descripcion
                </label>
                <textarea
                  placeholder="Descripcion del salon (opcional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 resize-none"
                  rows={3}
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive animate-fade-in">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-5 glow-button">
                  {editingId ? 'Guardar Cambios' : 'Crear Salon'}
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
              <p className="text-muted-foreground mt-4">Cargando salones...</p>
            </div>
          </div>
        ) : classrooms.length === 0 ? (
          <Card className="glass-card p-12 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">No hay salones</h4>
            <p className="text-muted-foreground mb-6">Crea tu primer salon para comenzar a gestionar tus clases</p>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 glow-button"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear Salon
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {classrooms.map((classroom, index) => (
              <Card 
                key={classroom.id} 
                className="glass-card card-hover p-6 animate-fade-in-up group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <Calendar className="w-3 h-3" />
                    {classroom.year}
                  </div>
                </div>
                
                {/* Card content */}
                <h4 className="text-lg font-semibold text-foreground mb-1">{classroom.name}</h4>
                <p className="text-sm font-medium text-primary mb-3">{classroom.subject}</p>
                
                {classroom.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{classroom.description}</p>
                )}
                
                {/* Card actions */}
                <div className="flex gap-2 pt-4 border-t border-border/50">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-border/50 text-foreground hover:bg-secondary rounded-lg group/btn"
                    onClick={() => handleEditClassroom(classroom)}
                  >
                    <Edit3 className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform duration-300" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 rounded-lg px-3"
                    onClick={() => handleDeleteClassroom(classroom.id)}
                  >
                    <Trash2 className="w-4 h-4" />
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
