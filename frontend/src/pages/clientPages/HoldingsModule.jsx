import { useState, useEffect, useRef } from 'react'
import {
  BarChart2, Plus, Search, TrendingUp, TrendingDown,
  Edit3, Trash2, X, ChevronLeft, ChevronRight,
  Loader2, AlertTriangle, IndianRupee, Calendar,
  Layers, Filter, RefreshCw
} from 'lucide-react'
import API from '../../services/api'
// ─── Formatters ──────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n ?? 0)

const fmtShort = (n) => {
  if (!n && n !== 0) return '₹0'
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`
  return `₹${fmt(n)}`
}

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

// ─── Constants ───────────────────────────────────────────────────
const TYPES = ['stock', 'mf', 'gold', 'fd', 'rd', 'crypto', 'other']

const TYPE_META = {
  stock:  { label: 'Stock',  color: 'text-blue-600',    bg: 'bg-blue-50',    dot: 'bg-blue-500'    },
  mf:     { label: 'MF',     color: 'text-purple-600',  bg: 'bg-purple-50',  dot: 'bg-purple-500'  },
  gold:   { label: 'Gold',   color: 'text-yellow-600',  bg: 'bg-yellow-50',  dot: 'bg-yellow-500'  },
  fd:     { label: 'FD',     color: 'text-green-600',   bg: 'bg-green-50',   dot: 'bg-green-500'   },
  rd:     { label: 'RD',     color: 'text-teal-600',    bg: 'bg-teal-50',    dot: 'bg-teal-500'    },
  crypto: { label: 'Crypto', color: 'text-orange-600',  bg: 'bg-orange-50',  dot: 'bg-orange-500'  },
  other:  { label: 'Other',  color: 'text-gray-600',    bg: 'bg-gray-100',   dot: 'bg-gray-400'    },
}

const inputCls =
  'w-full px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:bg-white transition-all placeholder-gray-300'

// ─── Summary Cards ───────────────────────────────────────────────
function SummaryCards({ summary, loading }) {
  const { totalValue = 0, totalInvestment = 0, totalGain = 0, totalPercentage = 0 } = summary || {}
  const isPositive = totalGain >= 0

  const cards = [
    {
      label: 'Current Value',
      value: fmtShort(totalValue),
      sub: 'Portfolio value',
      icon: IndianRupee,
      accent: 'text-gray-900',
    },
    {
      label: 'Invested',
      value: fmtShort(totalInvestment),
      sub: 'Total invested',
      icon: BarChart2,
      accent: 'text-gray-900',
    },
    {
      label: 'Total Gain / Loss',
      value: `${isPositive ? '+' : ''}${fmtShort(totalGain)}`,
      sub: `${isPositive ? '+' : ''}${totalPercentage}% overall`,
      icon: isPositive ? TrendingUp : TrendingDown,
      accent: isPositive ? 'text-emerald-600' : 'text-red-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      {cards.map(({ label, value, sub, icon: Icon, accent }) => (
        <div key={label} className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
            <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center">
              <Icon size={14} className={accent} />
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

// ─── Holding Row ─────────────────────────────────────────────────
function HoldingRow({ holding, onEdit, onDelete }) {
  const meta = TYPE_META[holding.type] || TYPE_META.other
  const isPositive = holding.gain >= 0

  return (
    <div className="group flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 rounded-xl transition-colors">
      {/* type badge */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
        <span className={`text-[11px] font-bold ${meta.color}`}>{meta.label}</span>
      </div>

      {/* name + date */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{holding.name}</p>
        <p className="text-xs text-gray-400">{fmtDate(holding.purchaseDate)}</p>
      </div>

      {/* invested */}
      <div className="hidden sm:block text-right w-28 flex-shrink-0">
        <p className="text-xs text-gray-400 mb-0.5">Invested</p>
        <p className="text-sm font-medium text-gray-700">₹{fmt(holding.purchaseValue)}</p>
      </div>

      {/* current */}
      <div className="text-right w-28 flex-shrink-0">
        <p className="text-xs text-gray-400 mb-0.5">Current</p>
        <p className="text-sm font-semibold text-gray-900">₹{fmt(holding.currentValue)}</p>
      </div>

      {/* gain */}
      <div className="text-right w-24 flex-shrink-0">
        <p className={`text-sm font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}₹{fmt(holding.gain)}
        </p>
        <p className={`text-xs ${isPositive ? 'text-emerald-500' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{holding.percentage}%
        </p>
      </div>

      {/* actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={() => onEdit(holding)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <Edit3 size={13} />
        </button>
        <button onClick={() => onDelete(holding)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
          <Trash2 size={13} />
        </button>
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

// ─── Add Modal ───────────────────────────────────────────────────
function AddModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    type: 'stock', name: '', purchaseValue: '',
    currentValue: '', purchaseDate: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    const { type, name, purchaseValue, currentValue, purchaseDate } = form
    if (!type || !name.trim() || purchaseValue === '' || currentValue === '' || !purchaseDate) {
      setError('Please fill all required fields.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { data } = await API.post('/holdings', {
        type,
        name: name.trim(),
        purchaseValue: Number(purchaseValue),
        currentValue:  Number(currentValue),
        purchaseDate,
      })
      if (!data.success) throw new Error(data.error)
      onSaved()
      onClose()
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <BarChart2 size={14} color="white" />
            </div>
            <h2 className="font-display text-base font-semibold text-gray-900">Add Holding</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Type selector */}
          <Field label="Asset Type" icon={Layers}>
            <div className="grid grid-cols-4 gap-1.5">
              {TYPES.map((t) => {
                const m = TYPE_META[t]
                return (
                  <button key={t} onClick={() => set('type', t)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      form.type === t
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400'
                    }`}>
                    {m.label}
                  </button>
                )
              })}
            </div>
          </Field>

          <Field label="Name" icon={BarChart2}>
            <input className={inputCls} placeholder="e.g. HDFC Bank, SBI Gold ETF…"
              value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Purchase Value (₹)" icon={IndianRupee}>
              <input className={inputCls} type="number" placeholder="50000"
                value={form.purchaseValue} onChange={(e) => set('purchaseValue', e.target.value)} />
            </Field>
            <Field label="Current Value (₹)" icon={TrendingUp}>
              <input className={inputCls} type="number" placeholder="60000"
                value={form.currentValue} onChange={(e) => set('currentValue', e.target.value)} />
            </Field>
          </div>

          <Field label="Purchase Date" icon={Calendar}>
            <input className={inputCls} type="date"
              value={form.purchaseDate} onChange={(e) => set('purchaseDate', e.target.value)} />
          </Field>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-xs px-3 py-2.5 rounded-xl border border-red-100">
              <AlertTriangle size={13} /> {error}
            </div>
          )}
        </div>

        <div className="flex gap-2.5 px-6 pb-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Add Holding
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit Modal (currentValue only) ──────────────────────────────
function EditModal({ holding, onClose, onSaved }) {
  const [currentValue, setCurrentValue] = useState(holding.currentValue ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async () => {
    if (currentValue === '') { setError('Current value is required.'); return }
    setError('')
    setLoading(true)
    try {
      const { data } = await API.patch(`/holdings/${holding._id}`, {
        currentValue: Number(currentValue),
      })
      if (!data.success) throw new Error(data.error)
      onSaved()
      onClose()
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <RefreshCw size={13} color="white" />
            </div>
            <div>
              <h2 className="font-display text-sm font-semibold text-gray-900">Update Value</h2>
              <p className="text-xs text-gray-400 truncate max-w-[180px]">{holding.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-xs text-gray-400">Purchase Value</p>
              <p className="text-sm font-semibold text-gray-700">₹{fmt(holding.purchaseValue)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Purchased on</p>
              <p className="text-sm font-semibold text-gray-700">{fmtDate(holding.purchaseDate)}</p>
            </div>
          </div>

          <Field label="New Current Value (₹)" icon={IndianRupee}>
            <input className={inputCls} type="number" placeholder="Enter current market value"
              value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} autoFocus />
          </Field>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-xs px-3 py-2.5 rounded-xl border border-red-100">
              <AlertTriangle size={13} /> {error}
            </div>
          )}
        </div>

        <div className="flex gap-2.5 px-6 pb-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Update
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ────────────────────────────────────────
function DeleteModal({ holding, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleDelete = async () => {
    setLoading(true)
    try {
      const { data } = await API.delete(`/holdings/${holding._id}`)
      if (!data.success) throw new Error(data.error)
      onDeleted()
      onClose()
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Trash2 size={20} className="text-red-500" />
          </div>
          <h2 className="font-display text-base font-semibold text-gray-900 mb-1">Delete Holding</h2>
          <p className="text-sm text-gray-400">
            Are you sure you want to delete <span className="font-semibold text-gray-700">"{holding.name}"</span>? This cannot be undone.
          </p>
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-xs px-3 py-2.5 rounded-xl border border-red-100 mt-3 text-left">
              <AlertTriangle size={13} /> {error}
            </div>
          )}
        </div>
        <div className="flex gap-2.5 px-6 pb-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────
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
        {filtered
          ? 'Try adjusting your search or filters.'
          : 'Add your first holding to start tracking your investment portfolio.'}
      </p>
      {!filtered && (
        <button onClick={onAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors">
          <Plus size={15} /> Add First Holding
        </button>
      )}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────
export default function HoldingsModule() {
  const [holdings,    setHoldings]    = useState([])
  const [summary,     setSummary]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [sumLoading,  setSumLoading]  = useState(true)
  const [search,      setSearch]      = useState('')
  const [typeFilter,  setTypeFilter]  = useState('')
  const [page,        setPage]        = useState(1)
  const [totalPages,  setTotalPages]  = useState(1)
  const [total,       setTotal]       = useState(0)

  const [addOpen,     setAddOpen]     = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const debounceRef = useRef(null)

  const fetchSummary = async () => {
    setSumLoading(true)
    try {
      const { data } = await API.get('/holdings/summary')
      if (data.success) setSummary(data.summary)
    } catch (e) {
      console.error('summary:', e.response?.data || e.message)
    } finally {
      setSumLoading(false)
    }
  }

  const fetchHoldings = async (p, s, t) => {
    setLoading(true)
    try {
      const params = { page: p, limit: 10 }
      if (s) params.search = s
      if (t) params.type   = t
      const { data } = await API.get('/holdings', { params })
      if (data.success) {
        setHoldings(data.holdings)
        setTotalPages(data.pagination.totalPages)
        setTotal(data.pagination.total)
      }
    } catch (e) {
      console.error('holdings:', e.response?.data || e.message)
    } finally {
      setLoading(false)
    }
  }

  const refetchAll = () => {
    fetchSummary()
    fetchHoldings(1, search, typeFilter)
    setPage(1)
  }

  // filter change
  useEffect(() => {
    setPage(1)
    fetchHoldings(1, search, typeFilter)
  }, [typeFilter])

  // debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      fetchHoldings(1, search, typeFilter)
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [search])

  // page change
  useEffect(() => {
    fetchHoldings(page, search, typeFilter)
  }, [page])

  // initial summary
  useEffect(() => { fetchSummary() }, [])

  const isFiltered = !!(search || typeFilter)

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Holdings</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {total > 0 ? `${total} holding${total !== 1 ? 's' : ''} in portfolio` : 'Track your investment portfolio'}
          </p>
        </div>
        <button onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 self-start sm:self-auto">
          <Plus size={15} /> Add Holding
        </button>
      </div>

      {/* Summary */}
      <SummaryCards summary={summary} loading={sumLoading} />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-colors placeholder-gray-300"
            placeholder="Search holdings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {[{ v: '', l: 'All' }, ...TYPES.map((t) => ({ v: t, l: TYPE_META[t].label }))].map(({ v, l }) => (
            <button key={v} onClick={() => setTypeFilter(v)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                typeFilter === v
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:flex items-center gap-4 px-4 py-2.5 border-b border-gray-50 bg-gray-50/60">
          <div className="w-9 flex-shrink-0" />
          <p className="flex-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Name</p>
          <p className="hidden sm:block text-xs font-semibold text-gray-400 uppercase tracking-wide w-28 text-right">Invested</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-28 text-right">Current</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-24 text-right">Gain / Loss</p>
          <div className="w-16 flex-shrink-0" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={26} className="animate-spin text-gray-400" />
          </div>
        ) : holdings.length === 0 ? (
          <EmptyState onAdd={() => setAddOpen(true)} filtered={isFiltered} />
        ) : (
          <div className="divide-y divide-gray-50 px-2 py-1">
            {holdings.map((h) => (
              <HoldingRow
                key={h._id}
                holding={h}
                onEdit={(h) => setEditTarget(h)}
                onDelete={(h) => setDeleteTarget(h)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-50">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
              className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-500 px-2">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {addOpen && (
        <AddModal onClose={() => setAddOpen(false)} onSaved={refetchAll} />
      )}
      {editTarget && (
        <EditModal holding={editTarget} onClose={() => setEditTarget(null)} onSaved={refetchAll} />
      )}
      {deleteTarget && (
        <DeleteModal holding={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={refetchAll} />
      )}
    </div>
  )
}