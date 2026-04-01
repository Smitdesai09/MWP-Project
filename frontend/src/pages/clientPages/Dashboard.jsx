import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Wallet, Target, PiggyBank, BarChart2, ArrowRight,
  CheckCircle2, AlertTriangle, ChevronRight,
  IndianRupee, PieChart as PieChartIcon
} from 'lucide-react'
import API from '../../services/api'

// ─── Formatters ──────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.abs(n ?? 0))

const fmtShort = (n) => {
  const abs = Math.abs(n ?? 0)
  const sign = n < 0 ? '-' : ''

  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)}Cr`
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)}L`
  if (abs >= 1e3) return `${sign}₹${(abs / 1e3).toFixed(1)}K`
  return `${sign}₹${fmt(n)}`
}

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const CATEGORY_COLORS = {
  income:  { text: 'text-emerald-600', bg: 'bg-emerald-50', icon: ArrowUpRight   },
  expense: { text: 'text-red-500',     bg: 'bg-red-50',     icon: ArrowDownRight },
}

const STATUS_META = {
  on_track: { label: 'On Track', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
  off_track: { label: 'Off Track', color: 'text-amber-600', bg: 'bg-amber-50',   icon: TrendingDown  },
  at_risk:   { label: 'At Risk',   color: 'text-red-500',   bg: 'bg-red-50',     icon: AlertTriangle },
}

// ─── Allocation Pie Chart (pure SVG) ────────────────────────────
function AllocationPie({ allocation, targetAllocation }) {
  const data = [
    { key: 'equity', label: 'Equity', color: '#1f2937', target: targetAllocation?.equity },
    { key: 'debt',   label: 'Debt',   color: '#6b7280', target: targetAllocation?.debt   },
    { key: 'gold',   label: 'Gold',   color: '#d97706', target: targetAllocation?.gold   },
    { key: 'other',  label: 'Other',  color: '#9ca3af', target: 0 },
  ].map(d => ({ ...d, value: allocation?.[d.key] ?? 0 }))

  const total = data.reduce((s, d) => s + d.value, 0)
  const isEmpty = total === 0

  const SIZE = 160
  const R = 58
  const CX = SIZE / 2
  const CY = SIZE / 2
  const stroke = 22

  let cumAngle = -90
  const slices = data.map((d) => {
    const pct   = isEmpty ? (100 / 4) : (d.value / total)
    const angle = pct * 360
    const start = cumAngle
    cumAngle   += angle

    const toRad = (deg) => (deg * Math.PI) / 180
    const x1 = CX + R * Math.cos(toRad(start))
    const y1 = CY + R * Math.sin(toRad(start))
    const x2 = CX + R * Math.cos(toRad(start + angle))
    const y2 = CY + R * Math.sin(toRad(start + angle))
    const large = angle > 180 ? 1 : 0

    const path =
      pct >= 0.999
        ? `M ${CX} ${CY - R} A ${R} ${R} 0 1 1 ${CX - 0.001} ${CY - R} Z`
        : `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`

    return { ...d, path, pct }
  })

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative flex-shrink-0">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
          {slices.map((s) => (
            <path
              key={s.key}
              d={s.path}
              fill="none"
              stroke={isEmpty ? '#e5e7eb' : s.color}
              strokeWidth={stroke}
              strokeLinecap="butt"
            />
          ))}
          <text x={CX} y={CY - 6} textAnchor="middle" fontSize="11" fill="#9ca3af" fontWeight="600">
            {isEmpty ? 'No Data' : 'Portfolio'}
          </text>
          <text x={CX} y={CY + 10} textAnchor="middle" fontSize="11" fill="#9ca3af" fontWeight="600">
            {isEmpty ? 'Yet' : 'Mix'}
          </text>
        </svg>
      </div>

      <div className="flex flex-col gap-2.5 w-full">
        {slices.map((d) => (
          <div key={d.key} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                style={{ background: isEmpty ? '#e5e7eb' : d.color }} 
              />
              <span className="text-xs font-medium text-gray-600 capitalize">{d.label}</span>
            </div>
            <div className="flex items-center gap-3 text-right">
              <span className={`text-sm font-bold ${isEmpty ? 'text-gray-400' : 'text-gray-900'}`}>
                {(isEmpty ? 0 : d.value)?.toFixed(1) ?? '0.0'}%
              </span>
              {d.target !== undefined && d.target > 0 && !isEmpty && (
                <span className="text-[10px] text-gray-400">target {d.target}%</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, accent = 'text-gray-900', loading }) {
  const strValue = String(value || '')
  const parts = strValue.split('₹')
  const hasRupee = parts.length === 2

  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center">
          <Icon size={14} className={accent} />
        </div>
      </div>
      {loading
        ? <div className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse mb-1" />
        : (
          <p className={`
            font-mono 
            text-[1.35rem] 
            leading-tight 
            font-semibold 
            tracking-tight 
            ${accent} 
            mb-0.5 
            whitespace-nowrap 
            overflow-hidden 
            text-ellipsis
          `}>
            {hasRupee ? (
              <>
                {parts[0]}₹<span className="ml-0.5">{parts[1]}</span>
              </>
            ) : (
              strValue
            )}
          </p>
        )
      }
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  )
}

// ─── Section Header ──────────────────────────────────────────────
function SectionHeader({ title, to }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display text-sm font-semibold text-gray-900 uppercase tracking-wider">{title}</h2>
      {to && (
        <Link to={to}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors group">
          View more <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

// ─── Main Dashboard ──────────────────────────────────────────────
export default function Dashboard() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/dashboard')
        if (res.data.success) setData(res.data.dashboard)
        else setError('Failed to load dashboard.')
      } catch (e) {
        setError(e.response?.data?.error || 'Something went wrong.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={22} className="text-red-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Failed to load</p>
          <p className="text-xs text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  const tx      = data?.transactions ?? {}
  const hold    = data?.holdings     ?? {}
  const goals   = data?.goals        ?? []
  const budgets = data?.budgets      ?? []

  const isGain     = (hold.totalGain ?? 0) >= 0
  const isBalance  = (tx.balance     ?? 0) >= 0

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 space-y-6">

      {/* ── Phase 1: Financial Flow (3 Cards) ─────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          label="Balance"
          value={loading ? '—' : `${isBalance ? '' : '-'}${fmtShort(tx.balance)}`}
          sub="Income − Expenses"
          icon={Wallet}
          accent={isBalance ? 'text-gray-900' : 'text-red-500'}
          loading={loading}
        />
        <StatCard
          label="Total Income"
          value={loading ? '—' : fmtShort(tx.totalIncome)}
          sub="All time"
          icon={TrendingUp}
          accent="text-emerald-600"
          loading={loading}
        />
        <StatCard
          label="Total Expense"
          value={loading ? '—' : fmtShort(tx.totalExpense)}
          sub="All time"
          icon={TrendingDown}
          accent="text-red-500"
          loading={loading}
        />
      </div>

      {/* ── Phase 2: Investment Health ─────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-4">
        
        {/* Left: Holdings Summary (3 Metrics) - FIXED SIZE & SPACING */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 flex flex-col">
          <SectionHeader title="Holdings Summary" to="/client/holdings" />
          
          {loading ? (
            <div className="space-y-4 flex-1">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : (
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              {/* Total Value */}
              <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between transition-all hover:shadow-sm">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900 font-mono tracking-tight">₹{fmt(hold.totalValue)}</p>
                </div>
                <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center">
                  <BarChart2 size={18} className="text-gray-600" />
                </div>
              </div>

              {/* Total Invested */}
              <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between transition-all hover:shadow-sm">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Total Invested</p>
                  <p className="text-2xl font-bold text-gray-900 font-mono tracking-tight">₹{fmt(hold.totalInvestment)}</p>
                </div>
                <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center">
                  <IndianRupee size={18} className="text-gray-600" />
                </div>
              </div>

              {/* Total Gain/Loss */}
              <div className={`p-4 rounded-xl flex items-center justify-between transition-all hover:shadow-sm ${isGain ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <div>
                  <p className={`text-xs font-medium mb-1 ${isGain ? 'text-emerald-600' : 'text-red-400'}`}>
                    Total {isGain ? 'Gain' : 'Loss'}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-2xl font-bold font-mono tracking-tight ${isGain ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isGain ? '+' : '-'}₹{fmt(hold.totalGain)}
                    </p>
                    <p className={`text-sm font-semibold ${isGain ? 'text-emerald-500' : 'text-red-400'}`}>
                      ({hold.totalPercentage}%)
                    </p>
                  </div>
                </div>
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${isGain ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  {isGain ? <TrendingUp size={18} className="text-emerald-600" /> : <TrendingDown size={18} className="text-red-500" />}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Allocation & Recommendations */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5 flex flex-col">
          <SectionHeader title="Allocation" />
          
          {loading ? (
            <div className="flex flex-col items-center gap-4 flex-1">
              <Skeleton className="w-40 h-40 !rounded-full" />
              <div className="w-full space-y-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <AllocationPie
                allocation={hold.allocation}
                targetAllocation={hold.targetAllocation}
              />

              {/* Recommendations */}
              <div className="mt-auto pt-5 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recommendations</p>
                <div className="space-y-2">
                  {(hold.recommendations ?? ['Portfolio is well aligned']).map((rec, i) => {
                    const isGood = rec.toLowerCase().includes('well aligned') || rec.toLowerCase().includes('aligned')
                    const isIncrease = rec.toLowerCase().startsWith('increase')
                    const isCategorize = rec.toLowerCase().includes('categorize')
                    const Icon = isGood ? CheckCircle2 : isCategorize ? PieChartIcon : isIncrease ? TrendingUp : TrendingDown
                    const color = isGood ? 'text-emerald-600 bg-emerald-50' : isCategorize ? 'text-gray-600 bg-gray-50' : isIncrease ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50'
                    return (
                      <div key={i} className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl ${color.split(' ')[1]}`}>
                        <Icon size={14} className={`${color.split(' ')[0]} flex-shrink-0 mt-0.5`} />
                        <p className="text-xs font-medium text-gray-700">{rec}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Phase 3: Planning (Goals & Budgets) ─────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">
        
        {/* Goals */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <SectionHeader title="Goals" to="/client/goals" />
          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-2">
                <Target size={18} className="text-gray-400" />
              </div>
              <p className="text-xs text-gray-400 mb-3">No goals set yet</p>
              <Link to="/client/goals" className="text-xs font-semibold text-gray-700 hover:text-gray-900 underline underline-offset-2 transition-colors">
                Create a goal →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map((g) => {
                const pct = Math.min(Math.round(g.progressPr ?? 0), 100)
                const status = STATUS_META[g.status] || STATUS_META.on_track
                const SIcon = status.icon
                return (
                  <div key={g._id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-800 truncate pr-2">{g.name}</p>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${status.bg} ${status.color}`}>
                        <SIcon size={8} />{status.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mb-1.5">
                      <div
                        className={`h-full rounded-full ${
                          g.status === 'on_track' ? 'bg-emerald-500' : g.status === 'off_track' ? 'bg-amber-400' : 'bg-red-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between">
                      <p className="text-[11px] text-gray-400">{pct}% complete</p>
                      <p className="text-[11px] text-gray-400">by {g.horizonyear} yrs</p>
                    </div>
                  </div>
                )
              })}
              <Link to="/client/goals" className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors border border-dashed border-gray-200">
                View all goals <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>

        {/* Budgets */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <SectionHeader title="Budgets" to="/client/budget" />
          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-2">
                <PiggyBank size={18} className="text-gray-400" />
              </div>
              <p className="text-xs text-gray-400 mb-3">No budgets set yet</p>
              <Link to="/client/budget" className="text-xs font-semibold text-gray-700 hover:text-gray-900 underline underline-offset-2 transition-colors">
                Create a budget →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {budgets.map((b) => {
                const spent = b.spent ?? 0
                const limit = b.limit ?? 0
                
                const pct = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0
                const over = pct >= 100
                const warn = pct >= 80
                
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                const monthLabel = monthNames[(b.month ?? 1) - 1] || ''
                
                return (
                  <div key={b._id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-gray-800 truncate">{b.category || 'N/A'}</p>
                        <span className="text-[10px] text-gray-400 font-medium">{monthLabel} {b.year}</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${over ? 'bg-red-50 text-red-500' : warn ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mb-1.5">
                      <div
                        className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : warn ? 'bg-amber-400' : 'bg-emerald-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between">
                      <p className="text-[11px] text-gray-400">₹{fmt(spent)} spent</p>
                      <p className="text-[11px] text-gray-400">₹{fmt(limit)} limit</p>
                    </div>
                  </div>
                )
              })}
              <Link to="/client/budget" className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors border border-dashed border-gray-200">
                View all budgets <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Phase 4: Recent Transactions (Table Layout) ─────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <SectionHeader title="Recent Transactions" to="/client/transactions" />
        
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 flex-shrink-0 !rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-2.5 w-1/3" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : tx.recent?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-2">
              <ArrowUpRight size={18} className="text-gray-400" />
            </div>
            <p className="text-xs text-gray-400">No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-2">Type</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-2">Category</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-2">Title</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-2">Date</th>
                  <th className="text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(tx.recent ?? []).map((t) => {
                  const meta = CATEGORY_COLORS[t.type] || CATEGORY_COLORS.expense
                  const Icon = meta.icon
                  const description = t.title || t.notes || '-'
                  return (
                    <tr key={t._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${meta.bg}`}>
                          <Icon size={14} className={meta.text} />
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-medium text-gray-700">{t.category || 'N/A'}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-gray-500 truncate max-w-[200px] block">{description}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-gray-400">{fmtDate(t.date)}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {t.type === 'income' ? '+' : '-'}₹{fmt(t.amount)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}