import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  TrendingUp, Mail, AlertCircle, ArrowRight,
  ChevronLeft, Loader2, ShieldCheck
} from 'lucide-react'
import API from '../../services/api.js'

import { forgotSchema } from '../../lib/schemas.js'

function Field({ label, id, icon: Icon, type = 'text', placeholder, register, error }) {
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
          className={`w-full py-3 pl-10 pr-4 text-sm text-gray-900 bg-gray-50 border rounded-xl
            placeholder:text-gray-300 font-sans focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200
            ${error ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
                    : 'border-gray-200 focus:ring-gray-900/10 focus:border-gray-900'}`}
        />
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  )
}

export default function ForgotPassword() {
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  })

  const handleForgot = async (data) => {
    setServerError('')
    try {
      await API.post('/auth/forgot-password', { email: data.email })
      setSubmitSuccess(true)
    } catch (err) {
      if (err.response?.status >= 500) {
        setServerError('Something went wrong. Please try again.')
      } else {
        setSubmitSuccess(true) // don't reveal if email exists
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex">

      {/* Left panel */}
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
            Forgot your<br />
            <span className="italic font-normal text-white/50">password?</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            No worries. Enter your email and we'll send a secure reset link within minutes.
          </p>
          <div className="flex flex-col gap-4">
            {[
              { step: '01', text: 'Enter your registered email' },
              { step: '02', text: 'Check your inbox for the link' },
              { step: '03', text: 'Set a new secure password' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-white/60 font-sans">{item.step}</span>
                </div>
                <span className="text-sm text-gray-400">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400">© 2026 Wealth Planner</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex lg:hidden items-center p-5">
          <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft size={16} /> Back to login
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

            {submitSuccess ? (
              <div className="flex flex-col items-center py-10 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                  <ShieldCheck size={28} className="text-green-500" />
                </div>
                <div className="space-y-2">
                  <p className="font-display text-2xl font-bold text-gray-900">Check your inbox</p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    If that email is registered, a reset link is on its way.
                    It expires in <strong className="text-gray-700">15 minutes</strong>.
                  </p>
                </div>
                <div className="pt-2 w-full space-y-3">
                  <Link to="/login"
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
                    Back to Sign In <ArrowRight size={16} />
                  </Link>
                  <button onClick={() => setSubmitSuccess(false)}
                    className="w-full py-3 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    Try a different email
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h1 className="font-display text-3xl font-bold text-gray-900 mb-2 tracking-tight">Reset password</h1>
                  <p className="text-sm text-gray-500">
                    Remember it?{' '}
                    <Link to="/login" className="text-gray-900 font-semibold hover:underline">Sign in instead</Link>
                  </p>
                </div>

                <form onSubmit={handleSubmit(handleForgot)} noValidate className="space-y-5">
                  <Field label="Email Address" id="email" icon={Mail} type="email"
                    placeholder="you@example.com" register={register('email')} error={errors.email?.message} />

                  {serverError && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                      <AlertCircle size={12} /> {serverError}
                    </p>
                  )}

                  <button type="submit" disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none transition-all duration-200 mt-2">
                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Sending link…</>
                                 : <>Send Reset Link <ArrowRight size={16} /></>}
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