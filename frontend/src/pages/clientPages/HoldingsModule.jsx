import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import api from '../../services/api'
import {
  BarChart2, Plus, TrendingUp, TrendingDown, Edit3, Trash2, X,
  ChevronLeft, ChevronRight, ChevronDown, Loader2, IndianRupee,
  Calendar, Layers, RefreshCw, Search
} from 'lucide-react'

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
    setInputValue('')
    setDebouncedValue('')
    setIsSearching(false)
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

// ─── SEARCH INPUT COMPONENT ──────────────────────────────────────
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
          <button onClick={onClear} className="p-0.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={14} />
          </button>
        ) : null}
      </div>
    </div>
  )
}

// ─── FORMATTERS & CONSTANTS ──────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n ?? 0)
const fmtShort = (n) => {
  if (!n && n !== 0) return '₹0'
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`
  return `₹${fmt(n)}`
}
const fmtDate = (d) => {
  if (!d) return 'N/A'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const TYPES = ['stock', 'mf', 'gold', 'fd', 'rd', 'crypto', 'other']
const TYPE_META = {
  stock: { label: 'Stock', color: 'text-blue-600', bg: 'bg-blue-50' },
  mf: { label: 'MF', color: 'text-purple-600', bg: 'bg-purple-50' },
  gold: { label: 'Gold', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  fd: { label: 'FD', color: 'text-green-600', bg: 'bg-green-50' },
  rd: { label: 'RD', color: 'text-teal-600', bg: 'bg-teal-50' },
  crypto: { label: 'Crypto', color: 'text-orange-600', bg: 'bg-orange-50' },
  other: { label: 'Other', color: 'text-gray-600', bg: 'bg-gray-100' }
}

const inputCls = 'w-full px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:bg-white transition-all placeholder-gray-300'
const errorInputCls = 'w-full px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-red-300 rounded-xl focus:outline-none focus:border-red-400 focus:bg-white transition-all placeholder-gray-300'

// ─── STRICT ZOD SCHEMAS ─────────────────────────────────────────
const today = new Date().toISOString().split('T')[0]
const minDate = '2020-01-01'

const holdingSchema = z.object({
  type: z.enum(['stock', 'mf', 'gold', 'fd', 'rd', 'crypto', 'other'], {
    required_error: 'Asset type is required',
    invalid_type_error: 'Please select a valid asset type'
  }),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be under 100 characters')
    .trim()
    .regex(/^[a-zA-Z]/, 'Name must start with a letter')
    .regex(/^[a-zA-Z0-9\s\-_.&'()]+$/, 'Name contains invalid special characters'),
  purchaseValue: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number({ required_error: 'Purchase value is required', invalid_type_error: 'Must be a valid number' })
      .positive('Must be greater than 0')
      .max(99999999, 'Cannot exceed ₹9,99,99,999')
      .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), 'Maximum 2 decimal places allowed')
  ),
  currentValue: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number({ required_error: 'Current value is required', invalid_type_error: 'Must be a valid number' })
      .positive('Must be greater than 0')
      .max(99999999, 'Cannot exceed ₹9,99,99,999')
      .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), 'Maximum 2 decimal places allowed')
  ),
  purchaseDate: z.string()
    .min(1, 'Purchase date is required')
    .refine((val) => val >= minDate, 'Date must be after Jan 2020')
    .refine((val) => val <= today, 'Date cannot be in the future')
})

const editHoldingSchema = z.object({
  currentValue: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number({ required_error: 'Current value is required', invalid_type_error: 'Must be a valid number' })
      .positive('Must be greater than 0')
      .max(99999999, 'Cannot exceed ₹9,99,99,999')
      .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), 'Maximum 2 decimal places allowed')
  )
})

// ─── NUMBER INPUT SECURITY ───────────────────────────────────────
const blockInvalidKeys = (e) => {
  if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault()
}

// ─── CUSTOM DROPDOWN ─────────────────────────────────────────────
const CustomDropdown = ({ value, onChange, options, className = '', placeholder = 'Select...' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(o => o.value === value)

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-left outline-none cursor-pointer transition-all pr-10 flex items-center justify-between hover:border-gray-400 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 text-sm"
      >
        <span className={`truncate ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-fade-up">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setIsOpen(false) }}
                className={`w-full text-left px-4 py-2 text-sm transition-all duration-150 ${value === opt.value ? 'bg-gray-900 text-white font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── FIELD COMPONENT ─────────────────────────────────────────────
function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {Icon && <Icon size={11} />}
        {label}
      </label>
      {children}
    </div>
  )
}

// ─── SUMMARY CARDS (INSTANT RENDER) ──────────────────────────────
function SummaryCards({ summary, loading }) {
  const { totalValue = 0, totalInvestment = 0, totalGain = 0, totalPercentage = 0 } = summary || {}
  const isPos = totalGain >= 0

  const cards = [
    { label: 'Current Value', value: fmtShort(totalValue), sub: 'Portfolio value', icon: IndianRupee, accent: 'text-gray-900' },
    { label: 'Invested', value: fmtShort(totalInvestment), sub: 'Total invested', icon: BarChart2, accent: 'text-gray-900' },
    { label: 'Total Gain / Loss', value: `${isPos ? '+' : ''}${fmtShort(totalGain)}`, sub: `${isPos ? '+' : ''}${totalPercentage}% overall`, icon: isPos ? TrendingUp : TrendingDown, accent: isPos ? 'text-emerald-600' : 'text-red-500' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      {cards.map(({ label, value, sub, icon: Icon, accent }) => (
        <div key={label} className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
            <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center">
              {loading ? <Loader2 size={14} className="animate-spin text-gray-400" /> : <Icon size={14} className={accent} />}
            </div>
          </div>
          {loading ? (
            <div className="h-7 w-24 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <p className={`font-display text-xl font-bold ${accent}`}>{value}</p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
        </div>
      ))}
    </div>
  )
}

// ─── HOLDING ROW ─────────────────────────────────────────────────
function HoldingRow({ holding, onEdit, onDelete }) {
  const meta = TYPE_META[holding.type] || TYPE_META.other
  const isPos = (holding.gain ?? 0) >= 0

  return (
    <div className="group flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 rounded-xl transition-colors">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
        <span className={`text-[11px] font-bold ${meta.color}`}>{meta.label}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{holding.name}</p>
        <p className="text-xs text-gray-400">{fmtDate(holding.purchaseDate)}</p>
      </div>
      <div className="hidden sm:block text-right w-28 flex-shrink-0">
        <p className="text-xs text-gray-400 mb-0.5">Invested</p>
        <p className="text-sm font-medium text-gray-700">₹{fmt(holding.purchaseValue)}</p>
      </div>
      <div className="text-right w-28 flex-shrink-0">
        <p className="text-xs text-gray-400 mb-0.5">Current</p>
        <p className="text-sm font-semibold text-gray-900">₹{fmt(holding.currentValue)}</p>
      </div>
      <div className="text-right w-24 flex-shrink-0">
        <p className={`text-sm font-semibold ${isPos ? 'text-emerald-600' : 'text-red-500'}`}>
          {isPos ? '+' : ''}₹{fmt(holding.gain)}
        </p>
        <p className={`text-xs ${isPos ? 'text-emerald-500' : 'text-red-400'}`}>
          {isPos ? '+' : ''}{holding.percentage ?? 0}%
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={() => onEdit(holding)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" aria-label="Edit holding">
          <Edit3 size={13} />
        </button>
        <button onClick={() => onDelete(holding)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" aria-label="Delete holding">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── EMPTY STATE ─────────────────────────────────────────────────
function EmptyState({ onAdd, filtered }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <BarChart2 size={26} className="text-gray-400" />
      </div>
      <h3 className="font-display text-lg font-semibold text-gray-900 mb-1">
        {filtered ? 'No holdings found' : 'No holdings yet'}
      </h3>
      <p className="text-sm text-gray-400 max-w-xs mb-6">
        {filtered ? 'Try adjusting your search or filters.' : 'Add your first holding to start tracking.'}
      </p>
      {!filtered && (
        <button onClick={onAdd} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors">
          <Plus size={15} /> Add First Holding
        </button>
      )}
    </div>
  )
}

// ─── ADD MODAL (PORTAL) ──────────────────────────────────────────
function AddModal({ isOpen, onClose, onSaved }) {
  const defaultValues = {
    type: 'stock',
    name: '',
    purchaseValue: '',
    currentValue: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  }

  const {
    register, handleSubmit, formState: { errors, isSubmitting },
    reset, setValue, watch
  } = useForm({ resolver: zodResolver(holdingSchema), defaultValues })

  const watchType = watch('type')

  useEffect(() => { if (isOpen) reset(defaultValues) }, [isOpen, reset])

  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  const onSubmit = async (data) => {
    try {
      const payload = {
        type: data.type,
        name: data.name.trim(),
        purchaseValue: Number(data.purchaseValue),
        currentValue: Number(data.currentValue),
        purchaseDate: data.purchaseDate
      }
      const { data: res } = await api.post('/holdings', payload)
      if (res.success) {
        toast.success('Holding added successfully!')
        onSaved()
        onClose()
      } else {
        toast.error(res.error || 'Failed to add holding')
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Something went wrong')
    }
  }

  if (!isOpen) return null

  const typeOptions = TYPES.map(t => ({ value: t, label: TYPE_META[t].label }))

  return createPortal(
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center"><Plus size={14} color="white" /></div>
            <h2 className="font-display text-base font-semibold text-gray-900">Add Holding</h2>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4" noValidate>
          <Field label="Asset Type" icon={Layers}>
            <CustomDropdown value={watchType} onChange={(val) => setValue('type', val)} options={typeOptions} />
            <input type="hidden" {...register('type')} />
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
          </Field>
          <Field label="Name" icon={BarChart2}>
            <input className={errors.name ? errorInputCls : inputCls} placeholder="e.g. HDFC Bank, Nifty 50 ETF…" {...register('name')} maxLength={100} autoComplete="off" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Purchase Value (₹)" icon={IndianRupee}>
              <input className={errors.purchaseValue ? errorInputCls : inputCls} type="number" step="0.01" min="0.01" max="99999999" placeholder="50000" {...register('purchaseValue')} onKeyDown={blockInvalidKeys} />
              {errors.purchaseValue && <p className="text-red-500 text-xs mt-1">{errors.purchaseValue.message}</p>}
            </Field>
            <Field label="Current Value (₹)" icon={TrendingUp}>
              <input className={errors.currentValue ? errorInputCls : inputCls} type="number" step="0.01" min="0.01" max="99999999" placeholder="60000" {...register('currentValue')} onKeyDown={blockInvalidKeys} />
              {errors.currentValue && <p className="text-red-500 text-xs mt-1">{errors.currentValue.message}</p>}
            </Field>
          </div>
          <Field label="Purchase Date" icon={Calendar}>
            <input className={errors.purchaseDate ? errorInputCls : inputCls} type="date" min={minDate} max={today} {...register('purchaseDate')} />
            {errors.purchaseDate && <p className="text-red-500 text-xs mt-1">{errors.purchaseDate.message}</p>}
          </Field>
          <div className="flex gap-2.5 pt-2">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">{isSubmitting && <Loader2 size={14} className="animate-spin" />}Add Holding</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

// ─── EDIT MODAL (PORTAL) ─────────────────────────────────────────
function EditModal({ isOpen, holding, onClose, onSaved }) {
  const defaultValues = { currentValue: holding?.currentValue?.toString() ?? '' }

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(editHoldingSchema),
    defaultValues
  })

  useEffect(() => {
    if (isOpen && holding) reset({ currentValue: holding.currentValue?.toString() ?? '' })
  }, [isOpen, holding, reset])

  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  const onSubmit = async (data) => {
    if (!holding?._id) return
    try {
      const { data: res } = await api.patch(`/holdings/${holding._id}`, { currentValue: Number(data.currentValue) })
      if (res.success) {
        toast.success('Holding value updated!')
        onSaved()
        onClose()
      } else {
        toast.error(res.error || 'Failed to update holding')
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Something went wrong')
    }
  }

  if (!isOpen || !holding) return null

  return createPortal(
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center"><RefreshCw size={13} color="white" /></div>
            <div>
              <h2 className="font-display text-sm font-semibold text-gray-900">Update Value</h2>
              <p className="text-xs text-gray-400 truncate max-w-[180px]">{holding.name}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4" noValidate>
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div><p className="text-xs text-gray-400">Purchase Value</p><p className="text-sm font-semibold text-gray-700">₹{fmt(holding.purchaseValue)}</p></div>
            <div className="text-right"><p className="text-xs text-gray-400">Purchased on</p><p className="text-sm font-semibold text-gray-700">{fmtDate(holding.purchaseDate)}</p></div>
          </div>
          <Field label="New Current Value (₹)" icon={IndianRupee}>
            <input className={errors.currentValue ? errorInputCls : inputCls} type="number" step="0.01" min="0.01" max="99999999" placeholder="Enter current market value" {...register('currentValue')} onKeyDown={blockInvalidKeys} autoFocus />
            {errors.currentValue && <p className="text-red-500 text-xs mt-1">{errors.currentValue.message}</p>}
          </Field>
          <div className="flex gap-2.5">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">{isSubmitting && <Loader2 size={14} className="animate-spin" />}Update</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

// ─── DELETE MODAL (PORTAL) ───────────────────────────────────────
function DeleteModal({ isOpen, holding, onClose, onDeleted }) {
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  const handleDelete = async () => {
    if (!holding?._id) return
    setIsDeleting(true)
    try {
      const { data } = await api.delete(`/holdings/${holding._id}`)
      if (data.success) {
        toast.success('Holding deleted successfully')
        onDeleted()
        onClose()
      } else {
        toast.error(data.error || 'Failed to delete holding')
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Delete failed')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen || !holding) return null

  return createPortal(
    <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><Trash2 size={20} className="text-red-500" /></div>
          <h2 className="font-display text-base font-semibold text-gray-900 mb-1">Delete Holding?</h2>
          <p className="text-sm text-gray-400">Are you sure you want to delete <span className="font-semibold text-gray-700">"{holding.name}"</span>? This action cannot be undone.</p>
        </div>
        <div className="flex gap-2.5 px-6 pb-5">
          <button type="button" onClick={onClose} disabled={isDeleting} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50">Cancel</button>
          <button type="button" onClick={handleDelete} disabled={isDeleting} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">{isDeleting && <Loader2 size={14} className="animate-spin" />}Delete</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── MAIN HOLDINGS MODULE ────────────────────────────────────────
export default function HoldingsModule() {
  const [holdings, setHoldings] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sumLoading, setSumLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { searchValue, debouncedSearch, isSearching, handleSearchChange, clearSearch } = useDebouncedSearch()
  const holdingsAbortRef = useRef(null)
  const summaryAbortRef = useRef(null)

  // ═══════════════════════════════════════════════════════════════
  // KEY FIX: Separate summary and holdings fetching logic
  // Summary ONLY fetches on mount + after CRUD operations
  // Holdings fetches on mount + search/filter/page changes
  // ═══════════════════════════════════════════════════════════════

  // Fetch Summary - ONLY called explicitly, NOT on search/filter changes
  const fetchSummary = useCallback(async (signal) => {
    if (summaryAbortRef.current) summaryAbortRef.current.abort()
    const c = signal || new AbortController()
    summaryAbortRef.current = c
    setSumLoading(true)
    try {
      const { data } = await api.get('/holdings/summary', { signal: c.signal })
      if (data.success) setSummary(data.summary)
    } catch (err) {
      if (err.code !== 'ERR_CANCELED') console.error(err)
    } finally {
      if (!c.signal?.aborted) setSumLoading(false)
    }
  }, [])

  // Fetch Holdings - called on search/filter/page changes
  const fetchHoldings = useCallback(async (p, s, t, signal) => {
    if (holdingsAbortRef.current) holdingsAbortRef.current.abort()
    const c = signal || new AbortController()
    holdingsAbortRef.current = c
    setLoading(true)
    try {
      const params = { page: p, limit: 5 }
      if (s) params.search = s
      if (t) params.type = t
      const { data } = await api.get('/holdings', { params, signal: c.signal })
      if (data.success) {
        setHoldings(data.holdings)
        setTotalPages(data.pagination.totalPages)
        setTotal(data.pagination.total)
      }
    } catch (err) {
      if (err.code !== 'ERR_CANCELED') {
        console.error(err)
        toast.error('Failed to fetch holdings')
      }
    } finally {
      if (!c.signal?.aborted) setLoading(false)
    }
  }, [])

  // ═══════════════════════════════════════════════════════════════
  // INITIAL MOUNT: Fetch both in parallel
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const c = new AbortController()
    fetchHoldings(1, '', '', c.signal)
    fetchSummary(c.signal)
    return () => c.abort()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ═══════════════════════════════════════════════════════════════
  // SEARCH/FILTER CHANGES: ONLY fetch holdings, NOT summary
  // This is the KEY performance fix!
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    setPage(1) // Reset page on filter change
  }, [typeFilter, debouncedSearch])

  useEffect(() => {
    const c = new AbortController()
    holdingsAbortRef.current = c
    fetchHoldings(1, debouncedSearch, typeFilter, c.signal)
    return () => c.abort()
  }, [debouncedSearch, typeFilter, fetchHoldings])

  // Page change: ONLY fetch holdings
  useEffect(() => {
    const c = new AbortController()
    holdingsAbortRef.current = c
    fetchHoldings(page, debouncedSearch, typeFilter, c.signal)
    return () => c.abort()
  }, [page, fetchHoldings, debouncedSearch, typeFilter])

  // Ensure page doesn't exceed totalPages
  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(totalPages)
  }, [totalPages, page])

  // ═══════════════════════════════════════════════════════════════
  // CRUD CALLBACKS: Fetch both summary AND holdings
  // ═══════════════════════════════════════════════════════════════
  const refetchAll = useCallback(() => {
    fetchSummary() // Only summary, holdings will refetch via effects
    setPage(1)     // This triggers holdings refetch
  }, [fetchSummary])

  // Handle callbacks
  const handleSaveSuccess = useCallback(() => { refetchAll() }, [refetchAll])
  const handleDeleteConfirm = useCallback(() => { refetchAll() }, [refetchAll])
  const handleAddClose = useCallback(() => { setIsAddOpen(false) }, [])
  const handleEditClose = useCallback(() => { setEditTarget(null) }, [])
  const handleDeleteClose = useCallback(() => { setDeleteTarget(null) }, [])
  const handleEdit = useCallback((holding) => { setEditTarget(holding) }, [])
  const handleDeleteClick = useCallback((holding) => { setDeleteTarget(holding) }, [])

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Holdings</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {total > 0 ? `${total} holdings in portfolio` : 'Track your investment portfolio'}
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 self-start sm:self-auto"
        >
          <Plus size={15} /> Add Holding
        </button>
      </div>

      {/* Summary Cards - Now loads INSTANT on mount, stays stable during search/filter */}
      <SummaryCards summary={summary} loading={sumLoading} />

      {/* Search & Filters - Only affects holdings list, NOT summary */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          value={searchValue}
          onChange={handleSearchChange}
          onClear={clearSearch}
          isSearching={isSearching}
          placeholder="Search holdings…"
          className="flex-1"
        />
        <div className="flex gap-1.5 flex-wrap">
          {[
            { v: '', l: 'All' },
            ...TYPES.map(t => ({ v: t, l: TYPE_META[t].label }))
          ].map(({ v, l }) => (
            <button
              key={v}
              onClick={() => setTypeFilter(v)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
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

      {/* Holdings Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Table Header */}
        <div className="hidden sm:flex items-center gap-4 px-4 py-2.5 border-b border-gray-50 bg-gray-50/60">
          <div className="w-9 flex-shrink-0" />
          <p className="flex-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Name</p>
          <p className="hidden sm:block text-xs font-semibold text-gray-400 uppercase tracking-wide w-28 text-right">Invested</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-28 text-right">Current</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-24 text-right">Gain / Loss</p>
          <div className="w-16 flex-shrink-0" />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={26} className="animate-spin text-gray-400" />
          </div>
        ) : holdings.length === 0 ? (
          <EmptyState onAdd={() => setIsAddOpen(true)} filtered={!!(searchValue.trim() || typeFilter)} />
        ) : (
          <div className="divide-y divide-gray-50 px-2 py-1">
            {holdings.map(h => (
              <HoldingRow key={h._id} holding={h} onEdit={handleEdit} onDelete={handleDeleteClick} />
            ))}
          </div>
        )}

        {/* Centered Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-gray-400 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                <span className="text-xs font-semibold hidden sm:inline">Prev</span>
              </button>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-1 py-1">
                <span className="px-3 py-1 text-xs font-bold text-gray-900 bg-white rounded-md shadow-sm">{page}</span>
                <span className="text-xs text-gray-400 px-1">of</span>
                <span className="px-2 py-1 text-xs font-semibold text-gray-600">{totalPages}</span>
              </div>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-gray-400 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center gap-1"
              >
                <span className="text-xs font-semibold hidden sm:inline">Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddModal isOpen={isAddOpen} onClose={handleAddClose} onSaved={handleSaveSuccess} />
      <EditModal isOpen={!!editTarget} holding={editTarget} onClose={handleEditClose} onSaved={handleSaveSuccess} />
      <DeleteModal isOpen={!!deleteTarget} holding={deleteTarget} onClose={handleDeleteClose} onDeleted={handleDeleteConfirm} />
    </div>
  )
}