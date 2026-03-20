import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TrendingUp, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Calculators', href: '#calculators' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
  ]

   const handleLogoClick = (e) => {
    e.preventDefault()
    if (location.pathname === '/') {
      // Already on home page — just scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Navigate to home, then scroll to top
      navigate('/')
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <a href="/" onClick={handleLogoClick} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gray-700 transition-colors duration-200">
              <TrendingUp size={16} color="white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-[17px] font-bold text-gray-900 tracking-tight">
              Wealth <span className="font-normal text-gray-500">Planner</span>
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-150"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:border-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            >
              Register
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-gray-100 mt-2 flex flex-col gap-2">
            <Link
              to="/login"
              className="w-full text-center px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-700 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
