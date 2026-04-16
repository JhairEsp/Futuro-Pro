import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        id,
        classrooms (
          id,
          name,
          subject
        ),
        grades (
          exam_number,
          score
        )
      `)
      .eq('student_id', user.id)

    if (error) throw error
    if (!data) return NextResponse.json([])

    const courseGrades = data.map((enrollment: any) => {
      const classroom = enrollment.classrooms
      const gradesData = enrollment.grades || []

      const scores = gradesData
        .map((g: any) => g.score)
        .filter((s: number | null): s is number => s !== null)

      const average = scores.length > 0
        ? parseFloat(
            (scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(2)
          )
        : null

      return {
        classroom_name: `${classroom?.subject || 'Curso'} - ${classroom?.name || 'Sin nombre'}`,
        classroom_id: classroom?.id,
        grades: Array.from({ length: 7 }, (_, i) => ({
          exam_number: i + 1,
          score:
            gradesData.find((g: any) => g.exam_number === i + 1)?.score || null,
        })),
        average,
      }
    })

    return NextResponse.json(courseGrades)

  } catch (error) {
    console.error('Error fetching grades:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}