import React from 'react';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';
import { ClipboardCheck, Check, X, ShieldCheck } from 'lucide-react';

const DirectorView: React.FC = () => {
  const { classrooms, users, courses, approveClassroom } = useStore();
  const pendingClassrooms = classrooms.filter(c => !c.isApproved);

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex items-center gap-4">
        <div className="p-3 bg-indigo-600 rounded-xl text-white">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Panel de Aprobación</h3>
          <p className="text-sm text-slate-500">Usted tiene {pendingClassrooms.length} solicitudes pendientes de revisión.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pendingClassrooms.length === 0 ? (
          <div className="col-span-2 py-12 text-center bg-white border border-slate-200 rounded-3xl text-slate-400">
            <ClipboardCheck size={48} className="mx-auto mb-3 opacity-20" />
            <p>No hay solicitudes pendientes</p>
          </div>
        ) : (
          pendingClassrooms.map(room => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase">
                  Solicitud de Salón
                </span>
                <span className="text-xs text-slate-400">Ref: {room.id}</span>
              </div>
              
              <h4 className="text-xl font-bold text-slate-800 mb-2">{room.name}</h4>
              <div className="space-y-1 mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profesores por Curso:</p>
                {room.assignments?.map(asg => (
                  <div key={asg.courseId} className="flex justify-between text-xs border-b border-slate-50 py-1">
                    <span className="text-slate-500">{courses.find(c => c.id === asg.courseId)?.name}</span>
                    <span className="font-bold text-slate-700">{users.find(u => u.id === asg.teacherId)?.fullName.split(' ')[0]}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => approveClassroom(room.id)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Check size={18} /> Aprobar
                </button>
                <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all">
                  <X size={18} /> Rechazar
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Approved List */}
      <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">Recientemente Aprobados</h3>
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Salón</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Profesor</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classrooms.filter(c => c.isApproved).map(room => (
                <tr key={room.id}>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">{room.name}</td>
                  <td className="px-6 py-4 text-xs text-slate-600 italic">
                    {room.assignments?.length} Profesores asignados
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs uppercase">
                      <Check size={14} /> Confirmado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DirectorView;
