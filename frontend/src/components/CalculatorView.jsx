// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
// import { ArrowLeft, TrendingUp, Landmark, Home, BarChart3, Flame, Palmtree, ShieldCheck, Calculator, RotateCcw } from 'lucide-react';
// import API from '../services/api';

// // ============================================
// // CONFIGURATION
// // ============================================
// const configs = [
//   {
//     slug: 'sip',
//     title: 'SIP Calculator',
//     description: 'Invest small amounts regularly for big returns',
//     icon: TrendingUp,
//     category: 'investment',
//     resultType: 'donut',
//     fields: [
//       { key: 'monthlyInvestment', label: 'Monthly Investment', min: 500, max: 200000, step: 500, default: 10000, prefix: '₹' },
//       { key: 'annualRate', label: 'Expected Return Rate', min: 1, max: 30, step: 0.5, default: 12, suffix: '%' },
//       { key: 'years', label: 'Time Period', min: 1, max: 40, step: 1, default: 10, suffix: 'Yr' }
//     ],
//     resultMap: {
//       hero: { label: 'Total Value', key: 'totalValue', prefix: '₹' },
//       segments: [
//         { label: 'Invested Amount', key: 'investedAmount', prefix: '₹', color: '#0a0a0a' },
//         { label: 'Estimated Returns', key: 'estimatedReturns', prefix: '₹', color: '#9ca3af' }
//       ]
//     },
//     related: ['lumpsum', 'retirement']
//   },
//   {
//     slug: 'lumpsum',
//     title: 'Lump Sum Calculator',
//     description: 'One-time investment growth projection',
//     icon: Landmark,
//     category: 'investment',
//     resultType: 'donut',
//     fields: [
//       { key: 'principal', label: 'Total Investment', min: 1000, max: 10000000, step: 1000, default: 500000, prefix: '₹' },
//       { key: 'rate', label: 'Expected Return Rate', min: 1, max: 30, step: 0.5, default: 12, suffix: '%' },
//       { key: 'years', label: 'Time Period', min: 1, max: 40, step: 1, default: 10, suffix: 'Yr' }
//     ],
//     resultMap: {
//       hero: { label: 'Total Value', key: 'totalValue', prefix: '₹' },
//       segments: [
//         { label: 'Invested Amount', key: 'investedAmount', prefix: '₹', color: '#0a0a0a' },
//         { label: 'Estimated Returns', key: 'estimatedReturns', prefix: '₹', color: '#9ca3af' }
//       ]
//     },
//     related: ['sip', 'cagr']
//   },
//   {
//     slug: 'emi',
//     title: 'EMI Calculator',
//     description: 'Monthly loan payment breakdown',
//     icon: Home,
//     category: 'debt',
//     resultType: 'donut',
//     fields: [
//       { key: 'loanAmount', label: 'Loan Amount', min: 10000, max: 10000000, step: 10000, default: 2500000, prefix: '₹' },
//       { key: 'rate', label: 'Interest Rate', min: 1, max: 30, step: 0.5, default: 8.5, suffix: '%' },
//       { key: 'tenure', label: 'Loan Tenure', min: 1, max: 30, step: 1, default: 20, suffix: 'Yr' }
//     ],
//     resultMap: {
//       hero: { label: 'Monthly EMI', key: 'emi', prefix: '₹' },
//       segments: [
//         { label: 'Principal', key: 'loanAmount', prefix: '₹', color: '#0a0a0a', fromInputs: true },
//         { label: 'Interest Paid', key: 'interestPaid', prefix: '₹', color: '#d1d5db' }
//       ]
//     },
//     related: ['cibil']
//   },
//   {
//     slug: 'cagr',
//     title: 'CAGR Calculator',
//     description: 'Measure investment performance',
//     icon: BarChart3,
//     category: 'investment',
//     resultType: 'metric',
//     fields: [
//       { key: 'initialValue', label: 'Initial Value', min: 1000, max: 10000000, step: 1000, default: 100000, prefix: '₹' },
//       { key: 'finalValue', label: 'Final Value', min: 1000, max: 100000000, step: 1000, default: 250000, prefix: '₹' },
//       { key: 'years', label: 'Time Period', min: 1, max: 40, step: 1, default: 5, suffix: 'Yr' }
//     ],
//     resultMap: {
//       hero: { label: 'CAGR', key: 'cagr', suffix: '%' }
//     },
//     related: ['lumpsum']
//   },
//   {
//     slug: 'inflation',
//     title: 'Inflation Calculator',
//     description: 'Erosion of purchasing power',
//     icon: Flame,
//     category: 'future',
//     resultType: 'metric',
//     fields: [
//       { key: 'amount', label: 'Current Cost', min: 100, max: 10000000, step: 100, default: 50000, prefix: '₹' },
//       { key: 'inflationRate', label: 'Inflation Rate', min: 1, max: 20, step: 0.5, default: 6, suffix: '%' },
//       { key: 'years', label: 'Time Period', min: 1, max: 40, step: 1, default: 10, suffix: 'Yr' }
//     ],
//     resultMap: {
//       hero: { label: 'Future Cost', key: 'futureCost', prefix: '₹' }
//     },
//     related: ['retirement']
//   },
//   {
//     slug: 'retirement',
//     title: 'Retirement Calculator',
//     description: 'Calculate required corpus',
//     icon: Palmtree,
//     category: 'future',
//     resultType: 'milestone',
//     fields: [
//       { key: 'currentAge', label: 'Current Age', min: 18, max: 60, step: 1, default: 28, suffix: 'Yr' },
//       { key: 'retirementAge', label: 'Retirement Age', min: 35, max: 70, step: 1, default: 55, suffix: 'Yr' },
//       { key: 'monthlyExpense', label: 'Monthly Expense', min: 5000, max: 500000, step: 1000, default: 30000, prefix: '₹' },
//       { key: 'inflationRate', label: 'Expected Inflation', min: 1, max: 15, step: 0.5, default: 6, suffix: '%' }
//     ],
//     resultMap: {
//       milestones: [
//         { label: 'Monthly Expense at Retirement', key: 'monthlyExpenseAtRetirement' },
//         { label: 'Yearly Expense', key: 'yearlyExpense' },
//         { label: 'Required Corpus', key: 'requiredCorpus' }
//       ]
//     },
//     related: ['sip', 'inflation']
//   },
//   {
//     slug: 'cibil',
//     title: 'CIBIL Estimator',
//     description: 'Estimated credit range',
//     icon: ShieldCheck,
//     category: 'debt',
//     resultType: 'gauge',
//     fields: [
//       {
//         key: 'paymentHistory',
//         label: 'Payment History',
//         type: 'select',
//         options: [
//           { value: 'good', label: 'Good' },
//           { value: 'average', label: 'Average' },
//           { value: 'poor', label: 'Poor' }
//         ],
//         default: 'good'
//       },
//       { key: 'creditUtilization', label: 'Utilization', min: 0, max: 100, step: 1, default: 20, suffix: '%' },
//       { key: 'loans', label: 'Active Loans', min: 0, max: 15, step: 1, default: 2, suffix: '' }
//     ],
//     resultMap: {
//       hero: { label: 'Score', key: 'estimatedScore' }
//     },
//     related: ['emi']
//   },
// ];

// const formatCurrency = (num) => {
//   if (num === undefined || num === null) return '₹0';
//   return '₹' + Math.round(num).toLocaleString('en-IN');
// };

// export default function CalculatorView() {
//   const { slug } = useParams();
//   const navigate = useNavigate();
//   const { pathname } = useLocation();
//   const [inputValues, setInputValues] = useState({});
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const config = configs.find(c => c.slug === slug);
//   const isDashboard = pathname.startsWith('/client');

//   useEffect(() => {
//     if (config) {
//       const init = {};
//       config.fields.forEach(f => init[f.key] = f.default);
//       setInputValues(init);
//       setResult(null);
//       setError(null);
//       window.scrollTo(0, 0);
//     }
//   }, [slug]);

//   if (!config) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen p-6 sm:p-8 text-center">
//         <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
//           <span className="text-3xl sm:text-4xl">🔍</span>
//         </div>
//         <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Calculator Not Found</h2>
//         <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 max-w-md mx-auto">
//           The calculator you're looking for doesn't exist.
//         </p>
//         <button
//           onClick={() => navigate(isDashboard ? '/client/calculators' : '/calculators')}
//           className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl hover:bg-gray-800 transition-all min-h-[48px] sm:min-[52px] active:scale-[0.98]"
//         >
//           Back to Tools
//         </button>
//       </div>
//     );
//   }

//   const handleCalculate = async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       const res = await API.post(`/api/calculate/${slug}`, inputValues);
      
//       if (res.data && res.success !== false) {
//         setResult(res.data);
//       } else {
//         throw new Error(res.message || 'Invalid response from server');
//       }
//     } catch (err) {
//       console.error("Calculation Error:", err);
//       setError(err.message || 'Failed to calculate. Please check your inputs and try again.');
//       setResult(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReset = () => {
//     const init = {};
//     config.fields.forEach(f => init[f.key] = f.default);
//     setInputValues(init);
//     setResult(null);
//     setError(null);
//   };

//   // ============================================
//   // RESULT RENDERING WITH RESPONSIVE BUTTONS
//   // ============================================
//   const renderResults = () => {
//     if (error) {
//       return (
//         <div className="text-center animate-fade-in p-6 sm:p-8 w-full max-w-md mx-auto">
//           <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
//             <span className="text-2xl sm:text-3xl">❌</span>
//           </div>
//           <h3 className="text-lg sm:text-xl font-bold text-red-600 mb-2 sm:mb-3">Calculation Failed</h3>
//           <p className="text-xs sm:text-sm text-gray-600 mb-6 sm:mb-8">{error}</p>
          
//           {/* ERROR ACTION BUTTONS - RESPONSIVE */}
//           <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
//             <button
//               onClick={handleCalculate}
//               disabled={loading}
//               className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 bg-gray-900 text-white text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl hover:bg-gray-800 transition-all min-h-[52px] sm:min-[56px] disabled:opacity-50 active:scale-[0.98]"
//             >
//               {loading ? (
//                 <>
//                   <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
//                   </svg>
//                   Retrying...
//                 </>
//               ) : (
//                 <>Try Again →</>
//               )}
//             </button>
            
//             <button
//               onClick={handleReset}
//               className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 bg-white text-gray-700 text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl border-2 border-gray-200 hover:border-gray-400 transition-all min-h-[52px] sm:min-[56px] active:scale-[0.98]"
//             >
//               <RotateCcw size={16} className="sm:size-[18px]" />
//               Reset
//             </button>
//           </div>
//         </div>
//       );
//     }

//     if (loading) {
//       return (
//         <div className="text-center animate-pulse p-8 sm:p-12 lg:p-16">
//           <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4 sm:mb-6"></div>
//           <p className="text-base sm:text-lg lg:text-xl font-semibold text-gray-600 mb-2">Calculating...</p>
//           <p className="text-xs sm:text-sm text-gray-400">Processing your financial data</p>
          
//           {/* CANCEL BUTTON DURING LOADING */}
//           <button
//             onClick={() => setLoading(false)}
//             className="mt-6 px-6 py-2.5 sm:py-3 text-sm font-bold text-gray-500 hover:text-gray-900 underline min-h-[44px]"
//           >
//             Cancel
//           </button>
//         </div>
//       );
//     }

//     if (!result) {
//       return (
//         <div className="text-center opacity-30 p-8 sm:p-12 lg:p-16">
//           <config.icon size={48} className="mx-auto mb-4 sm:mb-6 sm:size-[64px] lg:size-[80px]" strokeWidth={1} />
//           <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-gray-500 mb-2">
//             Adjust values to calculate
//           </p>
//           <p className="text-xs text-gray-400 mb-6 sm:mb-8">Configure your inputs and click "Run Analysis"</p>
          
//           {/* QUICK CALCULATE BUTTON */}
//           <button
//             onClick={handleCalculate}
//             className="px-8 py-3 sm:py-4 bg-gray-900 text-white text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl hover:bg-gray-800 transition-all min-h-[48px] sm:min-[52px] inline-flex items-center gap-2"
//           >
//             <Calculator size={18} className="sm:size-[20px]" />
//             Calculate Now
//           </button>
//         </div>
//       );
//     }

//     // DONUT CHART TYPE
//     if (config.resultType === 'donut') {
//       const heroValue = result[config.resultMap.hero.key];
//       const segments = config.resultMap.segments.map(s => ({
//         ...s,
//         value: s.fromInputs ? inputValues[s.key] : result[s.key]
//       }));
//       const total = segments.reduce((sum, s) => sum + s.value, 0);
//       const pct = total > 0 ? (segments[0].value / total) * 100 : 50;
//       const radius = typeof window !== 'undefined' && window.innerWidth < 768 ? 55 : 70;
//       const circ = 2 * Math.PI * radius;

//       return (
//         <div className="w-full text-center animate-fade-in px-2 sm:px-4 lg:px-6">
//           <p className="text-xs sm:text-sm font-black text-gray-400 uppercase mb-1 sm:mb-2 tracking-wide">
//             {config.resultMap.hero.label}
//           </p>
//           <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-6 sm:mb-8 tracking-tight">
//             {formatCurrency(heroValue)}
//           </p>
          
//           <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto mb-6 sm:mb-8">
//             <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
//               <circle cx="80" cy="80" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="14" />
//               <circle
//                 cx="80" cy="80" r={radius} fill="none" stroke="#0a0a0a" strokeWidth="14"
//                 strokeDasharray={circ}
//                 strokeDashoffset={circ - (pct / 100) * circ}
//                 strokeLinecap="round"
//                 className="transition-all duration-700 ease-out"
//               />
//             </svg>
            
//             <div className="absolute inset-0 flex flex-col items-center justify-center">
//               <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
//                 Principal
//               </span>
//               <span className="text-xs sm:text-sm lg:text-base font-black text-gray-900">
//                 {formatCurrency(segments[0].value)}
//               </span>
//             </div>
//           </div>
          
//           <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 max-w-sm mx-auto">
//             {segments.map(s => (
//               <div key={s.label} className="p-3 sm:p-4 lg:p-5 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100">
//                 <p className="text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wide">
//                   {s.label}
//                 </p>
//                 <p className="text-sm sm:text-base lg:text-lg font-black text-gray-900">
//                   {formatCurrency(s.value)}
//                 </p>
//               </div>
//             ))}
//           </div>
          
//           {/* RECALCULATE BUTTON */}
//           <button
//             onClick={handleCalculate}
//             className="mt-6 sm:mt-8 px-6 sm:px-8 py-2.5 sm:py-3 bg-gray-100 text-gray-700 text-xs sm:text-sm font-bold rounded-xl hover:bg-gray-200 transition-all min-h-[44px] sm:min-[48px] inline-flex items-center gap-2"
//           >
//             <RotateCcw size={14} className="sm:size-[16px]" />
//             Recalculate
//           </button>
//         </div>
//       );
//     }

//     // METRIC TYPE
//     if (config.resultType === 'metric') {
//       return (
//         <div className="text-center animate-fade-in p-4 sm:p-6 lg:p-8">
//           <p className="text-xs sm:text-sm font-black text-gray-400 uppercase mb-2 sm:mb-4 tracking-wide">
//             {config.resultMap.hero.label}
//           </p>
//           <p className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 tracking-tighter mb-6 sm:mb-8">
//             {config.slug === 'cagr'
//               ? `${result.cagr}%`
//               : formatCurrency(result.futureCost)
//             }
//           </p>
          
//           {/* ACTION BUTTONS */}
//           <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
//             <button
//               onClick={handleCalculate}
//               className="px-6 sm:px-8 py-3 sm:py-3.5 bg-gray-900 text-white text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl hover:bg-gray-800 transition-all min-h-[48px] sm:min-[52px]"
//             >
//               Recalculate
//             </button>
//             <button
//               onClick={handleReset}
//               className="px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-gray-700 text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl border-2 border-gray-200 hover:border-gray-400 transition-all min-h-[48px] sm:min-[52px]"
//             >
//               Start Over
//             </button>
//           </div>
//         </div>
//       );
//     }

//     // MILESTONE TYPE
//     if (config.resultType === 'milestone') {
//       return (
//         <div className="space-y-3 sm:space-y-4 w-full animate-fade-in p-2 sm:p-0">
//           {config.resultMap.milestones.map((m, i) => (
//             <div
//               key={m.key}
//               className={`p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-[1.5rem] border transition-all hover:shadow-md ${
//                 i === 2
//                   ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-lg'
//                   : 'bg-white border-gray-200'
//               }`}
//             >
//               <p className={`text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase mb-1 sm:mb-2 tracking-widest ${
//                 i === 2 ? 'text-gray-300' : 'text-gray-500'
//               }`}>
//                 {m.label}
//               </p>
//               <p className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight ${
//                 i === 2 ? 'text-white' : 'text-gray-900'
//               }`}>
//                 {formatCurrency(result[m.key])}
//               </p>
              
//               {i === 2 && (
//                 <div className="mt-3 pt-3 border-t border-gray-700">
//                   <p className="text-xs text-gray-300">💡 This is the corpus you need to retire comfortably</p>
//                 </div>
//               )}
//             </div>
//           ))}
          
//           {/* BOTTOM ACTION BUTTONS */}
//           <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
//             <button
//               onClick={handleCalculate}
//               className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 bg-gray-900 text-white text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl hover:bg-gray-800 transition-all min-h-[52px] sm:min-[56px]"
//             >
//               <Calculator size={18} className="sm:size-[20px]" />
//               Recalculate
//             </button>
//             <button
//               onClick={handleReset}
//               className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 bg-white text-gray-700 text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl border-2 border-gray-200 hover:border-gray-400 transition-all min-h-[52px] sm:min-[56px]"
//             >
//               <RotateCcw size={18} className="sm:size-[20px]" />
//               Reset Values
//             </button>
//           </div>
//         </div>
//       );
//     }

//     // GAUGE TYPE
//     if (config.resultType === 'gauge') {
//       const ratingColors = {
//         'Excellent': 'bg-green-100 text-green-700 border-green-200',
//         'Good': 'bg-blue-100 text-blue-700 border-blue-200',
//         'Average': 'bg-yellow-100 text-yellow-700 border-yellow-200',
//         'Poor': 'bg-red-100 text-red-700 border-red-200'
//       };
      
//       const ratingIcons = {
//         'Excellent': '🌟',
//         'Good': '✅',
//         'Average': '⚠️',
//         'Poor': '❌'
//       };

//       return (
//         <div className="text-center animate-fade-in p-4 sm:p-6 lg:p-8">
//           <p className="text-xs sm:text-sm font-black text-gray-400 uppercase mb-4 sm:mb-6 tracking-wide">
//             Estimated Credit Score
//           </p>
          
//           <div className="relative inline-block mb-4 sm:mb-6">
//             <p className="text-6xl sm:text-7xl lg:text-8xl font-black text-gray-900 tracking-tighter">
//               {result.estimatedScore}
//             </p>
//             <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 text-2xl sm:text-3xl lg:text-4xl">
//               {ratingIcons[result.rating]}
//             </div>
//           </div>
          
//           <div className={`inline-block px-5 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold text-sm sm:text-base lg:text-lg uppercase tracking-wider border ${
//             ratingColors[result.rating] || 'bg-blue-100 text-blue-700 border-blue-200'
//           }`}>
//             {result.rating}
//           </div>
          
//           <div className="mt-6 sm:mt-8 max-w-md mx-auto">
//             <div className="flex justify-between text-xs text-gray-500 mb-2 px-1">
//               <span>300</span>
//               <span>900</span>
//             </div>
//             <div className="h-3 sm:h-4 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 to-green-600 rounded-full"></div>
//             <div
//               className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-900 rounded-full border-2 border-white shadow-lg -mt-3.5 sm:-mt-4.5 mx-auto transition-all duration-500"
//               style={{ marginLeft: `${((result.estimatedScore - 300) / 600) * 100}%` }}
//             ></div>
//           </div>
          
//           <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-gray-50 rounded-xl border border-gray-200 text-left">
//             <p className="text-xs sm:text-sm font-bold text-gray-700 mb-2">💡 Tips to improve:</p>
//             <ul className="text-xs sm:text-sm text-gray-600 space-y-1.5">
//               {result.estimatedScore < 700 && <li>• Pay bills on time</li>}
//               {result.estimatedScore < 750 && <li>• Keep credit utilization below 30%</li>}
//               {result.estimatedScore < 800 && <li>• Maintain a good credit mix</li>}
//               {result.estimatedScore >= 750 && <li>✅ Great score! Keep it up!</li>}
//             </ul>
//           </div>
          
//           {/* ACTION BUTTONS */}
//           <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
//             <button
//               onClick={handleCalculate}
//               className="flex-1 px-6 py-3.5 sm:py-4 bg-gray-900 text-white text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl hover:bg-gray-800 transition-all min-h-[52px] sm:min-[56px]"
//             >
//               Check Again
//             </button>
//             <button
//               onClick={handleReset}
//               className="flex-1 px-6 py-3.5 sm:py-4 bg-white text-gray-700 text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl border-2 border-gray-200 hover:border-gray-400 transition-all min-h-[52px] sm:min-[56px]"
//             >
//               New Assessment
//             </button>
//           </div>
//         </div>
//       );
//     }

//     return null;
//   };

//   return (
//     <div className="w-full animate-fade-up">
//       {/* HEADER WITH BACK BUTTON - FULLY RESPONSIVE */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
//         <button
//           onClick={() => navigate(isDashboard ? '/client/calculators' : '/calculators')}
//           className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl border border-gray-200 bg-white flex items-center justify-center hover:border-gray-900 hover:shadow-lg transition-all shrink-0 min-w-[44px] sm:min-w-[48px] active:scale-95"
//         >
//           <ArrowLeft size={18} className="sm:size-[20px]" />
//         </button>
        
//         <div className="flex-1 min-w-0">
//           <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight truncate">
//             {config.title}
//           </h2>
//           <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-tight mt-0.5 sm:mt-1 truncate">
//             {config.description}
//           </p>
//         </div>
        
//         {/* MOBILE QUICK ACTIONS */}
//         <div className="hidden sm:flex gap-2 w-full sm:w-auto">
//           <button
//             onClick={handleReset}
//             className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 text-gray-700 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl hover:bg-gray-200 transition-all min-h-[40px] sm:min-[44px]"
//           >
//             <RotateCcw size={14} className="sm:hidden inline mr-1" />
//             <span className="hidden sm:inline">Reset</span>
//             <span className="sm:hidden">↺</span>
//           </button>
//         </div>
//       </div>

//       {/* MAIN CONTENT GRID */}
//       <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
        
//         {/* INPUT PANEL */}
//         <div className="lg:col-span-2 bg-white p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] border border-gray-100 shadow-sm order-2 lg:order-1">
//           <div className="flex items-center justify-between mb-6 sm:mb-8 pb-4 border-b border-gray-100">
//             <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">
//               Configuration
//             </p>
//             <button
//               onClick={handleReset}
//               className="sm:hidden px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 min-h-[36px]"
//             >
//               ↺ Reset
//             </button>
//           </div>
          
//           <div className="space-y-6 sm:space-y-8">
//             {config.fields.map(f => (
//               <div key={f.key}>
//                 <div className="flex justify-between items-center mb-3">
//                   <label className="text-[11px] sm:text-sm font-bold text-gray-600 uppercase tracking-tight">
//                     {f.label}
//                   </label>
//                   <span className="text-xs sm:text-sm font-black text-gray-900 bg-gray-50 px-2 sm:px-3 py-1 rounded-lg tabular-nums min-w-fit">
//                     {f.prefix}{inputValues[f.key]?.toLocaleString('en-IN') || f.default}{f.suffix}
//                   </span>
//                 </div>
                
//                 {f.type === 'select' ? (
//                   <div className="grid grid-cols-1 gap-2">
//                     {f.options.map(o => (
//                       <button
//                         key={o.value}
//                         onClick={() => setInputValues(p => ({...p, [f.key]: o.value}))}
//                         className={`w-full px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-200 min-h-[48px] sm:min-[52px] ${
//                           inputValues[f.key] === o.value
//                             ? 'bg-gray-900 text-white border-gray-900 shadow-md scale-[1.01]'
//                             : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98]'
//                         }`}
//                       >
//                         {o.label}
//                       </button>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="space-y-2">
//                     <input
//                       type="range"
//                       min={f.min}
//                       max={f.max}
//                       step={f.step}
//                       value={inputValues[f.key] || f.default}
//                       onChange={(e) => setInputValues(p => ({...p, [f.key]: Number(e.target.value)}))}
//                       className="w-full h-2.5 sm:h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:sm:w-7 [&::-webkit-slider-thumb]:sm:h-7 [&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:sm:w-7 [&::-moz-range-thumb]:sm:h-7 [&::-moz-range-thumb]:bg-gray-900 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
//                     />
//                     <div className="flex justify-between text-[10px] sm:text-xs text-gray-400">
//                       <span>{f.prefix}{f.min.toLocaleString()}{f.suffix}</span>
//                       <span>{f.prefix}{f.max.toLocaleString()}{f.suffix}</span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
            
//             {/* MAIN CALCULATE BUTTON - SUPER RESPONSIVE */}
//             <button
//               onClick={handleCalculate}
//               disabled={loading}
//               className="group w-full py-4 sm:py-4.5 lg:py-5 bg-gray-900 text-white text-xs sm:text-sm lg:text-base font-black uppercase tracking-wider rounded-xl sm:rounded-2xl lg:rounded-[1.5rem] hover:bg-black transition-all shadow-xl shadow-gray-200/50 hover:shadow-gray-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] min-h-[56px] sm:min-[60px] lg:min-[64px] flex items-center justify-center gap-2 sm:gap-3"
//             >
//               {loading ? (
//                 <>
//                   <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
//                   </svg>
//                   <span className="hidden xs:inline">Calculating...</span>
//                   <span className="xs:hidden">Loading...</span>
//                 </>
//               ) : (
//                 <>
//                   <Calculator size={18} className="sm:size-[20px] lg:size-[22px]" />
//                   <span className="hidden xs:inline">Run Analysis</span>
//                   <span className="xs:hidden">Calculate</span>
//                   <ArrowRight size={16} className="sm:size-[18px] group-hover:translate-x-1 transition-transform hidden sm:block" />
//                 </>
//               )}
//             </button>
//           </div>
//         </div>

//         {/* RESULTS PANEL */}
//         <div className="lg:col-span-3 bg-white p-6 sm:p-8 lg:p-12 rounded-2xl sm:rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[350px] sm:min-h-[450px] lg:min-h-[550px] flex items-center justify-center order-1 lg:order-2">
//           {renderResults()}
//         </div>
//       </div>
      
//       {/* RELATED TOOLS SECTION - RESPONSIVE BUTTONS */}
//       <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-100">
//         <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mb-4 sm:mb-5">
//           Related Tools
//         </p>
//         <div className="flex flex-wrap gap-2 sm:gap-3">
//            {config.related.map(rSlug => {
//              const r = configs.find(c => c.slug === rSlug);
//              return r ? (
//                <Link
//                  key={rSlug}
//                  to={`${isDashboard ? '/client/calculators/' : '/calculators/'}${rSlug}`}
//                  className="group flex items-center gap-2 xs:gap-3 px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5 bg-white border border-gray-100 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-gray-600 hover:border-gray-900 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 min-h-[44px] xs:min-[48px] sm:min-[52px] active:scale-[0.98]"
//                >
//                  <r.icon size={16} className="sm:size-[18px] shrink-0" />
//                  <span className="hidden xs:inline">{r.title}</span>
//                  <span className="xs:hidden truncate max-w-[80px]">{r.title.split(' ')[0]}</span>
//                  <ArrowRight size={14} className="sm:size-[16px] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 hidden sm:block" />
//                </Link>
//              ) : null;
//            })}
//         </div>
        
//         {/* BACK TO LIST BUTTON - MOBILE FRIENDLY */}
//         <div className="mt-6 sm:mt-8">
//           <button
//             onClick={() => navigate(isDashboard ? '/client/calculators' : '/calculators')}
//             className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-gray-50 text-gray-600 text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl hover:bg-gray-100 hover:text-gray-900 transition-all border border-gray-200 min-h:[48px] sm:min-[52px]"
//           >
//             <ArrowLeft size={16} className="sm:size-[18px]" />
//             <span>Back to All Tools</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Landmark, Home, BarChart3, Flame, Palmtree, ShieldCheck } from 'lucide-react';
import API from '../services/api';

const configs = [
  { slug: 'sip', title: 'SIP Calculator', description: 'Invest small amounts regularly for big returns', icon: TrendingUp, category: 'investment', resultType: 'donut', fields: [{ key: 'monthlyInvestment', label: 'Monthly Investment', min: 500, max: 200000, step: 500, default: 10000, prefix: '₹' }, { key: 'annualRate', label: 'Expected Return Rate', min: 1, max: 30, step: 0.5, default: 12, suffix: '%' }, { key: 'years', label: 'Time Period', min: 1, max: 40, step: 1, default: 10, suffix: 'Yr' }], resultMap: { hero: { label: 'Total Value', key: 'totalValue', prefix: '₹' }, segments: [{ label: 'Invested Amount', key: 'investedAmount', prefix: '₹', color: '#0a0a0a' }, { label: 'Estimated Returns', key: 'estimatedReturns', prefix: '₹', color: '#9ca3af' }] }, related: ['lumpsum', 'retirement'] },
  { slug: 'lumpsum', title: 'Lump Sum Calculator', description: 'One-time investment growth projection', icon: Landmark, category: 'investment', resultType: 'donut', fields: [{ key: 'principal', label: 'Total Investment', min: 1000, max: 10000000, step: 1000, default: 500000, prefix: '₹' }, { key: 'rate', label: 'Expected Return Rate', min: 1, max: 30, step: 0.5, default: 12, suffix: '%' }, { key: 'years', label: 'Time Period', min: 1, max: 40, step: 1, default: 10, suffix: 'Yr' }], resultMap: { hero: { label: 'Total Value', key: 'totalValue', prefix: '₹' }, segments: [{ label: 'Invested Amount', key: 'investedAmount', prefix: '₹', color: '#0a0a0a' }, { label: 'Estimated Returns', key: 'estimatedReturns', prefix: '₹', color: '#9ca3af' }] }, related: ['sip', 'cagr'] },
  { slug: 'emi', title: 'EMI Calculator', description: 'Monthly loan payment breakdown', icon: Home, category: 'debt', resultType: 'donut', fields: [{ key: 'loanAmount', label: 'Loan Amount', min: 10000, max: 10000000, step: 10000, default: 2500000, prefix: '₹' }, { key: 'rate', label: 'Interest Rate', min: 1, max: 30, step: 0.5, default: 8.5, suffix: '%' }, { key: 'tenure', label: 'Loan Tenure', min: 1, max: 30, step: 1, default: 20, suffix: 'Yr' }], resultMap: { hero: { label: 'Monthly EMI', key: 'emi', prefix: '₹' }, segments: [{ label: 'Principal', key: 'loanAmount', prefix: '₹', color: '#0a0a0a', fromInputs: true }, { label: 'Interest Paid', key: 'interestPaid', prefix: '₹', color: '#d1d5db' }] }, related: ['cibil'] },
  { slug: 'cagr', title: 'CAGR Calculator', description: 'Measure investment performance', icon: BarChart3, category: 'investment', resultType: 'metric', fields: [{ key: 'initialValue', label: 'Initial Value', min: 1000, max: 10000000, step: 1000, default: 100000, prefix: '₹' }, { key: 'finalValue', label: 'Final Value', min: 1000, max: 100000000, step: 1000, default: 250000, prefix: '₹' }, { key: 'years', label: 'Time Period', min: 1, max: 40, step: 1, default: 5, suffix: 'Yr' }], resultMap: { hero: { label: 'CAGR', key: 'cagr', suffix: '%' } }, related: ['lumpsum'] },
  { slug: 'inflation', title: 'Inflation Calculator', description: 'Erosion of purchasing power', icon: Flame, category: 'future', resultType: 'metric', fields: [{ key: 'amount', label: 'Current Cost', min: 100, max: 10000000, step: 100, default: 50000, prefix: '₹' }, { key: 'inflationRate', label: 'Inflation Rate', min: 1, max: 20, step: 0.5, default: 6, suffix: '%' }, { key: 'years', label: 'Time Period', min: 1, max: 40, step: 1, default: 10, suffix: 'Yr' }], resultMap: { hero: { label: 'Future Cost', key: 'futureCost', prefix: '₹' } }, related: ['retirement'] },
  { slug: 'retirement', title: 'Retirement Calculator', description: 'Calculate required corpus', icon: Palmtree, category: 'future', resultType: 'milestone', fields: [{ key: 'currentAge', label: 'Current Age', min: 18, max: 60, step: 1, default: 28, suffix: 'Yr' }, { key: 'retirementAge', label: 'Retirement Age', min: 35, max: 70, step: 1, default: 55, suffix: 'Yr' }, { key: 'monthlyExpense', label: 'Monthly Expense', min: 5000, max: 500000, step: 1000, default: 30000, prefix: '₹' }, { key: 'inflationRate', label: 'Expected Inflation', min: 1, max: 15, step: 0.5, default: 6, suffix: '%' }], resultMap: { milestones: [{ label: 'Monthly Expense at Retirement', key: 'monthlyExpenseAtRetirement' }, { label: 'Yearly Expense', key: 'yearlyExpense' }, { label: 'Required Corpus', key: 'requiredCorpus' }] }, related: ['sip', 'inflation'] },
  { slug: 'cibil', title: 'CIBIL Estimator', description: 'Estimated credit range', icon: ShieldCheck, category: 'debt', resultType: 'gauge', fields: [{ key: 'paymentHistory', label: 'Payment History', type: 'select', options: [{ value: 'good', label: 'Good' }, { value: 'average', label: 'Average' }, { value: 'poor', label: 'Poor' }], default: 'good' }, { key: 'creditUtilization', label: 'Utilization', min: 0, max: 100, step: 1, default: 20, suffix: '%' }, { key: 'loans', label: 'Active Loans', min: 0, max: 15, step: 1, default: 2, suffix: '' }], resultMap: { hero: { label: 'Score', key: 'estimatedScore' } }, related: ['emi'] },
];

const formatCurrency = (num) => {
  if (num === undefined || num === null) return '₹0';
  return '₹' + Math.round(num).toLocaleString('en-IN');
};

export default function CalculatorView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [inputValues, setInputValues] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  // FIX: track API errors to show user
  const [error, setError] = useState(null);

  const config = configs.find(c => c.slug === slug);
  const isDashboard = pathname.startsWith('/client');

  useEffect(() => {
    if (config) {
      const init = {};
      config.fields.forEach(f => init[f.key] = f.default);
      setInputValues(init);
      setResult(null);
      setError(null);
      window.scrollTo(0, 0);
    }
  }, [slug]);

  if (!config) return <div className="p-20 text-center font-bold">Calculator Not Found</div>;

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      // FIX: API instance baseURL must be 'http://localhost:5000/api'
      // so this correctly hits /api/calculate/:slug on the backend
      const res = await API.post(`/calculate/${slug}`, inputValues);
      setResult(res.data.data);
    } catch (err) {
      console.error("Calculation Error:", err);
      // FIX: show error message from backend or generic fallback
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    // FIX: show error state inside result panel
    if (error) return (
      <div className="text-center">
        <p className="text-xs font-bold text-red-500 uppercase tracking-widest">{error}</p>
      </div>
    );

    if (!result) return (
      <div className="text-center opacity-30">
        <config.icon size={48} className="mx-auto mb-4" strokeWidth={1} />
        <p className="text-[10px] font-black uppercase tracking-widest">Adjust values to calculate</p>
      </div>
    );

    if (config.resultType === 'donut') {
      const heroValue = result[config.resultMap.hero.key];
      const segments = config.resultMap.segments.map(s => ({
        ...s,
        value: s.fromInputs ? inputValues[s.key] : result[s.key]
      }));
      const total = segments.reduce((sum, s) => sum + s.value, 0);
      const pct = total > 0 ? (segments[0].value / total) * 100 : 50;
      const radius = 70, circ = 2 * Math.PI * radius;

      return (
        <div className="w-full text-center animate-fade-in">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">{config.resultMap.hero.label}</p>
          <p className="text-3xl font-black text-gray-900 mb-8">{formatCurrency(heroValue)}</p>
          <div className="relative w-40 h-40 mx-auto mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="14" />
              <circle cx="80" cy="80" r={radius} fill="none" stroke="#0a0a0a" strokeWidth="14" strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ} strokeLinecap="round" className="transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[9px] font-bold text-gray-400 uppercase">Principal</span>
              <span className="text-xs font-black text-gray-900">{formatCurrency(segments[0].value)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {segments.map(s => (
              <div key={s.label} className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">{s.label}</p>
                <p className="text-sm font-black text-gray-900">{formatCurrency(s.value)}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (config.resultType === 'metric') {
      return (
        <div className="text-center animate-fade-in">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-2">{config.resultMap.hero.label}</p>
          <p className="text-6xl font-black text-gray-900 tracking-tighter">
            {config.slug === 'cagr' ? `${result.cagr}%` : formatCurrency(result.futureCost)}
          </p>
        </div>
      );
    }

    if (config.resultType === 'milestone') {
      return (
        <div className="space-y-4 w-full animate-fade-in">
          {config.resultMap.milestones.map((m, i) => (
            <div key={m.key} className={`p-5 rounded-[1.5rem] border ${i === 2 ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 border-gray-100'}`}>
              <p className="text-[10px] font-bold uppercase opacity-60 mb-1">{m.label}</p>
              <p className="text-2xl font-black tracking-tight">{formatCurrency(result[m.key])}</p>
            </div>
          ))}
        </div>
      );
    }

    if (config.resultType === 'gauge') {
      return (
        <div className="text-center animate-fade-in">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-4">Estimated Credit Score</p>
          <p className="text-7xl font-black text-gray-900 mb-2">{result.estimatedScore}</p>
          <div className={`inline-block px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest ${result.rating === 'Excellent' ? 'bg-green-100 text-green-700' : result.rating === 'Good' ? 'bg-blue-100 text-blue-700' : result.rating === 'Average' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
            {result.rating}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="w-full animate-fade-up">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(isDashboard ? '/client/calculators' : '/calculators')}
          className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:border-gray-900 transition-all shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{config.title}</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{config.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 border-b pb-4">Configuration</p>
          <div className="space-y-8">
            {config.fields.map(f => (
              <div key={f.key}>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-tight">{f.label}</label>
                  <span className="text-xs font-black text-gray-900 bg-gray-50 px-2 py-1 rounded-lg">
                    {f.prefix}{inputValues[f.key] !== undefined ? Number(inputValues[f.key]).toLocaleString('en-IN') : f.default}{f.suffix}
                  </span>
                </div>
                {f.type === 'select' ? (
                  // FIX: changed grid-cols-1 to grid-cols-3 so all 3 options sit in a row
                  <div className="grid grid-cols-3 gap-2">
                    {f.options.map(o => (
                      <button 
                        key={o.value} 
                        onClick={() => setInputValues(p => ({...p, [f.key]: o.value}))} 
                        className={`px-2 py-3 rounded-xl text-xs font-bold border transition-all ${inputValues[f.key] === o.value ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input 
                    type="range" 
                    min={f.min} 
                    max={f.max} 
                    step={f.step} 
                    value={inputValues[f.key] !== undefined ? inputValues[f.key] : f.default}
                    onChange={(e) => setInputValues(p => ({...p, [f.key]: Number(e.target.value)}))} 
                    className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-gray-900" 
                  />
                )}
              </div>
            ))}
            {/* FIX: changed py-4.5 (invalid Tailwind class) to py-4 */}
            <button 
              onClick={handleCalculate} 
              disabled={loading}
              className="w-full py-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
            >
              {loading ? 'Calculating...' : 'Run Analysis'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white p-8 sm:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[450px] flex items-center justify-center">
          {renderResults()}
        </div>
      </div>
      
      <div className="mt-8 pt-8 border-t border-gray-100">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Related Tools</p>
        <div className="flex flex-wrap gap-2">
          {config.related.map(rSlug => {
            const r = configs.find(c => c.slug === rSlug);
            return r ? (
              <Link key={rSlug} to={`${isDashboard ? '/client/calculators/' : '/calculators/'}${rSlug}`} className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[11px] font-bold text-gray-600 hover:border-gray-900 transition-all">
                {r.title}
              </Link>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}