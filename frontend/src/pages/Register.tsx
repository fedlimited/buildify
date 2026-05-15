import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Mail, Phone, MapPin, Key, User, Globe, 
  Sparkles, Shield, CheckCircle2, ArrowRight, ArrowLeft,
  AlertCircle, CheckCircle, Info, HelpCircle,
  ChevronRight, Rocket, Target, Star, Award, TrendingUp, Clock, Users
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

interface RegisterProps {
  onBackToLogin?: () => void;
}

export function Register({ onBackToLogin }: RegisterProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1);
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [showSubdomainHint, setShowSubdomainHint] = useState(false);
  const [form, setForm] = useState({
    name: '',
    subdomain: '',
    email: '',
    phone: '',
    address: '',
    kra_pin: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    confirm_password: ''
  });

  const helpTexts = {
    companyName: "Your company's legal or trading name as it will appear on invoices and reports",
    subdomainFormat: "Use only lowercase letters, numbers, and hyphens",
    adminEmail: "This will be your primary login email",
    kraPin: "Optional - used for tax compliance"
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'subdomain') {
      const formatted = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setForm({ ...form, subdomain: formatted });
    } else {
      setForm({ ...form, [id]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.admin_password !== form.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    if (form.admin_password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (form.subdomain.length < 3) {
      setError('Subdomain must be at least 3 characters');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/companies/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          subdomain: form.subdomain,
          email: form.email,
          phone: form.phone,
          address: form.address,
          kra_pin: form.kra_pin.toUpperCase(),
          admin_name: form.admin_name,
          admin_email: form.admin_email,
          admin_password: form.admin_password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || '';
        if (errorMsg.includes('subdomain') || errorMsg.includes('exists')) {
          throw new Error('Subdomain already taken');
        } else if (errorMsg.includes('email')) {
          throw new Error('Email already registered');
        } else {
          throw new Error('Check details and try again');
        }
      }

      setSuccess(`🎉 Welcome! Your company has been registered. Redirecting to login...`);

      setTimeout(() => {
        if (onBackToLogin) {
          onBackToLogin();
        } else {
          navigate('/login', { state: { subdomain: form.subdomain, email: form.admin_email } });
        }
      }, 3000);

    } catch (err: any) {
      const message = err.message || '';
      if (message.includes('network') || message.includes('fetch')) {
        setError('Check your internet connection');
      } else {
        setError(message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isStep1Valid = form.name && form.subdomain;
  const isStep2Valid = form.admin_name && form.admin_email && form.admin_password && form.confirm_password;

  return (
    <div className="min-h-screen bg-black flex">
      {/* LEFT SIDE - Registration Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative overflow-y-auto">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Top Login Link */}
        <div className="relative z-10 w-full px-8 pt-6">
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (onBackToLogin) {
                  onBackToLogin();
                } else {
                  navigate('/login');
                }
              }}
              className="group flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm border border-amber-500/40 hover:border-amber-500 rounded-md text-amber-400 text-sm font-medium transition-all duration-300"
            >
              Sign in
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Registration Form - Better space utilization */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-8 py-8">
          <div className="w-full max-w-md mx-auto">
            {/* Logo and Header - Compact */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-3">
                <img 
                  src="/Bochi_logo_transparent.png" 
                  alt="BOCHI Logo" 
                  className="h-8 w-auto"
                />
              </div>
              <h1 className="text-xl font-bold text-white mb-1">Register Your Company</h1>
              <p className="text-slate-400 text-xs">Join the world's best construction platform</p>
            </div>

            {/* Form Card - Minimal border, no excessive padding */}
            <div className="border border-slate-800 rounded-md p-5">
              {/* Step Indicator - Compact */}
              <div className="flex justify-between mb-5">
                <div className="flex-1 text-center">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-xs transition-all duration-300 ${
                    step >= 1 ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    1
                  </div>
                  <span className={`text-[10px] font-medium ${step >= 1 ? 'text-amber-400' : 'text-slate-500'}`}>
                    Company
                  </span>
                </div>
                <div className="flex-1 text-center">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-xs transition-all duration-300 ${
                    step >= 2 ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    2
                  </div>
                  <span className={`text-[10px] font-medium ${step >= 2 ? 'text-amber-400' : 'text-slate-500'}`}>
                    Admin
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1 block">Company Name *</label>
                        <div className="relative">
                          <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            id="name"
                            type="text"
                            placeholder="Acme Construction Ltd"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full pl-9 pr-3 py-2 bg-black/50 border border-slate-800 rounded-md text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1 block">Your URL *</label>
                        <div className="flex">
                          <input
                            id="subdomain"
                            type="text"
                            placeholder="acme"
                            value={form.subdomain}
                            onChange={handleChange}
                            className="flex-1 px-3 py-2 bg-black/50 border border-slate-800 rounded-l-md text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                          />
                          <span className="px-3 py-2 bg-slate-900 border border-l-0 border-slate-800 rounded-r-md text-xs text-slate-400">
                            .bochi.ke
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <button
                            type="button"
                            onClick={() => setShowSubdomainHint(!showSubdomainHint)}
                            className="text-[10px] text-amber-400 hover:text-amber-300"
                          >
                            Why need this?
                          </button>
                        </div>
                        {showSubdomainHint && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-md"
                          >
                            <p className="text-[10px] text-amber-300">
                              Your personalized login URL: <span className="font-mono">acme.bochi.ke</span>
                            </p>
                          </motion.div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-slate-300 mb-1 block">Email</label>
                          <div className="relative">
                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                              id="email"
                              type="email"
                              placeholder="info@acme.com"
                              value={form.email}
                              onChange={handleChange}
                              className="w-full pl-9 pr-3 py-2 bg-black/50 border border-slate-800 rounded-md text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-300 mb-1 block">Phone</label>
                          <div className="relative">
                            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                              id="phone"
                              type="text"
                              placeholder="+254 700 000 000"
                              value={form.phone}
                              onChange={handleChange}
                              className="w-full pl-9 pr-3 py-2 bg-black/50 border border-slate-800 rounded-md text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1 block">Address</label>
                        <div className="relative">
                          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            id="address"
                            type="text"
                            placeholder="Nairobi, Kenya"
                            value={form.address}
                            onChange={handleChange}
                            className="w-full pl-9 pr-3 py-2 bg-black/50 border border-slate-800 rounded-md text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1 block">KRA PIN <span className="text-slate-500">(Optional)</span></label>
                        <div className="relative">
                          <Target size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            id="kra_pin"
                            type="text"
                            placeholder="P051012345Z"
                            value={form.kra_pin}
                            onChange={handleChange}
                            className="w-full pl-9 pr-3 py-2 bg-black/50 border border-slate-800 rounded-md text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={!isStep1Valid}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-md text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                      >
                        Continue
                      </button>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1 block">Full Name *</label>
                        <div className="relative">
                          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            id="admin_name"
                            type="text"
                            placeholder="John Doe"
                            value={form.admin_name}
                            onChange={handleChange}
                            className="w-full pl-9 pr-3 py-2 bg-black/50 border border-slate-800 rounded-md text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1 block">Admin Email *</label>
                        <div className="relative">
                          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            id="admin_email"
                            type="email"
                            placeholder="admin@acme.com"
                            value={form.admin_email}
                            onChange={handleChange}
                            className="w-full pl-9 pr-3 py-2 bg-black/50 border border-slate-800 rounded-md text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-slate-300 mb-1 block">Password *</label>
                          <div className="relative">
                            <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                              id="admin_password"
                              type="password"
                              placeholder="********"
                              value={form.admin_password}
                              onChange={handleChange}
                              className="w-full pl-9 pr-3 py-2 bg-black/50 border border-slate-800 rounded-md text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowPasswordHint(!showPasswordHint)}
                            className="text-[10px] text-amber-400 hover:text-amber-300 mt-1"
                          >
                            Requirements?
                          </button>
                          {showPasswordHint && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-1 p-1.5 bg-slate-900 rounded-md text-[10px] text-slate-400"
                            >
                              Minimum 6 characters
                            </motion.div>
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-300 mb-1 block">Confirm *</label>
                          <div className="relative">
                            <CheckCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                              id="confirm_password"
                              type="password"
                              placeholder="********"
                              value={form.confirm_password}
                              onChange={handleChange}
                              className="w-full pl-9 pr-3 py-2 bg-black/50 border border-slate-800 rounded-md text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="flex-1 bg-transparent border border-slate-700 hover:border-amber-500 text-white py-2 rounded-md text-sm font-semibold transition-all duration-200"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading || !isStep2Valid}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-md text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Rocket size={14} />
                              Start Trial
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-xs flex items-center gap-2"
                  >
                    <AlertCircle size={12} />
                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded-md text-green-400 text-xs flex items-center gap-2"
                  >
                    <CheckCircle size={12} />
                    <span>{success}</span>
                  </motion.div>
                )}
              </form>

              {/* Terms - Compact */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                <p className="text-[10px] text-slate-500">
                  By registering, you agree to our{' '}
                  <a href="/terms" className="text-amber-400 hover:text-amber-300">Terms</a> and{' '}
                  <a href="/privacy" className="text-amber-400 hover:text-amber-300">Privacy</a>
                </p>
              </div>
            </div>

            {/* Stats - Compact */}
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-1">
                <Building2 size={10} className="text-amber-400" />
                <span className="text-slate-500 text-[10px]">500+ Companies</span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={10} className="text-amber-400" />
                <span className="text-slate-500 text-[10px]">10k+ Users</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield size={10} className="text-amber-400" />
                <span className="text-slate-500 text-[10px]">14-Day Trial</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Professional Black Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="premiumGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.06"/>
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.02"/>
              </linearGradient>
              <pattern id="premiumDots" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#f59e0b" fillOpacity="0.05"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#premiumDots)" />
            <rect width="100%" height="100%" fill="url(#premiumGrad)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-center max-w-md mx-auto px-8 py-16 w-full">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-500/10 rounded-full px-3 py-1 border border-amber-500/20 w-fit mx-auto mb-6">
            <Globe size={12} className="text-amber-400" />
            <span className="text-amber-400 text-[10px] font-medium">Trusted Worldwide</span>
          </div>

          {/* Main Message */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Best Construction
              <span className="block text-amber-400">Software Platform</span>
            </h2>
            <p className="text-slate-400 text-sm">
              Join 500+ construction companies worldwide
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center">
              <p className="text-xl font-bold text-white">40%</p>
              <p className="text-[10px] text-slate-500">Cost Reduction</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">20h</p>
              <p className="text-[10px] text-slate-500">Weekly Saved</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">99.9%</p>
              <p className="text-[10px] text-slate-500">Accuracy</p>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-2 mb-6">
            {[
              "Save 20+ hours weekly on admin work",
              "Reduce costs by up to 40%",
              "Real-time financial insights",
              "Stakeholder portal for clients"
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-amber-400" />
                <span className="text-slate-300 text-xs">{item}</span>
              </div>
            ))}
          </div>

          {/* Rating */}
          <div className="border-t border-slate-800 pt-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-xs text-slate-400">Rated 4.9/5 by Construction Professionals</p>
          </div>
        </div>
      </div>
    </div>
  );
}