import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, AlertCircle, Calendar, Tag, Wallet, ArrowUpRight, ArrowDownRight, Layers, FileText } from 'lucide-react';
import { api, Transaction, Category } from '../lib/api';

export default function TransactionsView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'gasto' | 'ingreso'>('all');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Add Transaction Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'gasto' | 'ingreso'>('gasto');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // Delete Transaction Modal
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);

  useEffect(() => {
    // Set default date to today in local format (YYYY-MM-DD)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);

    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transactionsRes, categoriesRes] = await Promise.all([
        api.get<Transaction[]>('/transactions'),
        api.get<Category[]>('/categories')
      ]);
      setTransactions(transactionsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching transactions or categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      // API expects ISO string for Date
      await api.post('/transactions', {
        type,
        amount: parseFloat(amount),
        date: new Date(date).toISOString(),
        description: description.trim() || undefined,
        categoryId: categoryId || undefined
      });

      setIsModalOpen(false);
      setAmount('');
      setType('gasto');
      setDescription('');
      setCategoryId('');
      
      // Reset date to today
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setDate(`${yyyy}-${mm}-${dd}`);

      fetchData();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const openConfirmModal = (id: string) => {
    setDeleteTransactionId(id);
    setIsConfirmOpen(true);
  };

  const handleDeleteTransaction = async () => {
    if (!deleteTransactionId) return;
    try {
      await api.delete(`/transactions/${deleteTransactionId}`);
      setIsConfirmOpen(false);
      setDeleteTransactionId(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  // Calculations
  const totalIncomes = transactions
    .filter(t => t.type === 'ingreso')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'gasto')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const netBalance = totalIncomes - totalExpenses;

  // Filtered transactions list
  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = filterCategoryId === 'all' || t.category?.id === filterCategoryId;
    return matchesType && matchesCategory;
  });

  // Calculate expenses distribution by category
  const expenseByCategory = categories.map(cat => {
    const total = transactions
      .filter(t => t.type === 'gasto' && t.category?.id === cat.id)
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    return {
      ...cat,
      total
    };
  }).filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total);

  const totalExpenseInCategories = expenseByCategory.reduce((acc, curr) => acc + curr.total, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-slate-100/40 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Wallet className="w-6 h-6" />
            </span>
            Finanzas Personales
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            Lleva el control de tus gastos diarios e ingresos de forma rápida y sencilla.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/10 transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Registrar Transacción
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Net Balance Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Balance General</span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${netBalance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              Neto
            </span>
          </div>
          <div>
            <h3 className={`text-3xl font-extrabold tracking-tight ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {netBalance < 0 ? '-' : ''}${Math.abs(netBalance).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1.5">Monto total acumulado</p>
          </div>
        </div>

        {/* Total Incomes Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingresos Totales</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              ${totalIncomes.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-emerald-600 font-bold mt-1.5">Entradas registradas</p>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gastos Totales</span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              ${totalExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-rose-600 font-bold mt-1.5">Salidas registradas</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Transactions List */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
              <div className="flex rounded-xl bg-slate-200/60 p-1 text-xs font-bold text-slate-500 border border-slate-200/30">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${filterType === 'all' ? 'bg-white shadow-sm text-slate-800' : 'hover:text-slate-700'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterType('gasto')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${filterType === 'gasto' ? 'bg-white shadow-sm text-rose-600' : 'hover:text-slate-700'}`}
                >
                  Gastos
                </button>
                <button
                  onClick={() => setFilterType('ingreso')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${filterType === 'ingreso' ? 'bg-white shadow-sm text-emerald-600' : 'hover:text-slate-700'}`}
                >
                  Ingresos
                </button>
              </div>

              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Filtrar por:</span>
                  <select
                    value={filterCategoryId}
                    onChange={(e) => setFilterCategoryId(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs font-bold text-slate-600 bg-white"
                  >
                    <option value="all">Todas las Categorías</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-8 h-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="px-6 py-20 text-center">
                  <span className="text-4xl mb-3 block">💸</span>
                  <p className="text-sm text-slate-400 font-semibold">No se encontraron transacciones</p>
                  <p className="text-xs text-slate-300 font-medium mt-1">Registra tus transacciones diarias usando el botón superior.</p>
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/40 transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Left icon with Category Color */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: transaction.category ? transaction.category.color + '18' : '#e2e8f0',
                          color: transaction.category ? transaction.category.color : '#64748b'
                        }}
                      >
                        {transaction.type === 'gasto' ? (
                          <ArrowDownRight className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm truncate leading-snug">
                          {transaction.description || (transaction.type === 'gasto' ? 'Gasto' : 'Ingreso')}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {transaction.category && (
                            <span
                              className="text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase"
                              style={{
                                backgroundColor: transaction.category.color + '12',
                                color: transaction.category.color,
                              }}
                            >
                              {transaction.category.name}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(transaction.date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-extrabold ${transaction.type === 'gasto' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {transaction.type === 'gasto' ? '-' : '+'}${Number(transaction.amount).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={() => openConfirmModal(transaction.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Eliminar transacción"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {filteredTransactions.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/20 text-center">
              <span className="text-xs font-bold text-slate-400">
                Mostrando {filteredTransactions.length} transacciones
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Category Breakdown & Statistics */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-base mb-1 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-500" />
              Gastos por Categoría
            </h3>
            <p className="text-xs text-slate-400 font-semibold mb-6">Desglose de tus salidas financieras.</p>

            {expenseByCategory.length === 0 ? (
              <div className="text-center py-10">
                <span className="text-3xl mb-2 block">📊</span>
                <p className="text-xs text-slate-400 font-semibold italic">Registra gastos con categoría para ver el desglose.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {expenseByCategory.map((cat) => {
                  const percentage = totalExpenseInCategories > 0
                    ? Math.round((cat.total / totalExpenseInCategories) * 100)
                    : 0;
                  return (
                    <div key={cat.id} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </span>
                        <div className="space-x-1.5">
                          <span className="text-slate-800">${cat.total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <span className="text-slate-400">({percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: cat.color,
                            width: `${percentage}%`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-slate-800 text-xl flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-500" />
                Registrar Transacción
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => setType('gasto')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${type === 'gasto' ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/10' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Gasto (Salida)
                </button>
                <button
                  type="button"
                  onClick={() => setType('ingreso')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${type === 'ingreso' ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/10' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Ingreso (Entrada)
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Monto ($)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium text-slate-800"
                />
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Descripción / Concepto
                </label>
                <input
                  type="text"
                  placeholder="Ej: Almuerzo, Sueldo, Supermercado..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium text-slate-800"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Categoría
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium text-slate-800"
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
                  className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 text-sm transition-colors shadow-md shadow-emerald-600/10"
                >
                  Guardar Transacción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Delete Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg mb-2">¿Eliminar Transacción?</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">
              Esta acción no se puede deshacer. ¿Seguro que deseas eliminar esta transacción de tu registro?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmOpen(false);
                  setDeleteTransactionId(null);
                }}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteTransaction}
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
