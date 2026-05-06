import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type Role = 'admin' | 'enrollment' | 'coordinator' | 'director' | 'teacher' | 'student' | 'profesor' | 'alumno' | 'matricula' | 'coordinador';

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: Role;
}

export interface Student extends User {
  dni: string;
  birthDate: string;
  level: 'Primaria' | 'Secundaria';
  grade: number;
  enrollmentPaid: boolean;
  points: number;
  levelRank: number;
}

export interface ClassroomAssignment {
  courseId: number;
  teacherId: string;
}

export interface Classroom {
  id: string;
  name: string;
  level: 'Primaria' | 'Secundaria';
  grade: number;
  assignments: ClassroomAssignment[];
  studentIds: string[];
  isApproved: boolean;
}

export interface Grade {
  studentId: string;
  classroomId?: number;
  courseId: number;
  examNumber: number; 
  score: number;
  bimester?: number;
}

export interface Course {
  id: number;
  name: string;
}

interface AppState {
  user: User | null;
  users: User[];
  students: Student[];
  classrooms: Classroom[];
  courses: Course[];
  grades: Grade[];
  isLoading: boolean;
  
  fetchInitialData: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: User) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  enrollStudent: (student: any) => Promise<Student | null>;
  deleteStudent: (studentId: string) => Promise<void>;
  updateEnrollmentStatus: (studentId: string, paid: boolean) => Promise<void>;
  addClassroom: (classroom: any) => Promise<void>;
  deleteClassroom: (classroomId: string) => Promise<void>;
  approveClassroom: (id: string) => Promise<void>;
  addCourse: (courseName: string) => Promise<void>;
  deleteCourse: (courseId: number) => Promise<void>;
  addGrade: (grade: Grade) => Promise<void>;
  assignStudentToClassroom: (classroomId: string, studentId: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  users: [],
  students: [],
  classrooms: [],
  courses: [],
  grades: [],
  isLoading: false,

  fetchInitialData: async () => {
    set({ isLoading: true });
    console.log('🔄 Sincronizando con Nueva Estructura Relacional...');
    try {
      const { data: users } = await supabase.from('users').select('*');
      const { data: students } = await supabase.from('students').select('*');
      const { data: courses } = await supabase.from('courses').select('*');
      const { data: rooms } = await supabase.from('classrooms').select('*');
      const { data: relTeachers } = await supabase.from('classroom_teachers').select('*');
      const { data: relStudents } = await supabase.from('classroom_students').select('*');
      const { data: grades } = await supabase.from('grades').select('*');

      set({ 
        users: (users || []).map(u => ({ id: u.id, username: u.username, password: u.password, fullName: u.full_name, role: u.role })),
        courses: courses || [],
        students: (students || []).map(s => {
          const u = (users || []).find(user => user.id === s.id);
          return {
            ...s,
            enrollmentPaid: s.enrollment_paid,
            levelRank: s.level_rank,
            birthDate: s.birth_date,
            username: u?.username || '',
            fullName: u?.full_name || '',
            role: 'student'
          };
        }),
        grades: (grades || []).map(g => ({ studentId: g.student_id, courseId: g.course_id, examNumber: g.exam_number, score: Number(g.score) })),
        classrooms: (rooms || []).map(r => ({
          ...r,
          id: r.id.toString(),
          isApproved: r.is_approved,
          assignments: (relTeachers || []).filter(t => t.classroom_id === r.id).map(t => ({ courseId: t.course_id, teacherId: t.teacher_id })),
          studentIds: (relStudents || []).filter(s => s.classroom_id === r.id).map(s => s.student_id)
        }))
      });
      console.log('✅ Sincronización Exitosa');
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (username, password) => {
    const { users, students } = get();
    let found = users.find(u => u.username === username && u.password === password);
    if (!found) {
      const student = students.find(s => s.username === username && (s.password ? s.password === password : s.dni === password));
      if (student) found = student;
    }
    if (found) {
      set({ user: found });
      return true;
    }
    return false;
  },

  logout: () => set({ user: null }),

  addUser: async (userData) => {
    const { error } = await supabase.from('users').insert([{
      id: userData.id, username: userData.username, password: userData.password, full_name: userData.fullName, role: userData.role
    }]);
    if (!error) set((state) => ({ users: [...state.users, userData] }));
  },

  updateUser: async (u) => {
    const { error } = await supabase.from('users').update({ username: u.username, password: u.password, full_name: u.fullName, role: u.role }).eq('id', u.id);
    if (!error) set((state) => ({ users: state.users.map(user => user.id === u.id ? u : user) }));
  },

  deleteUser: async (id) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (!error) set((state) => ({ users: state.users.filter(u => u.id !== id) }));
  },

  enrollStudent: async (s) => {
    const id = Math.random().toString(36).substr(2, 9);
    const username = s.fullName.toLowerCase().replace(/\s+/g, '.') + id.substr(0, 3);
    const { error: uErr } = await supabase.from('users').insert([{ id, username, password: s.dni, full_name: s.fullName, role: 'student' }]);
    const { error: sErr } = await supabase.from('students').insert([{ id, dni: s.dni, birth_date: s.birthDate, level: s.level, grade: s.grade }]);
    if (!uErr && !sErr) {
      const newS = { ...s, id, username, password: s.dni, role: 'student', points: 0, levelRank: 1, enrollmentPaid: false };
      set((state) => ({ students: [...state.students, newS], users: [...state.users, newS] }));
      return newS;
    }
    return null;
  },

  deleteStudent: async (id) => {
    await supabase.from('users').delete().eq('id', id); // Cascade handles the rest
    set((state) => ({ students: state.students.filter(s => s.id !== id), users: state.users.filter(u => u.id !== id) }));
  },

  updateEnrollmentStatus: async (id, paid) => {
    const { error } = await supabase.from('students').update({ enrollment_paid: paid }).eq('id', id);
    if (!error) set((state) => ({ students: state.students.map(s => s.id === id ? { ...s, enrollmentPaid: paid } : s) }));
  },

  addClassroom: async (r) => {
    const { data, error } = await supabase.from('classrooms').insert([{ name: r.name, level: r.level, grade: r.grade }]).select();
    if (!error && data) {
      const roomId = data[0].id;
      const inserts = r.assignments.map((a: any) => ({ classroom_id: roomId, teacher_id: a.teacherId, course_id: a.courseId }));
      await supabase.from('classroom_teachers').insert(inserts);
      const newRoom = { ...r, id: roomId.toString(), isApproved: false };
      set((state) => ({ classrooms: [...state.classrooms, newRoom] }));
    }
  },

  deleteClassroom: async (id) => {
    const { error } = await supabase.from('classrooms').delete().eq('id', id);
    if (!error) set((state) => ({ classrooms: state.classrooms.filter(c => c.id !== id) }));
  },

  approveClassroom: async (id) => {
    const { error } = await supabase.from('classrooms').update({ is_approved: true }).eq('id', id);
    if (!error) set((state) => ({ classrooms: state.classrooms.map(c => c.id === id ? { ...c, isApproved: true } : c) }));
  },

  addCourse: async (name) => {
    const { data, error } = await supabase.from('courses').insert([{ name }]).select();
    if (!error && data) set((state) => ({ courses: [...state.courses, data[0]] }));
  },

  deleteCourse: async (id) => {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (!error) set((state) => ({ courses: state.courses.filter(c => c.id !== id) }));
  },

  addGrade: async (g) => {
    const { error } = await supabase.from('grades').upsert([{
      student_id: g.studentId, course_id: g.courseId, exam_number: g.examNumber, score: g.score, bimester: Math.ceil(g.examNumber/2)
    }]);
    if (!error) {
      set((state) => ({ grades: [...state.grades.filter(gr => !(gr.studentId === g.studentId && gr.courseId === g.courseId && gr.examNumber === g.examNumber)), g] }));
    }
  },

  assignStudentToClassroom: async (roomId, studentId) => {
    const { error } = await supabase.from('classroom_students').insert([{ classroom_id: Number(roomId), student_id: studentId }]);
    if (!error) {
      set((state) => ({ classrooms: state.classrooms.map(c => c.id === roomId ? { ...c, studentIds: [...c.studentIds, studentId] } : c) }));
    }
  }
}));
