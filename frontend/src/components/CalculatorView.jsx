import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Landmark, Home, BarChart3, Flame, Palmtree, ShieldCheck } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

// --- CONFIGS (Kept exactly as your original) ---
const configs = [
  {
    slug: 'sip', title: 'SIP Calculator', description: 'Invest small amounts regularly for big returns',
    icon: TrendingUp, category: 'investment', tag: 'Most Popular', resultType: 'donut',
    fields: [
      { key: 'monthlyInvestment', label: 'Monthly Investment', min: 500, max: 200000, step: 500, default: 10000, prefix: '₹' },
      { key: 'annualRate', label: 'Expected Return Rate', min: 1, max: 30, step: 0.5, default: 12, suffix: '%' },
      { key: 'years', label: 'Time Period', min: 1, max: 40, step: 1, default: 10, suffix: 'Yr' },
    ],
    resultMap: {
      hero: { label: 'Total Value', key: 'totalValue', prefix: '₹' },
      segments: [
        { label: 'Invested Amount', key: 'investedAmount', prefix: '₹', color: '#0a0a0a' },
        { label: 'Estimated Returns', key: 'estimatedReturns', prefix: '₹', color: '#9ca3af' },
      ],
    },
    related: ['lumpsum', 'cagr', 'retirement'],
  },
  {
    slug: 'lumpsum', title: 'Lump Sum Calculator', description: 'One-time investment growth projection',
    icon: Landmark, category: 'investment', resultType: 'donut',
    fields: [
      { key: 'principal', label: 'Total Investment', min: 1000, max: 10000000, step: 1000, default: 500000, prefix: '₹' },
      { key: 'rate', label: 'Expected Return Rate', min: 1, max: 30, step: 0.5, default: 12, suffix: '%' },
      { key: 'years', label: 'Time Period', min: 1, max: 40, step: 1, default: 10, suffix: 'Yr' },
    ],
    resultMap: {
      hero: { label: 'Total Value', key: 'totalValue', prefix: '₹' },
      segments: [
        { label: 'Invested Amount', key: 'investedAmount', prefix: '₹', color: '#0a0a0a' },
        { label: 'Estimated Returns', key: 'estimatedReturns', prefix: '₹', color: '#9ca3af' },
      ],
    },
    related: ['sip', 'cagr', 'inflation'],
  },
  {
    slug: 'emi', title: 'EMI Calculator', description: 'Know your monthly loan payment breakdown',
    icon: Home, category: 'debt', resultType: 'donut',
    fields: [
      { key: 'loanAmount', label: 'Loan Amount', min: 10000, max: 10000000, step: 10000, default: 2500000, prefix: '₹' },
      { key: 'rate', label: 'Interest Rate', min: 1, max: 30, step: 0.5, default: 8.5, suffix: '%' },
      { key: 'tenure', label: 'Loan Tenure', min: 1, max: 30, step: 1, default: 20, suffix: 'Yr' },
    ],
    resultMap: {
      hero: { label: 'Monthly EMI', key: 'emi', prefix: '₹' },
      segments: [
        { label: 'Principal', key: 'loanAmount', prefix: '₹', color: '#0a0a0a', fromInputs: true },
        { label: 'Interest Paid', key: 'interestPaid', prefix: '₹', color: '#d1d5db' },
      ],
    },
    related: ['sip', 'retirement'],
  },
  {
    slug: 'cagr', title: 'CAGR Calculator', description: 'Measure your investment performance',
    icon: BarChart3, category: 'investment', resultType: 'metric',
    fields: [
      { key: 'initialValue', label: 'Initial Value', min: 1000, max: 10000000, step: 1000, default: 100000, prefix: '₹' },
      { key: 'finalValue', label: 'Final Value', min: 1000, max: 100000000, step: 1000, default: 250000, prefix: '₹' },
      { key: 'years', label: 'Time Period', min: 1, max: 40, step: 1, default: 5, suffix: 'Yr' },
    ],
    resultMap: { hero: { label: 'CAGR', key: 'cagr', suffix: '%' } },
    related: ['sip', 'lumpsum'],
  },
  {
    slug: 'inflation', title: 'Inflation Calculator', description: 'See how inflation erodes your purchasing power',
    icon: Flame, category: 'future', resultType: 'metric',
    fields: [
      { key: 'amount', label: 'Current Cost', min: 100, max: 10000000, step: 100, default: 50000, prefix: '₹' },
      { key: 'inflationRate', label: 'Inflation Rate', min: 1, max: 20, step: 0.5, default: 6, suffix: '%' },
      { key: 'years', label: 'Time Period', min: 1, max: 40, step: 1, default: 10, suffix: 'Yr' },
    ],
    resultMap: { hero: { label: 'Future Cost', key: 'futureCost', prefix: '₹' } },
    related: ['retirement', 'sip'],
  },
  {
    slug: 'retirement', title: 'Retirement Calculator', description: 'Find out how much corpus you need to retire',
    icon: Palmtree, category: 'future', resultType: 'milestone',
    fields: [
      { key: 'currentAge', label: 'Current Age', min: 18, max: 60, step: 1, default: 28, suffix: 'Yr' },
      { key: 'retirementAge', label: 'Retirement Age', min: 35, max: 70, step: 1, default: 55, suffix: 'Yr' },
      { key: 'monthlyExpense', label: 'Monthly Expense', min: 5000, max: 500000, step: 1000, default: 30000, prefix: '₹' },
      { key: 'inflationRate', label: 'Expected Inflation', min: 1, max: 15, step: 0.5, default: 6, suffix: '%' },
    ],
    resultMap: {
      milestones: [
        { label: 'Monthly Expense at Retirement', key: 'monthlyExpenseAtRetirement', prefix: '₹', icon: '📅' },
        { label: 'Yearly Expense at Retirement', key: 'yearlyExpense', prefix: '₹', icon: '📆' },
        { label: 'Required Retirement Corpus', key: 'requiredCorpus', prefix: '₹', icon: '🎯' },
      ],
    },
    related: ['sip', 'inflation', 'emi'],
  },
  {
    slug: 'cibil', title: 'CIBIL Score Estimator', description: 'Get an estimated credit score range',
    icon: ShieldCheck, category: 'debt', resultType: 'gauge',
    fields: [
      { key: 'paymentHistory', label: 'Payment History', type: 'select', options: [
        { value: 'good', label: 'Good — Always on time' },
        { value: 'average', label: 'Average — Occasional delays' },
        { value: 'poor', label: 'Poor — Frequent defaults' },
      ], default: 'good' },
      { key: 'creditUtilization', label: 'Credit Utilization', min: 0, max: 100, step: 1, default: 20, suffix: '%' },
      { key: 'loans', label: 'Active Loans / Cards', min: 0, max: 15, step: 1, default: 2, suffix: '' },
    ],
    resultMap: { hero: { label: 'Estimated Score', key: 'estimatedScore', suffix: '/900' }, rating: { key: 'rating' } },
    related: ['emi'],
  },
];

// --- HELPERS ---
const getBySlug = (slug) => configs.find((c) => c.slug === slug);

const formatCurrency = (num) => {
  if (num === null || num === undefined) return '₹0';
  const str = Math.round(num).toString();
  let lastThree = str.substring(str.length - 3);
  const rest = str.substring(0, str.length - 3);
  if (rest !== '') lastThree = ',' + lastThree;
  return '₹' + rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
};

// --- RESULTS COMPONENTS ---
const DonutResult = ({ data, resultMap, inputValues }) => {
  if (!data) return null;
  const heroValue = data[resultMap.hero.key];
  const segments = resultMap.segments.map(s => ({ ...s, value: s.fromInputs ? inputValues[s.key] : data[s.key] }));
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const pctZero = total > 0 ? (segments[0].value / total) * 100 : 50;
  const radius = 70, circumference = 2 * Math.PI * radius;
  const offsetZero = circumference - (pctZero / 100) * circumference;
  const heroDisplay = resultMap.hero.prefix === '₹' ? formatCurrency(heroValue) : `${heroValue}${resultMap.hero.suffix || ''}`;

  return (
    <div>
      <div className="text-center mb-6">
        <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-1">{resultMap.hero.label}</p>
        <p className="text-3xl font-bold text-gray-900 tabular-nums">{heroDisplay}</p>
      </div>
      <div className="flex justify-center mb-6">
        <div className="relative w-44 h-44">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="18" />
            <circle cx="80" cy="80" r={radius} fill="none" stroke={segments[0].color} strokeWidth="18"
              strokeDasharray={circumference} strokeDashoffset={offsetZero} strokeLinecap="round" className="transition-all duration-700 ease-out" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-gray-400 font-medium">{segments[0].label}</span>
            <span className="text-sm font-bold text-gray-900 tabular-nums">{segments[0].prefix === '₹' ? formatCurrency(segments[0].value) : segments[0].value}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {segments.map(s => (
          <div key={s.label} className="p-4 bg-white rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-gray-400 font-medium">{s.label}</span>
            </div>
            <p className="text-lg font-bold text-gray-900 tabular-nums">{s.prefix === '₹' ? formatCurrency(s.value) : `${s.value}${s.suffix || ''}`}</p>
            <p className="text-xs text-gray-400 mt-0.5 tabular-nums">{total > 0 ? ((s.value / total) * 100).toFixed(1) : 0}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const MetricResult = ({ data, config }) => {
  if (!data) return null;
  const heroValue = data[config.resultMap.hero.key];
  const prefix = config.resultMap.hero.prefix || '';
  const suffix = config.resultMap.hero.suffix || '';
  const heroDisplay = prefix === '₹' ? formatCurrency(heroValue) : `${heroValue}${suffix}`;

  return (
    <div className="text-center py-6">
      <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-2">{config.resultMap.hero.label}</p>
      <p className="text-5xl font-bold text-gray-900 tabular-nums mb-1">{heroDisplay}</p>
      {config.slug === 'inflation' && (
        <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100 text-red-500 text-xs font-medium">
          You will need {formatCurrency(data.futureCost - config.fields.find(f => f.key === 'amount').default)} more due to inflation.
        </div>
      )}
    </div>
  );
};

const MilestoneResult = ({ data, resultMap }) => {
  if (!data) return null;
  return (
    <div className="space-y-4">
      {resultMap.milestones.map((m, i) => (
        <div key={m.key} className={`p-5 rounded-xl border ${i === resultMap.milestones.length - 1 ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium opacity-60">{m.label}</span>
          </div>
          <p className="text-xl font-bold tabular-nums">
            {m.prefix === '₹' ? formatCurrency(data[m.key]) : data[m.key]}
          </p>
        </div>
      ))}
    </div>
  );
};

const GaugeResult = ({ data, resultMap }) => {
  if (!data) return null;
  const score = data[resultMap.hero.key];
  return (
    <div className="text-center">
      <p className="text-xs font-semibold text-gray-400 uppercase mb-4">{resultMap.hero.label}</p>
      <div className="text-6xl font-black text-gray-900 mb-2">{score}</div>
      <div className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 font-bold text-sm">
        {data.rating}
      </div>
    </div>
  );
};

const getResultComponent = (type) => {
  const map = { donut: DonutResult, metric: MetricResult, milestone: MilestoneResult, gauge: GaugeResult };
  return map[type];
};

// --- MAIN COMPONENT ---
export default function CalculatorView() {
  const { slug } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  
  const [inputValues, setInputValues] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const config = getBySlug(slug);

  // Logic to determine back button destination
  const isDashboard = location.pathname.startsWith('/client');
  const backTo = isDashboard ? "/client/calculators" : "/calculators";

  useEffect(() => {
    if (config) {
      const init = {};
      config.fields.forEach(f => init[f.key] = f.default);
      setInputValues(init);
      setResult(null);
      setError('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [slug, config]);

  if (!config) return <div className="p-20 text-center">Calculator Not Found</div>;

  const handleCalculate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.post(`/calculate/${slug}`, inputValues);
      if (!res.data.success) throw new Error(res.data.message);
      setResult(res.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const ResultComponent = getResultComponent(config.resultType);

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-up">
      {/* HEADER & NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <Link to={backTo} className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:border-gray-900 hover:shadow-sm transition-all group">
          <ArrowLeft size={18} className="text-gray-400 group-hover:text-gray-900" />
        </Link>
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">{config.title}</h2>
          <p className="text-sm text-gray-400">{config.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        {/* INPUTS PANEL */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Adjustment Parameters</p>
            
            {config.fields.map(field => (
              <div key={field.key} className="mb-6 last:mb-0">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-700">{field.label}</label>
                  <span className="text-sm font-bold text-gray-900 tabular-nums px-3 py-1 bg-gray-50 rounded-lg">
                    {field.prefix === '₹' ? `₹${Math.round(inputValues[field.key]).toLocaleString('en-IN')}` : `${inputValues[field.key]}${field.suffix || ''}`}
                  </span>
                </div>

                {field.type === 'select' ? (
                  <div className="grid grid-cols-1 gap-2">
                    {field.options.map(opt => (
                      <button key={opt.value} onClick={() => setInputValues(p => ({...p, [field.key]: opt.value}))}
                        className={`text-left px-4 py-3 rounded-xl text-xs font-bold border transition-all ${inputValues[field.key] === opt.value ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="range" min={field.min} max={field.max} step={field.step} value={inputValues[field.key]}
                    onChange={(e) => setInputValues(p => ({...p, [field.key]: Number(e.target.value)}))}
                    className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-gray-900"
                  />
                )}
              </div>
            ))}

            <button onClick={handleCalculate} disabled={loading} className="w-full mt-4 py-4 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200">
              {loading ? 'Calculating...' : 'Generate Analysis'}
            </button>
            {error && <p className="mt-4 text-xs text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
          </div>
        </div>

        {/* RESULTS PANEL */}
        <div className="lg:col-span-3">
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm min-h-[400px] flex items-center justify-center relative overflow-hidden">
            {result ? (
              <div className="w-full animate-fade-up">
                <ResultComponent data={result} resultMap={config.resultMap} inputValues={inputValues} config={config} />
              </div>
            ) : (
              <div className="text-center opacity-40">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <config.icon size={28} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-400">Configure parameters on the left <br /> to see your financial projection.</p>
              </div>
            )}
          </div>

          {/* RELATED QUICK LINKS */}
          <div className="mt-8">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">You might also need</p>
            <div className="flex flex-wrap gap-2">
              {config.related.map(rSlug => {
                const rConfig = getBySlug(rSlug);
                if (!rConfig) return null;
                const Icon = rConfig.icon;
                return (
                  <Link key={rSlug} to={(isDashboard ? "/client/calculators/" : "/calculators/") + rSlug}
                    className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-all shadow-sm">
                    <Icon size={14} />{rConfig.title}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}