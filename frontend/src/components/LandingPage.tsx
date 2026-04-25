import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HardHat, Check, ArrowRight, Sparkles, Shield, Building2, Users, Award, TrendingUp, Clock, CreditCard, Smartphone, Globe, Zap, X } from 'lucide-react';
import api from '@/services/api';

interface Plan {
  id: number;
  name: string;
  display_name: string;
  description: string;
  price_monthly_kes: number;
  price_yearly_kes: number;
  price_monthly_usd: number;
  price_yearly_usd: number;
  max_projects: number;
  max_workers: number;
  max_users: number;
  features: string[];
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [hoveredTestimonial, setHoveredTestimonial] = useState<number | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('card');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'sent' | 'completed' | 'error'>('idle');
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    fetchPlans();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('https://buildify-backend-kye8.onrender.com/api/subscription/plans');
      const data = await response.json();
      console.log('Fetched plans:', data);
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      // Fallback plans
      setPlans([
        { id: 1, name: 'free', display_name: 'Free', description: 'For solo contractors', price_monthly_kes: 0, price_yearly_kes: 0, price_monthly_usd: 0, price_yearly_usd: 0, max_projects: 1, max_workers: 10, max_users: 1, features: [] },
        { id: 2, name: 'basic', display_name: 'Basic', description: 'For small businesses', price_monthly_kes: 6370, price_yearly_kes: 61100, price_monthly_usd: 49, price_yearly_usd: 470, max_projects: 3, max_workers: 30, max_users: 5, features: [] },
        { id: 3, name: 'pro', display_name: 'Pro', description: 'For growing companies', price_monthly_kes: 33670, price_yearly_kes: 323180, price_monthly_usd: 259, price_yearly_usd: 2486, max_projects: 10, max_workers: 150, max_users: 15, features: [] },
        { id: 4, name: 'premier', display_name: 'Premier', description: 'For large enterprises', price_monthly_kes: 64870, price_yearly_kes: 622700, price_monthly_usd: 499, price_yearly_usd: 4790, max_projects: 999999, max_workers: 999999, max_users: 999999, features: [] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (plan: Plan) => {
    if (paymentMethod === 'mpesa') {
      return billingCycle === 'monthly' ? plan.price_monthly_kes : plan.price_yearly_kes;
    } else {
      return billingCycle === 'monthly' ? plan.price_monthly_usd : plan.price_yearly_usd;
    }
  };

  const getCurrencySymbol = () => {
    return paymentMethod === 'mpesa' ? 'KES' : 'USD';
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const handleUpgrade = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
    setPaymentStatus('idle');
    setPaymentError('');
    setPhoneNumber('');
  };

  const handleCardPayment = async () => {
    setPaymentStatus('processing');
    setPaymentError('');
    
    try {
      // For now, show coming soon message
      setPaymentStatus('error');
      setPaymentError('Visa/Mastercard payments coming soon. Please use M-Pesa for now.');
    } catch (error: any) {
      setPaymentStatus('error');
      setPaymentError(error.message || 'Payment failed. Please try again.');
    }
  };

  const handleMpesaPayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setPaymentError('Please enter a valid M-Pesa phone number');
      return;
    }
    
    setPaymentStatus('processing');
    setPaymentError('');
    
    try {
      const response = await api.request('/subscription/pay', {
        method: 'POST',
        body: JSON.stringify({
          planId: selectedPlan?.id,
          phoneNumber: phoneNumber,
          billingCycle: billingCycle
        })
      });
      
      if (response.success) {
        setPaymentStatus('sent');
        pollPaymentStatus(response.paymentId);
      } else {
        setPaymentStatus('error');
        setPaymentError(response.error || 'Payment initiation failed');
      }
    } catch (error: any) {
      setPaymentStatus('error');
      setPaymentError(error.message);
    }
  };

  const pollPaymentStatus = async (paymentId: number) => {
    const interval = setInterval(async () => {
      try {
        const status = await api.request(`/subscription/payment-status/${paymentId}`);
        if (status.status === 'completed') {
          clearInterval(interval);
          setPaymentStatus('completed');
          setTimeout(() => {
            setShowPaymentModal(false);
            navigate('/dashboard');
          }, 2000);
        } else if (status.status === 'failed') {
          clearInterval(interval);
          setPaymentStatus('error');
          setPaymentError('Payment failed. Please try again.');
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    }, 3000);
  };

  // Moving text animation words
  const heroMovingWords = [
    '✓ Save 20+ hours weekly', '✓ Reduce costs by 40%', '✓ Real-time insights', 
    '✓ KRA compliant', '✓ 99.9% uptime', '✓ 500+ happy clients'
  ];
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
    const statsInterval = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % 4);
    }, 4000);
    return () => {
      clearInterval(interval);
      clearInterval(statsInterval);
    };
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
    { name: 'John Mwangi', role: 'Project Manager', company: 'Nairobi Heights Construction', text: 'BOCHI has transformed how we manage subcontractor payments. The quotation and payment tracking alone saves us 5+ hours every week!', rating: 5, image: '👨‍💼' },
    { name: 'Mary Wanjiku', role: 'Site Supervisor', company: 'Kisii Teaching Hospital Project', text: 'The site diary feature is brilliant. We can now track daily activities, workers, and deliveries all in one place. Game changer!', rating: 5, image: '👩‍💼' },
    { name: 'James Otieno', role: 'Quantity Surveyor', company: 'Mombasa Port Road Project', text: 'The reports module gives me exactly what I need. Project profitability at a glance with just a few clicks. Highly recommended!', rating: 5, image: '👨‍💻' }
  ];

  const faqs = [
    { question: 'How does the free trial work?', answer: 'Our 14-day free trial gives you full access to all Pro plan features. No credit card required. You can cancel anytime.' },
    { question: 'Can I change my plan later?', answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.' },
    { question: 'Is my data secure?', answer: 'Absolutely. We use enterprise-grade encryption and follow industry best practices to keep your data safe.' },
    { question: 'Do you offer training?', answer: 'Yes, we provide onboarding training for all paid plans. Premier plans include dedicated training sessions.' },
    { question: 'Can I export my data?', answer: 'Yes, you can export all your data to CSV or PDF at any time.' },
    { question: 'What payment methods do you accept?', answer: 'We accept M-Pesa and Visa/Mastercard.' }
  ];

  const subscriptionBenefits = [
    { title: 'Cancel Anytime', description: 'No long-term contracts. Cancel your subscription with just one click.', icon: '🔓' },
    { title: 'Secure Payments', description: 'All payments are processed through secure, encrypted channels.', icon: '🔒' },
    { title: 'Monthly Billing', description: 'Simple monthly billing with no hidden fees.', icon: '📅' },
    { title: 'Volume Discounts', description: 'Get special pricing for multiple projects or long-term commitments.', icon: '💰' }
  ];

  const floatingStats = [
    { value: '500+', label: 'Active Companies', icon: '🏢' },
    { value: '10k+', label: 'Users', icon: '👥' },
    { value: '12+', label: 'Reports', icon: '📊' },
    { value: '99.9%', label: 'Uptime', icon: '⚡' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

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
            >




<div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/25 mr-2 group-hover:scale-105 transition-transform">
  <HardHat size={18} className="text-white" />
</div>




<span className="text-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">BOCHI</span>
<span className="ml-1 text-xs text-slate-400">Construction Suite</span>





            </motion.div>
            <div className="hidden md:flex items-center gap-6">
              {['features', 'subscription', 'testimonials', 'pricing', 'faq'].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item}`}
                  className="text-sm text-slate-300 hover:text-amber-500 transition"
                  whileHover={{ scale: 1.05 }}
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
                onClick={() => navigate('/register')} 
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
              <p className="text-[17px] text-slate-300 max-w-2xl mx-auto mb-7">
                From subcontractors and payroll to stores and site diary — everything you need to run successful construction projects in one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-5">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  onClick={() => navigate('/register')} 
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
              
              <motion.div 
                className="py-2 px-5 bg-slate-800/50 rounded-full inline-block"
                whileHover={{ scale: 1.02 }}
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

      {/* Stats Section */}
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
                  animate={{ scale: currentStatIndex === idx ? [1, 1.1, 1] : 1 }}
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
                onClick={() => navigate('/register')}
              >
                <motion.div 
                  className="text-3xl mb-3"
                  animate={{ scale: hoveredFeature === idx ? 1.1 : 1 }}
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

      {/* Pricing Section with Real Plans and Payment Method Toggle */}
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
            <p className="text-slate-300 max-w-2xl mx-auto">All plans include a 14-day free trial of Pro features. No credit card required.</p>
          </motion.div>

          {/* Payment Method Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-800 rounded-xl p-1 inline-flex border border-slate-700">
              <button
                onClick={() => setPaymentMethod('mpesa')}
                className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${
                  paymentMethod === 'mpesa'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone size={16} />
                <span>M-Pesa (KES)</span>
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${
                  paymentMethod === 'card'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard size={16} />
                <span>Visa / Mastercard (USD)</span>
              </button>
            </div>
          </div>

          {/* Billing Cycle Toggle */}
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
                Annual <span className="text-amber-400 text-xs ml-1">Save 15%</span>
              </motion.button>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {plans.map((plan, idx) => {
              const isPopular = plan.name === 'pro';
              const price = getPrice(plan);
              const currencySymbol = getCurrencySymbol();
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border ${isPopular ? 'border-amber-500 shadow-lg shadow-amber-500/10 relative' : 'border-slate-700'} p-6 transition-all flex flex-col h-full`}
                >
                  {isPopular && (
                    <motion.div 
                      className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🔥 Most Popular
                    </motion.div>
                  )}
                  <h3 className="text-xl font-semibold text-white mb-2">{plan.display_name}</h3>
                  <p className="text-slate-400 text-xs mb-4">{plan.description}</p>
                  
                  <div className="mt-2 mb-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-slate-400 text-sm font-medium">{currencySymbol}</span>
                      <span className="text-2xl font-bold text-amber-500 tracking-tight">
                        {formatPrice(price)}
                      </span>
                    </div>
                    <span className="text-slate-500 text-xs">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                    {billingCycle === 'annual' && paymentMethod === 'mpesa' && plan.price_yearly_kes > 0 && (
                      <div className="text-[10px] text-green-400 mt-1 font-medium">
                        Save {Math.round((plan.price_monthly_kes * 12 - plan.price_yearly_kes) / (plan.price_monthly_kes * 12) * 100)}%
                      </div>
                    )}
                    {billingCycle === 'annual' && paymentMethod === 'card' && plan.price_yearly_usd > 0 && (
                      <div className="text-[10px] text-green-400 mt-1 font-medium">
                        Save {Math.round((plan.price_monthly_usd * 12 - plan.price_yearly_usd) / (plan.price_monthly_usd * 12) * 100)}%
                      </div>
                    )}
                  </div>
                  
                  <ul className="space-y-2 mb-4 flex-grow">
                    <li className="text-sm text-slate-300 flex items-center gap-2">
                      <Check size={14} className="text-green-500" />
                      <span>{plan.max_projects === 999999 ? 'Unlimited' : plan.max_projects} Projects</span>
                    </li>
                    <li className="text-sm text-slate-300 flex items-center gap-2">
                      <Check size={14} className="text-green-500" />
                      <span>{plan.max_workers === 999999 ? 'Unlimited' : plan.max_workers} Workers</span>
                    </li>
                    <li className="text-sm text-slate-300 flex items-center gap-2">
                      <Check size={14} className="text-green-500" />
                      <span>{plan.max_users === 999999 ? 'Unlimited' : plan.max_users} Users</span>
                    </li>
                  </ul>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => plan.name === 'free' ? navigate('/register') : handleUpgrade(plan)} 
                    className={`w-full py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 mt-2 ${
                      isPopular 
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-amber-700' 
                        : plan.name === 'free'
                          ? 'border border-slate-600 text-slate-300 hover:bg-slate-700'
                          : paymentMethod === 'mpesa'
                            ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                    }`}
                  >
                    {plan.name === 'free' ? 'Get Started' : plan.name === 'premier' ? 'Contact Sales' : 'Upgrade Now'}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
          <p className="text-center text-xs text-slate-400 mt-8">
            * M-Pesa payments in Kenyan Shillings (KES) | Visa/Mastercard payments in US Dollars (USD)
          </p>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="py-12 px-4 bg-slate-800/30">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-lg font-semibold text-white mb-4">We Accept</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: <CreditCard size={20} />, name: 'Visa / Mastercard', via: 'Secure Checkout', color: 'blue' },
              { icon: <Smartphone size={20} />, name: 'M-Pesa', via: 'Paybill 222111', color: 'green' }
            ].map((method, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -2 }}
                className={`px-5 py-3 bg-slate-800 rounded-xl border border-slate-700 hover:border-${method.color}-500/30 transition-all flex items-center gap-2`}
              >
                <span className={`text-${method.color}-500`}>{method.icon}</span>
                <span className="text-white text-sm">{method.name}</span>
                <span className="text-slate-500 text-xs">{method.via}</span>
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
            <p className="text-slate-300 max-w-2xl mx-auto">Join hundreds of construction professionals who love BOCHI</p>
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
            Join thousands of construction professionals who trust BOCHI to manage their projects efficiently.
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
              onClick={() => navigate('/register')} 
              className="px-8 py-3 bg-white text-amber-600 rounded-lg hover:bg-gray-100 transition font-semibold shadow-lg"
            >
              Start Free Trial
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = 'mailto:sales@bochi.com'} 
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

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl shadow-2xl max-w-md w-full mx-4 border border-slate-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  {paymentMethod === 'mpesa' ? (
                    <Smartphone size={20} className="text-green-500" />
                  ) : (
                    <CreditCard size={20} className="text-blue-500" />
                  )}
                  <h3 className="text-lg font-semibold text-white">
                    Complete Your Upgrade
                  </h3>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 mb-5">
                <p className="text-sm text-slate-400">Selected Plan</p>
                <p className="text-base font-semibold text-white mt-1">{selectedPlan.display_name}</p>
                <div className="mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-slate-400 text-sm">{getCurrencySymbol()}</span>
                    <span className="text-xl font-bold text-amber-500">
                      {formatPrice(getPrice(selectedPlan))}
                    </span>
                  </div>
                  <span className="text-slate-500 text-xs ml-1">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="flex gap-3 mb-5">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <CreditCard size={16} />
                  <span>Card</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'mpesa'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <Smartphone size={16} />
                  <span>M-Pesa</span>
                </button>
              </div>

              {paymentStatus === 'idle' && paymentMethod === 'mpesa' && (
                <>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      M-Pesa Phone Number
                    </label>
                    <div className="flex items-center border border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-green-500 bg-slate-800">
                      <span className="pl-3 text-slate-400 text-sm">+254</span>
                      <input
                        type="tel"
                        placeholder="712345678"
                        className="flex-1 p-3 outline-none rounded-lg bg-transparent text-white text-sm"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      You will receive a payment prompt on this number
                    </p>
                  </div>
                  {paymentError && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
                      {paymentError}
                    </div>
                  )}
                  <button
                    onClick={handleMpesaPayment}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all"
                  >
                    Pay with M-Pesa
                  </button>
                </>
              )}

              {paymentStatus === 'idle' && paymentMethod === 'card' && (
                <>
                  {paymentError && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
                      {paymentError}
                    </div>
                  )}
                  <button
                    onClick={handleCardPayment}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all"
                  >
                    Pay with Card
                  </button>
                  <p className="text-xs text-slate-500 text-center mt-3">
                    You will be redirected to secure checkout
                  </p>
                </>
              )}

              {paymentStatus === 'processing' && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto mb-4"></div>
                  <p className="text-slate-400">Processing payment...</p>
                </div>
              )}

              {paymentStatus === 'sent' && (
                <div className="text-center py-8">
                  <Smartphone size={48} className="text-green-500 mx-auto mb-4" />
                  <p className="font-medium text-white">Check your phone</p>
                  <p className="text-sm text-slate-400 mt-1">Enter your M-Pesa PIN to complete payment</p>
                </div>
              )}

              {paymentStatus === 'completed' && (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={28} className="text-green-500" />
                  </div>
                  <p className="font-semibold text-green-500">Payment Successful!</p>
                  <p className="text-sm text-slate-400 mt-1">Your plan has been upgraded</p>
                </div>
              )}

              {paymentStatus === 'error' && (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-500 text-xl">!</span>
                  </div>
                  <p className="font-medium text-red-500">Payment Failed</p>
                  <p className="text-sm text-slate-400 mt-1">{paymentError}</p>
                  <button
                    onClick={() => setPaymentStatus('idle')}
                    className="mt-4 px-4 py-2 bg-slate-800 rounded-lg text-sm hover:bg-slate-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center mb-8">
            <motion.div 
              className="flex items-center gap-2 mb-4"
              whileHover={{ scale: 1.02 }}
            >




<div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/25 mr-2 group-hover:scale-105 transition-transform">
  <HardHat size={18} className="text-white" />
</div>




              <span className="text-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">BOCHI</span>
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
            <p>&copy; 2026 BOCHI Construction Suite. All rights reserved.</p>
            <p className="mt-1 text-xs">Built with ❤️ by Finite Element Designs | Nairobi, Kenya</p>
          </motion.div>
        </div>
      </footer>

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