import React from 'react';
import { LayoutDashboard, Calendar as CalendarIcon, Wallet, Target, CheckSquare, Settings, HelpCircle, LogOut } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ currentView, onViewChange, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendario', label: 'Calendario', icon: CalendarIcon },
    { id: 'tareas', label: 'Tareas', icon: CheckSquare },
    { id: 'finanzas', label: 'Finanzas', icon: Wallet },
    { id: 'metas', label: 'Metas', icon: Target },
  ];

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-screen select-none">
      {/* Brand logo */}
      <div className="p-6 border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            E
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight">Equilibrium</h1>
            <span className="text-xs text-slate-500 font-medium">Gestión Total</span>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-400 text-slate-900 shadow-sm shadow-emerald-400/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer / Utilities & Profile */}
      <div className="p-4 border-t border-slate-200/60 space-y-4">
        <div className="space-y-1 px-2">
          <button className="w-full flex items-center gap-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            <Settings className="w-5 h-5 text-slate-400" />
            Ajustes
          </button>
          <button className="w-full flex items-center gap-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            <HelpCircle className="w-5 h-5 text-slate-400" />
            Ayuda
          </button>
        </div>

        {/* Profile with Logout */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-inner flex-shrink-0">
              AL
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">Alan</p>
              <p className="text-xs text-slate-500 font-medium truncate">Pro Plan</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-rose-600 transition-colors flex-shrink-0"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
