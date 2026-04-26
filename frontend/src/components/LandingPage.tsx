import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HardHat, Check, ArrowRight, Sparkles, Shield, Building2, Users, Award, TrendingUp, Clock, Globe } from 'lucide-react';

// Minimal Testimonial Form
function TestimonialForm() {
  const [form, setForm] = useState({ name: '', role: '', company: '', text: '', rating: 5 });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.text) { setError('Name and testimonial required'); return; }
    setLoading(true); setError('');
    try {
      const r = await fetch('https://buildify-backend-kye8.onrender.com/api/testimonials/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      r.ok ? setSubmitted(true) : setError((await r.json()).error || 'Failed');
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  };

  if (submitted) return <p className="text-green-400 text-sm text-center py-4">✅ Thanks! Your testimonial is under review.</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <input type="text" placeholder="Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
          className="p-2 bg-slate-700/50 rounded-lg text-white text-xs border border-slate-600 focus:border-amber-500 outline-none" required />
        <input type="text" placeholder="Role" value={form.role} onChange={e => setForm({...form, role: e.target.value})}
          className="p-2 bg-slate-700/50 rounded-lg text-white text-xs border border-slate-600 focus:border-amber-500 outline-none" />
        <input type="text" placeholder="Company" value={form.company} onChange={e => setForm({...form, company: e.target.value})}
          className="p-2 bg-slate-700/50 rounded-lg text-white text-xs border border-slate-600 focus:border-amber-500 outline-none" />
      </div>
      <textarea placeholder="Share your experience..." value={form.text} onChange={e => setForm({...form, text: e.target.value})}
        className="w-full p-2 bg-slate-700/50 rounded-lg text-white text-xs border border-slate-600 focus:border-amber-500 outline-none h-16 resize-none" required />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map(star => (
            <button key={star} type="button" onClick={() => setForm({...form, rating: star})}
              className={`text-sm ${star <= form.rating ? 'text-yellow-400' : 'text-slate-600'}`}>★</button>
          ))}
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button type="submit" disabled={loading}
          className="px-4 py-2 bg-amber-500 text-white text-xs rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50">
          {loading ? '...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
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
      const r = await fetch('https://buildify-backend-kye8.onrender.com/api/testimonials/approved');
      const data = await r.json();
      if (data?.length) setApprovedTestimonials(data);
    } catch {}
  };

  const heroMovingWords = ['✓ Save 20+ hours weekly', '✓ Reduce costs by 40%', '✓ Real-time insights', '✓ KRA compliant', '✓ 99.9% uptime', '✓ 500+ happy clients'];
  const bottomMovingWords = ['🚀 Streamline Projects', '💰 Save Money', '📊 Real-time Reports', '👷 Subcontractors', '👥 Workforce', '📦 Inventory', '🏗️ Construction', '📈 Grow Faster', '🔒 Secure Data'];
  const [currentHeroWordIndex, setCurrentHeroWordIndex] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setCurrentHeroWordIndex(p => (p + 1) % heroMovingWords.length), 2000);
    return () => clearInterval(i);
  }, []);

  const features = [
    { icon: '👷', title: 'Subcontractor Management', description: 'Track quotations, payments, and balances for all subcontractors.', benefits: 'Save 10+ hours weekly' },
    { icon: '👥', title: 'Workforce Management', description: 'Manage workers, attendance, and weekly payroll efficiently.', benefits: 'Reduce errors by 95%' },
    { icon: '📦', title: 'Store & Inventory', description: 'Track materials and stock levels across projects in real-time.', benefits: 'Prevent stockouts' },
    { icon: '🚚', title: 'Procurement', description: 'Purchase orders and supplier management.', benefits: '40% faster cycle' },
    { icon: '💰', title: 'Financial Tracking', description: 'Income, expenses, VAT, and profit/loss reporting.', benefits: 'Real-time visibility' },
    { icon: '📋', title: 'Site Diary', description: 'Daily records, activities, and incident logging.', benefits: 'Complete audit trail' },
    { icon: '📊', title: 'Reports', description: '12+ reports with filtering and CSV export.', benefits: 'Data-driven decisions' },
    { icon: '🧾', title: 'Invoices', description: 'Client invoices with automatic 16% VAT.', benefits: 'KRA compliant' }
  ];

  const defaultTestimonials = [
    { name: 'John Mwangi', role: 'Project Manager', company: 'Nairobi Heights Construction', text: 'BOCHI has transformed how we manage subcontractor payments. Saves us 5+ hours every week!', rating: 5 },
    { name: 'Mary Wanjiku', role: 'Site Supervisor', company: 'Kisii Teaching Hospital', text: 'The site diary feature is brilliant. Track everything in one place!', rating: 5 },
    { name: 'James Otieno', role: 'Quantity Surveyor', company: 'Mombasa Port Road Project', text: 'Project profitability at a glance. Highly recommended!', rating: 5 }
  ];

  const displayTestimonials = approvedTestimonials.length > 0 ? approvedTestimonials : defaultTestimonials;

  const faqs = [
    { q: 'How does the free trial work?', a: '14-day full access to Pro features. No credit card required.' },
    { q: 'Can I change my plan?', a: 'Yes, upgrade or downgrade anytime from billing.' },
    { q: 'Is my data secure?', a: 'Enterprise-grade encryption and best practices.' },
    { q: 'Do you offer training?', a: 'Yes, onboarding for all paid plans.' },
    { q: 'Can I export data?', a: 'Export to CSV or PDF anytime.' },
    { q: 'Payment methods?', a: 'M-Pesa and Visa/Mastercard.' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className={`fixed top-0 w-full z-50 transition-all ${scrolled ? 'bg-slate-900/95 backdrop-blur-md border-b border-slate-700' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center"><HardHat size={18} className="text-white" /></div>
            <span className="text-xl font-bold text-amber-500">BOCHI</span>
            <span className="text-xs text-slate-400">Construction Suite</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {['features', 'testimonials', 'faq'].map(item => (
              <a key={item} href={`#${item}`} className="text-sm text-slate-300 hover:text-amber-500">{item.charAt(0).toUpperCase() + item.slice(1)}</a>
            ))}
            <button onClick={() => navigate('/login')} className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-md">Log in</button>
            <button onClick={() => navigate('/register')} className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-md">Get Started</button>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="pt-24 pb-10 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 rounded-full px-4 py-1.5 border border-amber-500/20 mb-5">
            <HardHat size={14} className="text-amber-400" /><span className="text-amber-400 text-xs">Trusted by 500+ Construction Companies</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Manage Your Construction <span className="text-amber-500">Projects Smarter</span></h1>
          <p className="text-slate-300 max-w-2xl mx-auto mb-6">From subcontractors and payroll to stores and site diary — all in one platform.</p>
          <div className="flex gap-4 justify-center mb-4">
            <button onClick={() => navigate('/register')} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-md font-semibold">Start Free Trial</button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="px-6 py-3 border border-slate-600 text-slate-300 rounded-md font-semibold">Learn More</button>
          </div>
          <p className="text-xs text-slate-400">No credit card • 14-day trial • Cancel anytime</p>
          <div className="mt-4 inline-block bg-slate-800/50 rounded-full px-5 py-2">
            <AnimatePresence mode="wait">
              <motion.span key={currentHeroWordIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-amber-400 text-xs">{heroMovingWords[currentHeroWordIndex]}</motion.span>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-slate-800/30 border-y border-slate-700">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[{ v: '500+', l: 'Companies' }, { v: '10k+', l: 'Users' }, { v: '12+', l: 'Reports' }, { v: '99.9%', l: 'Uptime' }].map((s, i) => (
            <div key={i}><div className="text-3xl font-bold text-amber-500">{s.v}</div><div className="text-sm text-slate-400">{s.l}</div></div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:border-amber-500/50 transition-all cursor-pointer" onClick={() => navigate('/register')}>
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="font-semibold text-white text-sm">{f.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{f.description}</p>
                <p className="text-xs text-amber-500/70 mt-2">✨ {f.benefits}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Submit Testimonial - Minimal */}
      <section className="py-8 px-4 bg-slate-800/20">
        <div className="max-w-lg mx-auto">
          <h3 className="text-sm font-semibold text-white text-center mb-3">⭐ Share Your Experience</h3>
          <TestimonialForm />
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 px-4 bg-slate-800/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-10">Trusted by Industry Leaders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayTestimonials.map((t, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                <div className="flex gap-1 mb-3">{[...Array(t.rating || 5)].map((_, j) => <span key={j} className="text-yellow-500 text-sm">★</span>)}</div>
                <p className="text-slate-300 text-sm mb-3">"{t.text}"</p>
                <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs">{t.name[0]}</div>
                  <div><p className="font-semibold text-white text-xs">{t.name}</p><p className="text-xs text-slate-400">{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-10">FAQs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {faqs.map((f, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <h3 className="font-semibold text-white text-sm">{f.q}</h3>
                <p className="text-xs text-slate-400 mt-1">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-amber-600 to-amber-700 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Build Smarter?</h2>
        <p className="text-amber-100 mb-6">Join thousands of construction professionals using BOCHI.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate('/register')} className="px-8 py-3 bg-white text-amber-600 rounded-lg font-semibold">Start Free Trial</button>
          <button onClick={() => window.location.href = 'mailto:info@bochi.ke'} className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold">Contact Us</button>
        </div>
        <p className="text-amber-100 text-sm mt-4">No credit card • 14-day trial • Cancel anytime</p>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-8 px-4 text-center border-t border-slate-800">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center"><HardHat size={16} className="text-white" /></div>
          <span className="text-lg font-bold text-amber-500">BOCHI</span>
          <span className="text-xs text-slate-400">Construction Suite</span>
        </div>
        <div className="flex justify-center gap-6 text-xs text-slate-400 mb-3">
          <a href="#features" className="hover:text-amber-500">Features</a>
          <a href="#testimonials" className="hover:text-amber-500">Testimonials</a>
          <a href="#faq" className="hover:text-amber-500">FAQ</a>
          <a href="mailto:info@bochi.ke" className="hover:text-amber-500">Contact</a>
        </div>
        <p className="text-slate-500 text-xs">&copy; 2026 BOCHI Construction Suite. Built by Finite Element Designs | Nairobi, Kenya</p>
      </footer>
    </div>
  );
};

export default LandingPage;