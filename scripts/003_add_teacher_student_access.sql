-- This script adds additional RLS policies to allow teachers to view all students
-- This is optional if using the API endpoint (recommended)
-- Only run this if you want to query the students table directly from the client

-- Add policy for teachers to read all students
DROP POLICY IF EXISTS "teachers_can_read_students" ON public.students;
CREATE POLICY "teachers_can_read_students"
ON public.students
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.teachers t
    WHERE t.id = auth.uid()
  )
);

-- Keep the original policy for students to read themselves
-- DROP POLICY IF EXISTS "students_select_own" ON public.students; -- Don't drop, keep it

-- Update policy: Allow students to read themselves
-- This is already handled by the existing "students_select_own" policy
