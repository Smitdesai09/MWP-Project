// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import {
//   TrendingUp, Landmark, Home, BarChart3,
//   Flame, Palmtree, ShieldCheck, ArrowRight
// } from 'lucide-react';

// const configs = [
//   { slug: 'sip', title: 'SIP Calculator', description: 'Small regular investments for high returns', icon: TrendingUp, category: 'investment', tag: 'Popular' },
//   { slug: 'lumpsum', title: 'Lump Sum', description: 'Project growth for one-time investments', icon: Landmark, category: 'investment' },
//   { slug: 'emi', title: 'EMI Tool', description: 'Plan your monthly loan repayments', icon: Home, category: 'debt' },
//   { slug: 'cagr', title: 'CAGR', description: 'Calculate compounded growth rates', icon: BarChart3, category: 'investment' },
//   { slug: 'inflation', title: 'Inflation', description: 'Effect of inflation on your money', icon: Flame, category: 'future' },
//   { slug: 'retirement', title: 'Retirement', description: 'Corpus needed for your golden years', icon: Palmtree, category: 'future' },
//   { slug: 'cibil', title: 'CIBIL Estimator', description: 'Check your estimated credit standing', icon: ShieldCheck, category: 'debt' },
// ];

// const categories = [
//   { key: 'all', label: 'All Tools' },
//   { key: 'investment', label: 'Investment' },
//   { key: 'debt', label: 'Debt' },
//   { key: 'future', label: 'Planning' },
// ];

// export default function CalculatorsList() {
//   const [activeCategory, setActiveCategory] = useState('all');
  
//   // Detect if we're in dashboard context
//   const isDashboard = window.location.pathname.startsWith('/client');
//   const basePath = isDashboard ? '/client/calculators' : '/calculators';
  
//   const filtered = activeCategory === 'all' ? configs : configs.filter(c => c.category === activeCategory);

//   return (
//     <div className="w-full animate-fade-up">
//       {/* Back Button - Fully Responsive */}
//       {!isDashboard && (
//         <div className="mb-6">
//           <Link
//             to="/"
//             className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-gray-400 hover:text-gray-900 transition-colors group py-2 px-3 rounded-lg hover:bg-gray-100 min-h-[44px]"
//           >
//             <ArrowRight size={16} className="sm:size-[18px] rotate-180 group-hover:-translate-x-1 transition-transform" />
//             <span className="hidden xs:inline">Back to Home</span>
//             <span className="xs:hidden">Back</span>
//           </Link>
//         </div>
//       )}

//       {/* Header Section - Responsive */}
//       <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
//         <div className="text-center md:text-left w-full md:w-auto">
//           <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
//             Financial Tools
//           </h2>
//           <p className="text-sm md:text-base font-medium text-gray-400 mt-1 md:mt-2">
//             Smart projections for smarter decisions.
//           </p>
//         </div>
        
//         {/* Category Filter Buttons - FULLY RESPONSIVE */}
//         <div className="w-full md:w-auto">
//           <div className="flex flex-wrap justify-center md:justify-end gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-gray-100 rounded-xl sm:rounded-2xl">
//             {categories.map(cat => (
//               <button
//                 key={cat.key}
//                 onClick={() => setActiveCategory(cat.key)}
//                 className={`flex-1 min-w-[70px] xs:min-w-[80px] sm:flex-none px-3 xs:px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 min-h-[40px] sm:min-h-[44px] ${
//                   activeCategory === cat.key
//                     ? 'bg-white text-gray-900 shadow-md scale-[1.02]'
//                     : 'text-gray-500 hover:text-gray-700 hover:bg-white/50 active:scale-95'
//                 }`}
//               >
//                 {cat.label}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Calculator Cards Grid - FULLY RESPONSIVE BUTTONS */}
//       <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
//         {filtered.map(calc => (
//           <Link
//             key={calc.slug}
//             to={`${basePath}/${calc.slug}`}
//             className="group relative block p-5 sm:p-6 bg-white rounded-2xl border border-gray-100 hover:border-gray-900 hover:shadow-2xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1 overflow-hidden"
//           >
//             {/* Hover Background Effect */}
//             <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
//             <div className="relative flex flex-col h-full">
//               {/* Icon & Tag Row */}
//               <div className="flex items-center justify-between mb-4 sm:mb-6">
//                 <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gray-50 group-hover:bg-gray-900 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0">
//                   <calc.icon size={20} className="sm:size-[22px] lg:size-[24px] text-gray-700 group-hover:text-white transition-colors duration-300" />
//                 </div>
//                 {calc.tag && (
//                   <span className="px-2 xs:px-3 py-1 bg-gray-900 text-white text-[8px] xs:text-[9px] sm:text-[10px] font-black rounded-full uppercase tracking-widest shrink-0">
//                     {calc.tag}
//                   </span>
//                 )}
//               </div>
              
//               {/* Title & Description */}
//               <h3 className="text-base sm:text-lg lg:text-xl font-black text-gray-900 mb-2 line-clamp-1">
//                 {calc.title}
//               </h3>
//               <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed mb-4 sm:mb-6 lg:mb-8 flex-grow line-clamp-2 xs:line-clamp-3">
//                 {calc.description}
//               </p>
              
//               {/* LAUNCH BUTTON - FULLY RESPONSIVE */}
//               <div className="mt-auto pt-4 sm:pt-5 border-t border-gray-50 group-hover:border-gray-200 transition-colors">
//                 <button
//                   type="button"
//                   className="w-full flex items-center justify-between gap-2 xs:gap-3 px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 bg-gray-50 group-hover:bg-gray-900 text-gray-700 group-hover:text-white rounded-xl sm:rounded-2xl font-black text-xs xs:text-sm transition-all duration-300 min-h-[48px] xs:min-[52px] sm:min-[56px] active:scale-[0.98]"
//                   onClick={(e) => e.preventDefault()}
//                 >
//                   <span className="uppercase tracking-wider">Launch Tool</span>
//                   <ArrowRight
//                     size={14}
//                     className="sm:size-[16px] group-hover:translate-x-1.5 transition-transform duration-300 shrink-0"
//                   />
//                 </button>
//               </div>
//             </div>
//           </Link>
//         ))}
//       </div>

//       {/* Empty State */}
//       {filtered.length === 0 && (
//         <div className="text-center py-12 sm:py-16">
//           <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <span className="text-2xl sm:text-3xl">🔍</span>
//           </div>
//           <p className="text-base sm:text-lg font-bold text-gray-600 mb-2">No tools found</p>
//           <p className="text-sm text-gray-400">Try selecting a different category</p>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  TrendingUp, Landmark, Home, BarChart3, 
  Flame, Palmtree, ShieldCheck, ArrowRight 
} from 'lucide-react';

const configs = [
  { slug: 'sip', title: 'SIP Calculator', description: 'Small regular investments for high returns', icon: TrendingUp, category: 'investment', tag: 'Popular' },
  { slug: 'lumpsum', title: 'Lump Sum', description: 'Project growth for one-time investments', icon: Landmark, category: 'investment' },
  { slug: 'emi', title: 'EMI Tool', description: 'Plan your monthly loan repayments', icon: Home, category: 'debt' },
  { slug: 'cagr', title: 'CAGR', description: 'Calculate compounded growth rates', icon: BarChart3, category: 'investment' },
  { slug: 'inflation', title: 'Inflation', description: 'Effect of inflation on your money', icon: Flame, category: 'future' },
  { slug: 'retirement', title: 'Retirement', description: 'Corpus needed for your golden years', icon: Palmtree, category: 'future' },
  { slug: 'cibil', title: 'CIBIL Estimator', description: 'Check your estimated credit standing', icon: ShieldCheck, category: 'debt' },
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
  const isDashboard = pathname.startsWith('/client');
  const basePath = isDashboard ? '/client/calculators' : '/calculators';
  
  const filtered = activeCategory === 'all' ? configs : configs.filter(c => c.category === activeCategory);

  return (
    <div className="w-full animate-fade-up">
      {!isDashboard && (
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-900 transition-colors group">
            <ArrowRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-display text-3xl font-black text-gray-900 tracking-tight">Financial Tools</h2>
          <p className="text-sm font-medium text-gray-400 mt-1">Smart projections for smarter decisions.</p>
        </div>
        
        <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-2xl w-fit">
          {categories.map(cat => (
            <button 
              key={cat.key} 
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(calc => (
          <Link 
            key={calc.slug} 
            to={`${basePath}/${calc.slug}`}
            className="group p-6 bg-white rounded-[2rem] border border-gray-100 hover:border-gray-900 hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-gray-50 group-hover:bg-gray-900 rounded-2xl flex items-center justify-center transition-all">
                <calc.icon size={22} className="text-gray-700 group-hover:text-white" />
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
              <span>Launch Tool</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}