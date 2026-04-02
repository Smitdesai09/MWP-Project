import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  TrendingUp, Landmark, Home, BarChart3, 
  Flame, Palmtree, ShieldCheck, ArrowRight 
} from 'lucide-react';

const configs = [
  { slug: 'sip', title: 'SIP Calculator', description: 'Invest small amounts regularly for big returns', icon: TrendingUp, category: 'investment', tag: 'Most Popular' },
  { slug: 'lumpsum', title: 'Lump Sum Calculator', description: 'One-time investment growth projection', icon: Landmark, category: 'investment' },
  { slug: 'emi', title: 'EMI Calculator', description: 'Know your monthly loan payment breakdown', icon: Home, category: 'debt' },
  { slug: 'cagr', title: 'CAGR Calculator', description: 'Measure your investment performance', icon: BarChart3, category: 'investment' },
  { slug: 'inflation', title: 'Inflation Calculator', description: 'See how inflation erodes your purchasing power', icon: Flame, category: 'future' },
  { slug: 'retirement', title: 'Retirement Calculator', description: 'Find out how much corpus you need to retire', icon: Palmtree, category: 'future' },
  { slug: 'cibil', title: 'CIBIL Score Estimator', description: 'Get an estimated credit score range', icon: ShieldCheck, category: 'debt' },
];

const categories = [
  { key: 'all', label: 'All Tools' },
  { key: 'investment', label: 'Investment' },
  { key: 'debt', label: 'Debt' },
  { key: 'future', label: 'Planning' },
];

export default function CalculatorsList() {
  const [activeCategory, setActiveCategory] = useState('all');
  const { pathname } = useLocation();
  
  // Logic to keep the user in the right layout (Dashboard vs Public)
  const isDashboard = pathname.startsWith('/client');
  const basePath = isDashboard ? '/client/calculators' : '/calculators';
  
  const filtered = activeCategory === 'all' ? configs : configs.filter(c => c.category === activeCategory);

  return (
    <div className="w-full animate-fade-up">
      {/* 1. Conditional Back Button (Only for Public Home) */}
      {!isDashboard && (
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-900 transition-colors group">
            <ArrowRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>
      )}

      {/* 2. Header Section - No large top padding here */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-display text-3xl font-black text-gray-900 tracking-tight">Financial Calculators</h2>
          <p className="text-sm font-medium text-gray-400 mt-1">Plan your wealth with precision.</p>
        </div>
        
        <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-2xl w-fit">
          {categories.map(cat => (
            <button 
              key={cat.key} 
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.key 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(calc => {
          const Icon = calc.icon;
          return (
            <Link 
              key={calc.slug} 
              to={`${basePath}/${calc.slug}`}
              className="group p-6 bg-white rounded-[2rem] border border-gray-100 hover:border-gray-900 hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-gray-50 group-hover:bg-gray-900 rounded-2xl flex items-center justify-center transition-all">
                  <Icon size={22} className="text-gray-700 group-hover:text-white" />
                </div>
                {calc.tag && (
                  <span className="px-3 py-1 bg-gray-900 text-white text-[9px] font-black rounded-full uppercase tracking-widest">
                    {calc.tag}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">{calc.title}</h3>
              <p className="text-xs text-gray-400 font-medium leading-relaxed mb-8 flex-grow">{calc.description}</p>
              <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-[10px] font-black text-gray-400 group-hover:text-gray-900 uppercase tracking-widest">
                <span>Open Calculator</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}