import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import api from '../../services/api.js'
import { 
  Plus, Search, Edit2, Trash2, ArrowUpRight, ArrowDownLeft, 
  X, ChevronRight, ChevronLeft,
  Wallet, TrendingUp, ArrowDownCircle,
  Loader2 
} from 'lucide-react'

// ── 1. ZOD SCHEMA ──────────────────────────────────────────────────
const transactionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z
    .number({ invalid_type_error: 'Amount is required' })
    .positive('Amount must be greater than 0'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional()
})

// ── 2. SUMMARY CARD ───────────────────────────────────────────────
const StatCard = ({ title, amount, icon: Icon, colorClass, bgColor }) => (
  <div className={`p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 animate-fade-up`}>
    <div className={`w-14 h-14 ${bgColor} ${colorClass} rounded-2xl flex items-center justify-center flex-shrink-0`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 font-sans mt-1">₹{amount.toLocaleString()}</h3>
    </div>
  </div>
)

// ── 3. TRANSACTION MODAL ───────────────────────────────────────────
const TransactionModal = ({ isOpen, onClose, onSubmit, defaultValues, isEditing }) => {
  // Categories stored in lowercase to match Backend logic
  const categories = {
    income: ['salary', 'business', 'investment', 'other'],
    expense: ['food', 'housing', 'transport', 'shopping', 'health', 'entertainment', 'other']
  };

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    reset, 
    watch 
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: defaultValues
  })

  const watchType = watch('type')

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const processForm = (data) => {
    onSubmit(data)
  }

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md cursor-pointer" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 animate-fade-up my-auto z-[11001]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-display text-2xl font-bold text-gray-900">{isEditing ? 'Edit Record' : 'Add Transaction'}</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(processForm)} className="space-y-5 font-sans" noValidate>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Type</label>
              <select 
                {...register('type')} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Category</label>
              <select 
                {...register('category')} 
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm ${errors.category ? 'border-red-300' : 'border-gray-100'}`}
              >
                {/* Display capitalized text, but value is lowercase */}
                {categories[watchType]?.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Title</label>
            <input 
              type="text" 
              {...register('title')} 
              className={`w-full px-5 py-3 bg-gray-50 border rounded-xl text-sm ${errors.title ? 'border-red-300 focus:border-red-400' : 'border-gray-100'}`}
              placeholder="e.g. Monthly Salary" 
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Amount (₹)</label>
              <input 
                type="number" 
                step="any"
                {...register('amount', { valueAsNumber: true })} 
                className={`w-full px-5 py-3 bg-gray-50 border rounded-xl text-sm ${errors.amount ? 'border-red-300 focus:border-red-400' : 'border-gray-100'}`}
                placeholder="0" 
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Date</label>
              <input 
                type="date" 
                {...register('date')} 
                className={`w-full px-5 py-3 bg-gray-50 border rounded-xl text-sm ${errors.date ? 'border-red-300 focus:border-red-400' : 'border-gray-100'}`}
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 mt-4 shadow-xl disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (isEditing ? <Edit2 size={18}/> : <Plus size={18}/>)}
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Confirm Entry')}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

// ── 4. MAIN MODULE ──────────────────────────────────────────────────
export default function Transaction() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 })

  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    type: '',
    category: '',
    search: ''
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })
  const itemsPerPage = 5

  const emptyFormValues = {
    title: '', 
    type: 'expense', 
    category: 'food', // Default to lowercase
    amount: '', 
    date: new Date().toISOString().split('T')[0], 
    notes: ''
  }

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        month: filters.month,
        year: filters.year,
        page: currentPage,
        limit: itemsPerPage,
      }
      if (filters.type) params.type = filters.type
      if (filters.category) params.category = filters.category
      if (filters.search) params.search = filters.search

      const { data } = await api.get('/transactions', { params })

      if (data.success) {
        setTransactions(data.transactions)
        setPagination({
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        })
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }, [filters, currentPage])

  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await api.get('/transactions/summary')
      if (data.success) setSummary(data.summary)
    } catch (err) {
      console.error('Failed to fetch summary', err)
    }
  }, [])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])
  useEffect(() => { fetchSummary() }, [fetchSummary])

  useEffect(() => {
    setCurrentPage(1)
  }, [filters.month, filters.year, filters.type, filters.category, filters.search])

  const handleFormSubmit = async (formData) => {
    try {
      if (editingData) {
        const { data } = await api.put(`/transactions/${editingData._id}`, formData)
        if (data.success) {
          toast.success('Transaction updated!')
          setIsModalOpen(false)
          fetchTransactions()
          fetchSummary()
        }
      } else {
        const { data } = await api.post('/transactions', formData)
        if (data.success) {
          toast.success('Transaction added!')
          setIsModalOpen(false)
          fetchTransactions()
          fetchSummary()
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Something went wrong')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return
    try {
      const { data } = await api.delete(`/transactions/${id}`)
      if (data.success) {
        toast.success('Transaction deleted')
        fetchTransactions()
        fetchSummary()
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Delete failed')
    }
  }

  const handleOpenModal = (t = null) => {
    if (t) {
      setEditingData({
        ...t,
        date: t.date ? t.date.split('T')[0] : new Date().toISOString().split('T')[0]
      })
    } else {
      setEditingData(null)
    }
    setIsModalOpen(true)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-6 px-4">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Income"  amount={summary.totalIncome}  icon={ArrowDownCircle} colorClass="text-emerald-600" bgColor="bg-emerald-50" />
        <StatCard title="Total Expense" amount={summary.totalExpense} icon={TrendingUp}      colorClass="text-rose-600"    bgColor="bg-rose-50"    />
        <StatCard title="Total Balance" amount={summary.balance}      icon={Wallet}          colorClass="text-blue-600"   bgColor="bg-blue-50"    />
      </div>

      <div className="flex justify-between items-end border-b border-gray-100 pb-6">
        <div>
          <h1 className="font-display text-4xl font-bold text-gray-900 tracking-tight">Transactions</h1>
          <p className="text-gray-500 text-sm mt-1">Showing data for {filters.month}/{filters.year}</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-7 py-3.5 bg-gray-900 text-white text-sm font-bold rounded-2xl hover:bg-gray-800 shadow-lg transition-all active:scale-95">
          <Plus size={18} /> New Entry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm items-center">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input
            type="text"
            placeholder="Search title..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-gray-900/5 outline-none"
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-xs font-bold text-gray-600 outline-none uppercase"
            value={filters.month}
            onChange={(e) => setFilters({...filters, month: Number(e.target.value)})}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', {month: 'long'})}</option>
            ))}
          </select>
          <select
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-xs font-bold text-gray-600 outline-none"
            value={filters.year}
            onChange={(e) => setFilters({...filters, year: Number(e.target.value)})}
          >
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
        <select
          className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-600 outline-none uppercase tracking-wider"
          value={filters.type}
          onChange={(e) => setFilters({...filters, type: e.target.value})}
        >
          <option value="">All Types</option>
          <option value="income">Income Only</option>
          <option value="expense">Expense Only</option>
        </select>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Label</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-sans">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-gray-200" size={32}/>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-sm text-gray-400">
                    No transactions found.
                  </td>
                </tr>
              ) : transactions.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(t.date).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {t.type === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{t.title}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full uppercase tracking-tighter">
                      {/* FIXED: Capitalize category for display */}
                      {t.category.charAt(0).toUpperCase() + t.category.slice(1)}
                    </span>
                  </td>
                  <td className={`px-8 py-5 text-sm font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'income' ? '+' : '-'} ₹{Number(t.amount).toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(t)}
                      className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-gray-900 rounded-xl transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-rose-600 rounded-xl transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Page {currentPage} of {pagination.totalPages || 1}
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-400 disabled:opacity-30 hover:text-gray-900 transition-all"
            >
              <ChevronLeft size={16}/>
            </button>
            <button
              disabled={currentPage >= pagination.totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-400 disabled:opacity-30 hover:text-gray-900 transition-all"
            >
              <ChevronRight size={16}/>
            </button>
          </div>
        </div>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        defaultValues={editingData || emptyFormValues}
        isEditing={!!editingData}
      />
    </div>
  )
}