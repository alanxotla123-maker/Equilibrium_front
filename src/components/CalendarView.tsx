import React, { useState, useEffect } from 'react';
import { Plus, Bell, ChevronLeft, ChevronRight, X, AlertCircle, Trash2 } from 'lucide-react';
import { api, Task, Category } from '../lib/api';

interface QuickIdea {
  id: string;
  text: string;
}

export default function CalendarView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date()); // Dynamic current date
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  // Ideas sueltas states
  const [ideas, setIdeas] = useState<QuickIdea[]>([]);
  const [newIdeaText, setNewIdeaText] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [noDueDate, setNoDueDate] = useState(false);
  const [categoryId, setCategoryId] = useState('');

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  // Load ideas from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('equilibrium_quick_ideas');
    if (saved) {
      try {
        setIdeas(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Seed some starter ideas!
      const starterIdeas = [
        { id: '1', text: 'Comprar bombilla inteligente para la oficina' },
        { id: '2', text: 'Revisar tasas de interés bancarias el fin de semana' }
      ];
      setIdeas(starterIdeas);
      localStorage.setItem('equilibrium_quick_ideas', JSON.stringify(starterIdeas));
    }
  }, []);

  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdeaText.trim()) return;
    const newIdea = {
      id: Date.now().toString(),
      text: newIdeaText.trim()
    };
    const updated = [newIdea, ...ideas];
    setIdeas(updated);
    localStorage.setItem('equilibrium_quick_ideas', JSON.stringify(updated));
    setNewIdeaText('');
  };

  const handleDeleteIdea = (id: string) => {
    const updated = ideas.filter(i => i.id !== id);
    setIdeas(updated);
    localStorage.setItem('equilibrium_quick_ideas', JSON.stringify(updated));
  };

  const fetchData = async () => {
    try {
      const [tasksRes, categoriesRes] = await Promise.all([
        api.get<Task[]>('/tasks'),
        api.get<Category[]>('/categories')
      ]);
      setTasks(tasksRes.data);
      setCategories(categoriesRes.data);

      // If database is completely empty, let's seed mock data automatically for a premium first look!
      if (categoriesRes.data.length === 0 && tasksRes.data.length === 0) {
        await seedDefaultData();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const seedDefaultData = async () => {
    try {
      // Create default categories
      const workCat = await api.post('/categories', { name: 'Trabajo', color: '#6366f1' });
      const personalCat = await api.post('/categories', { name: 'Personal', color: '#10b981' });
      const financeCat = await api.post('/categories', { name: 'Finanzas', color: '#f59e0b' });

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-indexed
      
      const makeDate = (day: number, hour: number = 12) => {
        // Create date in local timezone, then convert to ISO
        const d = new Date(currentYear, currentMonth, day, hour);
        return d.toISOString();
      };

      // Create default tasks for the current local month
      await api.post('/tasks', {
        title: 'Revisión de Q3',
        description: 'Enviar el archivo excel consolidado al equipo legal para revisión final.',
        dueDate: makeDate(1, 10),
        isCompleted: false,
        categoryId: workCat.data.id
      });
      await api.post('/tasks', {
        title: 'Pago Alquiler',
        description: 'Realizar transferencia de la renta mensual.',
        dueDate: makeDate(4, 12),
        isCompleted: false,
        categoryId: financeCat.data.id
      });
      await api.post('/tasks', {
        title: 'Lanzamiento',
        description: 'Lanzamiento de la nueva versión a producción.',
        dueDate: makeDate(5, 9),
        isCompleted: false,
        categoryId: workCat.data.id
      });
      await api.post('/tasks', {
        title: 'Llamada de Inversores',
        description: 'Preparar deck de diapositivas y proyecciones financieras Q4.',
        dueDate: makeDate(12, 15),
        isCompleted: false,
        categoryId: workCat.data.id
      });
      await api.post('/tasks', {
        title: 'Renovación Dominio',
        description: 'Check de tarjetas y renovación automática en Cloudflare.',
        dueDate: makeDate(14, 23),
        isCompleted: false,
        categoryId: personalCat.data.id
      });

      // Reload
      const [tasksRes, categoriesRes] = await Promise.all([
        api.get<Task[]>('/tasks'),
        api.get<Category[]>('/categories')
      ]);
      setTasks(tasksRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        title,
        description: description || undefined,
        dueDate: noDueDate ? null : (dueDate ? new Date(dueDate).toISOString() : undefined),
        categoryId: categoryId || undefined
      });
      setIsModalOpen(false);
      // Reset form
      setTitle('');
      setDescription('');
      setDueDate('');
      setNoDueDate(false);
      setCategoryId('');
      fetchData();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const openConfirmModal = (id: string) => {
    setDeleteTaskId(id);
    setIsConfirmOpen(true);
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;
    try {
      await api.delete(`/tasks/${deleteTaskId}`);
      setIsConfirmOpen(false);
      setDeleteTaskId(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleDayClick = (day: number) => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const dateObj = new Date(y, m, day, 12, 0); // Default to 12:00 PM
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const hh = String(dateObj.getHours()).padStart(2, '0');
    const min = String(dateObj.getMinutes()).padStart(2, '0');
    
    setDueDate(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
    setIsModalOpen(true);
  };

  const triggerAlertSimulation = () => {
    setAlertMessage('¡Alerta de Tareas! Tienes una tarea de "Reporte de Auditoria" que venció hace 2 horas.');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 6000);
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  // Get day of week (0 = Sunday, 1 = Monday ... 6 = Saturday)
  let startDayIndex = firstDayOfMonth.getDay();
  // Adjust so Monday is 0 and Sunday is 6
  startDayIndex = startDayIndex === 0 ? 6 : startDayIndex - 1;

  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const daysGrid: (number | null)[] = [];
  for (let i = 0; i < startDayIndex; i++) {
    daysGrid.push(null);
  }
  for (let i = 1; i <= totalDaysInMonth; i++) {
    daysGrid.push(i);
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Helper to categorize task dates
  const getTasksForDay = (day: number) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === day &&
        taskDate.getMonth() === month &&
        taskDate.getFullYear() === year
      );
    });
  };

  // Helper to categorize tasks for the sidebar list
  const getTaskStatus = (task: Task) => {
    if (!task.dueDate) {
      return { label: 'SIN LÍMITE', colorClass: 'bg-blue-100 text-blue-600', timeLabel: 'Sin límite' };
    }
    const due = new Date(task.dueDate);
    const now = new Date();
    
    // Check if task is overdue
    if (due < now) {
      return { label: 'VENCIDO', colorClass: 'bg-rose-100 text-rose-600', timeLabel: 'Vencido' };
    }
    
    // Check if due in less than 24 hours
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      return { label: 'POR VENCER', colorClass: 'bg-amber-100 text-amber-600', timeLabel: 'Pronto' };
    }
    
    return { label: 'EN TIEMPO', colorClass: 'bg-emerald-100 text-emerald-600', timeLabel: due.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) };
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-100/40 relative">
      {/* Alert banner */}
      {showAlert && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-rose-600 text-white px-6 py-4 rounded-xl shadow-xl shadow-rose-600/20 max-w-lg transition-all duration-300 animate-bounce">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div className="text-sm font-semibold">{alertMessage}</div>
          <button onClick={() => setShowAlert(false)} className="hover:bg-rose-700 p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* View layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Calendar Core Section */}
        <div className="flex-1 p-8 flex flex-col overflow-y-auto min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-extrabold text-slate-800">
                  {months[month]} {year}
                </h2>
                <div className="flex gap-1">
                  <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-slate-200 transition-colors">
                    <ChevronLeft className="w-5 h-5 text-slate-500" />
                  </button>
                  <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-slate-200 transition-colors">
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium mt-1">Revisa tus metas y tareas pendientes para hoy.</p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={triggerAlertSimulation}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-sm transition-all"
              >
                <Bell className="w-4 h-4 text-indigo-500" />
                Simular Alerta
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/10 transition-all"
              >
                <Plus className="w-4 h-4" />
                Nueva Tarea
              </button>
            </div>
          </div>

          {/* Calendar Grid Container */}
          <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col min-h-[500px]">
            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center font-bold text-xs text-slate-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2 flex-1">
              {daysGrid.map((day, idx) => {
                const dayTasks = day ? getTasksForDay(day) : [];
                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                return (
                  <div
                    key={idx}
                    onClick={() => day && handleDayClick(day)}
                    title={day ? `Crear tarea el día ${day}` : undefined}
                    className={`min-h-[90px] border border-slate-100 rounded-xl p-2 flex flex-col justify-between transition-all ${
                      day
                        ? 'bg-slate-50/30 hover:bg-indigo-50/30 hover:border-indigo-200 hover:shadow-sm cursor-pointer'
                        : 'bg-transparent border-none'
                    } ${isToday ? 'ring-2 ring-indigo-500/20 bg-indigo-50/20 hover:bg-indigo-50/40' : ''}`}
                  >
                    {day && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs font-bold ${isToday ? 'text-indigo-600' : 'text-slate-800'}`}>
                            {day}
                          </span>
                          {dayTasks.length > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                          )}
                        </div>

                        {/* Task list inside day */}
                        <div className="flex-1 flex flex-col gap-1 mt-1 justify-end">
                          {dayTasks.slice(0, 2).map((task) => (
                            <div
                              key={task.id}
                              style={{ backgroundColor: task.category?.color || '#a855f7' }}
                              className="text-[10px] text-white font-bold px-2 py-1 rounded-lg truncate shadow-sm"
                            >
                              {task.title}
                            </div>
                          ))}
                          {dayTasks.length > 2 && (
                            <div className="text-[9px] text-slate-400 font-semibold pl-1">
                              +{dayTasks.length - 2} más
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Tasks Panel */}
        <aside className="w-80 border-l border-slate-200 bg-white p-6 flex flex-col justify-between overflow-y-auto">
          <div className="flex-1 flex flex-col gap-6">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-extrabold text-slate-800 text-lg">Próximas Tareas</h3>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* List */}
              <div className="space-y-4">
                {tasks.slice(0, 4).map((task) => {
                  const status = getTaskStatus(task);
                  return (
                    <div key={task.id} className="p-4 border border-slate-200/80 rounded-2xl hover:border-slate-300 hover:shadow-sm transition-all group">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${status.colorClass}`}>
                          {status.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium text-slate-400">{status.timeLabel}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openConfirmModal(task.id);
                            }}
                            className="text-slate-300 hover:text-rose-600 transition-colors duration-200"
                            title="Eliminar tarea"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1 leading-snug group-hover:text-indigo-600 transition-colors">
                        {task.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
                        {task.description || 'Sin descripción.'}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shadow-inner"
                            style={{ backgroundColor: task.category?.color || '#a855f7' }}
                          ></span>
                          <span className="text-[10px] text-slate-500 font-bold">{task.category?.name || 'Gral'}</span>
                        </div>
                        <button className="text-slate-400 group-hover:text-indigo-600 text-xs font-semibold flex items-center gap-0.5">
                          →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ideas Sueltas Panel */}
            <div className="pt-6 border-t border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                  <span>💡</span> Ideas Sueltas
                </h3>
                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">
                  {ideas.length}
                </span>
              </div>

              {/* Add Input */}
              <form onSubmit={handleAddIdea} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Apunta una idea rápida..."
                  value={newIdeaText}
                  onChange={(e) => setNewIdeaText(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-800"
                />
                <button
                  type="submit"
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center"
                  title="Guardar idea"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Ideas List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {ideas.length === 0 ? (
                  <p className="text-[11px] text-slate-400 font-semibold italic text-center py-2">
                    Sin ideas aún. ¡Apunta algo rápido!
                  </p>
                ) : (
                  ideas.map((idea) => (
                    <div
                      key={idea.id}
                      className="flex items-start justify-between gap-2 p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/60 group/idea transition-all"
                    >
                      <p className="text-xs text-slate-600 font-semibold leading-tight flex-1 break-words">
                        {idea.text}
                      </p>
                      <button
                        onClick={() => handleDeleteIdea(idea.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors opacity-0 group-hover/idea:opacity-100 p-0.5"
                        title="Eliminar idea"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Weekly progress panel */}
          <div className="pt-6 border-t border-slate-200 mt-6">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span>Progreso Semanal</span>
              <span className="text-indigo-600">65%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </aside>
      </div>

      {/* Task Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-slate-800 text-xl">Crear Nueva Tarea</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Título de la Tarea</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Reporte de Auditoria"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Descripción</label>
                <textarea
                  placeholder="Ej: Enviar el archivo excel consolidado..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fecha y Hora</label>
                  <input
                    type="datetime-local"
                    disabled={noDueDate}
                    required={!noDueDate}
                    value={noDueDate ? '' : dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800 disabled:opacity-50 disabled:bg-slate-50"
                  />
                  <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={noDueDate}
                      onChange={(e) => setNoDueDate(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-slate-500">Sin fecha límite</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Categoría</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800"
                  >
                    <option value="">Selecciona categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 text-sm transition-colors shadow-md shadow-indigo-600/10"
                >
                  Crear Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg mb-2">¿Eliminar Tarea?</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">
              Esta acción no se puede deshacer. ¿Seguro que deseas eliminar esta tarea de tu calendario?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmOpen(false);
                  setDeleteTaskId(null);
                }}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-55 text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteTask}
                className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 text-sm transition-colors shadow-md shadow-rose-600/10"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
