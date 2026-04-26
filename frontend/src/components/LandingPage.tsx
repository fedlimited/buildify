import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HardHat, Check, ArrowRight, Sparkles, Shield, Building2, Users, Award, TrendingUp, Clock, Globe } from 'lucide-react';

// Testimonial Form Component
function TestimonialForm() {
  const [form, setForm] = useState({ name: '', role: '', company: '', text: '', rating: 5 });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.text) {
      setError('Name and testimonial are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://buildify-backend-kye8.onrender.com/api/testimonials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit. Please try again.');
      }
    } catch (err) {
      setError('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-4">
        <p className="text-green-400 text-lg">✅ Thank you for your testimonial!</p>
        <p className="text-slate-400 text-sm mt-2">It will appear on the site after review.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Your Name *"
        value={form.name}
        onChange={e => setForm({...form, name: e.target.value})}
        className="w-full p-2 bg-slate-700 rounded-lg text-white text-sm border border-slate-600"
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Your Role (e.g., Project Manager)"
          value={form.role}
          onChange={e => setForm({...form, role: e.target.value})}
          className="w-full p-2 bg-slate-700 rounded-lg text-white text-sm border border-slate-600"
        />
        <input
          type="text"
          placeholder="Company Name"
          value={form.company}
          onChange={e => setForm({...form, company: e.target.value})}
          className="w-full p-2 bg-slate-700 rounded-lg text-white text-sm border border-slate-600"
        />
      </div>
      <textarea
        placeholder="Your testimonial *"
        value={form.text}
        onChange={e => setForm({...form, text: e.target.value})}
        className="w-full p-2 bg-slate-700 rounded-lg text-white text-sm border border-slate-600 h-24"
        required
      />
      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-sm">Rating:</span>
        {[1,2,3,4,5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setForm({...form, rating: star})}
            className={`text-xl ${star <= form.rating ? 'text-yellow-500' : 'text-slate-600'}`}
          >
            ★
          </button>
        ))}
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Testimonial'}
      </button>
    </form>
  );
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [hoveredTestimonial, setHoveredTestimonial] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [approvedTestimonials, setApprovedTestimonials] = useState<any[]>([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    setTimeout(() => setLoading(false), 500);
    loadTestimonials();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadTestimonials = async () => {
    try {
      const response = await fetch('https://buildify-backend-kye8.onrender.com/api/testimonials/approved');
      const data = await response.json();
      if (data && data.length > 0) {
        setApprovedTestimonials(data);
      }
    } catch (err) {
      console.error('Failed to load testimonials:', err);
    }
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

  const defaultTestimonials = [
    { name: 'John Mwangi', role: 'Project Manager', company: 'Nairobi Heights Construction', text: 'BOCHI has transformed how we manage subcontractor payments. The quotation and payment tracking alone saves us 5+ hours every week!', rating: 5, image: '👨‍💼' },
    { name: 'Mary Wanjiku', role: 'Site Supervisor', company: 'Kisii Teaching Hospital Project', text: 'The site diary feature is brilliant. We can now track daily activities, workers, and deliveries all in one place. Game changer!', rating: 5, image: '👩‍💼' },
    { name: 'James Otieno', role: 'Quantity Surveyor', company: 'Mombasa Port Road Project', text: 'The reports module gives me exactly what I need. Project profitability at a glance with just a few clicks. Highly recommended!', rating: 5, image: '👨‍💻' }
  ];

  const displayTestimonials = approvedTestimonials.length > 0 ? approvedTestimonials : defaultTestimonials;

  const faqs = [
    { question: 'How does the free trial work?', answer: 'Our 14-day free trial gives you full access to all Pro plan features. No credit card required. You can cancel anytime.' },
    { question: 'Can I change my plan later?', answer: 'Yes, you can upgrade or downgrade your plan at any time from your billing page. Changes take effect immediately.' },
    { question: 'Is my data secure?', answer: 'Absolutely. We use enterprise-grade encryption and follow industry best practices to keep your data safe.' },
    { question: 'Do you offer training?', answer: 'Yes, we provide onboarding training for all paid plans. Premier plans include dedicated training sessions.' },
    { question: 'Can I export my data?', answer: 'Yes, you can export all your data to CSV or PDF at any time.' },
    { question: 'What payment methods do you accept?', answer: 'We accept M-Pesa and Visa/Mastercard for subscription payments.' }
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
              {['features', 'testimonials', 'faq'].map((item) => (
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

      {/* Submit Testimonial Form */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-6">Share Your Experience</h2>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <TestimonialForm />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-slate-800/30">
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
            {displayTestimonials.map((testimonial, idx) => (
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
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
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
                    {testimonial.image || '👤'}
                  </motion.div>
                  <div>
                    <p className="font-semibold text-white text-sm">{testimonial.name}</p>
                    <p className="text-xs text-slate-400">{testimonial.role || ''}</p>
                    <p className="text-xs text-amber-500/70">{testimonial.company || ''}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4">
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
              onClick={() => window.location.href = 'mailto:info@bochi.ke'}
              className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition font-semibold"
            >
              Contact Us
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
              <span className="text-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">BOCHI</span>
              <span className="text-xs text-slate-400">Construction Suite</span>
            </motion.div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
            {['Product', 'Company', 'Legal'].map((section, idx) => (
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
                      <li><a href="#testimonials" className="hover:text-amber-500 transition">Testimonials</a></li>
                      <li><a href="#faq" className="hover:text-amber-500 transition">FAQ</a></li>
                    </>
                  )}
                  {section === 'Company' && (
                    <>
                      <li><a href="#" className="hover:text-amber-500 transition">About Us</a></li>
                      <li><a href="mailto:info@bochi.ke" className="hover:text-amber-500 transition">Contact</a></li>
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