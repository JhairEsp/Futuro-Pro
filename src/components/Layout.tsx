import React from 'react';
import { useStore, Role } from '../store/useStore';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  GraduationCap, 
  BookOpen, 
  LogOut,
  BarChart3,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, logout } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  if (!user) return <>{children}</>;

  const menuItems: { id: string; label: string; icon: any; roles: Role[] }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'director', 'coordinator', 'coordinador'] },
    { id: 'users', label: 'Usuarios', icon: Users, roles: ['admin'] },
    { id: 'enrollment', label: 'Matrícula', icon: ClipboardCheck, roles: ['enrollment', 'matricula', 'admin', 'coordinator', 'coordinador'] },
    { id: 'academic', label: 'Gestión Académica', icon: GraduationCap, roles: ['coordinator', 'coordinador', 'admin'] },
    { id: 'approvals', label: 'Aprobaciones', icon: ClipboardCheck, roles: ['director', 'admin'] },
    { id: 'grades', label: 'Registro de Notas', icon: BookOpen, roles: ['teacher', 'profesor', 'admin'] },
    { id: 'student-notes', label: 'Mis Notas', icon: BookOpen, roles: ['student', 'alumno'] },
    { id: 'student-skills', label: 'Mis Habilidades', icon: BarChart3, roles: ['student', 'alumno'] },
  ];

  // Robust filtering: check if user.role exists and is valid
  const userRole = user?.role || 'student';
  const filteredMenu = menuItems.filter(item => item.roles.includes(userRole));
  
  console.log('Menu filtered for role:', userRole, 'Items:', filteredMenu.length);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white p-4">
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <GraduationCap className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Talentrack</h1>
          <p className="text-xs text-slate-400">Knowledge System</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {filteredMenu.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setIsMobileMenuOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
              activeTab === item.id 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon size={20} className={cn(
              "transition-colors",
              activeTab === item.id ? "text-white" : "group-hover:text-white"
            )} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-800">
        <div className="px-4 py-3 mb-4 bg-slate-800/50 rounded-lg">
          <p className="text-sm font-medium truncate">{user.fullName}</p>
          <p className="text-xs text-slate-500 capitalize">{user.role}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 fixed inset-y-0 left-0">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 lg:hidden text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1 lg:flex-none">
            <h2 className="text-lg font-semibold text-slate-800">
              {menuItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
             {/* Profile circle for mobile/desktop */}
             <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
                {user.fullName.charAt(0)}
             </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
