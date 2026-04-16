import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get enrollments with classroom subject
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('id, classroom_id')
      .eq('student_id', user.id)

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({
        skills: {
          'Matemáticas': 0,
          'Análisis Crítico': 0,
          'Resolución de Problemas': 0,
          'Comunicación': 0,
          'Liderazgo': 0,
          'Creatividad': 0,
          'Pensamiento Crítico': 0,
        },
        overallAverage: 0,
        careerRecommendations: []
      })
    }

    // Get classroom subjects
    const classroomIds = enrollments.map(e => e.classroom_id)
    const { data: classrooms, error: classError } = await supabase
      .from('classrooms')
      .select('id, subject')
      .in('id', classroomIds)



    const subjectMap = new Map(classrooms?.map(c => [c.id, c.subject]) || [])

    // Get all grades for all enrollments
    const gradesMap: Record<string, number[]> = {}
    const allScores: number[] = []

    for (const enrollment of enrollments) {
      const { data: grades } = await supabase
        .from('grades')
        .select('score')
        .eq('enrollment_id', enrollment.id)

      const subject = subjectMap.get(enrollment.classroom_id) || 'Desconocido'
      const scores = (grades || [])
        .map(g => g.score)
        .filter((s): s is number => s !== null)

      if (!gradesMap[subject]) {
        gradesMap[subject] = []
      }
      gradesMap[subject].push(...scores)
      allScores.push(...scores)
    }

    // Calculate overall average
    const overallAverage = allScores.length > 0
      ? parseFloat((allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2))
      : 0

    // Calculate skills based on subject grades (notes are 0-20)
    const skillsAccum: Record<string, { total: number; count: number }> = {
      'Matemáticas': { total: 0, count: 0 },
      'Análisis Crítico': { total: 0, count: 0 },
      'Resolución de Problemas': { total: 0, count: 0 },
      'Comunicación': { total: 0, count: 0 },
      'Liderazgo': { total: 0, count: 0 },
      'Creatividad': { total: 0, count: 0 },
      'Pensamiento Crítico': { total: 0, count: 0 },
    }

    for (const subject of Object.keys(gradesMap)) {
      if (gradesMap[subject].length === 0) continue

      const avg = gradesMap[subject].reduce((a, b) => a + b, 0) / gradesMap[subject].length

      const subjectLower = subject.toLowerCase()
      
      if (subjectLower.includes('matemática') || subjectLower.includes('matematica')) {
        skillsAccum['Matemáticas'].total += avg
        skillsAccum['Matemáticas'].count++
        skillsAccum['Análisis Crítico'].total += avg * 0.8
        skillsAccum['Análisis Crítico'].count++
        skillsAccum['Resolución de Problemas'].total += avg * 0.9
        skillsAccum['Resolución de Problemas'].count++
      } else if (subjectLower.includes('comunicación') || subjectLower.includes('comunicacion')) {
        skillsAccum['Comunicación'].total += avg
        skillsAccum['Comunicación'].count++
        skillsAccum['Liderazgo'].total += avg * 0.8
        skillsAccum['Liderazgo'].count++
      } else if (subjectLower.includes('ciencia')) {
        skillsAccum['Análisis Crítico'].total += avg * 0.9
        skillsAccum['Análisis Crítico'].count++
        skillsAccum['Pensamiento Crítico'].total += avg
        skillsAccum['Pensamiento Crítico'].count++
      } else if (subjectLower.includes('inglés') || subjectLower.includes('ingles')) {
        skillsAccum['Comunicación'].total += avg * 0.9
        skillsAccum['Comunicación'].count++
        skillsAccum['Liderazgo'].total += avg * 0.7
        skillsAccum['Liderazgo'].count++
      } else if (subjectLower.includes('arte')) {
        skillsAccum['Creatividad'].total += avg
        skillsAccum['Creatividad'].count++
      } else if (subjectLower.includes('educación') || subjectLower.includes('educacion') || subjectLower.includes('física') || subjectLower.includes('fisica')) {
        skillsAccum['Liderazgo'].total += avg * 0.8
        skillsAccum['Liderazgo'].count++
      } else {
        // If subject is unknown, assign to all skills evenly
        const skillNames = Object.keys(skillsAccum)
        skillNames.forEach(skill => {
          skillsAccum[skill].total += avg / skillNames.length
          skillsAccum[skill].count++
        })
      }
    }

    // Convert to final skills (keeping 0-20 scale)
    const skills: Record<string, number> = {}
    for (const skill of Object.keys(skillsAccum)) {
      const { total, count } = skillsAccum[skill]
      skills[skill] = count > 0 ? Math.round(total / count * 100) / 100 : 0
    }



    // Career recommendations
    const careers = [
      {
        name: 'Ingeniería Informática',
        skills: ['Matemáticas', 'Lógica y Resolución de Problemas', 'Análisis Crítico'],
        description: 'Desarrollo de software, sistemas y aplicaciones tecnológicas'
      },
      {
        name: 'Medicina',
        skills: ['Análisis Crítico', 'Pensamiento Crítico', 'Comunicación'],
        description: 'Ciencias de la salud y medicina clínica'
      },
      {
        name: 'Administración de Empresas',
        skills: ['Liderazgo', 'Comunicación', 'Análisis Crítico'],
        description: 'Gestión empresarial y emprendimiento'
      },
      {
        name: 'Psicología',
        skills: ['Comunicación', 'Liderazgo', 'Pensamiento Crítico'],
        description: 'Salud mental y comportamiento humano'
      },
      {
        name: 'Artes Plásticas',
        skills: ['Creatividad', 'Comunicación', 'Pensamiento Crítico'],
        description: 'Artes visuales y expresión creativa'
      },
      {
        name: 'Educación',
        skills: ['Comunicación', 'Liderazgo', 'Empatía'],
        description: 'Formación docente y pedagogía'
      },
      {
        name: 'Ingeniería Civil',
        skills: ['Matemáticas', 'Análisis Crítico', 'Resolución de Problemas'],
        description: 'Infraestructura y construcción'
      },
      {
        name: 'Periodismo',
        skills: ['Comunicación', 'Pensamiento Crítico', 'Creatividad'],
        description: 'Medios de comunicación e información'
      }
    ]

    const careerMatches = careers.map(career => {
      let totalMatch = 0
      let matchedSkills = 0

      for (const requiredSkill of career.skills) {
        if (skills[requiredSkill]) {
          totalMatch += skills[requiredSkill]
          matchedSkills++
        }
      }

      const match = matchedSkills > 0 ? Math.round((totalMatch / matchedSkills / 20) * 100) : 0

      return {
        name: career.name,
        match,
        skills: career.skills,
        description: career.description
      }
    }).sort((a, b) => b.match - a.match)

    return NextResponse.json({
      skills,
      overallAverage,
      careerRecommendations: careerMatches
    })
  } catch (error) {
    console.error('Error fetching skills:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
