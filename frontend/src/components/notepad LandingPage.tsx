import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    { icon: '👷', title: 'Subcontractor Management', description: 'Track quotations, payments, and balances for all subcontractors in one place.' },
    { icon: '👥', title: 'Workforce Management', description: 'Manage workers, track attendance, and process weekly payroll efficiently.' },
    { icon: '📦', title: 'Store & Inventory', description: 'Track materials, supplies, and stock levels across multiple projects in real-time.' },
    { icon: '🚚', title: 'Procurement', description: 'Create purchase orders and manage supplier relationships seamlessly.' },
    { icon: '💰', title: 'Financial Tracking', description: 'Income, expenses, VAT, and profit/loss reporting at your fingertips.' },
    { icon: '📋', title: 'Site Diary', description: 'Daily site records, activities, workers, and incident logging for compliance.' },
    { icon: '📊', title: 'Comprehensive Reports', description: '12+ reports with filtering, search, and CSV export capabilities.' },
    { icon: '🧾', title: 'Invoice Management', description: 'Create and track client invoices with automatic 16% VAT calculations.' }
  ];

  const pricingPlans = [
    { name: 'Starter', price: 'KSh 5,000', period: '/month', features: ['Up to 3 active projects', '5 team members', 'Basic financial reports', 'Email support'], highlighted: false },
    { name: 'Professional', price: 'KSh 15,000', period: '/month', features: ['Up to 15 active projects', '20 team members', 'All reports & analytics', 'Priority support', 'API access'], highlighted: true },
    { name: 'Enterprise', price: 'Custom', period: '', features: ['Unlimited projects', 'Unlimited users', 'Custom report builder', '24/7 dedicated support'], highlighted: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700 fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">BOCHABERI</span>
              <span className="ml-1 text-xs text-slate-400">Construction Suite</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-slate-300 hover:text-amber-500 transition">Features</a>
              <a href="#pricing" className="text-sm text-slate-300 hover:text-amber-500 transition">Pricing</a>
              <button 
                onClick={() => navigate('/login')} 
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-md hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/25 transition-all duration-200"
              >
                Log in
              </button>
              <button 
                onClick={() => navigate('/login')} 
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-md hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/25 transition-all duration-200"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Matching login page hero */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Hero Text */}
            <div className="text-left">
              <span className="text-amber-500 font-semibold text-sm uppercase tracking-wider">Welcome to</span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">
                BOCHABERI
              </h1>
              <p className="text-2xl font-semibold text-amber-500 mb-3">
                Construction Financial Management Simplified
              </p>
              <p className="text-slate-300 text-base leading-relaxed mb-6">
                Streamline project finances, track costs in real-time, and make data-driven decisions with confidence.
              </p>
              <div className="flex gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-slate-400 text-sm">Real-time Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-slate-400 text-sm">Smart Reports</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-slate-400 text-sm">Secure Access</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => navigate('/login')} 
                  className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-md hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/25 transition-all duration-200"
                >
                  Get Started
                </button>
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="px-6 py-3 text-sm font-semibold text-slate-300 border border-slate-600 rounded-md hover:bg-slate-800 transition-all duration-200"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Right Side - Preview Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-slate-400 ml-2">Dashboard Preview</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                  <div><span className="font-medium text-white text-sm">Nairobi Heights Apartments</span><div className="text-xs text-slate-400">Progress: 35%</div></div>
                  <div className="text-right"><span className="text-amber-500 text-sm font-medium">KSh 15.7M</span><div className="text-xs text-slate-400">Revenue</div></div>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                  <div><span className="font-medium text-white text-sm">Kisii Teaching Hospital</span><div className="text-xs text-slate-400">Progress: 15%</div></div>
                  <div className="text-right"><span className="text-amber-500 text-sm font-medium">KSh 18.7M</span><div className="text-xs text-slate-400">Revenue</div></div>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                  <div><span className="font-medium text-white text-sm">Mombasa Port Road</span><div className="text-xs text-slate-400">Progress: 45%</div></div>
                  <div className="text-right"><span className="text-amber-500 text-sm font-medium">KSh 40.0M</span><div className="text-xs text-slate-400">Revenue</div></div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700 flex justify-between">
                <span className="text-xs text-slate-400">Total Projects: 5</span>
                <span className="text-xs text-amber-500">Active →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 bg-slate-800/30 border-y border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div><div className="text-2xl font-bold text-amber-500">50+</div><div className="text-sm text-slate-400">Active Companies</div></div>
            <div><div className="text-2xl font-bold text-amber-500">200+</div><div className="text-sm text-slate-400">Projects Managed</div></div>
            <div><div className="text-2xl font-bold text-amber-500">12+</div><div className="text-sm text-slate-400">Reports Available</div></div>
            <div><div className="text-2xl font-bold text-amber-500">24/7</div><div className="text-sm text-slate-400">Support</div></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-12">Everything You Need to Run Your Construction Business</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-slate-800/50 backdrop-blur-sm p-5 rounded-xl border border-slate-700 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer" 
                onClick={() => navigate('/login')}
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-12">Simple, Transparent Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, idx) => (
              <div key={idx} className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border ${plan.highlighted ? 'border-amber-500 shadow-lg shadow-amber-500/10' : 'border-slate-700'} p-6`}>
                {plan.highlighted && <div className="text-center text-xs text-amber-500 mb-2 font-semibold">🔥 Most Popular</div>}
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold text-amber-500">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="text-sm text-slate-300">✓ {feature}</li>
                  ))}
                </ul>
                <button 
                  onClick={() => navigate('/login')} 
                  className={`w-full py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${plan.highlighted ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-amber-700' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-amber-600 to-amber-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to Transform Your Construction Management?</h2>
          <p className="text-amber-100 mb-8">Join hundreds of construction companies using BOCHABERI to manage their projects efficiently.</p>
          <button 
            onClick={() => navigate('/login')} 
            className="px-6 py-3 bg-white text-amber-600 rounded-lg hover:bg-gray-100 transition font-semibold shadow-lg"
          >
            Start Free Trial
          </button>
          <p className="text-amber-100 text-sm mt-6">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-400">
          <p>&copy; 2026 BOCHABERI Construction Suite. All rights reserved.</p>
          <p className="mt-1 text-xs">Built with ❤️ by Finite Element Designs | Nairobi, Kenya</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;