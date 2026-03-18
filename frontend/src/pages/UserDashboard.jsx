import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  TrendingUp, LayoutDashboard, Wallet, Target,
  PieChart, Bell, LogOut, Settings, ChevronRight,
  ArrowUpRight, ArrowDownRight, Shield
} from 'lucide-react'
// import API from '../api.js'

/* ─── Stat card ──────────────────────────────────── */
function StatCard({ label, value, sub, trend, color }) {
  const isUp = trend === 'up'
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3 hover:shadow-md transition-shadow duration-200">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className={`font-display text-2xl font-bold ${color ?? 'text-gray-900'}`}>{value}</p>
      {sub && (
        <p className={`flex items-center gap-1 text-xs font-medium ${isUp ? 'text-green-500' : 'text-red-400'}`}>
          {isUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {sub}
        </p>
      )}
    </div>
  )
}

/* ─── Nav item ───────────────────────────────────── */
function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
        ${active ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
    >
      <Icon size={16} />
      {label}
    </button>
  )
}

/* ─── Page ────────────────────────────────────────── */
export default function UserDashboard() {
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('Dashboard')

  // Replace with real user from auth context/store
  const user = { name: 'Rahul Shah', email: 'rahul@example.com', plan: 'Basic' }

  const handleLogout = async () => {
    try {
      await API.post('/auth/logout')
    } catch (_) {}
    localStorage.removeItem('token')
    navigate('/login')
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: Wallet,          label: 'Transactions' },
    { icon: Target,          label: 'Goals' },
    { icon: PieChart,        label: 'Portfolio' },
    { icon: Settings,        label: 'Settings' },
  ]

  return (
    <div className="min-h-screen bg-[#fafaf8] flex">

      {/* ── Sidebar ───────────────────────────────── */}
      <aside className="hidden lg:flex w-60 flex-col bg-white border-r border-gray-100 px-4 py-6 fixed h-full">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 px-2 mb-8">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <TrendingUp size={16} color="white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-[17px] font-bold text-gray-900 tracking-tight">
            Wealth <span className="font-normal text-gray-400">Planner</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.label} {...item}
              active={activeNav === item.label}
              onClick={() => setActiveNav(item.label)} />
          ))}
        </nav>

        {/* Reset password link */}
        <div className="mb-3">
          <Link to="/forgot-password"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all duration-150">
            <Shield size={16} />
            Reset Password
          </Link>
        </div>

        {/* User + logout */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <div className="px-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">{user.name.charAt(0)}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.plan} Plan</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all duration-150">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────── */}
      <main className="flex-1 lg:ml-60 px-6 py-8 max-w-5xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900 tracking-tight">
              Good morning, {user.name.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Here's your financial snapshot</p>
          </div>
          <button className="relative p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <Bell size={18} className="text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full" />
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Portfolio"  value="₹4,82,300" sub="12.4% this month" trend="up" />
          <StatCard label="Monthly Income"   value="₹65,000"   sub="vs ₹60,000 last month" trend="up" color="text-green-600" />
          <StatCard label="Monthly Expenses" value="₹28,450"   sub="₹3,200 over budget" trend="down" color="text-red-500" />
          <StatCard label="Goal Progress"    value="68%"        sub="Child Education on track" trend="up" color="text-blue-600" />
        </div>

        {/* Quick actions */}
        <div className="mb-8">
          <h2 className="font-display text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Add Transaction',   desc: 'Log income or expense',      icon: Wallet,          to: '/transactions' },
              { label: 'View Portfolio',    desc: 'Check holdings & returns',   icon: PieChart,        to: '/portfolio' },
              { label: 'Reset Password',    desc: 'Update your credentials',    icon: Shield,          to: '/forgot-password' },
            ].map((action) => (
              <Link key={action.label} to={action.to}
                className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 group-hover:bg-gray-900 rounded-xl flex items-center justify-center transition-colors duration-200">
                    <action.icon size={16} className="text-gray-600 group-hover:text-white transition-colors duration-200" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                    <p className="text-xs text-gray-400">{action.desc}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-gray-900">Recent Transactions</h2>
            <Link to="/transactions" className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">
              View all →
            </Link>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {[
              { label: 'Grocery Shopping',   cat: 'Food',       amount: '-₹2,450', date: 'Today',     type: 'expense' },
              { label: 'Salary Credit',       cat: 'Income',     amount: '+₹65,000', date: 'Mar 15',   type: 'income' },
              { label: 'SIP – Flexi Cap MF',  cat: 'Investment', amount: '-₹5,000', date: 'Mar 10',    type: 'expense' },
              { label: 'Electricity Bill',    cat: 'Utilities',  amount: '-₹1,340', date: 'Mar 8',     type: 'expense' },
            ].map((tx, i, arr) => (
              <div key={tx.label}
                className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${tx.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {tx.cat.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tx.label}</p>
                    <p className="text-xs text-gray-400">{tx.cat} · {tx.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-green-500' : 'text-gray-700'}`}>
                  {tx.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}