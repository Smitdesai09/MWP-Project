import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  TrendingUp, Mail, Lock, Eye, EyeOff,
  AlertCircle, ArrowRight, ChevronLeft, Loader2
} from 'lucide-react'
import { loginSchema } from '../lib/schemas.js'

/* ─── Field component ────────────────────────────── */
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
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
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

/* ─── Page ────────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const onSubmit = async (data) => {
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500))
    console.log('Login payload:', data)
    setSubmitSuccess(true)
    setTimeout(() => navigate('/'), 1200)
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex">

      {/* ── Left panel (desktop only) ────────────────── */}
      <div className="hidden lg:flex lg:w-[42%] bg-gray-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
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
            Welcome back<br />
            <span className="italic font-normal text-white/50">to your finances.</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Track every rupee, plan every goal, and watch your wealth grow — all in one place.
          </p>

          {/* Mini feature chips */}
          <div className="flex flex-col gap-3">
            {[
              'Portfolio & goal tracking',
              'Expert advisor guidance',
              'Smart SIP calculators',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <ArrowRight size={10} color="white" />
                </div>
                <span className="text-sm text-gray-400">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400">© 2026 Wealth Planner</p>
      </div>

      {/* ── Right panel (form) ────────────────────────── */}
      <div className="flex-1 flex flex-col">

        {/* Mobile back link */}
        <div className="flex lg:hidden items-center p-5">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft size={16} /> Back to home
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

            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-gray-900 mb-2 tracking-tight">Sign in</h1>
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-gray-900 font-semibold hover:underline">
                  Create one free
                </Link>
              </p>
            </div>

            {submitSuccess ? (
              <div className="flex flex-col items-center py-10 gap-3">
                <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900">Signed in successfully!</p>
                <p className="text-xs text-gray-400">Redirecting to dashboard…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

                <Field
                  label="Email Address"
                  id="email"
                  icon={Mail}
                  type="email"
                  placeholder="you@example.com"
                  register={register('email')}
                  error={errors.email?.message}
                />

                <Field
                  label="Password"
                  id="password"
                  icon={Lock}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  register={register('password')}
                  error={errors.password?.message}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-300 hover:text-gray-600 transition-colors p-0.5"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />

                {/* Remember me + forgot */}
                {/* <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      {...register('rememberMe')}
                      className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                    />
                    <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-gray-500 hover:text-gray-900 hover:underline transition-colors">
                    Forgot password?
                  </a>
                </div> */}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none transition-all duration-200 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign In <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* Divider */}
                {/* <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-300 font-medium">or continue with</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div> */}

                {/* Social stub */}
                {/* <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2.5 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  <svg viewBox="0 0 24 24" width="17" height="17">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button> */}
              </form>
            )}
          </div>
        </div>

       
      </div>
    </div>
  )
}
