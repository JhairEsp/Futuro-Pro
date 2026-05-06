import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, CheckCircle2, XCircle, CreditCard, Trash2, FileDown } from 'lucide-react';

const EnrollmentView: React.FC = () => {
  const { user, students, enrollStudent, updateEnrollmentStatus, deleteStudent } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('All');
  const [filterGrade, setFilterGrade] = useState<string>('All');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    dni: '',
    birthDate: '',
    level: 'Primaria' as 'Primaria' | 'Secundaria',
    grade: 1
  });

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || s.dni.includes(searchTerm);
    const matchesLevel = filterLevel === 'All' || s.level === filterLevel;
    const matchesGrade = filterGrade === 'All' || s.grade.toString() === filterGrade;
    return matchesSearch && matchesLevel && matchesGrade;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    enrollStudent(formData);
    setShowForm(false);
    setFormData({
      fullName: '',
      dni: '',
      birthDate: '',
      level: 'Primaria',
      grade: 1
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar alumno o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-11 pr-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">Todos los Niveles</option>
            <option value="Primaria">Primaria</option>
            <option value="Secundaria">Secundaria</option>
          </select>
          
          <select 
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">Todos los Grados</option>
            {[1, 2, 3, 4, 5, 6].map(g => (
              <option key={g} value={g}>{g}° Grado</option>
            ))}
          </select>

          <div className="h-8 w-px bg-slate-200 mx-1 hidden lg:block" />

          <button
            onClick={() => {
              const data = JSON.stringify(filteredStudents, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'reporte-alumnos.json';
              a.click();
            }}
            className="p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-200 transition-all"
            title="Exportar JSON"
          >
            <FileDown size={20} />
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
          >
            <UserPlus size={20} />
            <span className="hidden sm:inline">Nueva Matrícula</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Alumno</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">DNI</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nivel/Grado</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No se encontraron alumnos registrados.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                          {student.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{student.fullName}</p>
                          <p className="text-xs text-slate-500">User: {student.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{student.dni}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {student.level} - {student.grade}°
                    </td>
                    <td className="px-6 py-4">
                      {student.enrollmentPaid ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold">
                          <CheckCircle2 size={14} /> Pagado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-xs font-bold">
                          <XCircle size={14} /> Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {!student.enrollmentPaid && (
                          <button 
                            onClick={() => updateEnrollmentStatus(student.id, true)}
                            className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1"
                          >
                            <CreditCard size={14} /> Marcar Pago
                          </button>
                        )}
                        {(user?.role === 'admin' || user?.role === 'coordinator') && (
                          <button 
                            onClick={() => {
                              if(confirm('¿Está seguro de eliminar este alumno?')) deleteStudent(student.id);
                            }}
                            className="text-rose-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all"
                            title="Eliminar Alumno"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Matrícula de Alumno</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-600">Nombre Completo</label>
                  <input
                    required
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-600">DNI</label>
                  <input
                    required
                    type="text"
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-600">Fecha de Nacimiento</label>
                  <input
                    required
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">Nivel</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Primaria">Primaria</option>
                      <option value="Secundaria">Secundaria</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">Grado</label>
                    <input
                      required
                      type="number"
                      min="1"
                      max={formData.level === 'Primaria' ? 6 : 5}
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                  >
                    Registrar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnrollmentView;
