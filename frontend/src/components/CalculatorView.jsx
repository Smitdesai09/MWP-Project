import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Landmark, Home, BarChart3, Flame, Palmtree, ShieldCheck } from 'lucide-react';
import API from '../services/api';

const configs = [
  { slug: 'sip', title: 'SIP Calculator', description: 'Invest small amounts regularly for big returns', icon: TrendingUp, category: 'investment', tag: 'Most Popular', resultType: 'donut', fields: [{ key: 'monthlyInvestment', label: 'Monthly Investment', min: 500, max: 200000, step: 500, default: 10000, prefix: '₹' }, { key: 'annualRate', label: 'Expected Return Rate', min: 1, max: 30, step: 0.5, default: 12, suffix: '%' }, { key: 'years', label: 'Time Period', min: 1, max: 40, step: 1, default: 10, suffix: 'Yr' }], resultMap: { hero: { label: 'Total Value', key: 'totalValue', prefix: '₹' }, segments: [{ label: 'Invested Amount', key: 'investedAmount', prefix: '₹', color: '#0a0a0a' }, { label: 'Estimated Returns', key: 'estimatedReturns', prefix: '₹', color: '#9ca3af' }] }, related: ['lumpsum', 'cagr', 'retirement'] },
  { slug: 'lumpsum', title: 'Lump Sum Calculator', description: 'One-time investment growth projection', icon: Landmark, category: 'investment', resultType: 'donut', fields: [{ key: 'principal', label: 'Total Investment', min: 1000, max: 10000000, step: 1000, default: 500000, prefix: '₹' }, { key: 'rate', label: 'Expected Return Rate', min: 1, max: 30, step: 0.5, default: 12, suffix: '%' }, { key: 'years', label: 'Time Period', min: 1, max: 40, step: 1, default: 10, suffix: 'Yr' }], resultMap: { hero: { label: 'Total Value', key: 'totalValue', prefix: '₹' }, segments: [{ label: 'Invested Amount', key: 'investedAmount', prefix: '₹', color: '#0a0a0a' }, { label: 'Estimated Returns', key: 'estimatedReturns', prefix: '₹', color: '#9ca3af' }] }, related: ['sip', 'cagr', 'inflation'] },
  { slug: 'emi', title: 'EMI Calculator', description: 'Know your monthly loan payment breakdown', icon: Home, category: 'debt', resultType: 'donut', fields: [{ key: 'loanAmount', label: 'Loan Amount', min: 10000, max: 10000000, step: 10000, default: 2500000, prefix: '₹' }, { key: 'rate', label: 'Interest Rate', min: 1, max: 30, step: 0.5, default: 8.5, suffix: '%' }, { key: 'tenure', label: 'Loan Tenure', min: 1, max: 30, step: 1, default: 20, suffix: 'Yr' }], resultMap: { hero: { label: 'Monthly EMI', key: 'emi', prefix: '₹' }, segments: [{ label: 'Principal', key: 'loanAmount', prefix: '₹', color: '#0a0a0a', fromInputs: true }, { label: 'Interest Paid', key: 'interestPaid', prefix: '₹', color: '#d1d5db' }] }, related: ['sip', 'retirement'] },
  { slug: 'cagr', title: 'CAGR Calculator', description: 'Measure your investment performance', icon: BarChart3, category: 'investment', resultType: 'metric', fields: [{ key: 'initialValue', label: 'Initial Value', min: 1000, max: 10000000, step: 1000, default: 100000, prefix: '₹' }, { key: 'finalValue', label: 'Final Value', min: 1000, max: 100000000, step: 1000, default: 250000, prefix: '₹' }, { key: 'years', label: 'Time Period', min: 1, max: 40, step: 1, default: 5, suffix: 'Yr' }], resultMap: { hero: { label: 'CAGR', key: 'cagr', suffix: '%' } }, related: ['sip', 'lumpsum'] },
  { slug: 'inflation', title: 'Inflation Calculator', description: 'See how inflation erodes your purchasing power', icon: Flame, category: 'future', resultType: 'metric', fields: [{ key: 'amount', label: 'Current Cost', min: 100, max: 10000000, step: 100, default: 50000, prefix: '₹' }, { key: 'inflationRate', label: 'Inflation Rate', min: 1, max: 20, step: 0.5, default: 6, suffix: '%' }, { key: 'years', label: 'Time Period', min: 1, max: 40, step: 1, default: 10, suffix: 'Yr' }], resultMap: { hero: { label: 'Future Cost', key: 'futureCost', prefix: '₹' } }, related: ['retirement', 'sip'] },
  { slug: 'retirement', title: 'Retirement Calculator', description: 'Find out how much corpus you need to retire', icon: Palmtree, category: 'future', resultType: 'milestone', fields: [{ key: 'currentAge', label: 'Current Age', min: 18, max: 60, step: 1, default: 28, suffix: 'Yr' }, { key: 'retirementAge', label: 'Retirement Age', min: 35, max: 70, step: 1, default: 55, suffix: 'Yr' }, { key: 'monthlyExpense', label: 'Monthly Expense', min: 5000, max: 500000, step: 1000, default: 30000, prefix: '₹' }, { key: 'inflationRate', label: 'Expected Inflation', min: 1, max: 15, step: 0.5, default: 6, suffix: '%' }], resultMap: { milestones: [{ label: 'Monthly Expense', key: 'monthlyExpenseAtRetirement', prefix: '₹', icon: '📅' }, { label: 'Yearly Expense', key: 'yearlyExpense', prefix: '₹', icon: '📆' }, { label: 'Required Corpus', key: 'requiredCorpus', prefix: '₹', icon: '🎯' }] }, related: ['sip', 'inflation', 'emi'] },
  { slug: 'cibil', title: 'CIBIL Score Estimator', description: 'Get an estimated credit score range', icon: ShieldCheck, category: 'debt', resultType: 'gauge', fields: [{ key: 'paymentHistory', label: 'Payment History', type: 'select', options: [{ value: 'good', label: 'Good' }, { value: 'average', label: 'Average' }, { value: 'poor', label: 'Poor' }], default: 'good' }, { key: 'creditUtilization', label: 'Credit Utilization', min: 0, max: 100, step: 1, default: 20, suffix: '%' }, { key: 'loans', label: 'Active Loans', min: 0, max: 15, step: 1, default: 2, suffix: '' }], resultMap: { hero: { label: 'Score', key: 'estimatedScore', suffix: '/900' }, rating: { key: 'rating' } }, related: ['emi'] },
];

const formatCurrency = (num) => {
  if (!num) return '₹0';
  return '₹' + Math.round(num).toLocaleString('en-IN');
};

export default function CalculatorView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [inputValues, setInputValues] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const config = configs.find(c => c.slug === slug);
  const isDashboard = pathname.startsWith('/client');

  useEffect(() => {
    if (config) {
      const init = {};
      config.fields.forEach(f => init[f.key] = f.default);
      setInputValues(init);
      setResult(null);
    }
  }, [slug]);

  if (!config) return null;

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await API.post(`/calculate/${slug}`, inputValues);
      setResult(res.data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="w-full animate-fade-up">
      {/* Header / Nav */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(isDashboard ? '/client/calculators' : '/calculators')}
          className="p-2.5 rounded-xl border border-gray-200 bg-white hover:border-gray-900 transition-all shadow-sm"
        >
          <ArrowLeft size={18} className="text-gray-400 hover:text-gray-900" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{config.title}</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{config.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Parameters Column */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 border-b pb-4">Set Parameters</p>
          <div className="space-y-8">
            {config.fields.map(f => (
              <div key={f.key}>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-black text-gray-700 uppercase">{f.label}</label>
                  <span className="text-xs font-black text-gray-900 bg-gray-50 px-2 py-1 rounded-lg">
                    {f.prefix}{inputValues[f.key]}{f.suffix}
                  </span>
                </div>
                {f.type === 'select' ? (
                  <div className="flex flex-col gap-2">
                    {f.options.map(o => (
                      <button key={o.value} onClick={() => setInputValues(p => ({...p, [f.key]: o.value}))} className={`px-4 py-3 rounded-xl text-xs font-bold border transition-all ${inputValues[f.key] === o.value ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'bg-white text-gray-400 border-gray-100'}`}>{o.label}</button>
                    ))}
                  </div>
                ) : (
                  <input type="range" min={f.min} max={f.max} step={f.step} value={inputValues[f.key] || f.default} onChange={(e) => setInputValues(p => ({...p, [f.key]: Number(e.target.value)}))} className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-gray-900" />
                )}
              </div>
            ))}
            <button onClick={handleCalculate} className="w-full py-4.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200">
              {loading ? 'Crunching Numbers...' : 'Generate Analysis'}
            </button>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-3 bg-white p-8 sm:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[400px] flex items-center justify-center">
          {result ? (
            <div className="w-full text-center">
               <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Valuation</p>
               <p className="text-4xl font-black text-gray-900 mb-8">{formatCurrency(result.totalValue || result.emi || result.futureCost)}</p>
               {/* Add your charts here */}
            </div>
          ) : (
            <div className="text-center opacity-30">
              <config.icon size={48} className="mx-auto mb-4" strokeWidth={1} />
              <p className="text-[10px] font-black uppercase tracking-widest">Adjust values to calculate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}