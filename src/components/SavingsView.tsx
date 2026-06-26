import React, { useState, useEffect } from 'react';
import { Plus, Bell, Target, TrendingUp, X, Trash2, Edit2, Minus, Check, Calendar, Tag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api, Saving, Category } from '../lib/api';


export default function SavingsView() {
  const [savings, setSavings] = useState<Saving[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [monthlySaving, setMonthlySaving] = useState<number>(850);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteSavingId, setDeleteSavingId] = useState<string | null>(null);

  // Edit goal modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSaving, setSelectedSaving] = useState<Saving | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editGoalAmount, setEditGoalAmount] = useState('');
  const [editCurrentAmount, setEditCurrentAmount] = useState('');
  const [editTargetDate, setEditTargetDate] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');

  // Inline savings adjustment states
  const [adjustingGoalId, setAdjustingGoalId] = useState<string | null>(null);
  const [adjustType, setAdjustType] = useState<'add' | 'sub'>('add');
  const [adjustAmount, setAdjustAmount] = useState<string>('');

  // Form states
  const [title, setTitle] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [savingsRes, categoriesRes] = await Promise.all([
        api.get<Saving[]>('/savings'),
        api.get<Category[]>('/categories')
      ]);
      setSavings(savingsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCreateSaving = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/savings', {
        title,
        goalAmount: parseFloat(goalAmount),
        currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
        targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
        categoryId: categoryId || undefined
      });
      setIsModalOpen(false);
      setTitle('');
      setGoalAmount('');
      setCurrentAmount('');
      setTargetDate('');
      setCategoryId('');
      fetchData();
    } catch (error) {
      console.error('Error creating saving goal:', error);
    }
  };

  const openConfirmModal = (id: string) => {
    setDeleteSavingId(id);
    setIsConfirmOpen(true);
  };

  const handleDeleteSaving = async () => {
    if (!deleteSavingId) return;
    try {
      await api.delete(`/savings/${deleteSavingId}`);
      setIsConfirmOpen(false);
      setDeleteSavingId(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting saving goal:', error);
    }
  };

  const openEditModal = (saving: Saving) => {
    setSelectedSaving(saving);
    setEditTitle(saving.title);
    setEditGoalAmount(saving.goalAmount.toString());
    setEditCurrentAmount(saving.currentAmount.toString());
    
    // Format date string as YYYY-MM-DD for HTML input
    let formattedDate = '';
    if (saving.targetDate) {
      const dateObj = new Date(saving.targetDate);
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(dateObj.getDate()).padStart(2, '0');
      formattedDate = `${yyyy}-${mm}-${dd}`;
    }
    setEditTargetDate(formattedDate);
    setEditCategoryId(saving.category?.id || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateSaving = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSaving) return;
    try {
      await api.patch(`/savings/${selectedSaving.id}`, {
        title: editTitle,
        goalAmount: parseFloat(editGoalAmount),
        currentAmount: parseFloat(editCurrentAmount),
        targetDate: editTargetDate ? new Date(editTargetDate).toISOString() : null,
        categoryId: editCategoryId || null
      });
      setIsEditModalOpen(false);
      setSelectedSaving(null);
      fetchData();
    } catch (error) {
      console.error('Error updating saving goal:', error);
    }
  };

  const handleQuickAdjust = async (saving: Saving) => {
    const amountVal = parseFloat(adjustAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;
    
    let newAmount = parseFloat(saving.currentAmount.toString());
    if (adjustType === 'add') {
      newAmount += amountVal;
    } else {
      newAmount = Math.max(0, newAmount - amountVal);
    }

    try {
      await api.patch(`/savings/${saving.id}`, {
        currentAmount: newAmount
      });
      setAdjustingGoalId(null);
      setAdjustAmount('');
      fetchData();
    } catch (error) {
      console.error('Error adjusting savings amount:', error);
    }
  };

  // Trajectory Chart Calculation based on Monthly Savings
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = i + 1;
    const name = `Mes ${monthIndex}`;
    const capital = monthIndex * monthlySaving;
    return { name, capital };
  });

  // Highlight next upcoming goal
  const mainGoal = savings[0] || { title: 'MacBook Pro M3', goalAmount: 2400, currentAmount: 1000 };
  const mainProgress = Math.round((mainGoal.currentAmount / mainGoal.goalAmount) * 100) || 42;
  const mainMonthsToGoal = Math.ceil((mainGoal.goalAmount - mainGoal.currentAmount) / monthlySaving) || 2;

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-100/40 dark:bg-slate-950/40 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Metas de Ahorro</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Optimiza tus metas financieras y visualiza tu capital en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-xl transition-all shadow-sm">
            <Bell className="w-5 h-5 text-indigo-500" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/10 transition-all animate-fade-in"
          >
            <Plus className="w-4 h-4" />
            Nueva Meta
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Sliders Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="p-2 rounded-xl bg-indigo-55 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30">
                <Target className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base leading-tight">Inteligencia Financiera</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Ajusta tu capacidad para calcular impactos en tiempo real.</p>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Ahorro Mensual</span>
                <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">${monthlySaving}</span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="50"
                value={monthlySaving}
                onChange={(e) => setMonthlySaving(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500">
                <span>$100</span>
                <span>$5,000</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Fuerza de Ahorro</span>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-450">Optimizado</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>

        {/* Per-objective progress panel */}
        <div className="lg:col-span-7 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-3xl p-6 shadow-lg shadow-indigo-600/10 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <TrendingUp className="w-40 h-40" />
          </div>

          <div className="mb-5">
            <span className="text-xs font-extrabold bg-indigo-500/60 text-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Progreso por Objetivo
            </span>
            <h3 className="text-xl font-extrabold mt-3 leading-tight">
              {savings.length === 0 ? 'Sin objetivos aún' : `${savings.length} objetivo${savings.length !== 1 ? 's' : ''} activo${savings.length !== 1 ? 's' : ''}`}
            </h3>
          </div>

          {savings.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-indigo-200 text-sm font-semibold">Crea tu primer objetivo de ahorro</p>
            </div>
          ) : (
            <div className="flex-1 space-y-4 overflow-y-auto pr-1 max-h-52 scrollbar-thin">
              {savings.map((saving) => {
                const prog = Math.min(Math.round((saving.currentAmount / saving.goalAmount) * 100), 100);
                const mLeft = Math.ceil((saving.goalAmount - saving.currentAmount) / monthlySaving);
                const isComplete = saving.currentAmount >= saving.goalAmount;
                return (
                  <div key={saving.id}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-bold truncate max-w-[60%]">{saving.title}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-indigo-200 font-semibold">
                          ${saving.currentAmount.toLocaleString()} / ${saving.goalAmount.toLocaleString()}
                        </span>
                        <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded-md ${isComplete ? 'bg-emerald-400/30 text-emerald-200' : 'bg-indigo-500/50 text-white'}`}>
                          {prog}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-indigo-800/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${isComplete ? 'bg-emerald-400' : 'bg-white/80'}`}
                        style={{ width: `${prog}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-indigo-300 font-semibold mt-1">
                      {isComplete ? '✅ Objetivo completado' : `Faltan ${mLeft > 0 ? `${mLeft} mes${mLeft !== 1 ? 'es' : ''}` : 'menos de 1 mes'} con $${monthlySaving}/mes`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Target Goals grid */}
      <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg mb-4">Tus Objetivos de Compra</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {savings.map((saving) => {
          const progress = Math.min(Math.round((saving.currentAmount / saving.goalAmount) * 100), 100);
          const monthsLeft = Math.ceil((saving.goalAmount - saving.currentAmount) / monthlySaving);
          return (
            <div
              key={saving.id}
              onClick={() => openEditModal(saving)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md dark:hover:shadow-indigo-900/10 hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.01] cursor-pointer transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-550 shadow-inner">
                      🛍️
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{saving.title}</h4>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">${saving.goalAmount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(saving);
                      }}
                      className="text-slate-400 hover:text-indigo-600 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-slate-200/60 dark:border-slate-700 p-1.5 rounded-lg transition-all"
                      title="Editar meta"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openConfirmModal(saving.id);
                      }}
                      className="text-slate-400 hover:text-rose-600 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200/60 dark:border-slate-700 p-1.5 rounded-lg transition-all"
                      title="Eliminar meta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                {/* Quick savings adjust row */}
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  {adjustingGoalId === saving.id ? (
                    <div className="flex items-center gap-1.5 w-full z-10" onClick={(e) => e.stopPropagation()}>
                      <span className="text-xs font-extrabold text-indigo-600">
                        {adjustType === 'add' ? '+' : '-'}
                      </span>
                      <input
                        type="number"
                        min="1"
                        placeholder="Monto"
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(e.target.value)}
                        className="w-16 px-2 py-1 border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleQuickAdjust(saving)}
                        className="p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                        title="Confirmar"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          setAdjustingGoalId(null);
                          setAdjustAmount('');
                        }}
                        className="p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-md transition-colors"
                        title="Cancelar"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span>Ahorrado: <strong className="text-slate-800 dark:text-slate-200">${saving.currentAmount}</strong></span>
                      <div className="flex items-center gap-1.5 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAdjustingGoalId(saving.id);
                            setAdjustType('sub');
                            setAdjustAmount('');
                          }}
                          className="w-6 h-6 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/35 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                          title="Restar ahorro"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAdjustingGoalId(saving.id);
                            setAdjustType('add');
                            setAdjustAmount('');
                          }}
                          className="w-6 h-6 bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/35 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                          title="Sumar ahorro"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-slate-400 dark:text-slate-500">
                  <span>Progreso</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-550 flex items-center justify-between">
                  <span>Faltan {monthsLeft > 0 ? `${monthsLeft} meses` : 'Completado'}</span>
                  <span>{saving.category?.name || 'Gral'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trajectory capital chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">Trayectoria de Capital</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
              Proyección de crecimiento a 12 meses basado en el ahorro mensual.
            </p>
          </div>
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
            <button className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-300">12 Meses</button>
            <button className="px-3 py-1.5 rounded-lg">24 Meses</button>
          </div>
        </div>

        {/* Chart container */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(value) => [`$${value}`, 'Capital Proyectado']} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="capital" fill="#818cf8" radius={[8, 8, 0, 0]} maxBarSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add Savings Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-xl flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-500" />
                Crear Nueva Meta
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-slate-400 dark:text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSaving} className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                  Nombre de la Meta
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: MacBook Pro M3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-850"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    <Target className="w-3.5 h-3.5 text-indigo-500" />
                    Monto Objetivo ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Ej: 2400"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-850"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                    Ahorrado Inicial ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ej: 1000"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-850"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    Fecha Límite (Opcional)
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800 dark:text-slate-105 bg-white dark:bg-slate-850"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    <Tag className="w-3.5 h-3.5 text-indigo-500" />
                    Categoría
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-850"
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

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 font-bold hover:bg-slate-50 dark:hover:bg-slate-850 text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 text-sm transition-colors shadow-md shadow-indigo-600/10"
                >
                  Crear Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">⚠️</span>
            </div>
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg mb-2">¿Eliminar Meta?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">
              Esta acción no se puede deshacer. ¿Seguro que deseas eliminar esta meta de ahorro?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmOpen(false);
                  setDeleteSavingId(null);
                }}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-55 dark:hover:bg-slate-850 text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteSaving}
                className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 text-sm transition-colors shadow-md shadow-rose-600/10"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Savings Modal */}
      {isEditModalOpen && selectedSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-xl flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-500" />
                Modificar Meta de Ahorro
              </h3>
              <button onClick={() => {
                setIsEditModalOpen(false);
                setSelectedSaving(null);
              }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-slate-400 dark:text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSaving} className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                  Nombre de la Meta
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-850"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    <Target className="w-3.5 h-3.5 text-indigo-500" />
                    Monto Objetivo ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editGoalAmount}
                    onChange={(e) => setEditGoalAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-850"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                    Ahorro Acumulado ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editCurrentAmount}
                    onChange={(e) => setEditCurrentAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-850"
                  />
                </div>
              </div>

              {/* Quick Adjust inside Edit Modal */}
              <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-100/80 dark:border-slate-800 space-y-2">
                <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ajuste Rápido de Ahorro</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Monto a sumar/restar"
                    id="modalAdjustAmount"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const inputEl = document.getElementById('modalAdjustAmount') as HTMLInputElement;
                      const amount = parseFloat(inputEl?.value || '0');
                      if (amount > 0) {
                        const current = parseFloat(editCurrentAmount) || 0;
                        setEditCurrentAmount(Math.max(0, current - amount).toString());
                        inputEl.value = '';
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-450 border border-rose-200/50 dark:border-rose-900/40 font-bold text-xs rounded-xl transition-all shadow-sm"
                    title="Quitar ahorro"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    Restar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const inputEl = document.getElementById('modalAdjustAmount') as HTMLInputElement;
                      const amount = parseFloat(inputEl?.value || '0');
                      if (amount > 0) {
                        const current = parseFloat(editCurrentAmount) || 0;
                        setEditCurrentAmount((current + amount).toString());
                        inputEl.value = '';
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-450 border border-indigo-200/50 dark:border-indigo-900/40 font-bold text-xs rounded-xl transition-all shadow-sm"
                    title="Agregar ahorro"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Sumar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    Fecha Límite (Opcional)
                  </label>
                  <input
                    type="date"
                    value={editTargetDate}
                    onChange={(e) => setEditTargetDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800 dark:text-slate-105 bg-white dark:bg-slate-850"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    <Tag className="w-3.5 h-3.5 text-indigo-500" />
                    Categoría
                  </label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-850"
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

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedSaving(null);
                  }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 font-bold hover:bg-slate-50 dark:hover:bg-slate-850 text-sm transition-colors"
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
    </div>
  );
}
