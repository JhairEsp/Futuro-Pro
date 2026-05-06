import React from 'react';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const StudentNotes: React.FC = () => {
  const { user, grades, courses, students } = useStore();
  const student = students.find(s => s.id === user?.id);

  if (!student) return <div className="p-8 text-center text-slate-500 font-bold">Cargando datos del alumno...</div>;

  const studentGrades = grades.filter(g => g.studentId === student.id);

  return (
    <div className="space-y-6">
      <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl mb-8">
        <h1 className="text-3xl font-bold">Mis Notas 📚</h1>
        <p className="text-indigo-100 mt-2 opacity-90">Visualiza tu rendimiento académico detallado por curso.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => {
          const courseGrades = studentGrades.filter(g => g.courseId === course.id);
          const sum = courseGrades.reduce((acc, curr) => acc + Number(curr.score), 0);
          const avg = courseGrades.length > 0 
            ? (sum / courseGrades.length).toFixed(1)
            : '-';

          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{course.name}</h3>
                  <p className="text-xs text-slate-500 uppercase font-black tracking-widest mt-1">Curso Académico</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl ${
                  avg === '-' ? 'bg-slate-50 text-slate-400' :
                  parseFloat(avg) >= 14 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {avg}
                </div>
              </div>
              <div className="p-6 bg-slate-50/50">
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => {
                    const grade = courseGrades.find(g => g.examNumber === num);
                    return (
                      <div key={num} className="text-center">
                        <p className="text-[10px] text-slate-400 font-bold mb-1">E{num}</p>
                        <div className={`h-8 flex items-center justify-center rounded-lg text-xs font-bold ${
                          grade ? (grade.score >= 11 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700') : 'bg-white border border-slate-200 text-slate-300'
                        }`}>
                          {grade ? grade.score : '-'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="px-6 py-4 flex items-center gap-2 text-xs font-bold text-indigo-600">
                <Star size={14} fill="currentColor" />
                <span>Rendimiento {parseFloat(avg) >= 17 ? 'Excelente' : parseFloat(avg) >= 14 ? 'Muy Bueno' : 'En Mejora'}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentNotes;
