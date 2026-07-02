import React, { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PolarRadiusAxis 
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Zap, 
  TrendingUp, 
  Compass, 
  Star,
  GraduationCap
} from 'lucide-react';
import StatsCard from '../common/StatsCard';

const StudentDashboard: React.FC = () => {
  const { user, grades, students, courses } = useStore();
  const student = students.find(s => s.id === user?.id);

  if (!student) return <div>Cargando datos del estudiante...</div>;

  const studentGrades = grades.filter(g => g.studentId === student.id);
  
  // Calculate skills based on grades
  const skillsData = useMemo(() => {
    const categories = [
      { name: 'Lógica/Mates', names: ['Matemáticas'] },
      { name: 'Comunicación', names: ['Comunicación'] },
      { name: 'Ciencias', names: ['Ciencia y Tecnología'] },
      { name: 'Historia', names: ['Historia'] },
      { name: 'Arte', names: ['Arte y Cultura'] },
    ];

    return categories.map(cat => {
      const catCourseIds = courses.filter(c => cat.names.includes(c.name)).map(c => c.id);
      const catGrades = studentGrades.filter(g => catCourseIds.includes(g.courseId));
      const avg = catGrades.length > 0 
        ? catGrades.reduce((acc, curr) => acc + curr.score, 0) / catGrades.length 
        : 0;
      return { subject: cat.name, A: avg, fullMark: 20 };
    });
  }, [studentGrades, courses]);

  // Performance by Bimester
  const bimesterData = useMemo(() => {
    const bimesters = [
      { name: 'Bim 1', exams: [1, 2] },
      { name: 'Bim 2', exams: [3, 4] },
      { name: 'Bim 3', exams: [5, 6] },
      { name: 'Bim 4', exams: [7, 8] },
    ];

    return bimesters.map(bim => {
      const bimGrades = studentGrades.filter(g => bim.exams.includes(g.examNumber));
      const avg = bimGrades.length > 0 
        ? bimGrades.reduce((acc, curr) => acc + curr.score, 0) / bimGrades.length 
        : 0;
      return { name: bim.name, score: avg };
    });
  }, [studentGrades]);

  // Career Recommendations
  const careerRecommendations = useMemo(() => {
    const topSkill = [...skillsData].sort((a, b) => b.A - a.A)[0];
    const careers: Record<string, string[]> = {
      'Lógica/Mates': ['Ingeniería de Sistemas', 'Matemática Pura', 'Economía'],
      'Comunicación': ['Periodismo', 'Derecho', 'Literatura'],
      'Ciencias': ['Medicina', 'Biotecnología', 'Geología'],
      'Historia': ['Antropología', 'Arqueología', 'Ciencia Política'],
      'Arte': ['Diseño Gráfico', 'Arquitectura', 'Bellas Artes'],
    };
    return careers[topSkill.subject] || ['Administración de Empresas', 'Psicología'];
  }, [skillsData]);

  const avgGrade = studentGrades.length > 0 
    ? (studentGrades.reduce((acc, curr) => acc + curr.score, 0) / studentGrades.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-8 pb-12">
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">¡Hola, {student.fullName}! 👋</h1>
            <p className="text-indigo-100 opacity-90">Sigue así, FuturoPro te ayuda a mejorar.</p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 min-w-[280px]">
            <div className="p-3 bg-yellow-400 rounded-xl text-yellow-900">
              <Zap size={24} fill="currentColor" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm font-bold mb-1">
                <span>Nivel {student.levelRank}</span>
                <span>{student.points} XP</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(student.points % 1000) / 10}%` }}
                  className="h-full bg-yellow-400"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Promedio General" value={avgGrade} icon={TrendingUp} color="blue" />
        <StatsCard title="Puntos XP" value={student.points} icon={Star} color="orange" />
        <StatsCard title="Cursos" value={courses.length} icon={BookOpen} color="green" />
        <StatsCard title="Logros" value={0} icon={Trophy} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <Brain className="text-indigo-600" />
            <h3 className="text-xl font-bold text-slate-800">Mapa de Habilidades</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillsData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 20]} />
                <Radar
                  name="Habilidades"
                  dataKey="A"
                  stroke="#4f46e5"
                  fill="#4f46e5"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-emerald-600" />
            <h3 className="text-xl font-bold text-slate-800">Evolución</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bimesterData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis hide domain={[0, 20]} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none' }}
                />
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {bimesterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score >= 11 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Compass className="text-orange-600" />
          <h3 className="text-xl font-bold text-slate-800">Carreras Recomendadas</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {careerRecommendations.map((career) => (
            <div key={career} className="p-4 rounded-2xl bg-orange-50 border border-orange-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-orange-600 mb-3">
                <GraduationCap size={24} />
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">{career}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
