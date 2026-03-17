import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import {
  TrendingUp,
  ShieldCheck,
  Target,
  BarChart3,
  Calculator,
  BookOpen,
  ArrowRight,
  Star,
  ChevronRight,
  Wallet,
  PiggyBank,
  LineChart,
  Users,
  CheckCircle2,
  Zap
} from 'lucide-react'

const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full tracking-wide uppercase">
    {children}
  </span>
)

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <div
    className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-gray-900 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-up"
    style={{ animationDelay: delay }}
  >
    <div className="w-11 h-11 bg-gray-50 group-hover:bg-gray-900 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300">
      <Icon size={20} className="text-gray-700 group-hover:text-white transition-colors duration-300" />
    </div>
    <h3 className="font-display text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
  </div>
)

const StatCard = ({ value, label, icon: Icon }) => (
  <div className="text-center p-6">
    <div className="flex justify-center mb-2">
      <Icon size={22} className="text-gray-400" />
    </div>
    <div className="font-display text-3xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-sm text-gray-500 font-medium">{label}</div>
  </div>
)

const PlanCard = ({ name, price, features, highlight }) => (
  <div
    className={`relative p-7 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
      highlight
        ? 'bg-gray-900 border-gray-900 text-white shadow-2xl scale-105'
        : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-lg'
    }`}
  >
    {highlight && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-gray-900 text-xs font-bold rounded-full shadow-md">
        MOST POPULAR
      </div>
    )}
    <div className="mb-5">
      <p className="text-xs font-semibold tracking-widest uppercase mb-2 text-gray-400">{name}</p>
      <div className="flex items-end gap-1">
        <span className={`font-display text-4xl font-bold ${highlight ? 'text-white' : 'text-gray-900'}`}>
          {price}
        </span>
        {price !== 'Free' && <span className="text-sm mb-1.5 text-gray-400">/month</span>}
      </div>
    </div>
    <ul className="space-y-3 mb-7">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-2.5">
          <CheckCircle2 size={15} className={highlight ? 'text-green-400' : 'text-green-500'} />
          <span className={`text-sm ${highlight ? 'text-gray-300' : 'text-gray-600'}`}>{f}</span>
        </li>
      ))}
    </ul>
    <Link
      to="/register"
      className={`block w-full text-center py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
        highlight
          ? 'bg-white text-gray-900 hover:bg-gray-100'
          : 'bg-gray-900 text-white hover:bg-gray-700'
      }`}
    >
      Get Started
    </Link>
  </div>
)

const TestimonialCard = ({ name, role, text, rating }) => (
  <div className="p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
    <div className="flex gap-0.5 mb-4">
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
      ))}
    </div>
    <p className="text-sm text-gray-600 leading-relaxed mb-5 italic">"{text}"</p>
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
        <span className="text-xs font-bold text-gray-700">{name[0]}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{name}</p>
        <p className="text-xs text-gray-400">{role}</p>
      </div>
    </div>
  </div>
)

export default function Home() {
  const features = [
    { icon: Wallet, title: 'Expense Tracking', description: 'Log income and expenses by category with smart monthly budget alerts and visual charts.' },
    { icon: Target, title: 'Goal Planning', description: 'Set financial goals with corpus targets. Get required SIP or lump-sum calculations instantly.' },
    { icon: LineChart, title: 'Portfolio Tracking', description: 'Monitor MF, ELSS, PPF, NPS, FD, gold and equity holdings with gain/loss analytics.' },
    { icon: ShieldCheck, title: 'Risk Profiling', description: 'Answer a quick questionnaire and get a personalized asset-allocation recommendation.' },
    { icon: Calculator, title: 'Smart Calculators', description: 'SIP, EMI, CAGR, retirement, and inflation calculators — no spreadsheets needed.' },
    { icon: BookOpen, title: 'Expert Guidance', description: 'Advisor-curated notes, model portfolios, and a content hub with articles and FAQs.' },
  ]

  const plans = [
    { name: 'Free', price: 'Free', features: ['Expense tracking', 'Basic goal planner', '2 calculators', 'Community access'] },
    { name: 'Basic', price: '₹199', features: ['Everything in Free', 'Portfolio tracking', 'All calculators', 'Monthly PDF report', 'CSV export'], highlight: true },
    { name: 'Premium', price: '₹499', features: ['Everything in Basic', 'Advisor consultations', 'Secure document vault', 'Priority support', 'Custom rebalancing'] },
  ]

  const testimonials = [
    { name: 'Priya Sharma', role: 'Software Engineer, Pune', text: 'Wealth Planner helped me finally understand where my money goes. The SIP calculator alone saved me hours of spreadsheet work.', rating: 5 },
    { name: 'Rohan Mehta', role: 'Freelance Designer, Ahmedabad', text: 'The risk profiling feature gave me clarity. I now have a proper equity-debt allocation that matches my comfort level.', rating: 5 },
    { name: 'Ananya Patel', role: 'CA, Mumbai', text: 'Clean interface, powerful features. I recommend it to all my younger clients who are just starting their investment journey.', rating: 4 },
  ]

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-up">
            <Badge>
              <Zap size={10} />
              Now with Advisor Consultations
            </Badge>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mt-6 mb-6 leading-[1.08] tracking-tight animate-fade-up-delay-1">
            Your wealth,
            <br />
            <span className="italic font-normal text-gray-500">finally under control.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-up-delay-2">
            Track expenses, plan goals, monitor investments, and get expert guidance — all in one clean, privacy-first portal built for Indian investors.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up-delay-3">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
            >
              Start for free <ArrowRight size={16} />
            </Link>

            {/* <Link
              to="#features"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              Explore features <ChevronRight size={16} />
            </Link> */}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            <StatCard value="10K+" label="Active Users" icon={Users} />
            <StatCard value="₹50Cr+" label="Wealth Tracked" icon={TrendingUp} />
            <StatCard value="98%" label="Goal Accuracy" icon={Target} />
            <StatCard value="4.9★" label="User Rating" icon={Star} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge>
              <BarChart3 size={10} />
              Features
            </Badge>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mt-4 mb-4 tracking-tight">
              Everything you need,
              <br />
              <span className="italic font-normal text-gray-400">nothing you don't.</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base leading-relaxed">
              A complete suite of financial tools tailored for Indian investors — from daily expense tracking to retirement planning.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={`${i * 0.07}s`} />
            ))}
          </div>
        </div>
      </section>

      {/* Calculators CTA */}
      <section id="calculators" className="py-16 px-4 bg-gray-900">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl font-bold text-white mb-2">Free financial calculators</h2>
            <p className="text-gray-400 text-sm">SIP · EMI · CAGR · Retirement · Inflation — no signup needed</p>
          </div>
          <Link
            to="/register"
            className="flex-shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Try Calculators <Calculator size={16} />
          </Link>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#fafaf8]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge>
              <PiggyBank size={10} />
              Pricing
            </Badge>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mt-4 mb-4 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base">
              Start free, upgrade when you're ready. No hidden charges, no commitment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-center">
            {plans.map((p) => (
              <PlanCard key={p.name} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge>
              <Star size={10} />
              Testimonials
            </Badge>
            <h2 className="font-display text-4xl font-bold text-gray-900 mt-4 mb-3 tracking-tight">
              Trusted by real investors
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 p-5">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
            Ready to take control
            <br />
            <span className="italic font-normal text-gray-400">of your wealth?</span>
          </h2>
          <p className="text-gray-500 mb-8 text-base leading-relaxed">
            Join thousands of Indian investors who use Wealth Planner to make smarter financial decisions every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
            >
              Create free account <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-4 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
              <TrendingUp size={13} color="white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-sm font-bold text-gray-900">
              Wealth <span className="font-normal text-gray-400">Planner</span>
            </span>
          </div>
         
          <p className="text-xs text-gray-400">© 2026 Wealth Planner</p>
        </div>
      </footer>
    </div>
  )
}