'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

interface SkillData {
  name: string
  value: number
}

interface CareerMatch {
  name: string
  match: number
  skills: string[]
  description: string
}

export default function StudentSkillsPage() {
  const [skillsData, setSkillsData] = useState<SkillData[]>([])
  const [loading, setLoading] = useState(true)
  const [overallAverage, setOverallAverage] = useState(0)
  const [careerRecommendations, setCareerRecommendations] = useState<CareerMatch[]>([])

  useEffect(() => {
    fetchSkillsAndCareers()
  }, [])

  const fetchSkillsAndCareers = async () => {
    try {
      const response = await fetch('/api/student/skills')
      if (!response.ok) throw new Error('Error fetching skills')
      const data = await response.json()

      // Convert skills object to array format (0-20 scale)
      const skillsArray = Object.entries(data.skills).map(([name, value]) => ({
        name,
        value: typeof value === 'number' ? Math.min(20, Math.max(0, value)) : 0
      }))

      setSkillsData(skillsArray)
      setOverallAverage(data.overallAverage)
      setCareerRecommendations(data.careerRecommendations)
    } catch (error) {
      console.error('Error fetching skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSkillColor = (value: number) => {
    // Color scale for 0-20 score: red (0) -> yellow (10) -> green (20)
    if (value < 6) return '#ef4444' // Red - Bajo
    if (value < 12) return '#eab308' // Yellow - Medio
    if (value < 16) return '#84cc16' // Lime - Bueno
    return '#22c55e' // Green - Excelente
  }

  const getGradeLabel = (value: number) => {
    if (value < 6) return 'Bajo'
    if (value < 12) return 'Medio'
    if (value < 16) return 'Bueno'
    return 'Excelente'
  }

  if (loading) {
    return (
      <DashboardLayout role="student" title="Análisis de Habilidades y Carreras">
        <div className="flex items-center justify-center h-96">
          <p className="text-slate-500">Cargando análisis de habilidades...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="student" title="Análisis de Habilidades y Carreras">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
          {/* Promedio General */}
          <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Promedio General</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke={getSkillColor(overallAverage)}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(overallAverage / 20) * 339.29} 339.29`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-3xl font-bold">{overallAverage.toFixed(1)}</p>
                  <p className="text-xs text-slate-500">/ 20</p>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-slate-600 mt-4">
              {getGradeLabel(overallAverage)} desempeño
            </p>
          </Card>

          {/* Gráfico Radar de Habilidades */}
          <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Perfil de Habilidades</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={skillsData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 20]} />
                <Radar
                  name="Habilidad"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.5}
                  animationDuration={1000}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Detalle de Habilidades */}
        <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Detalle de Habilidades (0-20)</h3>
          <div className="space-y-4">
            {skillsData.map((skill, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">{skill.name}</span>
                  <span className="text-sm font-bold" style={{ color: getSkillColor(skill.value) }}>
                    {skill.value.toFixed(1)}/20
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: loading ? '0%' : `${(skill.value / 20) * 100}%`,
                      backgroundColor: getSkillColor(skill.value),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Escala de Evaluación */}
        <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Escala de Evaluación</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-xs font-medium text-red-700">0 - 5</p>
              <p className="text-lg font-bold text-red-600">Bajo</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <p className="text-xs font-medium text-yellow-700">6 - 11</p>
              <p className="text-lg font-bold text-yellow-600">Medio</p>
            </div>
            <div className="p-3 rounded-lg bg-lime-50 border border-lime-200">
              <p className="text-xs font-medium text-lime-700">12 - 15</p>
              <p className="text-lg font-bold text-lime-600">Bueno</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="text-xs font-medium text-green-700">16 - 20</p>
              <p className="text-lg font-bold text-green-600">Excelente</p>
            </div>
          </div>
        </Card>

        {/* Recomendaciones de Carreras */}
        <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Recomendaciones de Carreras Universitarias</h3>
          <div className="space-y-4">
            {careerRecommendations.slice(0, 5).map((career, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{career.name}</p>
                    <p className="text-sm text-slate-600 mt-1">{career.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{career.match}%</p>
                    <p className="text-xs text-slate-500">Compatibilidad</p>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${career.match}%`,
                      backgroundColor: career.match >= 80 ? '#22c55e' : career.match >= 60 ? '#eab308' : '#ef4444',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
