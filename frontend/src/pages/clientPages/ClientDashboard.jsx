import { useState, useRef, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import {
  TrendingUp, User, ArrowLeftRight, PiggyBank,
  Target, BarChart2, LayoutDashboard,
  Menu, X, LogOut, ChevronDown, ChevronRight,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react'

<<<<<<< HEAD
// 1. IMPORT YOUR PROFILE TAB COMPONENT
import ProfileTab from './ProfileTab.jsx'
import BudgetModule from './BudgetModule.jsx' 
import Transaction from './Transaction.jsx'
=======
// Import Page Components
import ProfileTab from './ProfileTab.jsx'
import BudgetModule from './BudgetModule.jsx' 
import Transaction from './Transaction.jsx'
import GoalModule from './GoalModule.jsx'
import Dashboard from './Dashboard.jsx'
import HoldingsModule from './Holdingsmodule.jsx'


>>>>>>> 37fe88855e7e7cfb1dd2988088a2cb2ec10c2d5d
const NAV_ITEMS = [
  { label: 'Dashboard',    icon: LayoutDashboard, path: '/client/dashboard'    },
  { label: 'Profile',      icon: User,            path: '/client/profile'      },
  { label: 'Transactions', icon: ArrowLeftRight,  path: '/client/transactions' },
  { label: 'Budget',       icon: PiggyBank,       path: '/client/budget'       },
  { label: 'Goals',        icon: Target,          path: '/client/goals'        },
  { label: 'Holdings',     icon: BarChart2,       path: '/client/holdings'     },
]

const getInitials = (name = '') =>
  name?.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || 'U'

// ── Profile Popup Component ─────────────────────────────────────
function ProfilePopup({ user, onLogout, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden">
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
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 font-medium hover:bg-red-50 transition-colors duration-150">
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  )
}

// ── Nav Link Component ──────────────────────────────────────────
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
        <span className="pointer-events-none absolute left-full ml-3 z-50 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {item.label}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
        </span>
      )}
    </Link>
  )
}

const ComingSoon = ({ title }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><span className="text-2xl">🚧</span></div>
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-400">This section is coming soon.</p>
    </div>
  </div>
)

export default function ClientDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const { pathname } = useLocation()
  const activeItem = NAV_ITEMS.find(i => pathname === i.path || pathname.startsWith(i.path + '/'))

  return (
    <div className="flex h-screen bg-[#fafaf8] overflow-hidden">
      {mobileOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ${collapsed ? 'lg:w-[60px]' : 'lg:w-60'} ${mobileOpen ? 'w-[280px] translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className={`flex items-center h-16 px-3 border-b border-gray-100 flex-shrink-0 ${collapsed ? 'lg:justify-center' : 'gap-2.5'}`}>
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp size={14} color="white" strokeWidth={2.5} />
          </div>
          <span className={`font-display text-[15px] font-bold text-gray-900 tracking-tight whitespace-nowrap ${collapsed ? 'lg:hidden' : ''}`}>
            Wealth <span className="font-normal text-gray-400">Planner</span>
          </span>
          <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><X size={16} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-0.5">
          <p className={`px-3 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest ${collapsed ? 'lg:hidden' : ''}`}>Menu</p>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.path} item={item} collapsed={collapsed} showLabel={mobileOpen} onClick={() => setMobileOpen(false)} />
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setCollapsed(c => !c)} className="hidden lg:flex p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
            </button>
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"><Menu size={20} /></button>
            <h1 className="hidden lg:block font-display text-lg font-semibold text-gray-900">{activeItem?.label || 'Dashboard'}</h1>
          </div>

          <div className="relative">
            <button onClick={() => setProfileOpen(p => !p)} className="flex items-center gap-2.5 pl-2 pr-2.5 py-1.5 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all">
              <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">{getInitials(user?.name)}</span>
              </div>
              <ChevronDown size={13} className={`text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>
            {profileOpen && <ProfilePopup user={user} onLogout={handleLogout} onClose={() => setProfileOpen(false)} />}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#fafaf8]">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
<<<<<<< HEAD
            <Route path="dashboard" element={<ComingSoon title="Dashboard" />} />
            
            {/* 2. PLUG IN THE PROFILE TAB HERE */}
=======
            
            <Route path="dashboard" element={<Dashboard/>} />
            
            {/* ✅ FIX: Removed leading slash. Now matches /client/profile correctly */}
>>>>>>> 37fe88855e7e7cfb1dd2988088a2cb2ec10c2d5d
            <Route path="profile" element={<ProfileTab />} />
            
            <Route path="transactions" element={<Transaction />} />
            <Route path="budget" element={<BudgetModule />} />
<<<<<<< HEAD
            <Route path="goals" element={<ComingSoon title="Goals" />} />
            <Route path="holdings" element={<ComingSoon title="Holdings" />} />
=======
            <Route path="goals" element={<GoalModule />} />
            <Route path="holdings" element={<HoldingsModule />} />
>>>>>>> 37fe88855e7e7cfb1dd2988088a2cb2ec10c2d5d
          </Routes>
        </main>
      </div>
    </div>
  )
}