import React, { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import api from '../../services/api.js'
import { Plus, Edit2, Trash2, ArrowUpRight, ArrowDownLeft, X, ChevronRight, ChevronLeft, ChevronDown, Wallet, TrendingUp, ArrowDownCircle, Loader2, Search } from 'lucide-react'

// ─── ULTRA-OPTIMIZED ADAPTIVE DEBOUNCE HOOK ───────────────────────
function useDebouncedSearch() {
  const [inputValue, setInputValue] = useState('')
  const [debouncedValue, setDebouncedValue] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const timerRef = useRef(null)
  const uiTimerRef = useRef(null)

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value
    setInputValue(value) 
    if (timerRef.current) clearTimeout(timerRef.current)
    if (uiTimerRef.current) clearTimeout(uiTimerRef.current)
    
    const trimmed = value.trim()
    if (!trimmed) { setDebouncedValue(''); setIsSearching(false); return }
    if (trimmed.length < 2) { setIsSearching(false); return }
    
    uiTimerRef.current = setTimeout(() => { setIsSearching(true) }, 200)
    timerRef.current = setTimeout(() => { setDebouncedValue(trimmed); setIsSearching(false) }, 600)
  }, [])

  const clearSearch = useCallback(() => {
    setInputValue(''); setDebouncedValue(''); setIsSearching(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (uiTimerRef.current) clearTimeout(uiTimerRef.current)
  }, [])

  useEffect(() => { return () => { if (timerRef.current) clearTimeout(timerRef.current); if (uiTimerRef.current) clearTimeout(uiTimerRef.current) } }, [])
  return { searchValue: inputValue, debouncedSearch: debouncedValue, isSearching, handleSearchChange, clearSearch }
}

function SearchInput({ value, onChange, onClear, isSearching = false, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${isSearching ? 'text-gray-900' : 'text-gray-400'}`} />
      <input type="text" className="w-full pl-9 pr-10 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 transition-all placeholder-gray-300" placeholder={placeholder} value={value} onChange={onChange} onKeyDown={(e) => { if (e.key === 'Escape') onClear?.() }} spellCheck={false} autoComplete="off" />
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
        {isSearching ? <Loader2 size={14} className="animate-spin text-gray-400" /> : value ? <button onClick={onClear} className="p-0.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><X size={14} /></button> : null}
      </div>
    </div>
  )
}

// ── 1. ZOD SCHEMA ──────────────────────────────────────────────────
const today = new Date().toISOString().split('T')[0]
const minDate = '2020-01-01'
const transactionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be under 100 characters').trim().regex(/^[a-zA-Z]/, 'Title must start with a letter').regex(/^[a-zA-Z0-9\s\-_.']+$/, 'Title contains invalid special characters'),
  amount: z.preprocess((val) => (val === "" || val === undefined ? undefined : Number(val)), z.number({ required_error: 'Amount is required', invalid_type_error: 'Amount must be a valid number' }).positive('Amount must be greater than 0').max(99999999, 'Amount cannot exceed ₹9,99,99,999').refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), 'Maximum 2 decimal places allowed')),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required').refine((val) => val >= minDate, 'Date must be after Jan 2020').refine((val) => val <= today, 'Date cannot be in the future'),
  notes: z.string().optional().default('')
})

// ── 2. SUMMARY CARD ───────────────────────────────────────────────
const StatCard = ({ title, amount, icon: Icon, colorClass, isLoading = false }) => (
  <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</p>
      <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center">{isLoading ? <Loader2 size={14} className="animate-spin text-gray-400" /> : <Icon size={14} className={colorClass} />}</div>
    </div>
    {isLoading ? <div className="h-7 w-24 bg-gray-100 rounded-lg animate-pulse" /> : <p className={`font-display text-xl font-bold ${colorClass}`}>₹{amount.toLocaleString('en-IN')}</p>}
  </div>
)

// ── 3. CUSTOM DROPDOWN ─────────────────────────────────────────────
const CustomDropdown = ({ value, onChange, options, className = '', placeholder = 'Select...' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => { if (ref.current && !ref.current.contains(event.target)) setIsOpen(false) }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(o => o.value === value)

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-left outline-none cursor-pointer transition-all pr-10 flex items-center justify-between hover:border-gray-400 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 text-sm">
        <span className={`truncate ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-fade-up">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((opt) => (
              <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setIsOpen(false) }} className={`w-full text-left px-4 py-2 text-sm transition-all duration-150 ${value === opt.value ? 'bg-gray-900 text-white font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── 4. DELETE MODAL ────────────────────────────────────────────────
const DeleteModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><Trash2 size={20} className="text-red-500" /></div>
          <h2 className="font-display text-base font-semibold text-gray-900 mb-1">Delete Transaction?</h2>
          <p className="text-sm text-gray-400">This action cannot be undone. The record will be permanently removed.</p>
        </div>
        <div className="flex gap-2.5 px-6 pb-5">
          <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={isLoading} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">{isLoading && <Loader2 size={14} className="animate-spin" />}Delete</button>
        </div>
      </div>
    </div>, document.body
  );
}

// ── 5. TRANSACTION MODAL ───────────────────────────────────────────
const TransactionModal = ({ isOpen, onClose, onSubmit, defaultValues, isEditing }) => {
  const categories = { income: ['salary', 'business', 'investment', 'other'], expense: ['food', 'housing', 'transport', 'shopping', 'health', 'entertainment', 'other'] }
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } = useForm({ resolver: zodResolver(transactionSchema), defaultValues })
  
  const watchType = watch('type')
  const watchCategory = watch('category')

  useEffect(() => {
    const cats = categories[watchType]
    if (cats && cats.length > 0 && !cats.includes(watchCategory)) setValue('category', cats[0])
  }, [watchType, watchCategory, categories, setValue])

  useEffect(() => { reset(defaultValues) }, [defaultValues, reset])

  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  const processForm = (data) => onSubmit(data)
  if (!isOpen) return null;

  const typeOptions = [{ value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]
  const currentCategoryOptions = categories[watchType]?.map(cat => ({ value: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1) })) || []
  const inputCls = 'w-full px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:bg-white transition-all placeholder-gray-300'
  const errorInputCls = 'w-full px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-red-300 rounded-xl focus:outline-none focus:border-red-400 focus:bg-white transition-all placeholder-gray-300'

  return createPortal(
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5"><div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">{isEditing ? <Edit2 size={14} color="white" /> : <Plus size={14} color="white" />}</div><h2 className="font-display text-base font-semibold text-gray-900">{isEditing ? 'Edit Record' : 'Add Transaction'}</h2></div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit(processForm)} className="px-6 py-5 space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Type</label>
              <CustomDropdown value={watchType} onChange={(val) => setValue('type', val)} options={typeOptions} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
              <CustomDropdown value={watchCategory} onChange={(val) => setValue('category', val)} options={currentCategoryOptions} />
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Title</label>
            <input type="text" {...register('title')} maxLength={100} className={errors.title ? errorInputCls : inputCls} placeholder="e.g. Monthly Salary" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Amount (₹)</label>
              <input type="number" step="0.01" min="0.01" max="99999999" {...register('amount')} className={errors.amount ? errorInputCls : inputCls} placeholder="0" onKeyDown={(e) => { if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault() }} />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
              <input type="date" min="2020-01-01" max={today} {...register('date')} className={errors.date ? errorInputCls : inputCls} />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
            </div>
          </div>
          <div className="flex gap-2.5 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">{isSubmitting && <Loader2 size={14} className="animate-spin" />}{isEditing ? 'Update' : 'Confirm Entry'}</button>
          </div>
        </form>
      </div>
    </div>, document.body
  );
}

// ── 6. TRANSACTION ROW ─────────────────────────────────────────────
const TransactionRow = ({ t, onEdit, onDelete }) => {
  const isIncome = t.type === 'income'
  return (
    <div className="group flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 rounded-xl transition-colors">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {isIncome ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{t.title}</p>
        <p className="text-xs text-gray-400">{t.date ? new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</p>
      </div>

      <div className="hidden sm:block flex-shrink-0 w-24 text-center">
        <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-lg uppercase tracking-tighter">
          {t.category ? t.category.charAt(0).toUpperCase() + t.category.slice(1) : 'N/A'}
        </span>
      </div>

      <div className="text-right w-28 flex-shrink-0">
        <p className={`text-sm font-semibold whitespace-nowrap ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isIncome ? '+' : '-'} ₹{Number(t.amount).toLocaleString('en-IN')}
        </p>
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={() => onEdit(t)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><Edit2 size={13} /></button>
        <button onClick={() => onDelete(t._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={13} /></button>
      </div>
    </div>
  )
}

// ── 7. MAIN MODULE ──────────────────────────────────────────────────
export default function Transaction() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 })
  const [filters, setFilters] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), type: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const itemsPerPage = 5 
  const { searchValue, debouncedSearch, isSearching, handleSearchChange, clearSearch } = useDebouncedSearch()
  const abortRef = useRef(null)

  const emptyFormValues = { title: '', type: 'expense', category: 'food', amount: '', date: new Date().toISOString().split('T')[0], notes: '' }

  const fetchTransactions = useCallback(async (signal) => {
    setLoading(true)
    try {
      const params = { month: filters.month, year: filters.year, page: currentPage, limit: itemsPerPage }
      if (filters.type) params.type = filters.type
      if (debouncedSearch) params.search = debouncedSearch
      const { data } = await api.get('/transactions', { params, signal })
      if (data.success) { setTransactions(data.transactions); setPagination({ total: data.pagination.total, totalPages: data.pagination.totalPages }) }
    } catch (err) { if (err.code !== 'ERR_CANCELED') toast.error(err?.response?.data?.error || 'Failed to fetch transactions') }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [filters, currentPage, debouncedSearch])

  const fetchSummary = useCallback(async (signal) => {
    setSummaryLoading(true)
    try { const params = { month: filters.month, year: filters.year }; const { data } = await api.get('/transactions/summary', { params, signal }); if (data.success) setSummary(data.summary) } 
    catch (err) { if (err.code !== 'ERR_CANCELED') console.error(err) }
    finally { if (!signal?.aborted) setSummaryLoading(false) }
  }, [filters.month, filters.year])

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort()
    const c = new AbortController(); abortRef.current = c
    fetchTransactions(c.signal); fetchSummary(c.signal)
    return () => c.abort()
  }, [fetchTransactions, fetchSummary])

  useEffect(() => { setCurrentPage(1) }, [filters.month, filters.year, filters.type, debouncedSearch])
  useEffect(() => { if (currentPage > pagination.totalPages && pagination.totalPages > 0) setCurrentPage(pagination.totalPages) }, [pagination.totalPages, currentPage])

  const handleFormSubmit = async (formData) => {
    try {
      const payload = { ...formData, notes: formData.notes || '' }
      const { data } = editingData ? await api.put(`/transactions/${editingData._id}`, payload) : await api.post('/transactions', payload)
      if (data.success) { toast.success(editingData ? 'Transaction updated!' : 'Transaction added!'); setIsModalOpen(false); fetchTransactions(); fetchSummary() }
    } catch (err) { toast.error(err?.response?.data?.error || 'Something went wrong') }
  }

  const handleDeleteClick = (id) => { setPendingDeleteId(id); setIsDeleteModalOpen(true) }

  const confirmDelete = async () => {
    if (!pendingDeleteId) return
    setIsDeleting(true)
    try { const { data } = await api.delete(`/transactions/${pendingDeleteId}`); if (data.success) { toast.success('Transaction deleted'); fetchTransactions(); fetchSummary() } } 
    catch (err) { toast.error(err?.response?.data?.error || 'Delete failed') }
    finally { setIsDeleting(false); setIsDeleteModalOpen(false); setPendingDeleteId(null) }
  }

  const handleOpenModal = (t = null) => {
    setEditingData(t ? { ...t, date: t.date ? t.date.split('T')[0] : new Date().toISOString().split('T')[0], notes: t.notes || '' } : null)
    setIsModalOpen(true)
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 3 }, (_, i) => currentYear - 2 + i)

  const monthOptions = [...Array(12)].map((_, i) => ({ value: i + 1, label: new Date(0, i).toLocaleString('en', { month: 'long' }) }))
  const yearOptions = years.map(y => ({ value: y, label: y.toString() }))
  const typeOptions = [{ value: '', label: 'All Types' }, { value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }]

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-400 mt-0.5">Showing data for {new Date(0, filters.month - 1).toLocaleString('en', { month: 'long' })} {filters.year}</p>
        </div>
        <button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 self-start sm:self-auto"><Plus size={15} /> New Entry</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <StatCard title="Total Income" amount={summary.totalIncome} icon={ArrowDownCircle} colorClass="text-emerald-600" isLoading={summaryLoading} />
        <StatCard title="Total Expense" amount={summary.totalExpense} icon={TrendingUp} colorClass="text-rose-600" isLoading={summaryLoading} />
        <StatCard title="Total Balance" amount={summary.balance} icon={Wallet} colorClass="text-blue-600" isLoading={summaryLoading} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput value={searchValue} onChange={handleSearchChange} onClear={clearSearch} isSearching={isSearching} placeholder="Search transactions…" className="flex-1" />
        <div className="flex gap-2">
          <CustomDropdown value={filters.month} onChange={(val) => setFilters({...filters, month: Number(val)})} options={monthOptions} className="flex-1" />
          <CustomDropdown value={filters.year} onChange={(val) => setFilters({...filters, year: Number(val)})} options={yearOptions} className="w-24" />
          <CustomDropdown value={filters.type} onChange={(val) => setFilters({...filters, type: val})} options={typeOptions} className="w-36" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        
        <div className="hidden sm:flex items-center gap-4 px-4 py-2.5 border-b border-gray-50 bg-gray-50/60">
          <div className="w-9 flex-shrink-0" />
          <p className="flex-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Title</p>
          <p className="w-24 flex-shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Category</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-28 text-right">Amount</p>
          <div className="w-16 flex-shrink-0" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 size={26} className="animate-spin text-gray-400" /></div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4"><Wallet size={26} className="text-gray-400" /></div>
            <h3 className="font-display text-lg font-semibold text-gray-900 mb-1">No transactions found</h3>
            <p className="text-sm text-gray-400 max-w-xs mb-6">Try adjusting your search or filters.</p>
            <button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors"><Plus size={15} /> Add First Transaction</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 px-2 py-1">
            {transactions.map(t => (
              <TransactionRow key={t._id} t={t} onEdit={handleOpenModal} onDelete={handleDeleteClick} />
            ))}
          </div>
        )}

        {/* Centered Pagination - Removed "Showing X to Y" */}
        {pagination.totalPages > 1 && !loading && (
          <div className="flex items-center justify-center px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-1.5">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => p - 1)} 
                className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-gray-400 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center gap-1"
              >
                <ChevronLeft size={16} /> <span className="text-xs font-semibold hidden sm:inline">Prev</span>
              </button>
              
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-1 py-1">
                <span className="px-3 py-1 text-xs font-bold text-gray-900 bg-white rounded-md shadow-sm">{currentPage}</span>
                <span className="text-xs text-gray-400 px-1">of</span>
                <span className="px-2 py-1 text-xs font-semibold text-gray-600">{pagination.totalPages}</span>
              </div>

              <button 
                disabled={currentPage >= pagination.totalPages} 
                onClick={() => setCurrentPage(p => p + 1)} 
                className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-gray-400 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center gap-1"
              >
                <span className="text-xs font-semibold hidden sm:inline">Next</span> <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} defaultValues={editingData || emptyFormValues} isEditing={!!editingData} />
      <DeleteModal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setPendingDeleteId(null) }} onConfirm={confirmDelete} isLoading={isDeleting} />
    </div>
  )
}