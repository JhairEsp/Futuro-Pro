import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()

  try {
    // Create tables
    const { error: tablesError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.teachers (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT UNIQUE NOT NULL,
          first_name TEXT,
          last_name TEXT,
          department TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS public.students (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT UNIQUE NOT NULL,
          first_name TEXT,
          last_name TEXT,
          enrollment_number TEXT UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS public.classrooms (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          subject TEXT,
          year INTEGER,
          semester INTEGER,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS public.enrollments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
          student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
          enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(classroom_id, student_id)
        );

        CREATE TABLE IF NOT EXISTS public.grades (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
          exam_number INTEGER NOT NULL CHECK (exam_number BETWEEN 1 AND 7),
          score DECIMAL(5, 2),
          exam_date TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(enrollment_id, exam_number)
        );
      `
    })

    if (tablesError) {
      console.error('Error creating tables:', tablesError)
      return Response.json({ error: 'Failed to create tables' }, { status: 500 })
    }

    // Enable RLS
    const { error: rlsError } = await supabase.rpc('execute_sql', {
      sql: `
        ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
      `
    })

    if (rlsError) {
      console.error('Error enabling RLS:', rlsError)
      return Response.json({ error: 'Failed to enable RLS' }, { status: 500 })
    }

    return Response.json({ message: 'Database initialized successfully' })
  } catch (error) {
    console.error('Error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
