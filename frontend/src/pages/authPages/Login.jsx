import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import {
  TrendingUp, Mail, Lock, Eye, EyeOff,
  AlertCircle, ArrowRight, ChevronLeft, Loader2
} from 'lucide-react'
import { loginSchema } from '../../lib/schemas.js'
import API from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'

// ── Navigate based on role ───────────────────────────
const navigateAfterLogin = (role, navigate) => {
  switch (role) {
    case 'client': navigate('/client/dashboard'); break
    case 'advisor': navigate('/advisor/dashboard'); break
    case 'admin': navigate('/admin/dashboard'); break
    default: navigate('/login')
  }
}

// ── Field Component ──────────────────────────────────
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

// ── Error Banner ─────────────────────────────────────
function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
      <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-400" />
      <span>{message}</span>
    </div>
  )
}

// ── Login Page ───────────────────────────────────────
export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const handleLogin = async (data) => {
    setServerError('')
    try {
      const res = await API.post('/auth/login', {
        email: data.email,
        password: data.password
      })

      const message = res.data?.message || 'Login successful'
      const userData = res.data?.user    // { id, name, email, role }

      login(userData)  // ✅ update context

      toast.success(message, { duration: 1500, position: 'top-right' })
      setTimeout(() => navigateAfterLogin(userData.role, navigate), 1500)

    } catch (error) {
      const msg = error.response?.data?.message
      setServerError(msg || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex">

      {/* Left Panel */}
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
            Welcome back<br />
            <span className="italic font-normal text-white/50">to your finances.</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Track every rupee, plan every goal, and watch your wealth grow — all in one place.
          </p>
          <div className="flex flex-col gap-3">
            {[
              'Income & expense tracking with smart budgets',
              'Portfolio and goal tracking',
              'Powerful SIP and financial planning Caculators'
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

      {/* Right Panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex lg:hidden items-center p-5">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft size={16} /> Back to home
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[420px]">
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
            <form onSubmit={handleSubmit(handleLogin)} noValidate className="space-y-5">
              <ErrorBanner message={serverError} />
              <Field
                label="Email Address" id="email" icon={Mail}
                type="email" placeholder="you@example.com"
                register={register('email')} error={errors.email?.message}
              />
              <Field
                label="Password" id="password" icon={Lock}
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                register={register('password')} error={errors.password?.message}
                rightSlot={
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-300 hover:text-gray-600 transition-colors p-0.5">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-gray-900 hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none transition-all duration-200 mt-2">
                {isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                ) : (
                  <>Sign In <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
