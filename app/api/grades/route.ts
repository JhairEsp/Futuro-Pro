import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const classroomId = request.nextUrl.searchParams.get('classroom_id')

  // Get grades for a classroom (teacher only)
  const { data, error } = await supabase
    .from('grades')
    .select(`
      id,
      exam_number,
      score,
      exam_date,
      enrollment:enrollments(
        id,
        student:students(id, first_name, last_name, email)
      )
    `)
    .eq('enrollments.classrooms.teacher_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { enrollment_id, exam_number, score } = body

  // Verify teacher ownership
  const { data: grade, error: checkError } = await supabase
    .from('grades')
    .select(`
      id,
      enrollment:enrollments(
        classroom:classrooms(teacher_id)
      )
    `)
    .eq('enrollment_id', enrollment_id)
    .eq('exam_number', exam_number)
    .single()

  if (checkError?.code === 'PGRST116') {
    // Grade doesn't exist, create it
    const { data: newGrade, error } = await supabase
      .from('grades')
      .insert({
        enrollment_id,
        exam_number,
        score,
        exam_date: new Date().toISOString(),
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(newGrade, { status: 201 })
  }

  // Update existing grade
  const { data: updated, error } = await supabase
    .from('grades')
    .update({
      score,
      exam_date: new Date().toISOString(),
    })
    .eq('enrollment_id', enrollment_id)
    .eq('exam_number', exam_number)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(updated)
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const gradeId = request.nextUrl.searchParams.get('id')

  const { error } = await supabase
    .from('grades')
    .delete()
    .eq('id', gradeId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
