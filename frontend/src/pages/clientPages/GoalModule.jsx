import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Target, Plus, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, Edit3, IndianRupee, X,
  ChevronLeft, ChevronRight, Loader2, Info, Calendar,
  Percent, BarChart2, Layers, Flame, Search
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import api from '../../services/api.js'

// ─── ULTRA-OPTIMIZED ADAPTIVE DEBOUNCE HOOK ─────────────────────
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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (uiTimerRef.current) clearTimeout(uiTimerRef.current)
    }
  }, [])
  return { searchValue: inputValue, debouncedSearch: debouncedValue, isSearching, handleSearchChange, clearSearch }
}

// ─── Search Input Component ───────────────────────────────────────
function SearchInput({ value, onChange, onClear, isSearching = false, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${isSearching ? 'text-gray-900' : 'text-gray-400'}`} />
      <input
        type="text"
        className="w-full pl-9 pr-10 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 transition-all placeholder-gray-300"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={(e) => { if (e.key === 'Escape') onClear?.() }}
        spellCheck={false}
        autoComplete="off"
      />
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
        {isSearching ? (
          <Loader2 size={14} className="animate-spin text-gray-400" />
        ) : value ? (
          <button onClick={onClear} className="p-0.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Clear search">
            <X size={14} />
          </button>
        ) : null}
      </div>
    </div>
  )
}

// ─── Formatters ──────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n ?? 0)
const fmtShort = (n) => {
  if (!n && n !== 0) return '₹0'
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`
  return `₹${fmt(n)}`
}

// ─── Constants ───────────────────────────────────────────────────
const MAX_TARGET = 99999999

const STATUS_META = {
  on_track: { label: 'On Track', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
  off_track: { label: 'Off Track', color: 'text-amber-600', bg: 'bg-amber-50', icon: TrendingDown },
  at_risk: { label: 'At Risk', color: 'text-red-500', bg: 'bg-red-50', icon: AlertTriangle },
}
const PLAN_LABELS = { sip: 'SIP', lump_sum: 'Lump Sum' }
const inputCls = 'w-full px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:bg-white transition-all placeholder-gray-300'
const errorInputCls = 'w-full px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-red-300 rounded-xl focus:outline-none focus:border-red-400 focus:bg-white transition-all placeholder-gray-300'

// ─── Number Input Security ──────────────────────────────────────
const blockInvalidNumberKeys = (e) => {
  if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault()
}

const blockInvalidPercentKeys = (e) => {
  if (['e', 'E', '+'].includes(e.key)) e.preventDefault()
}

// ─── STRICT Zod Schema ──────────────────────────────────────────
const goalSchema = z.object({
  name: z.string()
    .min(1, 'Goal name is required')
    .max(100, 'Name must be under 100 characters')
    .trim()
    .regex(/^[a-zA-Z]/, 'Must start with a letter')
    .regex(/^[a-zA-Z0-9\s\-_.&']+$/, 'Contains invalid special characters'),

  targetCorpus: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number({ required_error: 'Target amount is required', invalid_type_error: 'Must be a valid number' })
      .positive('Must be greater than ₹0')
      .max(MAX_TARGET, `Cannot exceed ₹${MAX_TARGET.toLocaleString('en-IN')}`)
      .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), 'Maximum 2 decimal places allowed')
  ),

  // ✅ FIXED: horizonyear is YEARS FROM NOW (1, 2, 3, 5, 10), NOT calendar year (2031)
  horizonyear: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number({ required_error: 'Target horizon is required', invalid_type_error: 'Must be a valid number' })
      .int('Must be a whole number (e.g. 5)')
      .min(1, 'Must be at least 1 year')
      .max(50, 'Cannot exceed 50 years')
  ),

  excpectedReturnPr: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number({ required_error: 'Expected return is required', invalid_type_error: 'Must be a valid number' })
      .min(0, 'Cannot be negative')
      .max(100, 'Cannot exceed 100%')
      .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), 'Maximum 2 decimal places allowed')
  ),

  inflationPr: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number({ required_error: 'Inflation rate is required', invalid_type_error: 'Must be a valid number' })
      .min(0, 'Cannot be negative')
      .max(100, 'Cannot exceed 100%')
      .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), 'Maximum 2 decimal places allowed')
  ),

  planType: z.enum(['sip', 'lump_sum'], {
    required_error: 'Plan type is required',
    invalid_type_error: 'Please select a valid plan type'
  }),

  // progressCorpus: z.preprocess(
  //   (val) => (val === '' || val === undefined ? 0 : Number(val)),
  //   z.number({ invalid_type_error: 'Must be a valid number' })
  //     .min(0, 'Cannot be negative')
  //     .max(MAX_TARGET, `Cannot exceed ₹${MAX_TARGET.toLocaleString('en-IN')}`)
  // ),

  progressCorpus: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)), // ✅ Passes undefined to trigger Zod required error
    z.number({ required_error: 'Saved amount is required', invalid_type_error: 'Must be a valid number' })
      .min(0, 'Cannot be negative')
      .max(MAX_TARGET, `Cannot exceed ₹${MAX_TARGET.toLocaleString('en-IN')}`)
  ),
})

// ─── Goal Card ───────────────────────────────────────────────────
function GoalCard({ goal, onEdit }) {
  const pct = Math.min(Math.round(goal.progressPr ?? 0), 100)
  const status = STATUS_META[goal.status] || STATUS_META.on_track
  const StatusIcon = status.icon
  const remaining = Math.max((goal.futureTargetCorpus ?? goal.targetCorpus ?? 0) - (goal.progressCorpus ?? 0), 0)
  const suggested = goal.planType === 'sip' ? goal.suggestedSipMonthly : goal.suggestedLumpSum
  const barColor = goal.status === 'on_track' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : goal.status === 'off_track' ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-red-400 to-rose-500'
  const topBar = goal.status === 'on_track' ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : goal.status === 'off_track' ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-red-400 to-rose-400'

  // ✅ FIXED: Display as "5 years" instead of just "5"
  const yearLabel = goal.horizonyear === 1 ? '1 year' : `${goal.horizonyear} years`

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
      <div className={`h-1 w-full ${topBar}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="font-display text-[15px] font-semibold text-gray-900 truncate">{goal.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{fmtShort(goal.targetCorpus)} target · in {yearLabel}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.bg} ${status.color}`}>
              <StatusIcon size={9} />{status.label}
            </span>
            <button onClick={() => onEdit(goal)} className="p-1.5 rounded-lg text-gray-300 hover:text-gray-700 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100" aria-label="Edit goal">
              <Edit3 size={13} />
            </button>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-display text-2xl font-bold text-gray-900">{pct}%</span>
            <span className="text-xs font-medium text-gray-400">{PLAN_LABELS[goal.planType]}</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-gray-50 pt-3 mb-3">
          <div><p className="text-xs text-gray-400 mb-0.5">Saved</p><p className="text-sm font-semibold text-gray-900">₹{fmt(goal.progressCorpus)}</p></div>
          <div className="text-right"><p className="text-xs text-gray-400 mb-0.5">Remaining</p><p className="text-sm font-semibold text-emerald-600">₹{fmt(remaining)}</p></div>
        </div>
        {goal.futureTargetCorpus > 0 && (
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2 mb-2">
            <Info size={12} className="text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-500">Future Target: <span className="font-semibold text-gray-800">₹{fmt(goal.futureTargetCorpus)}</span> (inflation adjusted)</p>
          </div>
        )}
        {suggested > 0 && (
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2">
            <Info size={12} className="text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-500">Recommended: <span className="font-semibold text-gray-800">₹{fmt(suggested)}{goal.planType === 'sip' ? '/month' : ' lump sum'}</span></p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Field wrapper ───────────────────────────────────────────────
function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {Icon && <Icon size={11} />}{label}
      </label>
      {children}
    </div>
  )
}

// ─── Create / Edit Modal (PORTAL) ────────────────────────────────
function GoalModal({ isOpen, goal, onClose, onSaved }) {
  const isEdit = !!goal?._id

  const defaultValues = {
    name: goal?.name ?? '',
    targetCorpus: goal?.targetCorpus?.toString() ?? '',
    horizonyear: goal?.horizonyear?.toString() ?? '',
    excpectedReturnPr: goal?.excpectedReturnPr?.toString() ?? '',
    inflationPr: goal?.inflationPr?.toString() ?? '',
    planType: goal?.planType ?? 'sip',
    progressCorpus: goal?.progressCorpus?.toString() ?? ''
  }

  const {
    register, handleSubmit, formState: { errors, isSubmitting },
    reset, watch, setValue
  } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues
  })

  const watchPlanType = watch('planType')

  useEffect(() => {
    if (isOpen) {
      reset({
        name: goal?.name ?? '',
        targetCorpus: goal?.targetCorpus?.toString() ?? '',
        horizonyear: goal?.horizonyear?.toString() ?? '',
        excpectedReturnPr: goal?.excpectedReturnPr?.toString() ?? '',
        inflationPr: goal?.inflationPr?.toString() ?? '',
        planType: goal?.planType ?? 'sip',
        progressCorpus: goal?.progressCorpus?.toString() ?? ''
      })
    }
  }, [isOpen, goal, reset])

  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name.trim(),
        targetCorpus: Number(data.targetCorpus),
        horizonyear: Number(data.horizonyear),
        excpectedReturnPr: Number(data.excpectedReturnPr),
        inflationPr: Number(data.inflationPr),
        planType: data.planType,
        progressCorpus: Number(data.progressCorpus) || 0
      }
      const { data: res } = isEdit
        ? await api.patch(`/goals/${goal._id}`, payload)
        : await api.post('/goals', payload)

      if (res.success) {
        toast.success(isEdit ? 'Goal updated successfully!' : 'Goal created successfully!')
        onSaved()
        onClose()
      } else {
        toast.error(res.message || 'Operation failed')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Something went wrong')
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Target size={14} color="white" />
            </div>
            <h2 className="font-display text-base font-semibold text-gray-900">
              {isEdit ? 'Edit Goal' : 'New Goal'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4" noValidate>
          <Field label="Goal Name" icon={Target}>
            <input
              className={errors.name ? errorInputCls : inputCls}
              placeholder="e.g. Emergency Fund, Retirement…"
              {...register('name')}
              maxLength={100}
              autoComplete="off"
              autoFocus
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Target Amount (₹)" icon={IndianRupee}>
              <input
                className={errors.targetCorpus ? errorInputCls : inputCls}
                type="number"
                step="0.01"
                min="0.01"
                max={MAX_TARGET}
                placeholder="1000000"
                {...register('targetCorpus')}
                onKeyDown={blockInvalidNumberKeys}
              />
              {errors.targetCorpus && <p className="text-red-500 text-xs mt-1">{errors.targetCorpus.message}</p>}
            </Field>

            {/* ✅ FIXED: Label and placeholder now correctly reflect "years from now" */}
            <Field label="Target Horizon (Years)" icon={Calendar}>
              <input
                className={errors.horizonyear ? errorInputCls : inputCls}
                type="number"
                min="1"
                max="50"
                placeholder="e.g. 5"
                {...register('horizonyear')}
                onKeyDown={blockInvalidNumberKeys}
              />
              {errors.horizonyear && <p className="text-red-500 text-xs mt-1">{errors.horizonyear.message}</p>}
            </Field>

            <Field label="Expected Return %" icon={TrendingUp}>
              <input
                className={errors.excpectedReturnPr ? errorInputCls : inputCls}
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="12"
                {...register('excpectedReturnPr')}
                onKeyDown={blockInvalidPercentKeys}
              />
              {errors.excpectedReturnPr && <p className="text-red-500 text-xs mt-1">{errors.excpectedReturnPr.message}</p>}
            </Field>

            <Field label="Inflation %" icon={Percent}>
              <input
                className={errors.inflationPr ? errorInputCls : inputCls}
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="6"
                {...register('inflationPr')}
                onKeyDown={blockInvalidPercentKeys}
              />
              {errors.inflationPr && <p className="text-red-500 text-xs mt-1">{errors.inflationPr.message}</p>}
            </Field>
          </div>

          <Field label="Plan Type" icon={Layers}>
            <div className="grid grid-cols-2 gap-2">
              {['sip', 'lump_sum'].map((pt) => (
                <button
                  type="button"
                  key={pt}
                  onClick={() => setValue('planType', pt)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    watchPlanType === pt
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {pt === 'sip' ? 'SIP (Monthly)' : 'Lump Sum'}
                </button>
              ))}
            </div>
            <input type="hidden" {...register('planType')} />
            {errors.planType && <p className="text-red-500 text-xs mt-1">{errors.planType.message}</p>}
          </Field>

          <Field label="Amount Already Saved (₹)" icon={BarChart2}>
            <input
              className={errors.progressCorpus ? errorInputCls : inputCls}
              type="number"
              step="0.01"
              min="0"
              max={MAX_TARGET}
              placeholder="0"
              {...register('progressCorpus')}
              onKeyDown={blockInvalidNumberKeys}
            />
            {errors.progressCorpus && <p className="text-red-500 text-xs mt-1">{errors.progressCorpus.message}</p>}
          </Field>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

// ─── Empty State ─────────────────────────────────────────────────
function EmptyState({ onAdd, filtered }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Target size={26} className="text-gray-400" />
      </div>
      <h3 className="font-display text-lg font-semibold text-gray-900 mb-1">
        {filtered ? 'No goals found' : 'No goals yet'}
      </h3>
      <p className="text-sm text-gray-400 max-w-xs mb-6">
        {filtered ? 'Try adjusting your search or filters.' : 'Set your first financial goal.'}
      </p>
      {!filtered && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors"
        >
          <Plus size={15} /> Create First Goal
        </button>
      )}
    </div>
  )
}

// ─── Summary Bar ─────────────────────────────────────────────────
function SummaryBar({ goals, loading }) {
  if (!goals.length && !loading) return null

  const total = goals.length
  const onTrack = goals.filter(g => g.status === 'on_track').length
  const atRisk = goals.filter(g => g.status === 'at_risk').length
  const totalSaved = goals.reduce((s, g) => s + (g.progressCorpus ?? 0), 0)
  const totalTarget = goals.reduce((s, g) => s + (g.futureTargetCorpus ?? 0), 0)

  const items = [
    { label: 'Total Goals', value: total, icon: Target, color: 'text-gray-900' },
    { label: 'On Track', value: onTrack, icon: CheckCircle2, color: 'text-emerald-600' },
    { label: 'At Risk', value: atRisk, icon: Flame, color: 'text-red-500' },
    { label: 'Total Saved', value: fmtShort(totalSaved), icon: IndianRupee, color: 'text-gray-900' },
    { label: 'Total Target', value: fmtShort(totalTarget), icon: BarChart2, color: 'text-gray-900' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {items.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
            {loading ? <Loader2 size={14} className="animate-spin text-gray-400" /> : <Icon size={15} className={color} />}
          </div>
          <div>
            <p className="text-xs text-gray-400">{label}</p>
            <p className={`text-sm font-bold ${color}`}>{loading ? '—' : value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────
export default function GoalsModule() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const { searchValue, debouncedSearch, isSearching, handleSearchChange, clearSearch } = useDebouncedSearch()
  const abortRef = useRef(null)

  const fetchGoals = useCallback(async (p, s, t, signal) => {
    setLoading(true)
    try {
      const params = { page: p, limit: 6 }
      if (s) params.search = s
      if (t) params.type = t
      const { data } = await api.get('/goals', { params, signal })
      if (data.success) {
        setGoals(data.data)
        setTotalPages(data.totalPage)
        setTotal(data.total)
      }
    } catch (e) {
      if (e.code !== 'ERR_CANCELED') {
        toast.error('Failed to fetch goals')
      }
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => { setPage(1) }, [typeFilter, debouncedSearch])

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    fetchGoals(1, debouncedSearch, typeFilter, controller.signal)
    return () => controller.abort()
  }, [debouncedSearch, typeFilter, fetchGoals])

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    fetchGoals(page, debouncedSearch, typeFilter, controller.signal)
    return () => controller.abort()
  }, [page, fetchGoals])

  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(totalPages)
  }, [totalPages, page])

  const handleOpenModal = useCallback((goal = null) => {
    setEditingGoal(goal)
    setModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
    setEditingGoal(null)
  }, [])

  const handleSaved = useCallback(() => {
    fetchGoals(1, debouncedSearch, typeFilter)
    setPage(1)
  }, [fetchGoals, debouncedSearch, typeFilter])

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Goals</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {total > 0 ? `${total} goals tracked` : 'Plan and track your financial goals'}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal(null)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 self-start sm:self-auto"
        >
          <Plus size={15} /> New Goal
        </button>
      </div>

      <SummaryBar goals={goals} loading={loading} />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchInput
          value={searchValue}
          onChange={handleSearchChange}
          onClear={clearSearch}
          isSearching={isSearching}
          placeholder="Search goals…"
          className="flex-1"
        />
        <div className="flex gap-2">
          {[
            { v: '', l: 'All' },
            { v: 'sip', l: 'SIP' },
            { v: 'lump_sum', l: 'Lump Sum' }
          ].map(({ v, l }) => (
            <button
              key={v}
              onClick={() => setTypeFilter(v)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-xl border transition-all ${
                typeFilter === v
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin text-gray-400" />
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100">
          <EmptyState
            onAdd={() => handleOpenModal(null)}
            filtered={!!(searchValue.trim() || typeFilter)}
          />
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {goals.map(g => (
              <GoalCard
                key={g._id}
                goal={g}
                onEdit={(goal) => handleOpenModal(goal)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-500 px-2">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      <GoalModal
        isOpen={modalOpen}
        goal={editingGoal}
        onClose={handleCloseModal}
        onSaved={handleSaved}
      />
    </div>
  )
}