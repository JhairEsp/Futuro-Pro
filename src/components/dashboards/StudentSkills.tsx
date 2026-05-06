import React, { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis 
} from 'recharts';
import { motion } from 'framer-motion';
import { Brain, Compass, TrendingUp, GraduationCap } from 'lucide-react';
import FloatingBrain from '../common/FloatingBrain';
import StatsCard from '../common/StatsCard';

const StudentSkills: React.FC = () => {
  const { user, grades, students } = useStore();
  const student = students.find(s => s.id === user?.id);

  if (!student) return <div className="p-8 text-center text-slate-500 font-bold">Cargando datos del alumno...</div>;

  const studentGrades = grades.filter(g => g.studentId === student.id);
  
  const avgGrade = studentGrades.length > 0 
    ? (studentGrades.reduce((acc, curr) => acc + curr.score, 0) / studentGrades.length).toFixed(1)
    : "Sin notas";

  // Calculate skills based on grades
  const skillsData = useMemo(() => {
    const categories = [
      { name: 'Lógica/Mates', names: ['Matemáticas'] },
      { name: 'Comunicación', names: ['Comunicación'] },
      { name: 'Ciencias', names: ['Ciencia y Tecnología'] },
      { name: 'Historia', names: ['Historia'] },
      { name: 'Arte', names: ['Arte y Cultura'] },
    ];

    const allCourses = useStore.getState().courses;

    return categories.map(cat => {
      const catCourseIds = allCourses.filter(c => cat.names.includes(c.name)).map(c => c.id);
      const catGrades = studentGrades.filter(g => catCourseIds.includes(g.courseId));
      const avg = catGrades.length > 0 
        ? catGrades.reduce((acc, curr) => acc + curr.score, 0) / catGrades.length 
        : 0; 
      return { subject: cat.name, A: avg, fullMark: 20 };
    });
  }, [studentGrades]);

  // Career Recommendations
  const careerRecommendations = useMemo(() => {
    // Only recommend if there is some data
    const hasData = skillsData.some(s => s.A > 0);
    if (!hasData) return [];

    const topSkill = [...skillsData].sort((a, b) => b.A - a.A)[0];
    const careers: Record<string, string[]> = {
      'Lógica/Mates': ['Ingeniería de Sistemas', 'Matemática Pura', 'Economía'],
      'Comunicación': ['Periodismo', 'Derecho', 'Literatura'],
      'Ciencias': ['Medicina', 'Biotecnología', 'Geología'],
      'Historia': ['Antropología', 'Arqueología', 'Ciencia Política'],
      'Arte': ['Diseño Gráfico', 'Arquitectura', 'Bellas Artes'],
    };
    return careers[topSkill?.subject] || [];
  }, [skillsData]);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-700 to-purple-800 rounded-3xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold">Mis Habilidades 🧠</h1>
        <p className="text-indigo-100 mt-2 opacity-90">Análisis inteligente de tu potencial académico y profesional.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <StatsCard title="Promedio General" value={avgGrade} icon={TrendingUp} color="blue" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <Brain className="text-indigo-600" />
            <h3 className="text-xl font-bold text-slate-800">Mapa de Habilidades</h3>
          </div>
          <FloatingBrain />
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillsData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 20]} />
                <Radar
                  name="Habilidades"
                  dataKey="A"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm h-full"
          >
            <div className="flex items-center gap-2 mb-8">
              <Compass className="text-orange-600" />
              <h3 className="text-xl font-bold text-slate-800">Orientación Profesional</h3>
            </div>
            
            <div className="space-y-6">
              {careerRecommendations.length > 0 ? (
                careerRecommendations.map((career) => (
                  <div key={career} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all group">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{career}</h4>
                      <p className="text-xs text-slate-500">Basado en tu desempeño en {skillsData.sort((a,b) => b.A - a.A)[0].subject}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">Aún no hay suficientes notas para generar recomendaciones.</p>
                </div>
              )}
            </div>

            <div className="mt-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
              <p className="text-sm text-indigo-800 leading-relaxed italic">
                "Tu patrón de aprendizaje sugiere una alta capacidad analítica. Te recomendamos explorar campos que requieran resolución de problemas complejos."
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentSkills;
