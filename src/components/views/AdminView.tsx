import React, { useState } from 'react';
import { useStore, Role, User } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Shield, Mail, Lock, Edit2, Trash2, X } from 'lucide-react';

const AdminView: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    role: 'teacher' as Role
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser({
        ...editingUser,
        username: formData.username,
        fullName: formData.fullName,
        password: formData.password || editingUser.password,
        role: formData.role
      });
    } else {
      addUser({
        id: Math.random().toString(36).substr(2, 9),
        username: formData.username,
        fullName: formData.fullName,
        password: formData.password || 'password123',
        role: formData.role
      });
    }
    closeModal();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      password: '', // Don't show current password for security
      role: user.role
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      username: '',
      fullName: '',
      password: '',
      role: 'teacher' as Role
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">Gestión de Usuarios Staff</h3>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
        >
          <UserPlus size={20} /> Nuevo Miembro
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nombre Completo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Usuario</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Rol</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.filter(u => u.role !== 'student').map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center font-bold text-indigo-600">
                        {u.fullName.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-slate-800">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono">{u.username}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      u.role === 'admin' ? 'bg-rose-100 text-rose-700' :
                      u.role === 'director' ? 'bg-orange-100 text-orange-700' :
                      u.role === 'coordinator' ? 'bg-purple-100 text-purple-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(u)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      {u.username !== 'administracion' && (
                        <button 
                          onClick={() => {
                            if(confirm('¿Está seguro de eliminar este usuario?')) deleteUser(u.id);
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Shield className="text-indigo-600" /> 
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario Staff'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-1">
                    <Mail size={14} /> Nombre Completo
                  </label>
                  <input
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-1">
                    <Users size={14} /> Usuario
                  </label>
                  <input
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-1">
                    <Lock size={14} /> Contraseña
                  </label>
                  <input
                    type="text"
                    placeholder={editingUser ? "Dejar en blanco para no cambiar" : "Ingrese contraseña"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1 block">Rol</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                  >
                    <option value="teacher">Profesor</option>
                    <option value="coordinator">Coordinador Académico</option>
                    <option value="director">Director</option>
                    <option value="enrollment">Área de Matrícula</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-colors">
                    {editingUser ? 'Actualizar' : 'Registrar'}
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

export default AdminView;
