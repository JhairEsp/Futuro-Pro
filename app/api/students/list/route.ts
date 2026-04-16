import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is a teacher
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('id')
      .eq('id', user.id)
      .single()

    if (teacherError || !teacher) {
      return NextResponse.json(
        { error: 'Only teachers can access this resource' },
        { status: 403 }
      )
    }

    // Fetch all students using service role (bypasses RLS)
    // This is safe because we verified the user is a teacher
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, email, first_name, last_name, enrollment_number')
      .order('first_name', { ascending: true })

    if (studentsError) {
      console.error('[v0] Error fetching students:', studentsError)
      throw studentsError
    }

    return NextResponse.json(students || [])
  } catch (error) {
    console.error('[v0] API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
