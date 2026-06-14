'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import CalendarView from '../components/CalendarView';
import SavingsView from '../components/SavingsView';
import TasksView from '../components/TasksView';
import DashboardView from '../components/DashboardView';
import LoginView from '../components/LoginView';

export default function Home() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authState = localStorage.getItem('equilibrium_auth');
    if (authState === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (email: string, keepLoggedIn: boolean) => {
    setIsAuthenticated(true);
    localStorage.setItem('equilibrium_user_email', email);
    if (keepLoggedIn) {
      localStorage.setItem('equilibrium_auth', 'true');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('equilibrium_auth');
    localStorage.removeItem('equilibrium_user_email');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onViewChange={setCurrentView} />;
      case 'calendario':
        return <CalendarView />;
      case 'tareas':
        return <TasksView />;
      case 'finanzas':
      case 'metas':
        return <SavingsView />;
      default:
        return <DashboardView onViewChange={setCurrentView} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-slate-100">
      {/* Navigation Left Sidebar */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} onLogout={handleLogout} />

      {/* Main Dashboard Panel */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        {renderView()}
      </main>
    </div>
  );
}
