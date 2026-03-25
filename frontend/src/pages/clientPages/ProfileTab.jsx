import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  User, Users, Wallet, Edit3, ShieldCheck, CheckCircle2,
  TrendingUp, Loader2, X, ChevronLeft, ArrowRight, Shield
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useProfile } from '../../context/ProfileContext'
import { profileSchema } from '../../lib/schemas'
import API from '../../services/api'

// ── Constants ────────────────────────────────────────────────────────────────
const QUESTION_LABELS = [
  "Investment Horizon",
  "Loss Tolerance",
  "Return vs Risk",
  "Experience Level",
]

const RISK_QUESTIONS = [
  {
    title: "Investment Horizon",
    subtitle: "How long can you keep your money invested?",
    icon: "⏳",
    options: [
      { value: 1, label: "Less than 1 year", desc: "Short-term liquidity needed" },
      { value: 2, label: "1-3 years",         desc: "Medium-term planning" },
      { value: 3, label: "3-7 years",         desc: "Long-term growth focus" },
      { value: 4, label: "7+ years",          desc: "Maximum compounding horizon" },
    ]
  },
  {
    title: "Loss Tolerance",
    subtitle: "If your portfolio drops 20%, you would:",
    icon: "📉",
    options: [
      { value: 1, label: "Sell everything",  desc: "Preserve capital at all costs" },
      { value: 2, label: "Sell some assets", desc: "Reduce exposure gradually" },
      { value: 3, label: "Hold and wait",    desc: "Stay the course" },
      { value: 4, label: "Buy more",         desc: "Opportunity to double down" },
    ]
  },
  {
    title: "Return vs Risk",
    subtitle: "Your investment priority is:",
    icon: "⚖️",
    options: [
      { value: 1, label: "Capital safety first",  desc: "Minimize any chance of loss" },
      { value: 2, label: "Stable steady returns", desc: "Predictable modest growth" },
      { value: 3, label: "Balanced growth",       desc: "Accept some risk for reward" },
      { value: 4, label: "Maximum returns",       desc: "High risk, high reward" },
    ]
  },
  {
    title: "Experience Level",
    subtitle: "Your investing experience:",
    icon: "🎓",
    options: [
      { value: 1, label: "Complete beginner", desc: "Never invested before" },
      { value: 2, label: "Some experience",   desc: "Basic stocks or mutual funds" },
      { value: 3, label: "Experienced",       desc: "Diverse portfolio management" },
      { value: 4, label: "Expert",            desc: "Advanced derivatives & strategy" },
    ]
  }
]

// ── Helpers ──────────────────────────────────────────────────────────────────
const getRiskInfo = (score) => {
  if (score <= 5) return { label: 'Conservative', color: 'text-green-600', stroke: '#22c55e', bar: 'bg-green-500', text: 'text-green-600' }
  if (score <= 8) return { label: 'Moderate',     color: 'text-amber-600', stroke: '#f59e0b', bar: 'bg-amber-500', text: 'text-amber-600' }
  return              { label: 'Aggressive',   color: 'text-red-600',   stroke: '#ef4444', bar: 'bg-red-500',   text: 'text-red-600'   }
}

const getSegmentColor = (value) => {
  if (value <= 1)  return 'bg-red-400'
  if (value === 2) return 'bg-orange-400'
  if (value === 3) return 'bg-yellow-400'
  return 'bg-green-500'
}

// ── StatItem ─────────────────────────────────────────────────────────────────
const StatItem = ({ label, value, icon: Icon }) => (
  <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
        <Icon size={18} />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
    </div>
    <div className="font-display text-3xl font-bold text-gray-900">{value}</div>
  </div>
)

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditProfileModal({ profileData, onClose, onSaved }) {
  const [step, setStep] = useState(0)
  const [riskAnswers, setRiskAnswers] = useState(
    profileData?.riskAnswer?.length === 4 ? [...profileData.riskAnswer] : [0, 0, 0, 0]
  )
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      age:           profileData?.age           ?? '',
      dependents:    profileData?.dependents    ?? '',
      incomeMonthly: profileData?.incomeMonthly ?? '',
    }
  })

  const step0Data    = watch(['age', 'dependents', 'incomeMonthly'])
  const isStep0Valid = step0Data.every(v => v !== undefined && v !== '' && Number(v) >= 0)

  const currentQ = step > 0 ? RISK_QUESTIONS[step - 1] : null

  const handleRiskSelect = (index, value) => {
    const next = [...riskAnswers]
    next[index] = value
    setRiskAnswers(next)
    setTimeout(() => { if (step < 4) setStep(s => s + 1) }, 280)
  }

  const previewScore  = riskAnswers.reduce((a, b) => a + b, 0)
  const previewRisk   = getRiskInfo(previewScore)
  const previewPct    = Math.round((previewScore / 16) * 100)

  const onSubmit = async (formValues) => {
    setSubmitting(true)
    const payload = {
      age:           Number(formValues.age),
      dependents:    Number(formValues.dependents),
      incomeMonthly: Number(formValues.incomeMonthly),
      riskScore:     previewScore, // Backend recalculates this, but we send it
      answers:       riskAnswers,
    }
    try {
      // Backend route: PATCH /api/profile
      const res = await API.patch('/profile', payload)
      
      if (res.data.success) {
        await onSaved(); // Triggers checkProfile() in Context to refresh data
        toast.success('Profile updated!')
        onClose()
      } else {
        toast.error(res.data.message || "Update failed")
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to update profile')
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      {/* backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* drawer / modal */}
      <div
        className="relative bg-white w-full sm:max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden"
        style={{ animation: 'editModalIn 0.28s cubic-bezier(0.34,1.2,0.64,1) both' }}
      >
        <style>{`
          @keyframes editModalIn {
            from { opacity: 0; transform: translateY(40px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0)   scale(1);     }
          }
        `}</style>

        {/* top accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-gray-900 via-gray-600 to-gray-400" />

        {/* header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-none">Edit Profile</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                Step {step + 1} of 5
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* progress bar */}
        <div className="flex gap-1.5 px-8 py-3">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-400 ${step >= i ? 'bg-gray-900' : 'bg-gray-100'}`}
            />
          ))}
        </div>

        {/* body — scrollable on small screens */}
        <div className="px-8 pb-8 pt-4 max-h-[70vh] overflow-y-auto">

          {/* ── Step 0: Financial Basics ── */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="text-center mb-2">
                <div className="inline-flex items-center justify-center w-11 h-11 bg-gray-50 rounded-2xl mb-3 text-xl">🏠</div>
                <h4 className="font-display text-2xl font-bold text-gray-900">Financial Basics</h4>
                <p className="text-sm text-gray-400 mt-1">Update your core financial details.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Current Age</label>
                <input
                  type="number"
                  {...register('age')}
                  className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-gray-900 outline-none transition-all text-sm"
                  placeholder="25"
                />
                {errors.age && <p className="text-red-500 text-xs">{errors.age.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Dependents</label>
                  <input
                    type="number"
                    {...register('dependents')}
                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-gray-900 outline-none transition-all text-sm"
                    placeholder="0"
                  />
                  {errors.dependents && <p className="text-red-500 text-xs">{errors.dependents.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Monthly Income (₹)</label>
                  <input
                    type="number"
                    {...register('incomeMonthly')}
                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-gray-900 outline-none transition-all text-sm"
                    placeholder="50000"
                  />
                  {errors.incomeMonthly && <p className="text-red-500 text-xs">{errors.incomeMonthly.message}</p>}
                </div>
              </div>

              <button
                onClick={() => setStep(1)}
                disabled={!isStep0Valid}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-20 transition-all shadow-lg mt-2"
              >
                Continue to Risk Profile <ArrowRight size={17} />
              </button>
            </div>
          )}

          {/* ── Steps 1–4: Risk Questions ── */}
          {step > 0 && step <= 4 && (
            <div className="space-y-5">
              <div className="text-center mb-2">
                <div className="inline-flex items-center justify-center w-11 h-11 bg-gray-50 rounded-2xl mb-3 text-xl">
                  {currentQ.icon}
                </div>
                <h4 className="font-display text-2xl font-bold text-gray-900">{currentQ.title}</h4>
                <p className="text-sm text-gray-400 mt-1">{currentQ.subtitle}</p>
              </div>

              <div className="space-y-3">
                {currentQ.options.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleRiskSelect(step - 1, opt.value)}
                    className={`w-full p-4 text-left rounded-2xl border transition-all duration-150 ${
                      riskAnswers[step - 1] === opt.value
                        ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                        : 'border-gray-100 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className={`text-sm font-bold ${riskAnswers[step - 1] === opt.value ? 'text-gray-900' : 'text-gray-700'}`}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${
                        riskAnswers[step - 1] === opt.value ? 'bg-gray-900 scale-125' : 'bg-gray-100'
                      }`} />
                    </div>
                  </button>
                ))}
              </div>

              {/* Final step: preview + save */}
              {step === 4 && (
                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">New Persona</span>
                      <p className={`text-lg font-bold font-display mt-0.5 ${previewRisk.text}`}>{previewRisk.label}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-900">{previewPct}% Risk Intensity</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${previewRisk.bar} rounded-full transition-all duration-700`}
                      style={{ width: `${previewPct}%` }}
                    />
                  </div>

                  <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={submitting}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition-all shadow-xl"
                  >
                    {submitting
                      ? <Loader2 size={17} className="animate-spin" />
                      : <Shield size={17} />
                    }
                    {submitting ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── ProfileTab ────────────────────────────────────────────────────────────────
export default function ProfileTab() {
  const { profileData, loading, saveProfile } = useProfile()
  const [editOpen, setEditOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 size={36} className="animate-spin text-gray-300" />
        <p className="text-sm text-gray-400 italic">Loading profile…</p>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center px-6">
        <div className="w-14 h-14 bg-gray-50 rounded-3xl flex items-center justify-center text-2xl mb-2">🧭</div>
        <h3 className="text-lg font-bold text-gray-700">No profile yet</h3>
        <p className="text-sm text-gray-400 max-w-xs">Complete your wealth profile to unlock your investment persona.</p>
      </div>
    )
  }

  const { age = 0, dependents = 0, incomeMonthly = 0, riskScore = 0, riskAnswer = [] } = profileData
  const risk         = getRiskInfo(riskScore)
  const circumference = 2 * Math.PI * 80
  const dashOffset   = circumference - (circumference * (riskScore / 16))
  const riskPct      = Math.round((riskScore / 16) * 100)

  return (
    <>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 sm:space-y-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">Wealth Profile</h1>
            <p className="text-gray-500 mt-1 text-sm">Strategic overview of your investment persona.</p>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="self-start sm:self-auto flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-2xl hover:bg-gray-700 hover:-translate-y-0.5 transition-all shadow-xl"
          >
            <Edit3 size={16} /> Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          {/* Risk Score Circle */}
          <div className="lg:col-span-1 bg-white border border-gray-100 rounded-[2.5rem] p-8 sm:p-10 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 192 192">
                <circle cx="96" cy="96" r="80" stroke="#f3f4f6" strokeWidth="10" fill="transparent" />
                <circle
                  cx="96" cy="96" r="80"
                  stroke={risk.stroke}
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-display font-bold text-gray-900">{riskScore}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5">/ 16</span>
              </div>
            </div>

            <h3 className={`font-display text-2xl font-bold ${risk.color}`}>{risk.label}</h3>

            <div className="mt-3 w-full">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                <span>Risk Intensity</span>
                <span>{riskPct}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${risk.bar} rounded-full transition-all duration-1000`} style={{ width: `${riskPct}%` }} />
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4 leading-relaxed px-2">
              Your {risk.label.toLowerCase()} profile is shaped by your{' '}
              <span className="font-semibold text-gray-600">{age}-year</span> horizon and income levels.
            </p>
          </div>

          {/* Stats + Strategy */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              <StatItem label="Age"            value={`${age} yrs`}                                  icon={User}   />
              <StatItem label="Dependents"     value={dependents}                                    icon={Users}  />
              <StatItem label="Monthly Income" value={`₹${incomeMonthly.toLocaleString('en-IN')}`}   icon={Wallet} />
            </div>

            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 sm:p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-7">
                <TrendingUp size={20} className="text-gray-400" />
                <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-900">Strategy Breakdown</h3>
              </div>
              <div className="space-y-7">
                {QUESTION_LABELS.map((label, i) => {
                  const val = riskAnswer[i] ?? 0
                  return (
                    <div key={label} className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={15} className="text-gray-300 flex-shrink-0" />
                          <span className="text-sm font-bold text-gray-700">{label}</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Level {val}</span>
                      </div>
                      <div className="flex gap-1.5 h-2">
                        {[1, 2, 3, 4].map(n => (
                          <div
                            key={n}
                            className={`flex-1 rounded-full transition-all duration-500 ${n <= val ? getSegmentColor(val) : 'bg-gray-100'}`}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <EditProfileModal
          profileData={profileData}
          onClose={() => setEditOpen(false)}
          onSaved={saveProfile}
        />
      )}
    </>
  )
}