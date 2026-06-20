import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, X, Edit2, Tag, Calendar, FileText, AlertCircle } from 'lucide-react';
import { api, Task, Category } from '../lib/api';

export default function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');

  // Create modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [noDueDate, setNoDueDate] = useState(false);
  const [categoryId, setCategoryId] = useState('');

  // Delete task modal
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  // Edit task modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editNoDueDate, setEditNoDueDate] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState('');

  // Category management
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366f1');
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
  const [isConfirmCatOpen, setIsConfirmCatOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, categoriesRes] = await Promise.all([
        api.get<Task[]>('/tasks'),
        api.get<Category[]>('/categories'),
      ]);
      setTasks(tasksRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error('Error fetching tasks/categories:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        title,
        description: description || undefined,
        dueDate: noDueDate ? null : (dueDate ? new Date(dueDate).toISOString() : undefined),
        categoryId: categoryId || undefined,
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      setNoDueDate(false);
      setCategoryId('');
      fetchData();
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await api.patch(`/tasks/${task.id}`, { isCompleted: !task.isCompleted });
      fetchData();
    } catch (err) {
      console.error('Error toggling task:', err);
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
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const openEditModal = (task: Task) => {
    setEditTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    // Format ISO date -> datetime-local value
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      const pad = (n: number) => String(n).padStart(2, '0');
      setEditDueDate(
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      );
      setEditNoDueDate(false);
    } else {
      setEditDueDate('');
      setEditNoDueDate(true);
    }
    setEditCategoryId(task.category?.id || '');
    setIsEditOpen(true);
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask) return;
    try {
      await api.patch(`/tasks/${editTask.id}`, {
        title: editTitle,
        description: editDescription || undefined,
        dueDate: editNoDueDate ? null : (editDueDate ? new Date(editDueDate).toISOString() : undefined),
        categoryId: editCategoryId || null,
      });
      setIsEditOpen(false);
      setEditTask(null);
      fetchData();
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await api.post('/categories', { name: newCatName.trim(), color: newCatColor });
      setNewCatName('');
      setNewCatColor('#6366f1');
      setIsCatModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error creating category:', err);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCatId) return;
    try {
      await api.delete(`/categories/${deleteCatId}`);
      setIsConfirmCatOpen(false);
      setDeleteCatId(null);
      if (filterCategoryId === deleteCatId) setFilterCategoryId('all');
      fetchData();
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  // Filter by category
  const filteredTasks =
    filterCategoryId === 'all'
      ? tasks
      : tasks.filter((t) => t.category?.id === filterCategoryId);

  const pending = filteredTasks.filter((t) => !t.isCompleted);
  const completed = filteredTasks.filter((t) => t.isCompleted);

  const formatDate = (isoDate: string | null | undefined) => {
    if (!isoDate) return 'Sin fecha límite';
    return new Date(isoDate).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-slate-100/40 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FileText className="w-6 h-6" />
            </span>
            Tareas
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            Gestiona, organiza y completa todas tus tareas pendientes.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/10 transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Nueva Tarea
        </button>
      </div>

      {/* Category filter chips */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilterCategoryId('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              filterCategoryId === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setFilterCategoryId(filterCategoryId === cat.id ? 'all' : cat.id)
              }
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                filterCategoryId === cat.id
                  ? 'text-white border-transparent shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
              style={
                filterCategoryId === cat.id
                  ? { backgroundColor: cat.color, borderColor: cat.color }
                  : {}
              }
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: filterCategoryId === cat.id ? 'white' : cat.color }}
              />
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Task columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <h3 className="font-extrabold text-slate-700 text-sm uppercase tracking-wider">
              Tareas Pendientes
            </h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {pending.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-semibold">¡Todo al día!</p>
                <p className="text-xs text-slate-300 font-medium mt-1">No hay tareas pendientes.</p>
              </div>
            ) : (
              pending.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors group"
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 border-slate-300 hover:border-indigo-500 transition-colors flex items-center justify-center"
                    title="Marcar como completada"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm leading-snug">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-slate-400 font-medium mt-0.5 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {task.category && (
                        <span
                          className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: task.category.color + '22',
                            color: task.category.color,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: task.category.color }}
                          />
                          {task.category.name}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => openEditModal(task)}
                      className="text-slate-300 hover:text-indigo-500 transition-colors p-1"
                      title="Editar tarea"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openConfirmModal(task.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {pending.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/40">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar tarea
              </button>
            </div>
          )}
        </div>

        {/* Completed */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <h3 className="font-extrabold text-slate-700 text-sm uppercase tracking-wider">
              Tareas Completadas
            </h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {completed.length}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {completed.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-semibold">Sin completadas aún</p>
                <p className="text-xs text-slate-300 font-medium mt-1">
                  Completa tareas para verlas aquí.
                </p>
              </div>
            ) : (
              completed.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors group"
                >
                  {/* Completed checkbox */}
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-md bg-emerald-500 border-2 border-emerald-500 flex items-center justify-center hover:bg-emerald-400 transition-colors"
                    title="Marcar como pendiente"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </button>
                  <div className="flex-1 min-w-0 opacity-60">
                    <h4 className="font-bold text-slate-500 text-sm leading-snug line-through">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-slate-400 font-medium mt-0.5 line-clamp-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {task.category && (
                        <span className="text-[10px] font-bold text-slate-400">
                          {task.category.name}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => openEditModal(task)}
                      className="text-slate-300 hover:text-indigo-500 transition-colors p-1"
                      title="Editar tarea"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openConfirmModal(task.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Categories management panel */}
      <div className="mt-6 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <h3 className="font-extrabold text-slate-700 text-sm uppercase tracking-wider flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-500" />
            Categorías
          </h3>
          <button
            onClick={() => setIsCatModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva Categoría
          </button>
        </div>
        <div className="px-6 py-4">
          {categories.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold italic text-center py-2">
              Sin categorías creadas. ¡Agrega una para organizar tus tareas!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold group/cat transition-all"
                  style={{ borderColor: cat.color + '40', backgroundColor: cat.color + '12', color: cat.color }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                  <button
                    onClick={() => { setDeleteCatId(cat.id); setIsConfirmCatOpen(true); }}
                    className="ml-1 opacity-0 group-hover/cat:opacity-100 transition-opacity hover:text-rose-600"
                    title="Eliminar categoría"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary bar */}
      {tasks.length > 0 && (
        <div className="mt-6 bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm flex items-center gap-6">
          <div className="flex-1">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-2">
              <span>Progreso General</span>
              <span className="text-indigo-600">
                {tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-700"
                style={{
                  width: `${tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-slate-800">{completed.length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completadas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-indigo-600">{pending.length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pendientes</p>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-slate-800 text-xl flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-500" />
                Nueva Tarea
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                  Título de la Tarea
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Revisar el reporte mensual"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  Descripción (Opcional)
                </label>
                <textarea
                  placeholder="Añade detalles de la tarea..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    Fecha y Hora
                  </label>
                  <input
                    type="datetime-local"
                    disabled={noDueDate}
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
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <Tag className="w-3.5 h-3.5 text-indigo-500" />
                    Categoría
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800"
                  >
                    <option value="">Sin categoría</option>
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

      {/* Edit Task Modal */}
      {isEditOpen && editTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-slate-800 text-xl flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-500" />
                Editar Tarea
              </h3>
              <button
                onClick={() => { setIsEditOpen(false); setEditTask(null); }}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  Descripción (Opcional)
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    Fecha y Hora
                  </label>
                  <input
                    type="datetime-local"
                    disabled={editNoDueDate}
                    value={editNoDueDate ? '' : editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800 disabled:opacity-50 disabled:bg-slate-50"
                  />
                  <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editNoDueDate}
                      onChange={(e) => setEditNoDueDate(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-slate-500">Sin fecha límite</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <Tag className="w-3.5 h-3.5 text-indigo-500" />
                    Categoría
                  </label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800"
                  >
                    <option value="">Sin categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); setEditTask(null); }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 text-sm transition-colors shadow-md shadow-indigo-600/10"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Task Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg mb-2">¿Eliminar Tarea?</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">
              Esta acción no se puede deshacer. ¿Seguro que deseas eliminar esta tarea?
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setIsConfirmOpen(false); setDeleteTaskId(null); }}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-sm transition-colors">
                Cancelar
              </button>
              <button type="button" onClick={handleDeleteTask}
                className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 text-sm transition-colors shadow-md shadow-rose-600/10">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-slate-800 text-xl flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-500" />
                Nueva Categoría
              </h3>
              <button onClick={() => setIsCatModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Trabajo, Personal, Salud..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Color de la Categoría
                </label>
                {/* Preset color swatches */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#64748b'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCatColor(color)}
                      className={`w-8 h-8 rounded-lg transition-all border-2 ${
                        newCatColor === color ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                {/* Custom color picker */}
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-1"
                  />
                  <div
                    className="flex-1 h-10 rounded-xl border border-slate-200 flex items-center px-3 gap-2"
                    style={{ backgroundColor: newCatColor + '18', borderColor: newCatColor + '50' }}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: newCatColor }} />
                    <span className="text-sm font-bold" style={{ color: newCatColor }}>
                      {newCatName || 'Vista previa'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsCatModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-sm transition-colors">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 text-sm transition-colors shadow-md shadow-indigo-600/10">
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {isConfirmCatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg mb-2">¿Eliminar Categoría?</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">
              Las tareas con esta categoría quedarán sin categoría asignada.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setIsConfirmCatOpen(false); setDeleteCatId(null); }}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-sm transition-colors">
                Cancelar
              </button>
              <button type="button" onClick={handleDeleteCategory}
                className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 text-sm transition-colors shadow-md shadow-rose-600/10">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
