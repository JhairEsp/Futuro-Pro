import React, { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { 
  Users, 
  GraduationCap, 
  ClipboardCheck, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import StatsCard from '../common/StatsCard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const MainDashboard: React.FC = () => {
  const { students, classrooms, grades } = useStore();

  const totalStudents = students.length;
  const paidEnrollments = students.filter(s => s.enrollmentPaid).length;
  const approvedRooms = classrooms.filter(c => c.isApproved).length;

  const totalGrades = grades.length;
  const averageGrade = totalGrades > 0 
    ? (grades.reduce((acc, curr) => acc + curr.score, 0) / totalGrades).toFixed(1)
    : "0.0";
  
  // Real Grade Distribution
  const gradeDistribution = useMemo(() => [
    { name: 'Destacado (17-20)', value: grades.filter(g => g.score >= 17).length },
    { name: 'Logrado (14-16)', value: grades.filter(g => g.score >= 14 && g.score < 17).length },
    { name: 'En Proceso (11-13)', value: grades.filter(g => g.score >= 11 && g.score < 14).length },
    { name: 'Inicio (0-10)', value: grades.filter(g => g.score < 11).length },
  ], [grades]);

  // Real Alerts Logic
  const alerts = useMemo(() => {
    const list = [];
    
    // 1. Check for low performance
    const failingGrades = grades.filter(g => g.score < 11).length;
    if (failingGrades > 0) {
      list.push({
        type: 'danger',
        title: 'Bajo Rendimiento Detectado',
        desc: `Hay ${failingGrades} notas registradas por debajo de 11. Se requiere seguimiento.`,
        icon: <AlertCircle className="text-rose-600" />
      });
    }

    // 2. Check for students without classrooms
    const unassignedStudents = students.filter(s => !classrooms.some(c => c.studentIds.includes(s.id))).length;
    if (unassignedStudents > 0) {
      list.push({
        type: 'warning',
        title: 'Alumnos sin Salón',
        desc: `Hay ${unassignedStudents} alumnos matriculados que aún no tienen un salón asignado.`,
        icon: <Users className="text-orange-600" />
      });
    }

    // 3. Check for pending approvals
    const pendingApprovals = classrooms.filter(c => !c.isApproved).length;
    if (pendingApprovals > 0) {
      list.push({
        type: 'info',
        title: 'Salones por Aprobar',
        desc: `El director tiene ${pendingApprovals} salones pendientes de revisión y aprobación.`,
        icon: <GraduationCap className="text-indigo-600" />
      });
    }

    return list;
  }, [students, classrooms, grades]);

  const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444'];

  const hasData = grades.length > 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Alumnos" value={totalStudents} icon={Users} color="blue" />
        <StatsCard title="Matrículas Pagadas" value={`${paidEnrollments}/${totalStudents}`} icon={ClipboardCheck} color="green" />
        <StatsCard title="Salones Aprobados" value={`${approvedRooms}/${classrooms.length}`} icon={CheckCircle2} color="purple" />
        <StatsCard title="Promedio General" value={averageGrade} icon={TrendingUp} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Distribución de Notas (Global)</h3>
          {hasData ? (
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {gradeDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[350px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <TrendingUp size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">No hay notas registradas para generar estadísticas.</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Alertas del Sistema</h3>
          <div className="space-y-4 flex-1">
            {alerts.length > 0 ? (
              alerts.map((alert, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border flex gap-4 ${
                  alert.type === 'danger' ? 'bg-rose-50 border-rose-100' :
                  alert.type === 'warning' ? 'bg-orange-50 border-orange-100' :
                  'bg-indigo-50 border-indigo-100'
                }`}>
                  <div className="mt-1">{alert.icon}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{alert.title}</p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alert.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-3 opacity-50" />
                <p className="text-sm text-slate-500 font-medium">No hay alertas pendientes.</p>
              </div>
            )}
          </div>
          
          {hasData && (
            <div className="h-[180px] mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {gradeDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
