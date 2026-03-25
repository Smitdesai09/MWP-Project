import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { 
  Plus, Edit2, Loader2, X, Calendar, ChevronRight, AlertCircle, Target 
} from 'lucide-react'
import toast from 'react-hot-toast'
import API from '../../services/api'

// ─── Constants ───────────────────────────────────────────────────────────────
const MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"]
const YEARS = [2025, 2026]

// ─── 1. MODAL COMPONENT ──────────────────────────────────────────────────────
const BudgetModal = ({ isOpen, onClose, onSubmit, formData, setFormData, isEditing }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity cursor-pointer" 
        onClick={onClose} 
      />
      
      <div className="relative bg-white w-full max-w-md rounded-3xl sm:rounded-[40px] shadow-2xl p-6 sm:p-10 animate-fade-up my-auto border border-slate-100">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
            {isEditing ? 'Adjust Limit' : 'New Budget'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Category Name</label>
            <input 
              type="text" 
              disabled={isEditing}
              placeholder="e.g. Food"
              className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-slate-900/10 focus:outline-none disabled:opacity-50 transition-all font-sans"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Monthly Limit (₹)</label>
            <input 
              type="number" 
              placeholder="12000"
              className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-slate-900/10 focus:outline-none transition-all font-sans"
              value={formData.monthlyLimit}
              onChange={(e) => setFormData({...formData, monthlyLimit: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="w-full py-3.5 sm:py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 mt-4">
            {isEditing ? <Edit2 size={18} /> : <Plus size={18} />}
            {isEditing ? 'Update Plan' : 'Create Budget'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

// ─── 2. BUDGET CARD ────────────────────────────────────────────────
const BudgetCard = ({ budget, onEdit, index }) => {
  const isOver = budget.percentage >= 100
  const isWarning = budget.percentage >= 80 && !isOver
  
  const barColor = isOver ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-blue-600'
  const statusTextColor = isOver ? 'text-red-500' : 'text-emerald-500'

  return (
    <div 
      className={`bg-white rounded-3xl sm:rounded-[40px] p-6 sm:p-9 transition-all duration-300 border ${
        isOver ? 'border-slate-900 shadow-2xl scale-[1.01]' : 'border-transparent shadow-sm hover:border-slate-900'
      }`}
      style={{ animation: `fadeUp 0.4s ${index * 0.1}s both` }}
    >
      <div className="flex justify-between items-start mb-6">
        {/* FIXED: Capitalize category display */}
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif truncate pr-2">
          {budget.category.charAt(0).toUpperCase() + budget.category.slice(1)}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-lg sm:text-xl font-bold text-slate-900 font-sans">₹{budget.limit.toLocaleString('en-IN')}</span>
          <button onClick={() => onEdit(budget)} className="text-slate-300 hover:text-slate-900 transition-colors p-1">
            <Edit2 size={16} />
          </button>
        </div>
      </div>

      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight font-sans">{budget.percentage}%</span>
        {isOver && <AlertCircle size={16} className="text-red-500 animate-pulse" />}
      </div>

      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-6 sm:mb-8 mt-2">
        <div 
          className={`h-full ${barColor} transition-all duration-1000 ease-out`}
          style={{ width: `${Math.min(budget.percentage, 100)}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-sm font-bold pt-4 border-t border-slate-50 font-sans">
        <span className="text-slate-400 tracking-tight">₹{budget.current.toLocaleString('en-IN')} spent</span>
        <span className={statusTextColor}>
          {isOver 
            ? `₹${Math.abs(budget.remaining).toLocaleString('en-IN')} over` 
            : `₹${budget.remaining.toLocaleString('en-IN')} left`}
        </span>
      </div>
    </div>
  )
}

// ─── 3. MAIN MODULE ──────────────────────────────────────────────────────────
export default function BudgetModule() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ category: '', monthlyLimit: '' })

  const fetchBudgets = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await API.get('/budgets', { params: { month, year } })
      if (data.success) setBudgets(data.budgets)
    } catch (err) {
      toast.error('Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => { fetchBudgets() }, [fetchBudgets])

  const handleOpenModal = (budget = null) => {
    if (budget) {
      setEditingId(budget._id)
      // Note: Budget category is lowercase from DB, we show it in input as is (or capitalize it)
      setFormData({ category: budget.category, monthlyLimit: String(budget.limit) })
    } else {
      setEditingId(null)
      setFormData({ category: '', monthlyLimit: '' })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await API.patch(`/budgets/${editingId}`, { monthlyLimit: Number(formData.monthlyLimit) })
        toast.success('Budget limit updated')
      } else {
        // Backend will handle .toLowerCase() for category
        await API.post('/budgets', { 
            category: formData.category.trim(), 
            monthlyLimit: Number(formData.monthlyLimit) 
        })
        toast.success('Category plan created')
      }
      setIsModalOpen(false)
      fetchBudgets()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed')
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-4 sm:p-6 lg:p-12 font-sans overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white p-6 sm:p-8 lg:p-10 rounded-3xl sm:rounded-[2rem] border border-slate-100 shadow-sm mb-8">
          <div style={{ animation: 'fadeUp 0.3s both' }}>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-none font-serif">
              Budget <span className="text-slate-400 font-normal italic">Planner</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1.5">
              {MONTHS[month - 1]} {year} · {budgets.length} {budgets.length === 1 ? 'category' : 'categories'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3">
              <Calendar size={14} className="text-slate-300 mr-2 hidden sm:block" />
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="bg-transparent text-[11px] sm:text-xs font-bold uppercase outline-none cursor-pointer">
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
              <div className="mx-2 sm:mx-3 text-slate-200">|</div>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="bg-transparent text-[11px] sm:text-xs font-bold outline-none cursor-pointer">
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            
            <button 
              onClick={() => handleOpenModal()} 
              className="bg-[#0F172A] text-white px-5 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-xs sm:text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-200 active:scale-95"
            >
              <Plus size={18} /> <span className="hidden sm:inline">Set New Limit</span> <span className="sm:hidden">Add New</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-300">
            <Loader2 className="animate-spin" size={48} />
            <p className="text-slate-400 font-medium italic font-sans tracking-wide">Analyzing your spending...</p>
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl sm:rounded-[40px] border border-dashed border-slate-200 animate-fade-up">
            <Target className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-medium font-serif text-xl sm:text-2xl">No active budgets yet.</p>
            <p className="text-slate-300 text-sm mt-1">Start by setting a monthly limit for a category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {budgets.map((b, i) => (
              <BudgetCard key={b._id} budget={b} onEdit={handleOpenModal} index={i} />
            ))}
          </div>
        )}
      </div>

      <BudgetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={!!editingId}
      />
    </div>
  )
}