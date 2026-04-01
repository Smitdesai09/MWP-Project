import React, { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import api from '../../services/api.js'
import {
  Plus, Edit3, X, ChevronDown, Loader2, Target,
  AlertTriangle, CheckCircle2, TrendingDown
} from 'lucide-react'

// ─── CUSTOM DROPDOWN ─────────────────────────────────────────────
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

// ─── Constants & Formatters ──────────────────────────────────────
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 3 }, (_, i) => currentYear - 2 + i)
const MAX_BUDGET_LIMIT = 99999999

const monthOptions = MONTHS.map((m, i) => ({ value: i + 1, label: m }))
const yearOptions = YEARS.map(y => ({ value: y, label: y.toString() }))

const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n ?? 0)
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// ─── Zod Schema ────────────────────────────────────────────────
const budgetSchema = z.object({
  category: z.string().min(1, 'Category name is required').max(50, 'Category must be under 50 characters').trim().regex(/^[a-zA-Z]/, 'Must start with a letter').regex(/^[a-zA-Z0-9\s\-_.&']+$/, 'Contains invalid special characters'),
  monthlyLimit: z.preprocess((val) => (val === '' || val === undefined ? undefined : Number(val)), z.number({ required_error: 'Monthly limit is required', invalid_type_error: 'Must be a valid number' }).positive('Must be greater than ₹0').max(MAX_BUDGET_LIMIT, `Cannot exceed ₹${MAX_BUDGET_LIMIT.toLocaleString('en-IN')}`).refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), 'Maximum 2 decimal places allowed'))
})

const editBudgetSchema = z.object({
  monthlyLimit: z.preprocess((val) => (val === '' || val === undefined ? undefined : Number(val)), z.number({ required_error: 'Monthly limit is required', invalid_type_error: 'Must be a valid number' }).positive('Must be greater than ₹0').max(MAX_BUDGET_LIMIT, `Cannot exceed ₹${MAX_BUDGET_LIMIT.toLocaleString('en-IN')}`).refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), 'Maximum 2 decimal places allowed'))
})

const blockInvalidKeys = (e) => { if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault() }

const inputCls = 'w-full px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:bg-white transition-all placeholder-gray-300'
const errorInputCls = 'w-full px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-red-300 rounded-xl focus:outline-none focus:border-red-400 focus:bg-white transition-all placeholder-gray-300'
const inputDisabledCls = 'w-full px-3 py-2.5 text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed'

function Field({ label, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  )
}

// ─── RED TOAST COMPONENT ────────────────────────────────────────
function BudgetToast({ title, message, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl shadow-xl max-w-sm">
      <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-red-600" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-red-800">{title}</p>
        <p className="text-xs text-red-500 mt-0.5 leading-relaxed">{message}</p>
      </div>
    </div>
  )
}

// ─── ADD MODAL ─────────────────────────────────────────────────
function AddModal({ isOpen, onClose, onSaved }) {
  const defaultValues = { category: '', monthlyLimit: '' }
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({ resolver: zodResolver(budgetSchema), defaultValues })

  useEffect(() => { if (isOpen) reset(defaultValues) }, [isOpen, reset])
  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  const onSubmit = async (data) => {
    try {
      const payload = { category: data.category.trim().toLowerCase(), monthlyLimit: Number(data.monthlyLimit) }
      const { data: res } = await api.post('/budgets', payload)
      if (res.success) { toast.success(`"${data.category.trim()}" budget created!`); onSaved(); onClose() }
      else { toast.error(res.error || 'Failed to create budget') }
    } catch (err) { toast.error(err?.response?.data?.error || 'Something went wrong') }
  }

  if (!isOpen) return null
  return createPortal(
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5"><div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center"><Plus size={14} color="white" /></div><h2 className="font-display text-base font-semibold text-gray-900">New Budget</h2></div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4" noValidate>
          <Field label="Category Name">
            <input className={errors.category ? errorInputCls : inputCls} placeholder="e.g. Food, Transport, Shopping" {...register('category')} maxLength={50} autoComplete="off" autoFocus />
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </Field>
          <Field label="Monthly Limit (₹)">
            <input className={errors.monthlyLimit ? errorInputCls : inputCls} type="number" step="0.01" min="0.01" max={MAX_BUDGET_LIMIT} placeholder="e.g. 10000" {...register('monthlyLimit')} onKeyDown={blockInvalidKeys} />
            {errors.monthlyLimit && <p className="text-red-500 text-xs mt-1">{errors.monthlyLimit.message}</p>}
          </Field>
          <div className="flex gap-2.5 pt-2">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">{isSubmitting && <Loader2 size={14} className="animate-spin" />}Create Budget</button>
          </div>
        </form>
      </div>
    </div>, document.body
  )
}

// ─── EDIT MODAL ────────────────────────────────────────────────
function EditModal({ isOpen, budget, onClose, onSaved }) {
  const defaultValues = { monthlyLimit: budget?.limit?.toString() ?? '' }
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({ resolver: zodResolver(editBudgetSchema), defaultValues })

  useEffect(() => { if (isOpen && budget) reset({ monthlyLimit: budget.limit?.toString() ?? '' }) }, [isOpen, budget, reset])
  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  const onSubmit = async (data) => {
    if (!budget?._id) return
    try {
      const { data: res } = await api.patch(`/budgets/${budget._id}`, { monthlyLimit: Number(data.monthlyLimit) })
      if (res.success) { toast.success(`"${budget.category}" limit updated!`); onSaved(); onClose() }
      else { toast.error(res.error || 'Failed to update budget') }
    } catch (err) { toast.error(err?.response?.data?.error || 'Something went wrong') }
  }

  if (!isOpen || !budget) return null
  const displayName = cap(budget.category)

  return createPortal(
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5"><div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center"><Edit3 size={14} color="white" /></div><div><h2 className="font-display text-sm font-semibold text-gray-900">Adjust Limit</h2><p className="text-xs text-gray-400 truncate max-w-[180px]">{displayName}</p></div></div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4" noValidate>
          <Field label="Category"><input className={inputDisabledCls} value={displayName} disabled /></Field>
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div><p className="text-xs text-gray-400">Current Limit</p><p className="text-sm font-semibold text-gray-700">₹{fmt(budget.limit)}</p></div>
            <div className="text-right"><p className="text-xs text-gray-400">Spent</p><p className="text-sm font-semibold text-gray-700">₹{fmt(budget.current)}</p></div>
          </div>
          <Field label="New Monthly Limit (₹)">
            <input className={errors.monthlyLimit ? errorInputCls : inputCls} type="number" step="0.01" min="0.01" max={MAX_BUDGET_LIMIT} placeholder="Enter new limit" {...register('monthlyLimit')} onKeyDown={blockInvalidKeys} autoFocus />
            {errors.monthlyLimit && <p className="text-red-500 text-xs mt-1">{errors.monthlyLimit.message}</p>}
          </Field>
          <div className="flex gap-2.5">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">{isSubmitting && <Loader2 size={14} className="animate-spin" />}Update</button>
          </div>
        </form>
      </div>
    </div>, document.body
  )
}

// ─── BUDGET CARD ───────────────────────────────────────────────
function BudgetCard({ budget, onEdit }) {
  const percentage = Math.round(budget.percentage ?? 0)
  const isOver = percentage >= 100
  const isWarning = percentage >= 90 && !isOver
  const remaining = budget.limit - budget.current
  const displayName = cap(budget.category)

  const statusMeta = isOver
    ? { label: 'Exceeded', color: 'text-red-500', bg: 'bg-red-50', icon: AlertTriangle }
    : isWarning
      ? { label: 'Warning', color: 'text-amber-600', bg: 'bg-amber-50', icon: TrendingDown }
      : { label: 'Safe', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 }

  const StatusIcon = statusMeta.icon
  const barColor = isOver ? 'bg-gradient-to-r from-red-400 to-rose-500' : isWarning ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-emerald-400 to-teal-500'
  const topBar = isOver ? 'bg-gradient-to-r from-red-400 to-rose-400' : isWarning ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-emerald-400 to-teal-400'

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
      <div className={`h-1 w-full ${topBar}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="font-display text-[15px] font-semibold text-gray-900 truncate">{displayName}</h3>
            <p className="text-xs text-gray-400 mt-0.5">₹{fmt(budget.limit)} monthly limit</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusMeta.bg} ${statusMeta.color}`}>
              <StatusIcon size={9} />{statusMeta.label}
            </span>
            <button onClick={() => onEdit(budget)} className="p-1.5 rounded-lg text-gray-300 hover:text-gray-700 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
              <Edit3 size={13} />
            </button>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-display text-2xl font-bold text-gray-900">{percentage}%</span>
            <span className="text-xs font-medium text-gray-400">Monthly Budget</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-gray-50 pt-3">
          <div><p className="text-xs text-gray-400 mb-0.5">Spent</p><p className="text-sm font-semibold text-gray-900">₹{fmt(budget.current)}</p></div>
          <div className="text-right"><p className="text-xs text-gray-400 mb-0.5">{isOver ? 'Overspent' : 'Remaining'}</p><p className={`text-sm font-semibold ${isOver ? 'text-red-500' : 'text-emerald-600'}`}>{isOver ? '-' : ''}₹{fmt(Math.abs(remaining))}</p></div>
        </div>
      </div>
    </div>
  )
}

// ─── EMPTY STATE ───────────────────────────────────────────────
function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4"><Target size={26} className="text-gray-400" /></div>
      <h3 className="font-display text-lg font-semibold text-gray-900 mb-1">No active budgets</h3>
      <p className="text-sm text-gray-400 max-w-xs mb-6">Set monthly spending limits for categories to track your expenses better.</p>
      <button onClick={onAdd} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors"><Plus size={15} /> Set First Budget</button>
    </div>
  )
}

// ─── MAIN BUDGET MODULE ────────────────────────────────────────
export default function BudgetModule() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(currentYear)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  const abortRef = useRef(null)
  const alertedRef = useRef(new Set())

  const fetchBudgets = useCallback(async (signal) => {
    setLoading(true)
    try {
      const params = { month, year }
      const { data } = await api.get('/budgets', { params, signal })
      if (data.success) setBudgets(data.budgets)
    } catch (err) { if (err.code !== 'ERR_CANCELED') toast.error('Failed to load budgets') }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [month, year])

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort()
    const c = new AbortController(); abortRef.current = c
    fetchBudgets(c.signal)
    return () => c.abort()
  }, [fetchBudgets])

  // ─── CONSOLIDATED TOAST LOGIC ────────────────────────────────
  useEffect(() => {
    if (loading || budgets.length === 0) return

    const exceeded = budgets.filter(b => b.percentage >= 100)
    const warning = budgets.filter(b => b.percentage >= 90 && b.percentage < 100)

    if (exceeded.length > 0) {
      const key = `exceeded-${month}-${year}`
      if (!alertedRef.current.has(key)) {
        alertedRef.current.add(key)
        const names = exceeded.map(b => `${cap(b.category)} (${Math.round(b.percentage)}%)`)
        const list = names.join(' · ')
        const msg = exceeded.length === 1
          ? `${names[0]} has exceeded its limit`
          : `${exceeded.length} budgets exceeded: ${list}`
        toast.custom(
          () => <BudgetToast title="Budgets Exceeded" message={msg} icon={AlertTriangle} />,
          { duration: 7000, id: key }
        )
      }
    }

    if (warning.length > 0) {
      const key = `warning-${month}-${year}`
      if (!alertedRef.current.has(key)) {
        alertedRef.current.add(key)
        const names = warning.map(b => `${cap(b.category)} (${Math.round(b.percentage)}%)`)
        const list = names.join(' · ')
        const msg = warning.length === 1
          ? `${names[0]} is near its limit`
          : `${warning.length} budgets near limit: ${list}`
        toast.custom(
          () => <BudgetToast title="Budget Alerts" message={msg} icon={TrendingDown} />,
          { duration: 7000, id: key }
        )
      }
    }
  }, [budgets, loading, month, year])

  const refetchAll = useCallback(() => { fetchBudgets() }, [fetchBudgets])

  const handleSaveSuccess = useCallback(() => {
    alertedRef.current.delete(`exceeded-${month}-${year}`)
    alertedRef.current.delete(`warning-${month}-${year}`)
    refetchAll()
  }, [refetchAll, month, year])

  const handleAddClose = useCallback(() => setIsAddOpen(false), [])
  const handleEditClose = useCallback(() => setEditTarget(null), [])
  const handleEdit = useCallback((budget) => setEditTarget(budget), [])

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-gray-900">Budget Planner</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Showing data for {MONTHS[month - 1]} {year} · {budgets.length} {budgets.length === 1 ? 'category' : 'categories'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
          <CustomDropdown value={month} onChange={(val) => setMonth(Number(val))} options={monthOptions} className="w-36" />
          <CustomDropdown value={year} onChange={(val) => setYear(Number(val))} options={yearOptions} className="w-24" />
          <button onClick={() => setIsAddOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 whitespace-nowrap">
            <Plus size={15} /> <span className="hidden sm:inline">Set New Budget</span><span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 size={26} className="animate-spin text-gray-400" /></div>
      ) : budgets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100"><EmptyState onAdd={() => setIsAddOpen(true)} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {budgets.map(b => (
            <BudgetCard key={b._id} budget={b} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <AddModal isOpen={isAddOpen} onClose={handleAddClose} onSaved={handleSaveSuccess} />
      <EditModal isOpen={!!editTarget} budget={editTarget} onClose={handleEditClose} onSaved={handleSaveSuccess} />
    </div>
  )
}