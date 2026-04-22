import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import {
  TrendingUp, User, Mail, Lock, Eye, EyeOff,
  AlertCircle, ArrowRight, ChevronLeft, Loader2,
  ShieldCheck, CheckCircle2, Briefcase
} from 'lucide-react'
import { registerSchema } from '../../lib/schemas.js'
import API from '../../services/api.js'

function getStrength(password) {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const map = [
    { label: '', color: '' },
    { label: 'Weak', color: '#f87171' },
    { label: 'Fair', color: '#fb923c' },
    { label: 'Good', color: '#facc15' },
    { label: 'Strong', color: '#4ade80' },
  ]
  return { score, ...map[score] }
}



function Field({ label, id, icon: Icon, type = 'text', placeholder, register, error, rightSlot, hint }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          {...register}
          className={`
            w-full py-3 pl-10 ${rightSlot ? 'pr-11' : 'pr-4'}
            text-sm text-gray-900 bg-gray-50 border rounded-xl
            placeholder:text-gray-300 font-sans
            focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200
            ${error
              ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
              : 'border-gray-200 focus:ring-gray-900/10 focus:border-gray-900'
            }
          `}
        />
        {rightSlot && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  )
}

function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
      <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-400" />
      <span>{message}</span>
    </div>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  // const [role, setRole] = useState('client')
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', agreeTerms: false },
  })

  const passwordValue = watch('password', '')
  const strength = getStrength(passwordValue)

  const passwordRules = [
    { label: 'At least 8 characters', pass: passwordValue.length >= 8 },
    { label: 'One uppercase letter', pass: /[A-Z]/.test(passwordValue) },
    { label: 'One number', pass: /[0-9]/.test(passwordValue) },
  ]

  const handleRegister = async (data) => {
    setServerError('')
    try {
      await API.post('/auth/register', {
        name: data.fullName,
        email: data.email,
        password: data.password,
        role: 'client'
      })
      toast.success('Account created! Welcome aboard 🎉')
      setTimeout(() => navigate('/login'), 1000)
    } catch (error) {
      const msg = error.response?.data?.message
      setServerError(msg || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex">

      {/* ── Left panel ───────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[42%] bg-gray-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/3 -left-20 w-52 h-52 rounded-full bg-white/[0.03] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-white/5 pointer-events-none" />

        <Link to="/" className="flex items-center gap-2.5 z-10">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <TrendingUp size={16} color="white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-white text-[17px] font-bold tracking-tight">
            Wealth <span className="font-normal text-white/50">Planner</span>
          </span>
        </Link>

        <div className="z-10 space-y-7">
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-3">
            Start your journey<br />
            <span className="italic font-normal text-white/50">to financial clarity.</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Join thousands of Indians who've taken charge of their wealth with smart, simple tools.
          </p>
        </div>

        <p className="text-xs text-gray-400">© 2026 Wealth Planner</p>
      </div>

      {/* ── Right panel ──────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-y-auto">

        <div className="flex lg:hidden items-center justify-between p-5">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft size={16} /> Back
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center">
              <TrendingUp size={12} color="white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-sm font-bold text-gray-900">MyWealthPlanner</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-[420px]">

            <div className="mb-7">
              <h1 className="font-display text-3xl font-bold text-gray-900 mb-2 tracking-tight">Create account</h1>
              <p className="text-sm text-gray-500">
                Already have one?{' '}
                <Link to="/login" className="text-gray-900 font-semibold hover:underline">
                  Sign in instead
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit(handleRegister)} noValidate className="space-y-4">

              <ErrorBanner message={serverError} />

              <Field
                label="Full Name"
                id="fullName"
                icon={User}
                placeholder="Arjun Mehta"
                register={register('fullName')}
                error={errors.fullName?.message}
              />

              <Field
                label="Email Address"
                id="email"
                icon={Mail}
                type="email"
                placeholder="you@example.com"
                register={register('email')}
                error={errors.email?.message}
              />

              {/* Password with strength meter */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
                    <Lock size={16} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    {...register('password')}
                    className={`
                      w-full py-3 pl-10 pr-11 text-sm text-gray-900 bg-gray-50
                      border rounded-xl placeholder:text-gray-300 font-sans
                      focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200
                      ${errors.password
                        ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
                        : 'border-gray-200 focus:ring-gray-900/10 focus:border-gray-900'}
                    `}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {passwordValue && (
                  <div className="pt-1 space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{ background: i <= strength.score ? strength.color : '#e5e7eb' }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3">
                        {passwordRules.map((r) => (
                          <span key={r.label} className={`text-[10px] flex items-center gap-1 ${r.pass ? 'text-green-500' : 'text-gray-300'}`}>
                            <CheckCircle2 size={9} /> {r.label}
                          </span>
                        ))}
                      </div>
                      {strength.label && (
                        <span className="text-xs font-semibold" style={{ color: strength.color }}>
                          {strength.label}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                    <AlertCircle size={12} /> {errors.password.message}
                  </p>
                )}
              </div>

              <Field
                label="Confirm Password"
                id="confirmPassword"
                icon={ShieldCheck}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password"
                register={register('confirmPassword')}
                error={errors.confirmPassword?.message}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="text-gray-300 hover:text-gray-600 transition-colors p-0.5"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              {/* Terms */}
              <div className="space-y-1">
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    {...register('agreeTerms')}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer flex-shrink-0"
                  />
                  <span className="text-sm text-gray-500 leading-snug group-hover:text-gray-700 transition-colors">
                    I agree to the{' '}
                    <a href="#" className="text-gray-900 font-semibold hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-gray-900 font-semibold hover:underline">Privacy Policy</a>
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium ml-6">
                    <AlertCircle size={12} /> {errors.agreeTerms.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none transition-all duration-200 mt-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight size={16} />
                  </>
                )}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}