import { Link } from 'react-router-dom'
import { TrendingUp, ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col items-center justify-center px-6">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 mb-16">
        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
          <TrendingUp size={16} color="white" strokeWidth={2.5} />
        </div>
        <span className="font-display text-[17px] font-bold text-gray-900 tracking-tight">
          Wealth <span className="font-normal text-gray-400">Planner</span>
        </span>
      </Link>

      {/* 404 */}
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-gray-900 tracking-tight leading-none mb-2">404</p>
        <p className="text-lg font-semibold text-gray-900 mb-3">Page not found</p>
        <p className="text-sm text-gray-400 leading-relaxed mb-10">
          The page you're looking for doesn't exist or may have been moved.
          Double-check the URL and try again.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
          >
            Back to Home <ArrowRight size={15} />
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:border-gray-400 hover:text-gray-900 hover:-translate-y-0.5 transition-all duration-200"
          >
            Go to Login
          </Link>
        </div>
      </div>

    </div>
  )
}