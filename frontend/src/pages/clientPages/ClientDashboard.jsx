import React, { useState, useRef, useEffect } from 'react'
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import {
  TrendingUp, User, ArrowLeftRight, PiggyBank,
  Target, BarChart2, LayoutDashboard,
  Menu, X, LogOut, ChevronDown, ChevronRight,
  PanelLeftClose, PanelLeftOpen, Calculator
} from 'lucide-react'

import ProfileTab from './ProfileTab.jsx'
import BudgetModule from './BudgetModule.jsx' 
import Transaction from './Transaction.jsx'
import GoalModule from './GoalModule.jsx'
import Dashboard from './Dashboard.jsx'
import HoldingsModule from './HoldingsModule.jsx'
import CalculatorsList from '../../components/CalculatorsList.jsx'
import CalculatorView from '../../components/CalculatorView.jsx'

const NAV_ITEMS = [
  { label: 'Dashboard',    icon: LayoutDashboard, path: '/client/dashboard'    },
  { label: 'Transactions', icon: ArrowLeftRight,  path: '/client/transactions' },
  { label: 'Budget',       icon: PiggyBank,       path: '/client/budget'       },
  { label: 'Goals',        icon: Target,          path: '/client/goals'        },
  { label: 'Holdings',     icon: BarChart2,       path: '/client/holdings'     },
  { label: 'Calculators',  icon: Calculator,      path: '/client/calculators'  },
]

const getInitials = (name = '') =>
  name?.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || 'U'

function ProfilePopup({ user, onLogout, onManageProfile, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden animate-fade-up">
      <div className="px-4 py-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">{getInitials(user?.name)}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role || 'client'}</p>
          </div>
        </div>
      </div>
      <div className="py-1.5">
        <button onClick={onManageProfile} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors">
          <User size={15} /> Manage Profile
        </button>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 font-medium hover:bg-red-50 transition-colors">
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  )
}

function NavLink({ item, collapsed, showLabel = false, onClick }) {
  const { pathname } = useLocation()
  const active = pathname === item.path || pathname.startsWith(item.path + '/')
  const Icon = item.icon
  const withLabel = showLabel || !collapsed

  return (
    <Link to={item.path} onClick={onClick} className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-sm font-medium transition-all duration-150 group ${!withLabel ? 'justify-center' : ''} ${active ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
      <Icon size={17} className="flex-shrink-0" />
      {withLabel && (
        <>
          <span className="truncate">{item.label}</span>
          {active && <ChevronRight size={13} className="ml-auto opacity-50" />}
        </>
      )}
      {!withLabel && (
        <span className="pointer-events-none absolute left-full ml-3 z-50 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
          {item.label}
        </span>
      )}
    </Link>
  )
}

export default function ClientDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const activeItem = NAV_ITEMS.find(i => pathname === i.path || pathname.startsWith(i.path + '/'))
  const pageTitle = pathname.includes('/profile') ? 'Profile' : (activeItem?.label || 'Dashboard')

  return (
    <div className="flex h-screen bg-[#fafaf8] overflow-hidden">
      {mobileOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ${collapsed ? 'lg:w-[70px]' : 'lg:w-64'} ${mobileOpen ? 'w-[280px] translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className={`flex items-center h-16 px-4 border-b border-gray-100 flex-shrink-0 ${collapsed ? 'lg:justify-center' : 'gap-3'}`}>
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp size={14} color="white" strokeWidth={2.5} />
          </div>
          {!collapsed && <span className="font-display text-base font-bold text-gray-900 tracking-tight">Wealth <span className="font-normal text-gray-400">Planner</span></span>}
          <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X size={16} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className={`px-3 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest ${collapsed ? 'lg:hidden' : ''}`}>Menu</p>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.path} item={item} collapsed={collapsed} showLabel={mobileOpen} onClick={() => setMobileOpen(false)} />
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex p-2 rounded-xl text-gray-400 hover:bg-gray-100">
              {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl"><Menu size={20} /></button>
            <h1 className="font-display text-lg font-semibold text-gray-900">{pageTitle}</h1>
          </div>

          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2.5 p-1.5 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all">
              <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{getInitials(user?.name)}</span>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>
            {profileOpen && (
              <ProfilePopup user={user} onLogout={handleLogout} onManageProfile={() => {setProfileOpen(false); navigate('/client/profile')}} onClose={() => setProfileOpen(false)} />
            )}
          </div>
        </header>

        {/* SCROLLABLE AREA */}
        <main className="flex-1 overflow-y-auto bg-[#fafaf8] p-4 sm:p-6 lg:p-10">
          <div className="max-w-7xl mx-auto"> {/* This ensures consistency with Goals/Holdings modules */}
            <Routes>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<ProfileTab />} />
              <Route path="transactions" element={<Transaction />} />
              <Route path="budget" element={<BudgetModule />} />
              <Route path="goals" element={<GoalModule />} />
              <Route path="holdings" element={<HoldingsModule />} />
              <Route path="calculators" element={<CalculatorsList />} />
              <Route path="calculators/:slug" element={<CalculatorView />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}