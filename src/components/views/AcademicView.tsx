import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Users, Plus, CheckCircle2, Clock, X, UserPlus, BookOpen, Info, Sparkles } from 'lucide-react';

const AcademicView: React.FC = () => {
  const { classrooms, students, users, courses, addClassroom, deleteClassroom, assignStudentToClassroom, addCourse, deleteCourse } = useStore();
  // Support both English and Spanish roles
  const teachers = users.filter(u => u.role === 'teacher' || u.role === 'profesor' || u.role === 'admin');
  
  const [showModal, setShowModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<string | null>(null);
  const [newCourseName, setNewCourseName] = useState('');
  const [showCourseManagement, setShowCourseManagement] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    level: 'Primaria' as 'Primaria' | 'Secundaria',
    grade: 1,
    assignments: [] as { courseId: number; teacherId: string }[],
    studentIds: [] as string[]
  });

  // Update initial assignments when courses change
  React.useEffect(() => {
    if (courses.length > 0 && formData.assignments.length === 0) {
      setFormData(prev => ({
        ...prev,
        assignments: courses.map(c => ({ courseId: c.id, teacherId: teachers[0]?.id || '' }))
      }));
    }
  }, [courses, teachers]);

  const handleAddCourse = async () => {
    if (newCourseName.trim()) {
      await addCourse(newCourseName);
      setNewCourseName('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addClassroom(formData);
    setShowModal(false);
  };

  const handleAssignmentChange = (courseId: number, teacherId: string) => {
    setFormData(prev => ({
      ...prev,
      assignments: prev.assignments.map(a => a.courseId === courseId ? { ...a, teacherId } : a)
    }));
  };

  const handleAutoFill = (classroomId: string) => {
    const room = classrooms.find(c => c.id === classroomId);
    if (!room) return;

    // Filter students of same grade/level NOT in this room
    const available = students.filter(s => 
      s.level === room.level && 
      s.grade === room.grade && 
      !room.studentIds.includes(s.id)
    );

    // Shuffle and pick up to fill 20
    const currentCount = room.studentIds.length;
    const spotsLeft = 20 - currentCount;
    
    if (spotsLeft <= 0) {
      alert("El salón ya tiene 20 o más alumnos.");
      return;
    }

    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const toAdd = shuffled.slice(0, spotsLeft);

    if (toAdd.length === 0) {
      alert("No hay alumnos disponibles de este grado para asignar.");
      return;
    }

    toAdd.forEach(student => {
      assignStudentToClassroom(classroomId, student.id);
    });

    alert(`Se han asignado ${toAdd.length} alumnos aleatoriamente.`);
  };

  const currentRoomToLink = classrooms.find(c => c.id === showLinkModal);
  const eligibleStudents = students.filter(s => 
    currentRoomToLink && 
    s.level === currentRoomToLink.level && 
    s.grade === currentRoomToLink.grade &&
    !currentRoomToLink.studentIds.includes(s.id)
  );

  const roomInDetail = classrooms.find(c => c.id === showDetailsModal);
  const roomStudents = students.filter(s => roomInDetail?.studentIds.includes(s.id));

  return (
    <div className="space-y-8">
      {/* Course Management Section */}
      <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Plus size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Gestión de Cursos</h3>
          </div>
          <button 
            onClick={() => setShowCourseManagement(!showCourseManagement)}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
          >
            {showCourseManagement ? 'Cerrar' : 'Administrar'}
          </button>
        </div>

        {showCourseManagement && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Nombre del nuevo curso..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
              />
              <button 
                onClick={handleAddCourse}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-bold transition-all"
              >
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {courses.map(course => (
                <div key={course.id} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold border border-slate-200">
                  {course.name}
                  <button 
                    onClick={() => {
                      if(confirm(`¿Eliminar curso ${course.name}?`)) deleteCourse(course.id);
                    }}
                    className="hover:text-rose-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <GraduationCap size={20} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Salones Activos</h3>
        </div>
        <button
          onClick={() => {
            setFormData({
              name: '',
              level: 'Primaria',
              grade: 1,
              assignments: courses.map(c => ({ courseId: c.id, teacherId: teachers[0]?.id || '' })),
              studentIds: [] as string[]
            });
            setShowModal(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus size={20} /> Nuevo Salón
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classrooms.map(room => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col group hover:border-indigo-500 transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg text-slate-800">{room.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{room.level} - {room.grade}° Grado</p>
                </div>
                {room.isApproved ? (
                  <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
                    <CheckCircle2 size={12} /> Aprobado
                  </span>
                ) : (
                  <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
                    <Clock size={12} /> Pendiente
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cursos y Profesores</p>
                <div className="space-y-1">
                  {room.assignments?.map(asg => (
                    <div key={asg.courseId} className="flex items-center justify-between text-[11px] border-b border-slate-50 py-1 last:border-0">
                      <span className="text-slate-500 truncate mr-2">{courses.find(c => c.id === asg.courseId)?.name}</span>
                      <span className="text-slate-800 font-bold whitespace-nowrap">{users.find(u => u.id === asg.teacherId)?.fullName}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowDetailsModal(room.id)}
                    className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Info size={14} /> Detalle
                  </button>
                  <button 
                    onClick={() => setShowLinkModal(room.id)}
                    className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <UserPlus size={14} /> Alumnos
                  </button>
                </div>
                <button 
                  onClick={() => handleAutoFill(room.id)}
                  className="w-full py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} /> Autovincular (Máx 20)
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-b-3xl border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <Users size={14} /> {room.studentIds.length} Alumnos
              </span>
              <button 
                onClick={() => {
                  if(confirm(`¿Eliminar salón ${room.name}?`)) deleteClassroom(room.id);
                }}
                className="text-[10px] text-rose-500 font-bold uppercase tracking-tighter"
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Classroom Creation Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <GraduationCap className="text-indigo-600" /> Nuevo Salón
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700">Nombre del Salón</label>
                    <input
                      required
                      placeholder="Ej: 5to de Secundaria - A"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-slate-700">Nivel</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.level}
                        onChange={e => setFormData({ ...formData, level: e.target.value as any })}
                      >
                        <option value="Primaria">Primaria</option>
                        <option value="Secundaria">Secundaria</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700">Grado</label>
                      <input
                        type="number"
                        min="1"
                        max={formData.level === 'Primaria' ? 6 : 5}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.grade}
                        onChange={e => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-700">Asignar Profesores</p>
                  <div className="grid grid-cols-1 gap-3">
                    {courses.map(course => (
                      <div key={course.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-slate-600">{course.name}</span>
                        <select
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                          value={formData.assignments.find(a => a.courseId === course.id)?.teacherId}
                          onChange={e => handleAssignmentChange(course.id, e.target.value)}
                        >
                          {teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.fullName}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-600">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20">Crear Salón</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Classroom Details Modal */}
      <AnimatePresence>
        {showDetailsModal && roomInDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setShowDetailsModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
              
              <div className="mb-8">
                <h3 className="text-3xl font-bold text-slate-800">{roomInDetail.name}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black uppercase">
                    {roomInDetail.level}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-black uppercase">
                    {roomInDetail.grade}° Grado
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Courses List */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest">
                    <BookOpen size={16} className="text-indigo-500" /> Materias y Profesores
                  </h4>
                  <div className="space-y-3">
                    {roomInDetail.assignments?.map(asg => {
                      const course = courses.find(c => c.id === asg.courseId);
                      const teacher = users.find(u => u.id === asg.teacherId);
                      return (
                        <div key={asg.courseId} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-xs font-bold text-indigo-600">{course?.name}</p>
                          <p className="text-sm font-medium text-slate-800 mt-1">{teacher?.fullName}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Students List */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest">
                    <Users size={16} className="text-emerald-500" /> Alumnos ({roomStudents.length}/20)
                  </h4>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {roomStudents.length > 0 ? (
                      roomStudents.map(student => (
                        <div key={student.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                          <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xs">
                            {student.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{student.fullName}</p>
                            <p className="text-[10px] text-slate-500">DNI: {student.dni}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-8 italic">No hay alumnos vinculados.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(null)}
                  className="px-8 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Cerrar Vista
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Link Student Modal */}
      <AnimatePresence>
        {showLinkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button onClick={() => setShowLinkModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Vincular Alumnos</h3>
              <p className="text-sm text-slate-500 mb-6">Solo se muestran alumnos de <strong>{currentRoomToLink?.level} {currentRoomToLink?.grade}°</strong>.</p>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto mb-6 pr-2">
                {eligibleStudents.length > 0 ? (
                  eligibleStudents.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs">
                          {student.fullName.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{student.fullName}</span>
                      </div>
                      <button
                        onClick={() => assignStudentToClassroom(showLinkModal, student.id)}
                        className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700"
                      >
                        Vincular
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <p className="text-sm text-center italic">No hay alumnos disponibles para este grado/nivel.</p>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowLinkModal(null)}
                className="w-full py-3 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Listo
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AcademicView;
