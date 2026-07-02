import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Mail } from 'lucide-react';

interface GradeInputProps {
  initialValue: number | undefined;
  onSave: (value: number) => void;
}

const GradeInput: React.FC<GradeInputProps> = ({ initialValue, onSave }) => {
  const [localValue, setLocalValue] = useState<string>(initialValue !== undefined ? initialValue.toString() : '');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar con la DB solo si NO estamos escribiendo
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(initialValue !== undefined ? initialValue.toString() : '');
    }
  }, [initialValue, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Solo permitir números del 0 al 20
    if (val === '' || (/^\d*$/.test(val) && parseInt(val) <= 20)) {
      setLocalValue(val);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const numericVal = parseInt(localValue);
    if (!isNaN(numericVal)) {
      onSave(numericVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  const score = parseInt(localValue);

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      placeholder="-"
      value={localValue}
      onChange={handleChange}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`w-12 h-10 text-center rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-bold text-sm ${
        localValue === '' ? 'border-slate-200 bg-slate-50 text-slate-400' :
        score >= 11 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 
        'border-rose-200 bg-rose-50 text-rose-700'
      }`}
    />
  );
};

const TeacherView: React.FC = () => {
  const { user, classrooms, students, courses, grades, addGrade, sendEmail } = useStore();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSendGrades = async () => {
    if (!selectedCourse) return;
    const courseName = courses.find(c => c.id === selectedCourse)?.name;
    
    setIsSending(true);
    for (const student of roomStudents) {
      const studentGrades = [1, 2, 3, 4, 5, 6, 7, 8]
        .map(n => getGrade(student.id, n))
        .filter(g => g !== undefined);
      
      if (studentGrades.length > 0) {
        await sendEmail(
          student.email || 'a@gmail.com',
          `Reporte de Notas: ${courseName} - FuturoPro`,
          `Hola ${student.fullName}, tus notas en ${courseName} han sido actualizadas. Promedio actual: ${(studentGrades.reduce((a,b)=>a+b,0)/studentGrades.length).toFixed(1)}`
        );
      }
    }
    setIsSending(false);
    alert('✅ Notas enviadas a los correos de los alumnos.');
  };

  const teacherRooms = classrooms.filter(c => 
    c.assignments?.some(a => a.teacherId === user?.id) || user?.role === 'admin' || user?.role === 'profesor'
  );
  
  const teacherCourses = courses.filter(c => 
    classrooms.some(room => room.assignments?.some(a => a.courseId === c.id && a.teacherId === user?.id)) || user?.role === 'admin'
  );

  const currentRoom = classrooms.find(c => c.id === selectedRoom);
  const roomStudents = students.filter(s => currentRoom?.studentIds.includes(s.id));

  const handleGradeSave = (studentId: string, examNumber: number, score: number) => {
    if (selectedCourse !== null) {
      addGrade({
        studentId,
        courseId: selectedCourse,
        examNumber,
        score
      });
    }
  };

  const getGrade = (studentId: string, examNumber: number) => {
    const found = grades.find(g => 
      g.studentId === studentId && 
      Number(g.courseId) === Number(selectedCourse) && 
      g.examNumber === examNumber
    );
    return found ? Number(found.score) : undefined;
  };

  return (
    <div className="space-y-6">
      {!selectedRoom ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherRooms.map(room => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-500 transition-all text-left group"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <BookOpen size={24} />
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-indigo-500" />
              </div>
              <h4 className="font-bold text-lg text-slate-800">{room.name}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{room.level} - {room.grade}° Grado</p>
              <p className="text-sm text-slate-500">{room.studentIds.length} Alumnos asignados</p>
            </button>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => {
                setSelectedRoom(null);
                setSelectedCourse(null);
              }}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              ← <span className="underline">Volver a Salones</span>
            </button>
            <div className="flex items-center gap-4">
              {selectedCourse && (
                <button 
                  onClick={handleSendGrades}
                  disabled={isSending}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all disabled:opacity-50"
                >
                  <Mail size={16} /> {isSending ? 'ENVIANDO...' : 'ENVIAR NOTAS'}
                </button>
              )}
              <div className="text-right">
                <h3 className="text-xl font-bold text-slate-800">{currentRoom?.name}</h3>
                <p className="text-xs text-slate-500 italic">Notas automáticas.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex gap-4 overflow-x-auto">
            {teacherCourses.map(course => (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCourse === course.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {course.name}
              </button>
            ))}
          </div>

          {selectedCourse && (
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase sticky left-0 bg-slate-50 z-10 border-r border-slate-100">Alumno</th>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                      <th key={n} className="px-4 py-4 text-xs font-bold text-slate-500 uppercase text-center">Examen {n}</th>
                    ))}
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Prom.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roomStudents.map(student => {
                    const rowGrades = [1, 2, 3, 4, 5, 6, 7, 8]
                      .map(n => getGrade(student.id, n))
                      .filter((v): v is number => v !== undefined);
                    
                    const sum = rowGrades.reduce((acc, curr) => acc + curr, 0);
                    const avg = rowGrades.length > 0 ? (sum / rowGrades.length) : 0;

                    return (
                      <tr key={student.id}>
                        <td className="px-6 py-4 sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-slate-100">
                          <div className="flex items-center gap-3 w-48">
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-xs">
                              {student.fullName.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-slate-800 truncate">{student.fullName}</span>
                          </div>
                        </td>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                          <td key={n} className="px-2 py-4 text-center">
                            <GradeInput 
                              initialValue={getGrade(student.id, n)} 
                              onSave={(val) => handleGradeSave(student.id, n, val)}
                            />
                          </td>
                        ))}
                        <td className="px-6 py-4 text-center">
                          <span className={`text-sm font-black ${avg >= 11 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {rowGrades.length > 0 ? avg.toFixed(1) : '-'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default TeacherView;
