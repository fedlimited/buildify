import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HardHat, Check, ArrowRight, Sparkles, Shield, Building2, Users, Award, TrendingUp, Clock, Globe, Eye, CheckCircle, Star, Quote } from 'lucide-react';

function TestimonialForm() {
  const [form, setForm] = useState({ name: '', role: '', company: '', text: '', rating: 5 });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

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
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: 2 }}
          className="text-5xl mb-4"
        >
          ✅
        </motion.div>
        <p className="text-amber-400 text-xl font-bold mb-2">Thank You!</p>
        <p className="text-slate-300">Your testimonial has been submitted for review.</p>
        <p className="text-slate-500 text-sm mt-2">It will appear on the site once approved.</p>
      </motion.div>
    );
  }

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit} 
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Your Name *</label>
          <input
            type="text"
            placeholder="Mogaka Mokua"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
            className="w-full p-3 bg-slate-700/50 rounded-xl text-white text-sm border border-slate-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Your Role</label>
          <input
            type="text"
            placeholder="e.g., Project Manager"
            value={form.role}
            onChange={e => setForm({...form, role: e.target.value})}
            className="w-full p-3 bg-slate-700/50 rounded-xl text-white text-sm border border-slate-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Company Name</label>
        <input
          type="text"
          placeholder="e.g., Nairobi Heights Construction"
          value={form.company}
          onChange={e => setForm({...form, company: e.target.value})}
          className="w-full p-3 bg-slate-700/50 rounded-xl text-white text-sm border border-slate-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Your Testimonial *</label>
        <textarea
          placeholder="Share your experience with BOCHI..."
          value={form.text}
          onChange={e => setForm({...form, text: e.target.value})}
          className="w-full p-3 bg-slate-700/50 rounded-xl text-white text-sm border border-slate-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-500 h-28 resize-none"
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Rating:</span>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(star => (
              <motion.button
                key={star}
                type="button"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setForm({...form, rating: star})}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className={`text-2xl transition-colors ${
                  star <= (hoveredStar || form.rating) 
                    ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' 
                    : 'text-slate-600'
                }`}
              >
                ★
              </motion.button>
            ))}
          </div>
          <span className="text-xs text-slate-500 ml-1">
            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][form.rating]}
          </span>
        </div>
      </div>
      {error && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2"
        >
          <span>⚠️</span> {error}
        </motion.div>
      )}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
            Submitting...
          </>
        ) : (
          <>
            <span>🌟</span> Submit Testimonial
          </>
        )}
      </motion.button>
    </motion.form>
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
      const response = await fetch('https://buildify-backend-kye8.onrender.com/api/testimonials/approved?location=landing');
      const data = await response.json();
      if (data.success && data.testimonials && data.testimonials.length > 0) {
        const mappedTestimonials = data.testimonials.map(t => ({
          name: t.name,
          role: t.role || '',
          company: t.company || '',
          text: t.text,
          rating: t.rating || 5,
          image: '👤'
        }));
        setApprovedTestimonials(mappedTestimonials);
      }
    } catch (err) {
      console.error('Failed to load testimonials:', err);
    }
  };

  const heroMovingWords = [
    '✓ Save 20+ hours weekly', '✓ Reduce costs by 40%', '✓ Real-time insights',
    '✓ KRA compliant', '✓ 99.9% uptime', '✓ 500+ happy clients'
  ];
  
  const bottomMovingWords = [
    '🚀 Streamline Projects', '💰 Save Money', '📊 Real-time Reports',
    '👷 Subcontractors', '👥 Workforce', '📦 Inventory',
    '🏗️ Construction', '📈 Grow Faster', '🔒 Secure Data',
    '🌙 Dark Mode Ready', '📱 Collapsible Sidebar', '🔔 Smart Notifications'
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
    { icon: '👷', title: 'Subcontractor Management', description: 'Track quotations, payments, and balances for all subcontractors in one place.', benefits: 'Save 10+ hours weekly' },
    { icon: '👥', title: 'Workforce Management', description: 'Manage workers, track attendance, and process weekly payroll efficiently.', benefits: 'Reduce payroll errors by 95%' },
    { icon: '📦', title: 'Store & Inventory', description: 'Track materials, supplies, and stock levels across multiple projects in real-time.', benefits: 'Prevent stockouts' },
    { icon: '🚚', title: 'Procurement', description: 'Create purchase orders and manage supplier relationships seamlessly.', benefits: '40% faster cycle' },
    { icon: '💰', title: 'Financial Tracking', description: 'Income, expenses, VAT, and profit/loss reporting at your fingertips.', benefits: 'Real-time visibility' },
    { icon: '📋', title: 'Site Diary', description: 'Daily site records, activities, workers, and incident logging for compliance.', benefits: 'Complete audit trail' },
    { icon: '📊', title: 'Comprehensive Reports', description: '12+ reports with filtering, search, and CSV export capabilities.', benefits: 'Data-driven decisions' },
    { icon: '🧾', title: 'Invoice Management', description: 'Create and track client invoices with automatic 16% VAT calculations.', benefits: 'KRA compliant' },
    { icon: '🌙', title: 'Dark Mode', description: 'Toggle between light and dark themes for comfortable viewing.', benefits: 'Eye-friendly' },
    { icon: '📱', title: 'Collapsible Sidebar', description: 'Expand or collapse sidebar to maximize screen space.', benefits: 'More viewing area' },
    { icon: '🔔', title: 'Smart Notifications', description: 'Real-time alerts for new documents and task assignments.', benefits: 'Never miss updates' },
    { icon: '👁️', title: 'Stakeholder Portal', description: 'Give clients secure view-only access to project progress.', benefits: 'Client collaboration' }
  ];

  const defaultTestimonials = [
    { name: 'John Mwangi', role: 'Project Manager', company: 'Nairobi Heights', text: 'BOCHI has transformed how we manage subcontractor payments. The quotation and payment tracking alone saves us 5+ hours every week!', rating: 5, image: '👨‍💼' },
    { name: 'Mary Wanjiku', role: 'Site Supervisor', company: 'Kisii Hospital', text: 'The site diary feature is brilliant. We can now track daily activities, workers, and deliveries all in one place. Game changer!', rating: 5, image: '👩‍💼' },
    { name: 'James Otieno', role: 'Quantity Surveyor', company: 'Mombasa Port', text: 'The reports module gives me exactly what I need. Project profitability at a glance with just a few clicks.', rating: 5, image: '👨‍💻' }
  ];

  const displayTestimonials = approvedTestimonials.length > 0 ? approvedTestimonials : defaultTestimonials;

  const faqs = [
    { question: 'How does the free trial work?', answer: 'Our 14-day free trial gives you full access to all Pro plan features. No credit card required.' },
    { question: 'Can I change my plan later?', answer: 'Yes, you can upgrade or downgrade your plan at any time from your billing page.' },
    { question: 'Is my data secure?', answer: 'Absolutely. We use enterprise-grade encryption to keep your data safe.' },
    { question: 'Do you offer training?', answer: 'Yes, we provide onboarding training for all paid plans.' },
    { question: 'Can I export my data?', answer: 'Yes, you can export all your data to CSV or PDF at any time.' },
    { question: 'What payment methods?', answer: 'We accept M-Pesa and Visa/Mastercard.' },
    { question: 'Does the portal have dark mode?', answer: 'Yes! Stakeholders can toggle between light and dark mode.' },
    { question: 'Can my clients track progress?', answer: 'Yes! Our Stakeholder Portal gives clients view-only access to Gantt charts and documents.' },
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
              <motion.img 
                src="/Bochi_logo_transparent.png" 
                alt="BOCHI Logo" 
                className="h-8 w-auto mr-2 group-hover:scale-105 transition-transform"
                animate={{ rotateY: [0, 180, 360] }}
                transition={{ duration: 3, times: [0, 0.5, 1], ease: "easeInOut", repeat: Infinity, repeatDelay: 4 }}
                style={{ transformStyle: "preserve-3d" }}
              />
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

      {/* Hero Section - Improved Symmetry */}
      <section className="pt-28 pb-16 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left side - Text content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 text-center lg:text-left"
            >
              <motion.div
                className="inline-flex items-center gap-3 bg-amber-500/10 backdrop-blur-sm rounded-full px-4 py-1.5 border border-amber-500/20 mb-6"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <HardHat size={14} className="text-amber-400" />
                <span className="text-amber-400 text-xs font-medium">Trusted by 500+ Construction Companies</span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
                Manage Your Construction
                <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent block mt-2"> Projects Smarter</span>
              </h1>

              <p className="text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 mb-8">
                From subcontractors and payroll to stores and site diary — plus a dedicated <span className="text-amber-400 font-medium">Stakeholder Portal</span> for clients to track progress in real-time.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  onClick={() => navigate('/register')}
                  className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/25 transition-all duration-200"
                >
                  Start Free Trial
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-3 text-sm font-semibold text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-800 transition-all duration-200"
                >
                  Learn More
                </motion.button>
              </div>
              <p className="text-xs text-slate-400 mb-5">No credit card required • 14-day free trial • Cancel anytime</p>

              <motion.div
                className="py-2 px-5 bg-slate-800/50 rounded-full inline-flex items-center justify-center mx-auto lg:mx-0"
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

            {/* Right side - Image with improved styling */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1 flex justify-center lg:justify-end"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-2xl blur-2xl"></div>
                <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-2 border border-slate-700 shadow-2xl">
                  <img 
                    src="/construction-management-dashboard.png" 
                    alt="BOCHI Construction Management Dashboard" 
                    className="w-full max-w-md lg:max-w-lg rounded-xl"
                  />
                </div>
                <motion.div 
                  className="absolute -top-3 -right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  LIVE DEMO
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section - Symmetrical grid */}
      <section className="py-12 bg-slate-800/30 border-y border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
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
                  className="text-4xl font-bold text-amber-500"
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Improved grid with 3 columns for better symmetry */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (idx % 12) * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                onMouseEnter={() => setHoveredFeature(idx)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer group"
                onClick={() => navigate('/register')}
              >
                <motion.div
                  className="text-4xl mb-3"
                  animate={{ scale: hoveredFeature === idx ? 1.1 : 1 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="font-semibold text-white mb-2 text-lg">{feature.title}</h3>
                <p className="text-sm text-slate-400 mb-3 leading-relaxed">{feature.description}</p>
                <motion.div
                  className="text-xs text-amber-500/80 flex items-center gap-1"
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

      {/* Submit Testimonial Form - Centered and balanced */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-5xl mb-4"
            >
              🌟
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Share Your Experience</h2>
            <p className="text-slate-400">We'd love to hear how BOCHI has helped your construction business</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-700/50 shadow-xl"
          >
            <TestimonialForm />
          </motion.div>
        </div>
      </section>

      {/* Stakeholder Portal Section - Symmetrical two-column layout */}
      <section className="py-20 px-4 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm rounded-full px-4 py-1.5 border border-amber-500/20 mb-4"
            >
              <Eye size={16} className="text-amber-400" />
              <span className="text-amber-400 text-xs font-medium">NEW - Client Portal</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Stakeholder Portal
              <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent block mt-1"> Real-Time Project Visibility</span>
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Give your clients, consultants, and project stakeholders secure access to track progress without edit permissions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left side - Features list */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {[
                { icon: '📊', title: 'Live Gantt Charts', desc: 'View project timelines in real-time' },
                { icon: '🌙', title: 'Dark/Light Mode', desc: 'Toggle themes with one click' },
                { icon: '📱', title: 'Collapsible Sidebar', desc: 'Maximize viewing space' },
                { icon: '🔔', title: 'Smart Notifications', desc: 'Stay updated on new documents' },
                { icon: '📄', title: 'Document Library', desc: 'Securely access project files' },
                { icon: '📝', title: 'Meeting Minutes', desc: 'Review agendas and decisions' },
                { icon: '💰', title: 'Financial Summary', desc: 'Track invoices and payments' },
                { icon: '👥', title: 'Project Team', desc: 'See who's working on the project' },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-amber-500/30 transition-all"
                >
                  <div className="text-2xl">{feature.icon}</div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                    <p className="text-xs text-slate-400">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Right side - Portal Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
                <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-slate-400">Stakeholder Portal - Dashboard</span>
                  </div>
                  <Eye size={14} className="text-amber-400" />
                </div>
                
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">Nairobi Heights Tower</h4>
                      <p className="text-xs text-slate-400">Client: Heights Construction</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Progress</span>
                      <p className="text-lg font-bold text-amber-500">65%</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700">
                      <p className="text-lg font-bold text-white">24</p>
                      <p className="text-xs text-slate-400">Documents</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700">
                      <p className="text-lg font-bold text-white">8</p>
                      <p className="text-xs text-slate-400">Meetings</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700">
                      <p className="text-lg font-bold text-white">KES 45.2M</p>
                      <p className="text-xs text-slate-400">Contract Sum</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 border-b border-slate-700 pb-2">
                    {['Overview', 'Documents', 'Gantt', 'Financial'].map((tab) => (
                      <span key={tab} className={`text-xs px-2 py-1 rounded ${tab === 'Gantt' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400'}`}>
                        {tab}
                      </span>
                    ))}
                  </div>
                  
                  <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-slate-300">📊 Gantt Chart</span>
                      <span className="text-xs text-amber-400 ml-auto">🔒 Read Only</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-24 text-xs text-slate-400">Foundation</div>
                        <div className="flex-1 h-3 bg-amber-500/20 rounded overflow-hidden">
                          <div className="w-full h-full bg-green-500 rounded"></div>
                        </div>
                        <span className="text-xs text-slate-400">100%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 text-xs text-slate-400">Superstructure</div>
                        <div className="flex-1 h-3 bg-amber-500/20 rounded overflow-hidden">
                          <div className="w-3/4 h-full bg-amber-500 rounded"></div>
                        </div>
                        <span className="text-xs text-slate-400">75%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 text-xs text-slate-400">Finishing</div>
                        <div className="flex-1 h-3 bg-amber-500/20 rounded overflow-hidden">
                          <div className="w-1/4 h-full bg-amber-500 rounded"></div>
                        </div>
                        <span className="text-xs text-slate-400">25%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">✅ View Only</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">📥 Download Reports</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">🔒 Secure Access</span>
                  </div>
                </div>
              </div>
              
              <motion.div 
                className="absolute -top-3 -right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                NEW!
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-10 pt-6"
          >
            <button 
              onClick={() => navigate('/register')}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition shadow-lg shadow-amber-500/25"
            >
              Start Free Trial
            </button>
            <p className="text-xs text-slate-500 mt-3">Invite stakeholders after signup • No credit card required</p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section - Three column grid */}
      <section id="testimonials" className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Quote className="w-10 h-10 text-amber-500/50 mx-auto mb-4" />
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
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-amber-500/30 transition-all flex flex-col"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="text-yellow-500 text-lg"
                      animate={{ scale: hoveredTestimonial === idx ? [1, 1.2, 1] : 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      ★
                    </motion.span>
                  ))}
                </div>
                <p className="text-slate-300 text-sm mb-4 leading-relaxed flex-1">"{testimonial.text}"</p>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-700 mt-auto">
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

      {/* FAQ Section - Two column grid for symmetry */}
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

      {/* Mobile App Download Section - Symmetrical */}
      <section className="py-20 px-4 bg-gradient-to-r from-indigo-900 to-purple-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center md:text-left md:w-1/2"
            >
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-4"
              >
                <span className="text-xl">📱</span>
                <span className="text-sm text-white">Mobile App Available</span>
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Manage Your Projects <span className="text-amber-400">On The Go</span>
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Download the BOCHI mobile app to access your projects, track progress, 
                view documents, and collaborate with your team from anywhere.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <motion.a 
                  href="https://buildify-backend-kye8.onrender.com/api/download-mobile-app" 
                  download
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-3 bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zM14.5 12.71l-4.47 4.47 5.48-2.75 2.29-1.15-3.3-1.65zm-4.47-8.18l4.47 4.47 3.3-1.65-2.29-1.15-5.48-2.75z"/>
                  </svg>
                  <div>
                    <div className="text-xs">Download for</div>
                    <div className="text-xl font-bold">Android</div>
                  </div>
                </motion.a>
                
                <div className="flex items-center justify-center gap-3 bg-gray-700 text-white px-6 py-3 rounded-xl opacity-60 cursor-not-allowed">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.02.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.3 1.05-3.11z"/>
                  </svg>
                  <div>
                    <div className="text-xs">Coming Soon</div>
                    <div className="text-xl font-bold">iOS</div>
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-4">
                Android 8.0 or higher • 50MB free space • Free download
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="md:w-1/2 flex justify-center"
            >
              <div className="relative">
                <div className="w-64 h-[500px] bg-black rounded-3xl shadow-2xl overflow-hidden border-4 border-gray-800">
                  <div className="bg-gradient-to-b from-gray-900 to-gray-800 h-full">
                    <div className="bg-gray-900 pt-2 px-4 flex justify-between text-white text-xs">
                      <span>9:41</span>
                      <span>📶 🔋 100%</span>
                    </div>
                    <div className="p-4">
                      <div className="bg-amber-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                        <span className="text-white text-2xl">🏗️</span>
                      </div>
                      <h3 className="text-white font-bold text-lg">BOCHI</h3>
                      <p className="text-gray-400 text-sm mt-1">Construction Suite</p>
                      
                      <div className="mt-6 space-y-3">
                        <div className="bg-gray-700 rounded-lg p-2">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-500">📊</span>
                            <span className="text-white text-sm">Dashboard</span>
                          </div>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-2">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-500">📋</span>
                            <span className="text-white text-sm">Projects</span>
                          </div>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-2">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-500">💰</span>
                            <span className="text-white text-sm">Finance</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <motion.div 
                  className="absolute -bottom-4 -right-4 bg-green-500 text-white rounded-full px-3 py-1 text-xs font-bold shadow-lg"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  NEW!
                </motion.div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-12 pt-8 border-t border-white/20 text-center"
          >
            <h3 className="text-xl font-bold text-white mb-4">Scan to Download</h3>
            <p className="text-gray-300 mb-6">Scan this QR code with your phone camera to download the APK directly</p>
            
            <div className="bg-white p-4 rounded-2xl inline-block shadow-lg">
              <img 
                src="/qr-code.PNG" 
                alt="Download BOCHI App QR Code" 
                className="w-40 h-40 object-contain"
              />
            </div>
            
            <div className="mt-6">
              <a 
                href="https://buildify-backend-kye8.onrender.com/api/download-mobile-app"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition shadow-lg hover:shadow-xl"
              >
                <span>⬇️</span>
                Download APK Directly
              </a>
            </div>
            
            <div className="mt-4">
              <p className="text-gray-400 text-sm">
                Version 1.0.0 • Last updated: {new Date().toLocaleDateString()}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Android 8.0 or higher • 50MB free space
              </p>
            </div>
          </motion.div>
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
            className="flex flex-col items-center justify-center gap-3 mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <img 
              src="/Bochi_logo_transparent.png" 
              alt="BOCHI Logo" 
              className="h-16 w-auto"
            />
            <div className="text-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">BOCHI</span>
              <span className="text-sm text-amber-100/80 ml-2">Construction Suite</span>
            </div>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Ready to Transform Your Construction Management?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-amber-100 mb-8 text-lg"
          >
            From subcontractor payments to client portals — everything you need to run successful construction projects.
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
              <img 
                src="/Bochi_logo_transparent.png" 
                alt="BOCHI Logo" 
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">BOCHI</span>
              <span className="text-xs text-slate-400">Construction Suite</span>
            </motion.div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8 max-w-md mx-auto">
            {['Product', 'Company', 'Legal'].map((section, idx) => (
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
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