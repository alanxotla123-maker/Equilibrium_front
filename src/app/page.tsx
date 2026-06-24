'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import CalendarView from '../components/CalendarView';
import SavingsView from '../components/SavingsView';
import TasksView from '../components/TasksView';
import DashboardView from '../components/DashboardView';
import LoginView from '../components/LoginView';
import TransactionsView from '../components/TransactionsView';
import { Menu } from 'lucide-react';

export default function Home() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    localStorage.setItem('equilibrium_view', view);
  };

  useEffect(() => {
    const authState = localStorage.getItem('equilibrium_auth');
    if (authState === 'true') {
      setIsAuthenticated(true);
    }

    const savedView = localStorage.getItem('equilibrium_view');
    if (savedView) {
      setCurrentView(savedView);
    }
    
    // Check dark mode preference
    const savedTheme = localStorage.getItem('equilibrium_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    setIsLoading(false);
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('equilibrium_theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('equilibrium_theme', 'dark');
      setIsDarkMode(true);
    }
  };

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
        return <DashboardView onViewChange={handleViewChange} />;
      case 'calendario':
        return <CalendarView />;
      case 'tareas':
        return <TasksView />;
      case 'finanzas':
        return <TransactionsView />;
      case 'metas':
        return <SavingsView />;
      default:
        return <DashboardView onViewChange={handleViewChange} />;
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
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-250">
      {/* Navigation Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Dashboard Panel */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Mobile Header Bar */}
        <header className="flex md:hidden items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 z-30 select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-extrabold text-slate-800 dark:text-white text-lg">{getViewTitle()}</h1>
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
