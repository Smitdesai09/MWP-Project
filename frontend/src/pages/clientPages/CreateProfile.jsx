import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowRight, Shield, Loader2, ChevronLeft
} from 'lucide-react'
import toast from 'react-hot-toast'
import { profileSchema } from '../../lib/schemas'
import { useProfile } from '../../context/ProfileContext'
import API from '../../services/api'

// ── Risk Questions ─────────────────────────────────────────────────────────
const RISK_QUESTIONS = [
  {
    id: 1,
    title: "Investment Horizon",
    subtitle: "How long can you keep your money invested?",
    icon: "⏳",
    options: [
      { value: 1, label: "Less than 1 year",  desc: "Short-term liquidity needed" },
      { value: 2, label: "1–3 years",          desc: "Medium-term planning" },
      { value: 3, label: "3–7 years",          desc: "Long-term growth focus" },
      { value: 4, label: "7+ years",           desc: "Maximum compounding horizon" },
    ]
  },
  {
    id: 2,
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
    id: 3,
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
    id: 4,
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

export default function CreateProfile() {
  const navigate = useNavigate()
  const { profileData, saveProfile } = useProfile()

  const [step, setStep] = useState(0)
  const [riskAnswers, setRiskAnswers] = useState([0, 0, 0, 0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    mode: "onChange"
  })

  useEffect(() => {
    if (profileData) {
      reset({
        age:           profileData.age,
        dependents:    profileData.dependents,
        incomeMonthly: profileData.incomeMonthly,
      })
      if (profileData.riskAnswer) setRiskAnswers(profileData.riskAnswer)
    }
  }, [profileData, reset])

  const step0Data = watch(['age', 'dependents', 'incomeMonthly'])
  const isStep0Valid = step0Data.every(val => val !== undefined && val !== "" && val >= 0)

  // FIX: Check if all questions have been answered (no zeros allowed)
  const isRiskValid = riskAnswers.every(ans => ans >= 1 && ans <= 4)

  const handleRiskSelection = (index, value) => {
    const newAnswers = [...riskAnswers]
    newAnswers[index] = value
    setRiskAnswers(newAnswers)
    
    // Auto-advance logic
    setTimeout(() => {
      if (step < 4) setStep(s => s + 1)
    }, 280)
  }

  const calculateRisk = () => {
    const score = riskAnswers.reduce((a, b) => a + b, 0)
    if (score <= 5)  return { label: 'Conservative', color: 'bg-green-500', text: 'text-green-600' }
    if (score <= 8)  return { label: 'Moderate',     color: 'bg-amber-500', text: 'text-amber-600' }
    return               { label: 'Aggressive',   color: 'bg-red-500',   text: 'text-red-600'   }
  }

  const riskInfo = calculateRisk()

  const onSubmit = async (formValues) => {
    // FIX: Double check validity before sending
    if (!isRiskValid) {
      toast.error("Please answer all questions.")
      return
    }

    setIsSubmitting(true)

    const payload = {
      age:           Number(formValues.age),
      dependents:    Number(formValues.dependents),
      incomeMonthly: Number(formValues.incomeMonthly),
      answers:       riskAnswers, // Backend expects array of 1-4
    }

    try {
      let res
      if (profileData) {
        res = await API.put('/profile', payload)
      } else {
        res = await API.post('/profile', payload)
      }

      if (res.data.success) {
        await saveProfile()
        toast.success(profileData ? "Profile updated!" : "Profile created!")
        navigate('/client/dashboard')
      } else {
        toast.error(res.data.message || "Failed to save")
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to save profile'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentQ = step > 0 ? RISK_QUESTIONS[step - 1] : null

  return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col items-center justify-center px-6 py-12">

      {/* Progress Bar */}
      <div className="w-full max-w-xl mb-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => step > 0 && setStep(step - 1)}
            className={`flex items-center gap-1 text-sm font-medium transition-colors ${
              step === 0 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-gray-900'
            }`}
          >
            <ChevronLeft size={16} /> Back
          </button>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
            Step {step + 1} of 5
          </span>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                step >= i ? 'bg-gray-900' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-xl bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm">

        {step === 0 ? (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 rounded-2xl mb-4 text-xl">🏠</div>
              <h2 className="font-display text-3xl font-bold text-gray-900">Financial Basics</h2>
              <p className="text-gray-500 text-sm mt-2">Let's set the foundation for your wealth plan.</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Current Age</label>
                <input
                  type="number"
                  {...register('age')}
                  className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-gray-900 outline-none transition-all font-sans"
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
                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-gray-900 outline-none transition-all"
                    placeholder="0"
                  />
                  {errors.dependents && <p className="text-red-500 text-xs">{errors.dependents.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Monthly Income (₹)</label>
                  <input
                    type="number"
                    {...register('incomeMonthly')}
                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-gray-900 outline-none transition-all"
                    placeholder="50000"
                  />
                  {errors.incomeMonthly && <p className="text-red-500 text-xs">{errors.incomeMonthly.message}</p>}
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(1)}
              disabled={!isStep0Valid}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-20 transition-all shadow-xl"
            >
              Continue to Risk Profile <ArrowRight size={18} />
            </button>
          </div>

        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 rounded-2xl mb-4 text-xl">
                {currentQ.icon}
              </div>
              <h2 className="font-display text-3xl font-bold text-gray-900">{currentQ.title}</h2>
              <p className="text-gray-500 text-sm mt-2">{currentQ.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {currentQ.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleRiskSelection(step - 1, opt.value)}
                  className={`w-full p-5 text-left rounded-2xl border transition-all duration-200 ${
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
                    <div className={`w-2 h-2 rounded-full transition-all ${
                      riskAnswers[step - 1] === opt.value ? 'bg-gray-900 scale-125' : 'bg-gray-100'
                    }`} />
                  </div>
                </button>
              ))}
            </div>

            {step === 4 && (
              <div className="pt-8 border-t border-gray-100">
                <div className="flex justify-between items-end mb-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Calculated Persona</span>
                    <p className={`text-lg font-display font-bold ${riskInfo.text}`}>{riskInfo.label}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-900">
                    {Math.round((riskAnswers.reduce((a, b) => a + b, 0) / 16) * 100)}% Risk Intensity
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-out ${riskInfo.color}`}
                    style={{ width: `${(riskAnswers.reduce((a, b) => a + b, 0) / 16) * 100}%` }}
                  />
                </div>

                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting || !isRiskValid} // FIX: Disable if not all answered
                  className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting
                    ? <Loader2 size={18} className="animate-spin" />
                    : <Shield size={18} />
                  }
                  {isSubmitting ? 'Saving…' : 'Complete My Wealth Profile'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}