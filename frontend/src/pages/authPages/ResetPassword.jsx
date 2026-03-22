import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  TrendingUp, Lock, Eye, EyeOff, AlertCircle,
  ArrowRight, ChevronLeft, Loader2, CheckCircle2
} from 'lucide-react'
import API from '../../services/api.js'

/* ─── Schema ─────────────────────────────────────── */
import { resetSchema } from '../../lib/schemas.js'

/* ─── Field component (same as Login) ───────────── */
function Field({ label, id, icon: Icon, type = 'text', placeholder, register, error, rightSlot }) {
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
          id={id} type={type} placeholder={placeholder} {...register}
          className={`w-full py-3 pl-10 ${rightSlot ? 'pr-11' : 'pr-4'} text-sm text-gray-900 bg-gray-50 border rounded-xl
            placeholder:text-gray-300 font-sans focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200
            ${error
              ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
              : 'border-gray-200 focus:ring-gray-900/10 focus:border-gray-900'
            }`}
        />
        {rightSlot && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  )
}

/* ─── Password strength meter ────────────────────── */
function StrengthMeter({ password }) {
  if (!password) return null

  let score = 0
  if (password.length >= 8)        score++
  if (/[A-Z]/.test(password))      score++
  if (/[0-9]/.test(password))      score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors  = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500']

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-gray-200'}`}
          />
        ))}
      </div>
      {labels[score] && (
        <p className="text-xs text-gray-400 font-medium">{labels[score]}</p>
      )}
    </div>
  )
}

/* ─── Page ────────────────────────────────────────── */
export default function ResetPassword() {
  const { token } = useParams()           // raw token from email link
  const navigate  = useNavigate()
  const [showPassword, setShowPassword]   = useState(false)
  const [showConfirm,  setShowConfirm]    = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [serverError,   setServerError]   = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const passwordValue = watch('password')

  const handleReset = async (data) => {
    setServerError('')
    try {
      // Backend expects: POST /auth/reset-password/:token  body: { password }
      await API.post(`/auth/reset-password/${token}`, {
        password: data.password,
      })
      setSubmitSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Invalid or expired reset link. Please request a new one.'
      )
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex">

      {/* ── Left panel (desktop only) ─────────────── */}
      <div className="hidden lg:flex lg:w-[42%] bg-gray-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-white/5 pointer-events-none" />

        <Link to="/" className="flex items-center gap-2.5 z-10">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <TrendingUp size={16} color="white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-white text-[17px] font-bold tracking-tight">
            Wealth <span className="font-normal text-white/50">Planner</span>
          </span>
        </Link>

        <div className="z-10 space-y-6">
          <h2 className="font-display text-4xl font-bold text-white leading-tight">
            Create a new<br />
            <span className="italic font-normal text-white/50">secure password.</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Choose something strong. Your financial data deserves the best protection.
          </p>
          <div className="flex flex-col gap-3">
            {[
              'At least 8 characters long',
              'Mix uppercase & lowercase',
              'Include numbers or symbols',
            ].map((tip) => (
              <div key={tip} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <ArrowRight size={10} color="white" />
                </div>
                <span className="text-sm text-gray-400">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400">© 2026 Wealth Planner</p>
      </div>

      {/* ── Right panel (form) ────────────────────── */}
      <div className="flex-1 flex flex-col">

        <div className="flex lg:hidden items-center p-5">
          <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft size={16} /> Back to login
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[420px]">

            {/* Logo (mobile) */}
            <div className="flex lg:hidden items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} color="white" strokeWidth={2.5} />
              </div>
              <span className="font-display text-[17px] font-bold text-gray-900 tracking-tight">
                Wealth <span className="font-normal text-gray-500">Planner</span>
              </span>
            </div>

            {/* ── Success state ── */}
            {submitSuccess ? (
              <div className="flex flex-col items-center py-10 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                  <CheckCircle2 size={28} className="text-green-500" />
                </div>
                <div className="space-y-2">
                  <p className="font-display text-2xl font-bold text-gray-900">Password updated!</p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Your password has been reset successfully.<br />
                    Redirecting you to sign in in 3 seconds…
                  </p>
                </div>
                <Link to="/login"
                  className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
                  Sign In Now <ArrowRight size={16} />
                </Link>
              </div>

            ) : (
              /* ── Form state ── */
              <>
                <div className="mb-8">
                  <h1 className="font-display text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                    New password
                  </h1>
                  <p className="text-sm text-gray-500">Pick something strong and memorable.</p>
                </div>

                <form onSubmit={handleSubmit(handleReset)} noValidate className="space-y-5">

                  {/* Password field + strength meter */}
                  <div className="space-y-2">
                    <Field
                      label="New Password"
                      id="password"
                      icon={Lock}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      register={register('password')}
                      error={errors.password?.message}
                      rightSlot={
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-300 hover:text-gray-600 transition-colors p-0.5"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}>
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                    />
                    <StrengthMeter password={passwordValue} />
                  </div>

                  {/* Confirm password */}
                  <Field
                    label="Confirm Password"
                    id="confirmPassword"
                    icon={Lock}
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    register={register('confirmPassword')}
                    error={errors.confirmPassword?.message}
                    rightSlot={
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="text-gray-300 hover:text-gray-600 transition-colors p-0.5"
                        aria-label={showConfirm ? 'Hide' : 'Show'}>
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />

                  {/* Server error */}
                  {serverError && (
                    <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl space-y-1">
                      <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                        <AlertCircle size={12} /> {serverError}
                      </p>
                      <Link to="/forgot-password"
                        className="text-xs text-red-400 hover:text-red-600 underline">
                        Request a new reset link →
                      </Link>
                    </div>
                  )}

                  {/* Submit */}
                  <button type="submit" disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none transition-all duration-200 mt-2">
                    {isSubmitting
                      ? <><Loader2 size={16} className="animate-spin" /> Updating…</>
                      : <>Update Password <ArrowRight size={16} /></>
                    }
                  </button>

                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}