import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import Login from './components/Login';
import MainDashboard from './components/dashboards/MainDashboard';
import StudentNotes from './components/dashboards/StudentNotes';
import StudentSkills from './components/dashboards/StudentSkills';
import EnrollmentView from './components/views/EnrollmentView';
import AcademicView from './components/views/AcademicView';
import DirectorView from './components/views/DirectorView';
import TeacherView from './components/views/TeacherView';
import AdminView from './components/views/AdminView';

const App: React.FC = () => {
  const { user, fetchInitialData, isLoading } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Reset tab when user changes to their corresponding default view
  useEffect(() => {
    if (!user) return;

    switch (user.role) {
      case 'student':
      case 'alumno':
        setActiveTab('student-notes');
        break;
      case 'teacher':
      case 'profesor':
        setActiveTab('grades');
        break;
      case 'enrollment':
      case 'matricula':
        setActiveTab('enrollment');
        break;
      case 'admin':
      case 'director':
      case 'coordinator':
      case 'coordinador':
        setActiveTab('dashboard');
        break;
      default:
        setActiveTab('dashboard');
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-bold animate-pulse text-indigo-400">Cargando FuturoPro...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <MainDashboard />;
      case 'student-notes':
        return <StudentNotes />;
      case 'student-skills':
        return <StudentSkills />;
      case 'enrollment':
        return <EnrollmentView />;
      case 'academic':
        return <AcademicView />;
      case 'approvals':
        return <DirectorView />;
      case 'grades':
        return <TeacherView />;
      case 'users':
        return <AdminView />;
      default:
        return <MainDashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
