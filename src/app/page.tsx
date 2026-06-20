'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import CalendarView from '../components/CalendarView';
import SavingsView from '../components/SavingsView';
import TasksView from '../components/TasksView';
import DashboardView from '../components/DashboardView';
import LoginView from '../components/LoginView';
import { Menu } from 'lucide-react';

export default function Home() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    localStorage.setItem('equilibrium_auth', 'true');
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

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Dashboard';
      case 'calendario':
        return 'Calendario';
      case 'tareas':
        return 'Tareas';
      case 'finanzas':
        return 'Finanzas';
      case 'metas':
        return 'Metas';
      default:
        return 'Equilibrium';
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
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Dashboard Panel */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Mobile Header Bar */}
        <header className="flex md:hidden items-center justify-between px-6 py-4 bg-white border-b border-slate-200 z-30 select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-extrabold text-slate-800 text-lg">{getViewTitle()}</h1>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xs">
            AL
          </div>
        </header>

        {/* View container */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
