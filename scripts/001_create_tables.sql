-- Create teachers table
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  department TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  enrollment_number TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create classrooms table
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

-- Create enrollments table (students in classrooms)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(classroom_id, student_id)
);

-- Create grades table (7 exams per student per classroom)
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

-- Enable RLS on all tables
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Teachers RLS policies
CREATE POLICY IF NOT EXISTS "teachers_select_own" ON public.teachers FOR SELECT USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "teachers_update_own" ON public.teachers FOR UPDATE USING (auth.uid() = id);

-- Students RLS policies
CREATE POLICY IF NOT EXISTS "students_select_own" ON public.students FOR SELECT USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "students_update_own" ON public.students FOR UPDATE USING (auth.uid() = id);

-- Classrooms RLS policies
CREATE POLICY IF NOT EXISTS "classrooms_select_own_teacher" ON public.classrooms FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY IF NOT EXISTS "classrooms_insert_own" ON public.classrooms FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY IF NOT EXISTS "classrooms_update_own" ON public.classrooms FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY IF NOT EXISTS "classrooms_delete_own" ON public.classrooms FOR DELETE USING (auth.uid() = teacher_id);

-- Enrollments RLS policies
CREATE POLICY IF NOT EXISTS "enrollments_insert_teacher" ON public.enrollments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.classrooms c WHERE c.id = classroom_id AND c.teacher_id = auth.uid())
);
CREATE POLICY IF NOT EXISTS "enrollments_delete_teacher" ON public.enrollments FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.classrooms c WHERE c.id = classroom_id AND c.teacher_id = auth.uid())
);
CREATE POLICY IF NOT EXISTS "enrollments_select_teacher" ON public.enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.classrooms c WHERE c.id = classroom_id AND c.teacher_id = auth.uid())
);
CREATE POLICY IF NOT EXISTS "enrollments_select_own_student" ON public.enrollments FOR SELECT USING (
  student_id = auth.uid()
);

-- Grades RLS policies
CREATE POLICY IF NOT EXISTS "grades_insert_teacher" ON public.grades FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    JOIN public.classrooms c ON e.classroom_id = c.id
    WHERE e.id = enrollment_id AND c.teacher_id = auth.uid()
  )
);
CREATE POLICY IF NOT EXISTS "grades_update_teacher" ON public.grades FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    JOIN public.classrooms c ON e.classroom_id = c.id
    WHERE e.id = enrollment_id AND c.teacher_id = auth.uid()
  )
);
CREATE POLICY IF NOT EXISTS "grades_select_teacher" ON public.grades FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    JOIN public.classrooms c ON e.classroom_id = c.id
    WHERE e.id = enrollment_id AND c.teacher_id = auth.uid()
  )
);
CREATE POLICY IF NOT EXISTS "grades_select_own_student" ON public.grades FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.id = enrollment_id AND e.student_id = auth.uid()
  )
);
