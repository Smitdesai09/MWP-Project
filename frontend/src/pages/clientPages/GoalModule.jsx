import { useState, useEffect, useRef } from 'react'
import {
  Target, Plus, Search, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, Edit3, IndianRupee, X,
  ChevronLeft, ChevronRight, Loader2, Info, Calendar,
  Percent, BarChart2, Layers, Flame
} from 'lucide-react'
import API from '../../services/api'

// ─── Formatters ──────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n ?? 0)

const fmtShort = (n) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`
  return `₹${fmt(n)}`
}

// ─── Constants ───────────────────────────────────────────────────
const STATUS_META = {
  on_track: { label: 'On Track', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
  off_track: { label: 'Off Track', color: 'text-amber-600', bg: 'bg-amber-50',   icon: TrendingDown  },
  at_risk:   { label: 'At Risk',   color: 'text-red-500',   bg: 'bg-red-50',     icon: AlertTriangle },
}

const PLAN_LABELS = { sip: 'SIP', lump_sum: 'Lump Sum' }

const inputCls =
  'w-full px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:bg-white transition-all placeholder-gray-300'

// ─── Goal Card ───────────────────────────────────────────────────
function GoalCard({ goal, onEdit }) {
  const pct         = Math.min(Math.round(goal.progressPr ?? 0), 100)
  const status      = STATUS_META[goal.status] || STATUS_META.on_track
  const StatusIcon  = status.icon
    //   const remaining   = Math.max((goal.targetCorpus ?? 0) - (goal.progressCorpus ?? 0), 0)
  const remaining = Math.max((goal.futureTargetCorpus ?? goal.targetCorpus ?? 0) - (goal.progressCorpus ?? 0), 0)
  const suggested   = goal.planType === 'sip' ? goal.suggestedSipMonthly : goal.suggestedLumpSum

  const barColor =
    goal.status === 'on_track'  ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
    : goal.status === 'off_track' ? 'bg-gradient-to-r from-amber-400 to-orange-400'
    : 'bg-gradient-to-r from-red-400 to-rose-500'

  const topBar =
    goal.status === 'on_track'  ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
    : goal.status === 'off_track' ? 'bg-gradient-to-r from-amber-400 to-orange-400'
    : 'bg-gradient-to-r from-red-400 to-rose-400'

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
      <div className={`h-1 w-full ${topBar}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="font-display text-[15px] font-semibold text-gray-900 truncate">{goal.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {fmtShort(goal.targetCorpus)} target · by {goal.horizonyear}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.bg} ${status.color}`}>
              <StatusIcon size={9} />
              {status.label}
            </span>
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 rounded-lg text-gray-300 hover:text-gray-700 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Edit3 size={13} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-display text-2xl font-bold text-gray-900">{pct}%</span>
            <span className="text-xs font-medium text-gray-400">{PLAN_LABELS[goal.planType]}</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Saved / Remaining */}
        <div className="flex items-center justify-between border-t border-gray-50 pt-3 mb-3">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Saved</p>
            <p className="text-sm font-semibold text-gray-900">₹{fmt(goal.progressCorpus)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-0.5">Remaining</p>
            <p className="text-sm font-semibold text-emerald-600">₹{fmt(remaining)}</p>
          </div>
        </div>

        {/* Future Target Info - Subtle Awareness */}
        {goal.futureTargetCorpus && goal.futureTargetCorpus > 0 && (
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2 mb-2">
            <Info size={12} className="text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-500">
              Future Target:{' '}
              <span className="font-semibold text-gray-800">
                ₹{fmt(goal.futureTargetCorpus)}
              </span>
              {' '}(adjusted for inflation)
            </p>
          </div>
        )}

        {/* Recommended SIP/Lump Sum */}
        {suggested > 0 && (
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2">
            <Info size={12} className="text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-500">
              Recommended:{' '}
              <span className="font-semibold text-gray-800">
                ₹{fmt(suggested)}{goal.planType === 'sip' ? '/month' : ' lump sum'}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Form Field wrapper ──────────────────────────────────────────
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

// ─── Create / Edit Modal ─────────────────────────────────────────
function GoalModal({ goal, onClose, onSaved }) {
  const isEdit = !!goal?._id
  const [form, setForm] = useState({
    name:              goal?.name              ?? '',
    targetCorpus:      goal?.targetCorpus      ?? '',
    horizonyear:       goal?.horizonyear       ?? '',
    excpectedReturnPr: goal?.excpectedReturnPr ?? '',
    inflationPr:       goal?.inflationPr       ?? '',
    planType:          goal?.planType          ?? 'sip',
    progressCorpus:    goal?.progressCorpus    ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name || !form.targetCorpus || !form.horizonyear || !form.excpectedReturnPr || !form.inflationPr) {
      setError('Please fill all required fields.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        targetCorpus:      Number(form.targetCorpus),
        horizonyear:       Number(form.horizonyear),
        excpectedReturnPr: Number(form.excpectedReturnPr),
        inflationPr:       Number(form.inflationPr),
        progressCorpus:    Number(form.progressCorpus) || 0,
      }

      const { data } = isEdit
        ? await API.patch(`/goals/${goal._id}`, payload)
        : await API.post('/goals', payload)

      if (!data.success) throw new Error(data.message)
      onSaved()
      onClose()
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Target size={14} color="white" />
            </div>
            <h2 className="font-display text-base font-semibold text-gray-900">
              {isEdit ? 'Edit Goal' : 'New Goal'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Fields */}
        <div className="px-6 py-5 space-y-4">
          <Field label="Goal Name" icon={Target}>
            <input
              className={inputCls}
              placeholder="e.g. Emergency Fund, Child Education…"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Target Amount (₹)" icon={IndianRupee}>
              <input className={inputCls} type="number" placeholder="1000000"
                value={form.targetCorpus} onChange={(e) => set('targetCorpus', e.target.value)} />
            </Field>
            <Field label="Target Year" icon={Calendar}>
              <input className={inputCls} type="number" placeholder="2030"
                value={form.horizonyear} onChange={(e) => set('horizonyear', e.target.value)} />
            </Field>
            <Field label="Expected Return %" icon={TrendingUp}>
              <input className={inputCls} type="number" placeholder="12"
                value={form.excpectedReturnPr} onChange={(e) => set('excpectedReturnPr', e.target.value)} />
            </Field>
            <Field label="Inflation %" icon={Percent}>
              <input className={inputCls} type="number" placeholder="6"
                value={form.inflationPr} onChange={(e) => set('inflationPr', e.target.value)} />
            </Field>
          </div>

          <Field label="Plan Type" icon={Layers}>
            <div className="grid grid-cols-2 gap-2">
              {['sip', 'lump_sum'].map((pt) => (
                <button
                  key={pt}
                  onClick={() => set('planType', pt)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    form.planType === pt
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {pt === 'sip' ? 'SIP (Monthly)' : 'Lump Sum'}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Amount Already Saved (₹)" icon={BarChart2}>
            <input className={inputCls} type="number" placeholder="0"
              value={form.progressCorpus} onChange={(e) => set('progressCorpus', e.target.value)} />
          </Field>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-xs px-3 py-2.5 rounded-xl border border-red-100">
              <AlertTriangle size={13} /> {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 px-6 pb-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Goal'}
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
        <Target size={26} className="text-gray-400" />
      </div>
      <h3 className="font-display text-lg font-semibold text-gray-900 mb-1">
        {filtered ? 'No goals found' : 'No goals yet'}
      </h3>
      <p className="text-sm text-gray-400 max-w-xs mb-6">
        {filtered
          ? 'Try adjusting your search or filters.'
          : 'Set your first financial goal and start tracking your progress toward it.'}
      </p>
      {!filtered && (
        <button onClick={onAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors">
          <Plus size={15} /> Create First Goal
        </button>
      )}
    </div>
  )
}

// ─── Summary Bar ─────────────────────────────────────────────────
function SummaryBar({ goals }) {
  if (!goals.length) return null

  const total       = goals.length
  const onTrack     = goals.filter((g) => g.status === 'on_track').length
  const atRisk      = goals.filter((g) => g.status === 'at_risk').length
  const totalSaved  = goals.reduce((s, g) => s + (g.progressCorpus ?? 0), 0)
  const totalTarget = goals.reduce((s, g) => s + (g.futureTargetCorpus   ?? 0), 0)

  const items = [
    { label: 'Total Goals',  value: total,               icon: Target,       color: 'text-gray-900'    },
    { label: 'On Track',     value: onTrack,             icon: CheckCircle2, color: 'text-emerald-600' },
    { label: 'At Risk',      value: atRisk,              icon: Flame,        color: 'text-red-500'     },
    { label: 'Total Saved',  value: fmtShort(totalSaved),  icon: IndianRupee,  color: 'text-gray-900'  },
    { label: 'Total Target', value: fmtShort(totalTarget), icon: BarChart2,    color: 'text-gray-900'  },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {items.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon size={15} className={color} />
          </div>
          <div>
            <p className="text-xs text-gray-400">{label}</p>
            <p className={`text-sm font-bold ${color}`}>{value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────
export default function GoalsModule() {
  const [goals,       setGoals]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [search,      setSearch]      = useState('')
  const [typeFilter,  setTypeFilter]  = useState('')
  const [page,        setPage]        = useState(1)
  const [totalPages,  setTotalPages]  = useState(1)
  const [total,       setTotal]       = useState(0)

  const debounceRef = useRef(null)

  const fetchGoals = async (p, s, t) => {
    setLoading(true)
    try {
      const params = { page: p, limit: 6 }
      if (s) params.search = s
      if (t) params.type   = t

      const { data } = await API.get('/goals', { params })

      if (data.success) {
        setGoals(data.data)
        setTotalPages(data.totalPage)
        setTotal(data.total)
      }
    } catch (e) {
      console.error('fetchGoals:', e.response?.data || e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchGoals(1, search, typeFilter)
  }, [typeFilter])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      fetchGoals(1, search, typeFilter)
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [search])

  useEffect(() => {
    fetchGoals(page, search, typeFilter)
  }, [page])

  const openAdd     = ()  => { setEditingGoal(null); setModalOpen(true) }
  const openEdit    = (g) => { setEditingGoal(g);    setModalOpen(true) }
  const handleSaved = ()  => { setPage(1); fetchGoals(1, search, typeFilter) }

  const isFiltered = !!(search || typeFilter)

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Goals</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {total > 0
              ? `${total} goal${total !== 1 ? 's' : ''} tracked`
              : 'Plan and track your financial goals'}
          </p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 self-start sm:self-auto">
          <Plus size={15} /> New Goal
        </button>
      </div>

      {/* Summary */}
      <SummaryBar goals={goals} />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-colors placeholder-gray-300"
            placeholder="Search goals…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {[{ v: '', l: 'All' }, { v: 'sip', l: 'SIP' }, { v: 'lump_sum', l: 'Lump Sum' }].map(({ v, l }) => (
            <button key={v} onClick={() => setTypeFilter(v)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-xl border transition-all ${
                typeFilter === v
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin text-gray-400" />
        </div>
      ) : goals.length === 0 ? (
        <EmptyState onAdd={openAdd} filtered={isFiltered} />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {goals.map((g) => (
              <GoalCard key={g._id} goal={g} onEdit={openEdit} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
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
        </>
      )}

      {/* Modal */}
      {modalOpen && (
        <GoalModal
          goal={editingGoal}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}