import React from 'react';
import { LayoutDashboard, Calendar as CalendarIcon, Wallet, Target, CheckSquare, Settings, HelpCircle, LogOut, X } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ currentView, onViewChange, onLogout, isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendario', label: 'Calendario', icon: CalendarIcon },
    { id: 'tareas', label: 'Tareas', icon: CheckSquare },
    { id: 'finanzas', label: 'Finanzas', icon: Wallet },
    { id: 'metas', label: 'Metas', icon: Target },
  ];

  const handleItemClick = (id: string) => {
    onViewChange(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-screen select-none transform transition-transform duration-300 md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand logo & Close button */}
        <div className="p-6 border-b border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              E
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg leading-tight">Equilibrium</h1>
              <span className="text-xs text-slate-500 font-medium">Gestión Total</span>
            </div>
          </div>
          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 md:hidden transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation menu */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
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
    </>
  );
}
