'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { Sparkles, TrendingUp, Award, GraduationCap, Target } from 'lucide-react'

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
    if (value < 6) return 'text-destructive'
    if (value < 12) return 'text-warning'
    if (value < 16) return 'text-primary/70'
    return 'text-primary'
  }

  const getSkillBgColor = (value: number) => {
    if (value < 6) return 'bg-destructive'
    if (value < 12) return 'bg-warning'
    if (value < 16) return 'bg-primary/70'
    return 'bg-primary'
  }

  const getGradeLabel = (value: number) => {
    if (value < 6) return 'Bajo'
    if (value < 12) return 'Medio'
    if (value < 16) return 'Bueno'
    return 'Excelente'
  }

  if (loading) {
    return (
      <DashboardLayout role="student" title="Analisis de Habilidades y Carreras">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="relative inline-flex">
              <div className="w-12 h-12 rounded-full border-4 border-secondary" />
              <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-muted-foreground mt-4">Analizando habilidades...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="student" title="Analisis de Habilidades y Carreras">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-xl font-semibold text-foreground">Tu Perfil de Habilidades</h3>
          <p className="text-sm text-muted-foreground mt-1">Descubre tus fortalezas y recomendaciones de carrera</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {/* Average card */}
          <Card className="glass-card p-6 card-hover animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-foreground">Promedio General</h4>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-32 h-32 sm:w-36 sm:h-36">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    className="stroke-secondary"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    className="stroke-primary transition-all duration-1000"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(overallAverage / 20) * 339.29} 339.29`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <p className="text-3xl font-bold text-foreground">{overallAverage.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">/ 20</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSkillBgColor(overallAverage)} text-primary-foreground`}>
                {getGradeLabel(overallAverage)} desempeno
              </span>
            </div>
          </Card>

          {/* Radar chart */}
          <Card className="glass-card p-6 card-hover animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-foreground">Perfil de Habilidades</h4>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={skillsData}>
                <PolarGrid stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 12, fill: '#ffffff', fontWeight: 500 }} />
                <PolarRadiusAxis angle={90} domain={[0, 20]} tick={{ fontSize: 11, fill: '#ffffff' }} />
                <Radar
                  name="Habilidad"
                  dataKey="value"
                  stroke="#00ff00"
                  fill="#00ff00"
                  fillOpacity={0.4}
                  animationDuration={1000}
              />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Skills detail */}
        <Card className="glass-card p-6 card-hover animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-lg font-semibold text-foreground">Detalle de Habilidades</h4>
              <p className="text-sm text-muted-foreground">Escala de 0 a 20 puntos</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="space-y-4">
            {skillsData.map((skill, idx) => (
              <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">{skill.name}</span>
                  <span className={`text-sm font-bold ${getSkillColor(skill.value)}`}>
                    {skill.value.toFixed(1)}/20
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${getSkillBgColor(skill.value)}`}
                    style={{ width: `${(skill.value / 20) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Scale reference */}
        <Card className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h4 className="text-lg font-semibold text-foreground mb-4">Escala de Evaluacion</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-xs font-medium text-destructive/80">0 - 5</p>
              <p className="text-lg font-bold text-destructive">Bajo</p>
            </div>
            <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
              <p className="text-xs font-medium text-warning/80">6 - 11</p>
              <p className="text-lg font-bold text-warning">Medio</p>
            </div>
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-xs font-medium text-primary/80">12 - 15</p>
              <p className="text-lg font-bold text-primary/80">Bueno</p>
            </div>
            <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
              <p className="text-xs font-medium text-primary">16 - 20</p>
              <p className="text-lg font-bold text-primary">Excelente</p>
            </div>
          </div>
        </Card>

        {/* Career recommendations */}
        <Card className="glass-card p-6 card-hover animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-lg font-semibold text-foreground">Recomendaciones de Carreras</h4>
              <p className="text-sm text-muted-foreground">Basadas en tu perfil de habilidades</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="space-y-4">
            {careerRecommendations.slice(0, 5).map((career, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/30 hover:bg-secondary/50 transition-all duration-300 animate-fade-in group"
                style={{ animationDelay: `${(idx + 5) * 0.1}s` }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{career.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{career.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 sm:self-start">
                    <span className="text-lg font-bold text-primary">{career.match}%</span>
                    <span className="text-xs text-muted-foreground">match</span>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                      career.match >= 80 ? 'bg-primary' : career.match >= 60 ? 'bg-warning' : 'bg-destructive'
                    }`}
                    style={{ width: `${career.match}%` }}
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
