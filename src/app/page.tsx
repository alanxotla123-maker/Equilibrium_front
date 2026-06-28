'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import CalendarView from '../components/CalendarView';
import SavingsView from '../components/SavingsView';
import TasksView from '../components/TasksView';
import DashboardView from '../components/DashboardView';
import LoginView from '../components/LoginView';
import TransactionsView from '../components/TransactionsView';
import { Menu, LayoutDashboard, Calendar as CalendarIcon, CheckSquare, Wallet, Target, Bell, Sun, Moon } from 'lucide-react';

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
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-slate-100 dark:bg-[#0b0e17] text-slate-900 dark:text-slate-100 transition-colors duration-250">
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
      <main className="flex-1 flex flex-col min-w-0 h-full relative pb-20 md:pb-0">
        {/* Mobile Header Bar */}
        <header className="flex md:hidden items-center justify-between px-6 py-4 bg-white dark:bg-[#131722] border-b border-slate-200 dark:border-slate-800/80 z-30 select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-lg">
              E
            </div>
            <div>
              <h1 className="font-extrabold text-slate-800 dark:text-white text-sm leading-tight">Equilibrium</h1>
              <span className="text-[10px] text-slate-400 dark:text-slate-450 uppercase font-black tracking-widest block">Gestión Total</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Quick Dark Mode toggle for mobile */}
            <button 
              onClick={toggleDarkMode} 
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-350 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-350 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xs ml-1 border-2 border-white dark:border-indigo-900 shadow-sm">
              AL
            </div>
          </div>
        </header>

        {/* View container */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {renderView()}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="flex md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#131722] border-t border-slate-200 dark:border-slate-800/80 items-center justify-around z-40 px-2 shadow-lg">
          <button
            onClick={() => handleViewChange('dashboard')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${
              currentView === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 scale-105' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[9px] font-black mt-1">Home</span>
          </button>

          <button
            onClick={() => handleViewChange('calendario')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${
              currentView === 'calendario' ? 'text-indigo-600 dark:text-indigo-400 scale-105' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
            <span className="text-[9px] font-black mt-1">Cal</span>
          </button>

          <button
            onClick={() => handleViewChange('tareas')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${
              currentView === 'tareas' ? 'text-indigo-600 dark:text-indigo-400 scale-105' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[9px] font-black mt-1">Tareas</span>
          </button>

          <button
            onClick={() => handleViewChange('finanzas')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${
              currentView === 'finanzas' ? 'text-indigo-600 dark:text-indigo-400 scale-105' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[9px] font-black mt-1">Money</span>
          </button>

          <button
            onClick={() => handleViewChange('metas')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${
              currentView === 'metas' ? 'text-indigo-600 dark:text-indigo-400 scale-105' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <Target className="w-5 h-5" />
            <span className="text-[9px] font-black mt-1">Ajustes</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
