-- Add RLS policy to allow students to see classrooms they are enrolled in
-- This fixes the issue where classrooms were returning empty for student queries

CREATE POLICY IF NOT EXISTS "classrooms_select_enrolled_students" ON public.classrooms FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.classroom_id = classrooms.id
    AND e.student_id = auth.uid()
  )
);
