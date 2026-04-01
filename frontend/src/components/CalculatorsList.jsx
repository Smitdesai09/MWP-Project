import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Landmark, Home, BarChart3, Flame, Palmtree, ShieldCheck } from 'lucide-react';

// --- PASTE YOUR CONFIGS HERE (I shortened it for readability, paste your exact configs) ---
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
  { key: 'all', label: 'All Calculators' },
  { key: 'investment', label: 'Investment' },
  { key: 'debt', label: 'Debt' },
  { key: 'future', label: 'Future Planning' },
];

export default function CalculatorsList() {
  const [activeCategory, setActiveCategory] = useState('all');
  const filtered = activeCategory === 'all' ? configs : configs.filter(c => c.category === activeCategory);

  return (
    <div>
      {/* BACK TO HOME BUTTON */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Home
        </Link>
      </div>

      <div className="mb-8 animate-fade-up">
        <h2 className="font-display text-4xl font-bold text-gray-900 tracking-tight mb-2">Financial Calculators</h2>
        <p className="text-gray-500 text-base">Quick, accurate calculations — no signup required.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 animate-fade-up-delay-1">
        {categories.map(cat => (
          <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeCategory === cat.key ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-300 hover:text-gray-700'}`}>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up-delay-2">
        {filtered.map(calc => {
          const Icon = calc.icon;
          return (
            // USE LINK INSTEAD OF ONCLICK TO GO TO PAGE 2
            <Link key={calc.slug} to={`/calculators/${calc.slug}`}
              className="group text-left p-6 bg-white rounded-2xl border border-gray-100 hover:border-gray-900 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 bg-gray-50 group-hover:bg-gray-900 rounded-xl flex items-center justify-center transition-colors duration-300">
                  <Icon size={20} className="text-gray-700 group-hover:text-white transition-colors duration-300" />
                </div>
                {calc.tag && <span className="px-2.5 py-0.5 bg-gray-900 text-white text-[10px] font-bold rounded-full tracking-wide uppercase">{calc.tag}</span>}
              </div>
              <h3 className="font-display text-lg font-semibold text-gray-900 mb-1.5">{calc.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{calc.description}</p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-gray-400 group-hover:text-gray-900 transition-colors duration-200">
                Open calculator
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="group-hover:translate-x-0.5 transition-transform duration-200"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}