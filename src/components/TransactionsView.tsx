import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, AlertCircle, Calendar, Tag, Wallet, ArrowUpRight, ArrowDownRight, Layers, CreditCard, Shield, TrendingUp, DollarSign, Target, Check } from 'lucide-react';
import { api, Transaction, Category, Card, Saving } from '../lib/api';

type TabType = 'diario' | 'tarjetas' | 'ahorros';

export default function TransactionsView() {
  const [activeTab, setActiveTab] = useState<TabType>('diario');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [savings, setSavings] = useState<Saving[]>([]);

  const [filterType, setFilterType] = useState<'all' | 'gasto' | 'ingreso'>('all');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Add Transaction Modal
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'gasto' | 'ingreso'>('gasto');
  const [txDate, setTxDate] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [cardId, setCardId] = useState(''); // Option to pay with Credit Card

  // Add Card Modal
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardName, setCardName] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [closingDay, setClosingDay] = useState('15');
  const [dueDate, setDueDate] = useState('5');

  // Add/Adjust Saving Goal Modal
  const [isSavingModalOpen, setIsSavingModalOpen] = useState(false);
  const [savingTitle, setSavingTitle] = useState('');
  const [savingGoalAmount, setSavingGoalAmount] = useState('');
  const [savingCurrentAmount, setSavingCurrentAmount] = useState('');
  const [savingTargetDate, setSavingTargetDate] = useState('');
  const [savingCategoryId, setSavingCategoryId] = useState('');

  // Delete Modals
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);

  const [isConfirmCardOpen, setIsConfirmCardOpen] = useState(false);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);

  const [isConfirmSavingOpen, setIsConfirmSavingOpen] = useState(false);
  const [deleteSavingId, setDeleteSavingId] = useState<string | null>(null);

  // Selected card in card tab
  const [selectedCardId, setSelectedCardId] = useState<string | 'all'>('all');

  useEffect(() => {
    // Set default date to today in local format (YYYY-MM-DD)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setTxDate(`${yyyy}-${mm}-${dd}`);

    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transactionsRes, categoriesRes, cardsRes, savingsRes] = await Promise.all([
        api.get<Transaction[]>('/transactions'),
        api.get<Category[]>('/categories'),
        api.get<Card[]>('/cards'),
        api.get<Saving[]>('/savings')
      ]);
      setTransactions(transactionsRes.data);
      setCategories(categoriesRes.data);
      setCards(cardsRes.data);
      setSavings(savingsRes.data);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create Transaction Handler
  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      await api.post('/transactions', {
        type,
        amount: parseFloat(amount),
        date: new Date(txDate).toISOString(),
        description: description.trim() || undefined,
        categoryId: categoryId || undefined,
        cardId: type === 'gasto' && cardId ? cardId : undefined // Only gastos can use credit card
      });

      setIsTxModalOpen(false);
      setAmount('');
      setType('gasto');
      setDescription('');
      setCategoryId('');
      setCardId('');
      
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setTxDate(`${yyyy}-${mm}-${dd}`);

      fetchData();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  // Create Card Handler
  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName || !creditLimit) return;

    try {
      await api.post('/cards', {
        name: cardName,
        creditLimit: parseFloat(creditLimit),
        closingDay: parseInt(closingDay),
        dueDate: parseInt(dueDate)
      });

      setIsCardModalOpen(false);
      setCardName('');
      setCreditLimit('');
      setClosingDay('15');
      setDueDate('5');

      fetchData();
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  // Create Saving Goal Handler
  const handleCreateSaving = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savingTitle || !savingGoalAmount) return;

    try {
      await api.post('/savings', {
        title: savingTitle,
        goalAmount: parseFloat(savingGoalAmount),
        currentAmount: savingCurrentAmount ? parseFloat(savingCurrentAmount) : 0,
        targetDate: savingTargetDate ? new Date(savingTargetDate).toISOString() : undefined,
        categoryId: savingCategoryId || undefined
      });

      setIsSavingModalOpen(false);
      setSavingTitle('');
      setSavingGoalAmount('');
      setSavingCurrentAmount('');
      setSavingTargetDate('');
      setSavingCategoryId('');

      fetchData();
    } catch (error) {
      console.error('Error creating saving goal:', error);
    }
  };

  // Delete Handlers
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

  const handleDeleteCard = async () => {
    if (!deleteCardId) return;
    try {
      await api.delete(`/cards/${deleteCardId}`);
      setIsConfirmCardOpen(false);
      setDeleteCardId(null);
      if (selectedCardId === deleteCardId) setSelectedCardId('all');
      fetchData();
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const handleDeleteSaving = async () => {
    if (!deleteSavingId) return;
    try {
      await api.delete(`/savings/${deleteSavingId}`);
      setIsConfirmSavingOpen(false);
      setDeleteSavingId(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting saving:', error);
    }
  };

  // General Calculations
  const totalIncomes = transactions
    .filter(t => t.type === 'ingreso')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'gasto')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const netBalance = totalIncomes - totalExpenses;

  // Credit Card Balance Calculation (sum transactions linked to a card)
  const getCardUsedBalance = (cardId: string) => {
    return transactions
      .filter(t => t.type === 'gasto' && t.cardId === cardId)
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
  };

  // Total credit cards debt
  const totalCardDebt = cards.reduce((acc, curr) => acc + getCardUsedBalance(curr.id), 0);

  // Total savings accumulated
  const totalSavings = savings.reduce((acc, curr) => acc + Number(curr.currentAmount), 0);

  // Filters for Tab 1 (Diario)
  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = filterCategoryId === 'all' || t.category?.id === filterCategoryId;
    return matchesType && matchesCategory;
  });

  // Calculate expenses distribution by category (for Diario)
  const expenseByCategory = categories.map(cat => {
    const total = transactions
      .filter(t => t.type === 'gasto' && t.category?.id === cat.id)
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    return { ...cat, total };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const totalExpenseInCategories = expenseByCategory.reduce((acc, curr) => acc + curr.total, 0);

  // Card Transactions Filtering
  const cardTransactions = transactions.filter(t => {
    if (selectedCardId === 'all') return t.cardId !== undefined && t.cardId !== null;
    return t.cardId === selectedCardId;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Card color presets
  const cardGradients = [
    'from-slate-800 to-slate-900',
    'from-indigo-600 to-indigo-800',
    'from-emerald-600 to-emerald-800',
    'from-rose-600 to-rose-800',
    'from-amber-600 to-amber-800'
  ];

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
            Gestiona tus ingresos, gastos diarios, tarjetas de crédito y ahorros acumulados.
          </p>
        </div>

        {/* Global Action buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
          {activeTab === 'diario' && (
            <button
              onClick={() => setIsTxModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/10 transition-all"
            >
              <Plus className="w-4 h-4" />
              Registrar Gasto/Ingreso
            </button>
          )}
          {activeTab === 'tarjetas' && (
            <button
              onClick={() => setIsCardModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/10 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nueva Tarjeta
            </button>
          )}
          {activeTab === 'ahorros' && (
            <button
              onClick={() => setIsSavingModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/10 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nueva Meta de Ahorro
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-8">
        <button
          onClick={() => setActiveTab('diario')}
          className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'diario' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          <Layers className="w-4 h-4" />
          Gastos Diarios
        </button>
        <button
          onClick={() => setActiveTab('tarjetas')}
          className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'tarjetas' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          <CreditCard className="w-4 h-4" />
          Tarjetas de Crédito ({cards.length})
        </button>
        <button
          onClick={() => setActiveTab('ahorros')}
          className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'ahorros' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          <TrendingUp className="w-4 h-4" />
          Ahorros (${totalSavings.toLocaleString('es-ES')})
        </button>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <>
          {/* TAB 1: GASTOS DIARIOS */}
          {activeTab === 'diario' && (
            <div>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Balance Neto</span>
                  <h3 className={`text-3xl font-extrabold tracking-tight ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {netBalance < 0 ? '-' : ''}${Math.abs(netBalance).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Efectivo + Cuentas</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Total Ingresos</span>
                  <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                    ${totalIncomes.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">Entradas registradas</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Total Gastos</span>
                  <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                    ${totalExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[10px] text-rose-600 font-bold mt-1">Salidas registradas</p>
                </div>
              </div>

              {/* Transactions list & breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                    <div className="flex rounded-xl bg-slate-200/60 p-1 text-xs font-bold text-slate-500 border border-slate-200/30">
                      <button onClick={() => setFilterType('all')} className={`px-3 py-1.5 rounded-lg transition-all ${filterType === 'all' ? 'bg-white shadow-sm text-slate-800' : 'hover:text-slate-700'}`}>Todos</button>
                      <button onClick={() => setFilterType('gasto')} className={`px-3 py-1.5 rounded-lg transition-all ${filterType === 'gasto' ? 'bg-white shadow-sm text-rose-600' : 'hover:text-slate-700'}`}>Gastos</button>
                      <button onClick={() => setFilterType('ingreso')} className={`px-3 py-1.5 rounded-lg transition-all ${filterType === 'ingreso' ? 'bg-white shadow-sm text-emerald-600' : 'hover:text-slate-700'}`}>Ingresos</button>
                    </div>

                    {categories.length > 0 && (
                      <select
                        value={filterCategoryId}
                        onChange={(e) => setFilterCategoryId(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold text-slate-600 bg-white"
                      >
                        <option value="all">Todas las Categorías</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                    {filteredTransactions.length === 0 ? (
                      <div className="px-6 py-20 text-center">
                        <span className="text-4xl mb-3 block">💸</span>
                        <p className="text-sm text-slate-400 font-semibold">No hay transacciones registradas</p>
                      </div>
                    ) : (
                      filteredTransactions.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/40 transition-colors group">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: tx.category ? tx.category.color + '18' : '#e2e8f0', color: tx.category ? tx.category.color : '#64748b' }}>
                              {tx.type === 'gasto' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-800 text-sm truncate leading-snug">{tx.description || (tx.type === 'gasto' ? 'Gasto' : 'Ingreso')}</h4>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {tx.category && <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase" style={{ backgroundColor: tx.category.color + '12', color: tx.category.color }}>{tx.category.name}</span>}
                                {tx.card && <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center gap-1"><CreditCard className="w-2.5 h-2.5" /> {tx.card.name}</span>}
                                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(tx.date)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-extrabold ${tx.type === 'gasto' ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {tx.type === 'gasto' ? '-' : '+'}${Number(tx.amount).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <button onClick={() => openConfirmModal(tx.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-300 hover:text-rose-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-extrabold text-slate-800 text-base mb-1">Gastos por Categoría</h3>
                    <p className="text-xs text-slate-400 font-semibold mb-6">Desglose de egresos en efectivo y tarjetas.</p>
                    {expenseByCategory.length === 0 ? (
                      <p className="text-xs text-slate-400 font-semibold italic text-center py-6">Sin datos de gastos.</p>
                    ) : (
                      <div className="space-y-4">
                        {expenseByCategory.map(cat => {
                          const percentage = totalExpenseInCategories > 0 ? Math.round((cat.total / totalExpenseInCategories) * 100) : 0;
                          return (
                            <div key={cat.id} className="space-y-1">
                              <div className="flex justify-between text-xs font-bold text-slate-600">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />{cat.name}</span>
                                <span>${cat.total.toLocaleString('es-ES')} ({percentage}%)</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ backgroundColor: cat.color, width: `${percentage}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TARJETAS DE CRÉDITO */}
          {activeTab === 'tarjetas' && (
            <div>
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Deuda Total en Tarjetas</span>
                  <h3 className="text-3xl font-extrabold text-rose-600 tracking-tight">
                    ${totalCardDebt.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Suma acumulada por pagar en tus tarjetas</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Tarjetas Activas</span>
                  <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{cards.length}</h3>
                  <p className="text-[10px] text-indigo-600 font-bold mt-1">Línea de crédito total: ${cards.reduce((acc, curr) => acc + Number(curr.creditLimit), 0).toLocaleString('es-ES')}</p>
                </div>
              </div>

              {cards.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                  <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-800">No tienes tarjetas de crédito agregadas</h3>
                  <p className="text-sm text-slate-500 mt-2 mb-6 max-w-sm mx-auto">Agrega tus tarjetas de crédito para registrar tus consumos mensuales y controlar tus límites y fechas de pago.</p>
                  <button
                    onClick={() => setIsCardModalOpen(true)}
                    className="px-5 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 shadow-md transition-all"
                  >
                    Agregar mi Primera Tarjeta
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Credit Cards Slider/Grid */}
                  <div className="lg:col-span-6 space-y-6">
                    <h3 className="text-lg font-extrabold text-slate-800">Tus Tarjetas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cards.map((card, index) => {
                        const used = getCardUsedBalance(card.id);
                        const limit = Number(card.creditLimit);
                        const available = Math.max(0, limit - used);
                        const usedPercentage = Math.min(100, Math.round((used / limit) * 100)) || 0;
                        const gradient = cardGradients[index % cardGradients.length];

                        return (
                          <div
                            key={card.id}
                            onClick={() => setSelectedCardId(card.id)}
                            className={`p-6 rounded-3xl bg-gradient-to-br ${gradient} text-white shadow-lg cursor-pointer transform hover:scale-[1.02] transition-all relative overflow-hidden flex flex-col justify-between h-56 ${selectedCardId === card.id ? 'ring-4 ring-indigo-500/30 border-2 border-white' : 'opacity-90'}`}
                          >
                            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                              <CreditCard className="w-32 h-32" />
                            </div>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-extrabold text-lg leading-tight">{card.name}</h4>
                                <span className="text-[10px] text-white/70 font-semibold">Corte: Día {card.closingDay} | Pago: Día {card.dueDate}</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteCardId(card.id);
                                  setIsConfirmCardOpen(true);
                                }}
                                className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
                                title="Eliminar tarjeta"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between items-baseline">
                                <span className="text-[10px] font-bold text-white/80">Saldo Utilizado</span>
                                <span className="text-xl font-extrabold">${used.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                              </div>

                              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${usedPercentage}%` }} />
                              </div>

                              <div className="flex justify-between text-[9px] font-bold text-white/70">
                                <span>Disponible: ${available.toLocaleString('es-ES')}</span>
                                <span>Límite: ${limit.toLocaleString('es-ES')}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Transactions List */}
                  <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-base">Consumos Registrados</h3>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                          {selectedCardId === 'all' ? 'Mostrando consumos de todas las tarjetas' : `Consumos de la tarjeta seleccionada`}
                        </p>
                      </div>
                      <select
                        value={selectedCardId}
                        onChange={(e) => setSelectedCardId(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-white"
                      >
                        <option value="all">Todas las Tarjetas</option>
                        {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
                      {cardTransactions.length === 0 ? (
                        <p className="text-xs text-slate-400 font-semibold italic text-center py-12">No hay consumos vinculados a esta tarjeta.</p>
                      ) : (
                        cardTransactions.map(tx => (
                          <div key={tx.id} className="flex justify-between items-center py-3">
                            <div>
                              <p className="font-bold text-slate-800 text-sm leading-snug">{tx.description || 'Gasto con Tarjeta'}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {tx.category && <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase" style={{ backgroundColor: tx.category.color + '12', color: tx.category.color }}>{tx.category.name}</span>}
                                <span className="text-[10px] text-slate-400 font-medium">{formatDate(tx.date)}</span>
                              </div>
                            </div>
                            <span className="text-sm font-extrabold text-rose-600">-${Number(tx.amount).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MIS AHORROS */}
          {activeTab === 'ahorros' && (
            <div>
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Total Ahorrado</span>
                  <h3 className="text-3xl font-extrabold text-amber-500 tracking-tight">
                    ${totalSavings.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Capital total acumulado en tus objetivos</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Metas de Ahorro Activas</span>
                  <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{savings.length}</h3>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">Falta por ahorrar: ${savings.reduce((acc, curr) => acc + Math.max(0, Number(curr.goalAmount) - Number(curr.currentAmount)), 0).toLocaleString('es-ES')}</p>
                </div>
              </div>

              {savings.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                  <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-800">No tienes objetivos de ahorro activos</h3>
                  <p className="text-sm text-slate-500 mt-2 mb-6 max-w-sm mx-auto">Define tus metas de ahorro (e.g. Vacaciones, Coche, Emergencias) para llevar una proyección mensual del capital necesario.</p>
                  <button
                    onClick={() => setIsSavingModalOpen(true)}
                    className="px-5 py-3 bg-amber-500 text-white font-bold text-sm rounded-xl hover:bg-amber-600 shadow-md transition-all"
                  >
                    Crear mi Primer Meta
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savings.map(saving => {
                    const progress = Math.min(100, Math.round((Number(saving.currentAmount) / Number(saving.goalAmount)) * 100)) || 0;
                    const complete = Number(saving.currentAmount) >= Number(saving.goalAmount);

                    return (
                      <div key={saving.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold text-sm">
                                🎯
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 text-sm truncate max-w-[150px]">{saving.title}</h4>
                                <span className="text-[10px] text-slate-400 font-bold">${Number(saving.currentAmount).toLocaleString('es-ES')} / ${Number(saving.goalAmount).toLocaleString('es-ES')}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setDeleteSavingId(saving.id);
                                setIsConfirmSavingOpen(true);
                              }}
                              className="text-slate-300 hover:text-rose-600 p-1 rounded-lg transition-all"
                              title="Eliminar meta"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-slate-100">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                            <span>Progreso</span>
                            <span className="text-amber-500">{progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${complete ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${progress}%` }} />
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 flex items-center justify-between">
                            <span>{complete ? '✅ Completado' : `Falta: $${Math.max(0, Number(saving.goalAmount) - Number(saving.currentAmount)).toLocaleString('es-ES')}`}</span>
                            <span>{saving.category?.name || 'Ahorros'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* MODALS SECTION */}

      {/* 1. Add Transaction Modal */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-slate-800 text-xl flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-500" />
                Registrar Transacción
              </h3>
              <button onClick={() => setIsTxModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => setType('gasto')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${type === 'gasto' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Gasto (Salida)
                </button>
                <button
                  type="button"
                  onClick={() => setType('ingreso')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${type === 'ingreso' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Ingreso (Entrada)
                </button>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Monto ($)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Descripción / Concepto</label>
                <input
                  type="text"
                  placeholder="Ej: Almuerzo, Sueldo, Supermercado..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fecha</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none text-sm font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Categoría</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none text-sm font-medium text-slate-800"
                  >
                    <option value="">Selecciona categoría</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Pay with Credit Card Option (Gastos only) */}
              {type === 'gasto' && cards.length > 0 && (
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Método de Pago (Tarjeta de Crédito)
                  </label>
                  <select
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none text-sm font-medium text-slate-800"
                  >
                    <option value="">Efectivo / Débito</option>
                    {cards.map(card => <option key={card.id} value={card.id}>{card.name}</option>)}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsTxModalOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-sm transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 text-sm transition-colors shadow-md">Guardar Transacción</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Credit Card Modal */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-slate-800 text-xl flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-500" />
                Nueva Tarjeta de Crédito
              </h3>
              <button onClick={() => setIsCardModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre de la Tarjeta</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: BBVA Platinum, Banamex Oro..."
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none text-sm font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Límite de Crédito ($)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Ej: 50000"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none text-sm font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Día de Corte</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="31"
                    placeholder="15"
                    value={closingDay}
                    onChange={(e) => setClosingDay(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none text-sm font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Día Límite de Pago</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="31"
                    placeholder="5"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none text-sm font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsCardModalOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-sm transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 text-sm transition-colors shadow-md">Crear Tarjeta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Saving Goal Modal */}
      {isSavingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-slate-800 text-xl flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-500" />
                Crear Meta de Ahorro
              </h3>
              <button onClick={() => setIsSavingModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSaving} className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre de la Meta</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Fondo de Emergencias, Enganche Casa..."
                  value={savingTitle}
                  onChange={(e) => setSavingTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none text-sm font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Monto Objetivo ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Ej: 20000"
                    value={savingGoalAmount}
                    onChange={(e) => setSavingGoalAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none text-sm font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ahorrado Inicial ($)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ej: 5000"
                    value={savingCurrentAmount}
                    onChange={(e) => setSavingCurrentAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none text-sm font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fecha Límite</label>
                  <input
                    type="date"
                    value={savingTargetDate}
                    onChange={(e) => setSavingTargetDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none text-sm font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Categoría</label>
                  <select
                    value={savingCategoryId}
                    onChange={(e) => setSavingCategoryId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none text-sm font-medium text-slate-800"
                  >
                    <option value="">Selecciona categoría</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsSavingModalOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-sm transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 text-sm transition-colors shadow-md">Crear Meta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Delete Transaction Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg mb-2">¿Eliminar Transacción?</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Esta acción no se puede deshacer. ¿Seguro que deseas eliminar esta transacción?</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setIsConfirmOpen(false); setDeleteTransactionId(null); }} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-sm transition-colors">Cancelar</button>
              <button type="button" onClick={handleDeleteTransaction} className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 text-sm transition-colors shadow-md">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Delete Card Confirmation Modal */}
      {isConfirmCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg mb-2">¿Eliminar Tarjeta?</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Esta acción eliminará la tarjeta. Todas las transacciones asociadas a ella perderán el vínculo con la tarjeta pero permanecerán en tu registro histórico.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setIsConfirmCardOpen(false); setDeleteCardId(null); }} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-sm transition-colors">Cancelar</button>
              <button type="button" onClick={handleDeleteCard} className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 text-sm transition-colors shadow-md">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Delete Saving Confirmation Modal */}
      {isConfirmSavingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg mb-2">¿Eliminar Meta de Ahorro?</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Esta acción no se puede deshacer. ¿Seguro que deseas eliminar esta meta de ahorro?</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setIsConfirmSavingOpen(false); setDeleteSavingId(null); }} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-sm transition-colors">Cancelar</button>
              <button type="button" onClick={handleDeleteSaving} className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 text-sm transition-colors shadow-md">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
