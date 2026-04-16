import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get enrollments
    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select('*')
      .eq('student_id', user.id)

    console.log('[v0] Enrollments:', enrollments)
    console.log('[v0] Enrollments error:', enrollError)

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({
        status: 'No enrollments found',
        enrollments: [],
        classrooms: [],
        grades: []
      })
    }

    // Get classrooms IDs
    const classroomIds = enrollments.map(e => e.classroom_id)
    
    // Try to get classrooms WITHOUT filters first
    const { data: allClassrooms, error: allError } = await supabase
      .from('classrooms')
      .select('*')

    console.log('[v0] ALL Classrooms in DB:', allClassrooms?.length)
    console.log('[v0] ALL Classrooms error:', allError)

    // Now try with filter
    const { data: filteredClassrooms, error: filterError } = await supabase
      .from('classrooms')
      .select('id, name, subject, teacher_id')
      .in('id', classroomIds)

    console.log('[v0] Filtered Classrooms:', filteredClassrooms)
    console.log('[v0] Filter error:', filterError)

    // Get grades
    const gradesPromises = enrollments.map(async (e: any) => {
      const { data: g, error: e_err } = await supabase
        .from('grades')
        .select('*')
        .eq('enrollment_id', e.id)
      return { enrollmentId: e.id, grades: g, error: e_err }
    })
    const gradesResults = await Promise.all(gradesPromises)

    return NextResponse.json({
      status: 'OK',
      userId: user.id,
      enrollments: enrollments.map(e => ({
        id: e.id,
        student_id: e.student_id,
        classroom_id: e.classroom_id
      })),
      classroomIds,
      filteredClassrooms,
      allClassroomsCount: allClassrooms?.length || 0,
      gradesResults: gradesResults.map(r => ({
        enrollmentId: r.enrollmentId,
        gradeCount: r.grades?.length || 0,
        error: r.error?.message
      }))
    })
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
