import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HardHat } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [hoveredTestimonial, setHoveredTestimonial] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Moving text animation words for hero section
  const heroMovingWords = [
    '✓ Save 20+ hours weekly', '✓ Reduce costs by 40%', '✓ Real-time insights', 
    '✓ KRA compliant', '✓ 99.9% uptime', '✓ 500+ happy clients'
  ];

  // Moving text animation words for bottom banner
  const bottomMovingWords = [
    '🚀 Streamline Projects', '💰 Save Money', '📊 Real-time Reports', 
    '👷 Subcontractors', '👥 Workforce', '📦 Inventory', 
    '🏗️ Construction', '📈 Grow Faster', '🔒 Secure Data'
  ];

  const [currentHeroWordIndex, setCurrentHeroWordIndex] = useState(0);
  const [currentStatIndex, setCurrentStatIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroWordIndex((prev) => (prev + 1) % heroMovingWords.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Animated stats counter effect
  useEffect(() => {
    const statsInterval = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(statsInterval);
  }, []);

  const features = [
    { icon: '👷', title: 'Subcontractor Management', description: 'Track quotations, payments, and balances for all subcontractors in one place.', benefits: 'Save 10+ hours weekly on payment tracking' },
    { icon: '👥', title: 'Workforce Management', description: 'Manage workers, track attendance, and process weekly payroll efficiently.', benefits: 'Reduce payroll errors by 95%' },
    { icon: '📦', title: 'Store & Inventory', description: 'Track materials, supplies, and stock levels across multiple projects in real-time.', benefits: 'Prevent stockouts and reduce waste' },
    { icon: '🚚', title: 'Procurement', description: 'Create purchase orders and manage supplier relationships seamlessly.', benefits: '40% faster procurement cycle' },
    { icon: '💰', title: 'Financial Tracking', description: 'Income, expenses, VAT, and profit/loss reporting at your fingertips.', benefits: 'Real-time financial visibility' },
    { icon: '📋', title: 'Site Diary', description: 'Daily site records, activities, workers, and incident logging for compliance.', benefits: 'Complete audit trail' },
    { icon: '📊', title: 'Comprehensive Reports', description: '12+ reports with filtering, search, and CSV export capabilities.', benefits: 'Data-driven decisions' },
    { icon: '🧾', title: 'Invoice Management', description: 'Create and track client invoices with automatic 16% VAT calculations.', benefits: 'KRA compliant' }
  ];

  const testimonials = [
    { name: 'John Mwangi', role: 'Project Manager', company: 'Nairobi Heights Construction', text: 'BOCHABERI has transformed how we manage subcontractor payments. The quotation and payment tracking alone saves us 5+ hours every week!', rating: 5, image: '👨‍💼' },
    { name: 'Mary Wanjiku', role: 'Site Supervisor', company: 'Kisii Teaching Hospital Project', text: 'The site diary feature is brilliant. We can now track daily activities, workers, and deliveries all in one place. Game changer!', rating: 5, image: '👩‍💼' },
    { name: 'James Otieno', role: 'Quantity Surveyor', company: 'Mombasa Port Road Project', text: 'The reports module gives me exactly what I need. Project profitability at a glance with just a few clicks. Highly recommended!', rating: 5, image: '👨‍💻' }
  ];

  const pricingPlans = [
    { 
      name: 'Starter', 
      monthlyPrice: '$69', 
      annualPrice: '$799',
      period: '/month', 
      features: ['Up to 3 active projects', '5 team members', 'Basic financial reports', 'Email support', '30-day data retention'], 
      highlighted: false, 
      buttonText: 'Start Free Trial' 
    },
    { 
      name: 'Professional', 
      monthlyPrice: '$159', 
      annualPrice: '$1,599',
      period: '/month', 
      features: ['Up to 15 active projects', '20 team members', 'All reports & analytics', 'Priority support', 'Unlimited data retention', 'API access', 'Advanced filters'], 
      highlighted: true, 
      buttonText: 'Start Free Trial' 
    },
    { 
      name: 'Enterprise', 
      monthlyPrice: '$399', 
      annualPrice: '$3,999',
      period: '/month', 
      features: ['Unlimited projects', 'Unlimited users', 'Custom report builder', '24/7 dedicated support', 'On-premise option', 'SLA guarantee', 'Training included'], 
      highlighted: false, 
      buttonText: 'Contact Sales' 
    }
  ];

  const faqs = [
    { question: 'How does the free trial work?', answer: 'Our 14-day free trial gives you full access to all Professional plan features. No credit card required. You can cancel anytime.' },
    { question: 'Can I change my plan later?', answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.' },
    { question: 'Is my data secure?', answer: 'Absolutely. We use enterprise-grade encryption and follow industry best practices to keep your data safe.' },
    { question: 'Do you offer training?', answer: 'Yes, we provide onboarding training for all paid plans. Enterprise plans include dedicated training sessions.' },
    { question: 'Can I export my data?', answer: 'Yes, you can export all your data to CSV or PDF at any time.' },
    { question: 'What payment methods do you accept?', answer: 'We accept M-Pesa, bank transfers, and credit cards.' }
  ];

  const subscriptionBenefits = [
    { title: 'Cancel Anytime', description: 'No long-term contracts. Cancel your subscription with just one click.', icon: '🔓' },
    { title: 'Secure Payments', description: 'All payments are processed through secure, encrypted channels.', icon: '🔒' },
    { title: 'Monthly Billing', description: 'Simple monthly billing with no hidden fees.', icon: '📅' },
    { title: 'Volume Discounts', description: 'Get special pricing for multiple projects or long-term commitments.', icon: '💰' }
  ];

  // Get current price based on billing cycle
  const getCurrentPrice = (plan: any) => {
    if (billingCycle === 'monthly') {
      return { price: plan.monthlyPrice, period: '/month' };
    } else {
      const monthlyTotal = parseInt(plan.monthlyPrice.replace('$', '')) * 12;
      const annualPriceValue = parseInt(plan.annualPrice.replace('$', '').replace(',', ''));
      const savings = monthlyTotal - annualPriceValue;
      return { price: plan.annualPrice, period: '/year', savings: `Save $${savings}` };
    }
  };

  // Floating animation for stats
  const floatingStats = [
    { value: '500+', label: 'Active Companies', icon: '🏢' },
    { value: '10k+', label: 'Users', icon: '👥' },
    { value: '12+', label: 'Reports', icon: '📊' },
    { value: '99.9%', label: 'Uptime', icon: '⚡' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/95 backdrop-blur-md border-b border-slate-700 shadow-lg' : 'bg-transparent'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center cursor-pointer group" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/25 mr-2 group-hover:scale-105 transition-transform">
                <HardHat size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">BOCHABERI</span>
              <span className="ml-1 text-xs text-slate-400">Construction Suite</span>
            </motion.div>
            <div className="hidden md:flex items-center gap-6">
              {['features', 'subscription', 'testimonials', 'pricing', 'faq'].map((item, idx) => (
                <motion.a
                  key={item}
                  href={`#${item}`}
                  className="text-sm text-slate-300 hover:text-amber-500 transition"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </motion.a>
              ))}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')} 
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-md hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/25 transition-all duration-200"
              >
                Log in
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')} 
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-md hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/25 transition-all duration-200"
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>







{/* Hero Section */}
<section className="pt-24 pb-10 px-4 relative">
  <div className="max-w-7xl mx-auto">
    <div className="text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="inline-flex items-center gap-3 bg-amber-500/10 backdrop-blur-sm rounded-full px-4 py-1.5 border border-amber-500/20 mb-5"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <HardHat size={14} className="text-amber-400" />
          <span className="text-amber-400 text-xs font-medium">Trusted by 500+ Construction Companies</span>
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
          Manage Your Construction
          <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent block"> Projects Smarter</span>
        </h1>
        
        {/* Text size: 17px (5.5% reduction from 18px) */}
        <p className="text-[17px] text-slate-300 max-w-2xl mx-auto mb-7">
          From subcontractors and payroll to stores and site diary — everything you need to run successful construction projects in one platform.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-5">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            onClick={() => navigate('/login')} 
            className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-md hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/25 transition-all duration-200"
          >
            Start Free Trial
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} 
            className="px-6 py-3 text-sm font-semibold text-slate-300 border border-slate-600 rounded-md hover:bg-slate-800 transition-all duration-200"
          >
            Learn More
          </motion.button>
        </div>
        <p className="text-xs text-slate-400 mb-4">No credit card required • 14-day free trial • Cancel anytime</p>
        
        {/* Moving Text Below the guarantee line */}
        <motion.div 
          className="py-2 px-5 bg-slate-800/50 rounded-full inline-block"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">✨ What you get:</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={currentHeroWordIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="text-amber-400 font-medium text-xs"
              >
                {heroMovingWords[currentHeroWordIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  </div>
</section>




      {/* Stats Section with floating animation */}
      <section className="py-8 bg-slate-800/30 border-y border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {floatingStats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="cursor-pointer"
              >
                <motion.div
                  animate={{ 
                    scale: currentStatIndex === idx ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl font-bold text-amber-500"
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Powerful Features for Modern Construction</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">Everything you need to streamline your construction business</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                onMouseEnter={() => setHoveredFeature(idx)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="bg-slate-800/50 backdrop-blur-sm p-5 rounded-xl border border-slate-700 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer group"
                onClick={() => navigate('/login')}
              >
                <motion.div 
                  className="text-3xl mb-3"
                  animate={{ scale: hoveredFeature === idx ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-400 mb-2">{feature.description}</p>
                <motion.div 
                  className="text-xs text-amber-500/70 flex items-center gap-1"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: hoveredFeature === idx ? 1 : 0.7 }}
                >
                  <span>✨ {feature.benefits}</span>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Benefits Section */}
      <section id="subscription" className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Simple, Transparent Subscription</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">No hidden fees, no surprises. Just pay for what you need.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {subscriptionBenefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -3 }}
                className="text-center p-6 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-amber-500/30 transition-all"
              >
                <motion.div 
                  className="text-4xl mb-3"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {benefit.icon}
                </motion.div>
                <h3 className="font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-400">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section with Billing Toggle */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Choose Your Plan</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">All plans include a 14-day free trial. No credit card required.</p>
          </motion.div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-10">
            <motion.div 
              className="inline-flex items-center gap-3 p-1 bg-slate-800 rounded-full border border-slate-700"
              animate={{ boxShadow: billingCycle === 'annual' ? '0 0 10px rgba(245, 158, 11, 0.3)' : 'none' }}
            >
              <motion.button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  billingCycle === 'monthly' 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25' 
                    : 'text-slate-400 hover:text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Monthly
              </motion.button>
              <motion.button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  billingCycle === 'annual' 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25' 
                    : 'text-slate-400 hover:text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Annual <span className="text-amber-400 text-xs ml-1">Save up to 20%</span>
              </motion.button>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, idx) => {
              const currentPrice = getCurrentPrice(plan);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border ${plan.highlighted ? 'border-amber-500 shadow-lg shadow-amber-500/10 relative' : 'border-slate-700'} p-6 transition-all`}
                >
                  {plan.highlighted && (
                    <motion.div 
                      className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold px-3 py-1 rounded-full"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🔥 Most Popular
                    </motion.div>
                  )}
                  <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                  <div className="mt-2 mb-4">
                    <span className="text-4xl font-bold text-amber-500">{currentPrice.price}</span>
                    <span className="text-slate-400">{currentPrice.period}</span>
                    {currentPrice.savings && (
                      <motion.div 
                        className="text-xs text-green-400 mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        {currentPrice.savings}
                      </motion.div>
                    )}
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, fIdx) => (
                      <motion.li 
                        key={fIdx} 
                        className="text-sm text-slate-300 flex items-center gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: fIdx * 0.05 }}
                        viewport={{ once: true }}
                      >
                        <span className="text-amber-500">✓</span> {feature}
                      </motion.li>
                    ))}
                  </ul>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/login')} 
                    className={`w-full py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${plan.highlighted ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-amber-700' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
                  >
                    {plan.buttonText}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
          <p className="text-center text-xs text-slate-400 mt-8">* All prices are in USD. Kenyan clients can pay via M-Pesa.</p>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="py-12 px-4 bg-slate-800/30">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-lg font-semibold text-white mb-4">We Accept</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {['💳 Visa / Mastercard', '📱 M-Pesa', '🏦 Bank Transfer', '💼 Corporate Invoice'].map((method, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 hover:border-amber-500/30 transition-all"
              >
                <span className="text-white text-sm">{method}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Trusted by Industry Leaders</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">Join hundreds of construction professionals who love BOCHABERI</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                onMouseEnter={() => setHoveredTestimonial(idx)}
                onMouseLeave={() => setHoveredTestimonial(null)}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-amber-500/30 transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.span 
                      key={i} 
                      className="text-yellow-500"
                      animate={{ scale: hoveredTestimonial === idx ? [1, 1.2, 1] : 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      ★
                    </motion.span>
                  ))}
                </div>
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-700">
                  <motion.div 
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {testimonial.image}
                  </motion.div>
                  <div>
                    <p className="font-semibold text-white text-sm">{testimonial.name}</p>
                    <p className="text-xs text-slate-400">{testimonial.role}</p>
                    <p className="text-xs text-amber-500/70">{testimonial.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">Got questions? We've got answers.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.01, x: 3 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700 hover:border-amber-500/30 transition-all"
              >
                <motion.h3 
                  className="font-semibold text-white mb-2"
                  whileHover={{ color: '#f59e0b' }}
                >
                  {faq.question}
                </motion.h3>
                <p className="text-sm text-slate-400">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Moving Text Banner */}
      <div className="py-4 bg-amber-500/10 backdrop-blur-sm border-y border-amber-500/20 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...bottomMovingWords, ...bottomMovingWords].map((word, idx) => (
            <motion.span 
              key={idx} 
              className="mx-8 text-amber-400 text-sm font-medium"
              whileHover={{ scale: 1.05, color: '#fbbf24' }}
            >
              {word} <span className="text-amber-600 mx-2">✦</span>
            </motion.span>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-amber-600 to-amber-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            className="flex items-center justify-center gap-3 mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <HardHat size={24} className="text-white" />
            </motion.div>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Ready to Transform Your Construction Management?
            </motion.h2>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-amber-100 mb-8 text-lg"
          >
            Join thousands of construction professionals who trust BOCHABERI to manage their projects efficiently.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
              onClick={() => navigate('/login')} 
              className="px-8 py-3 bg-white text-amber-600 rounded-lg hover:bg-gray-100 transition font-semibold shadow-lg"
            >
              Start Free Trial
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')} 
              className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition font-semibold"
            >
              Contact Sales
            </motion.button>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-amber-100 text-sm mt-6"
          >
            No credit card required • 14-day free trial • Cancel anytime
          </motion.p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center mb-8">
            <motion.div 
              className="flex items-center gap-2 mb-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                <HardHat size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">BOCHABERI</span>
              <span className="text-xs text-slate-400">Construction Suite</span>
            </motion.div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {['Product', 'Resources', 'Company', 'Legal'].map((section, idx) => (
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <h4 className="font-semibold text-white mb-3 text-sm">{section}</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  {section === 'Product' && (
                    <>
                      <li><a href="#features" className="hover:text-amber-500 transition">Features</a></li>
                      <li><a href="#pricing" className="hover:text-amber-500 transition">Pricing</a></li>
                      <li><a href="#subscription" className="hover:text-amber-500 transition">Subscription</a></li>
                    </>
                  )}
                  {section === 'Resources' && (
                    <>
                      <li><a href="#faq" className="hover:text-amber-500 transition">FAQ</a></li>
                      <li><a href="#" className="hover:text-amber-500 transition">Documentation</a></li>
                      <li><a href="#" className="hover:text-amber-500 transition">API Reference</a></li>
                    </>
                  )}
                  {section === 'Company' && (
                    <>
                      <li><a href="#" className="hover:text-amber-500 transition">About Us</a></li>
                      <li><a href="#" className="hover:text-amber-500 transition">Contact</a></li>
                      <li><a href="#" className="hover:text-amber-500 transition">Support</a></li>
                    </>
                  )}
                  {section === 'Legal' && (
                    <>
                      <li><a href="#" className="hover:text-amber-500 transition">Privacy Policy</a></li>
                      <li><a href="#" className="hover:text-amber-500 transition">Terms of Service</a></li>
                      <li><a href="#" className="hover:text-amber-500 transition">Security</a></li>
                    </>
                  )}
                </ul>
              </motion.div>
            ))}
          </div>
          <motion.div 
            className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p>&copy; 2026 BOCHABERI Construction Suite. All rights reserved.</p>
            <p className="mt-1 text-xs">Built with ❤️ by Finite Element Designs | Nairobi, Kenya</p>
          </motion.div>
        </div>
      </footer>

      {/* CSS animation for marquee */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;