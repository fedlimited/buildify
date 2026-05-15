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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Main Content - Larger spacing */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* LEFT SIDE - Registration Form */}
          <div className="space-y-6">
            {/* Logo and Header */}
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-4">
                <img 
                  src="/Bochi_logo_transparent.png" 
                  alt="BOCHI Logo" 
                  className="h-10 w-auto"
                />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Register Your Company</h1>
              <p className="text-slate-400 text-base">Join the world's best construction platform</p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center lg:justify-start gap-8">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step >= 1 ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25' : 'bg-slate-700 text-slate-400'
                }`}>
                  1
                </div>
                <span className={`text-sm font-medium ${step >= 1 ? 'text-amber-400' : 'text-slate-500'}`}>
                  Company Details
                </span>
              </div>
              <div className="w-12 h-px bg-slate-700" />
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step >= 2 ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25' : 'bg-slate-700 text-slate-400'
                }`}>
                  2
                </div>
                <span className={`text-sm font-medium ${step >= 2 ? 'text-amber-400' : 'text-slate-500'}`}>
                  Admin Account
                </span>
              </div>
            </div>

            {/* Form Card - Larger padding, bigger text */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8">
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      {/* Company Name */}
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">
                          Company Name <span className="text-amber-400">*</span>
                        </label>
                        <div className="relative">
                          <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            id="name"
                            type="text"
                            placeholder="Acme Construction Ltd"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-black/30 border border-slate-700 rounded-lg text-white text-base placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Subdomain */}
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">
                          Your URL <span className="text-amber-400">*</span>
                        </label>
                        <div className="flex">
                          <input
                            id="subdomain"
                            type="text"
                            placeholder="acme"
                            value={form.subdomain}
                            onChange={handleChange}
                            className="flex-1 px-4 py-3 bg-black/30 border border-slate-700 rounded-l-lg text-white text-base placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                          />
                          <span className="px-4 py-3 bg-slate-800 border border-l-0 border-slate-700 rounded-r-lg text-base text-slate-400">
                            .bochi.ke
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowSubdomainHint(!showSubdomainHint)}
                          className="text-xs text-amber-400 hover:text-amber-300 mt-1 flex items-center gap-1"
                        >
                          <HelpCircle size={12} />
                          Why do I need this?
                        </button>
                        {showSubdomainHint && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
                          >
                            <p className="text-xs text-amber-300">
                              Your personalized login URL: <span className="font-mono">acme.bochi.ke</span>
                            </p>
                          </motion.div>
                        )}
                      </div>

                      {/* Email and Phone */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-2 block">Company Email</label>
                          <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                              id="email"
                              type="email"
                              placeholder="info@acme.com"
                              value={form.email}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-3 bg-black/30 border border-slate-700 rounded-lg text-white text-base placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-2 block">Phone Number</label>
                          <div className="relative">
                            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                              id="phone"
                              type="text"
                              placeholder="+254 700 000 000"
                              value={form.phone}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-3 bg-black/30 border border-slate-700 rounded-lg text-white text-base placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Business Address</label>
                        <div className="relative">
                          <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            id="address"
                            type="text"
                            placeholder="Nairobi, Kenya"
                            value={form.address}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-black/30 border border-slate-700 rounded-lg text-white text-base placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                          />
                        </div>
                      </div>

                      {/* KRA PIN */}
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">
                          KRA PIN <span className="text-slate-500">(Optional)</span>
                        </label>
                        <div className="relative">
                          <Target size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            id="kra_pin"
                            type="text"
                            placeholder="P051012345Z"
                            value={form.kra_pin}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-black/30 border border-slate-700 rounded-lg text-white text-base placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={!isStep1Valid}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 rounded-lg text-base font-semibold transition-all duration-200 shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                      >
                        Continue to Admin Setup
                        <ChevronRight size={16} className="inline ml-1" />
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
                      className="space-y-5"
                    >
                      {/* Admin Name */}
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">
                          Full Name <span className="text-amber-400">*</span>
                        </label>
                        <div className="relative">
                          <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            id="admin_name"
                            type="text"
                            placeholder="John Doe"
                            value={form.admin_name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-black/30 border border-slate-700 rounded-lg text-white text-base placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Admin Email */}
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">
                          Admin Email <span className="text-amber-400">*</span>
                        </label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            id="admin_email"
                            type="email"
                            placeholder="admin@acme.com"
                            value={form.admin_email}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-black/30 border border-slate-700 rounded-lg text-white text-base placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                          />
                        </div>
                      </div>

                      {/* Password and Confirm */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-2 block">
                            Password <span className="text-amber-400">*</span>
                          </label>
                          <div className="relative">
                            <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                              id="admin_password"
                              type="password"
                              placeholder="********"
                              value={form.admin_password}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-3 bg-black/30 border border-slate-700 rounded-lg text-white text-base placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowPasswordHint(!showPasswordHint)}
                            className="text-xs text-amber-400 hover:text-amber-300 mt-1"
                          >
                            Password requirements?
                          </button>
                          {showPasswordHint && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 p-2 bg-slate-800/50 rounded-lg text-xs text-slate-400"
                            >
                              Minimum 6 characters
                            </motion.div>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-2 block">
                            Confirm Password <span className="text-amber-400">*</span>
                          </label>
                          <div className="relative">
                            <CheckCircle size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                              id="confirm_password"
                              type="password"
                              placeholder="********"
                              value={form.confirm_password}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-3 bg-black/30 border border-slate-700 rounded-lg text-white text-base placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="flex-1 bg-transparent border border-slate-600 hover:border-amber-500 text-white py-3 rounded-lg text-base font-semibold transition-all duration-200"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading || !isStep2Valid}
                          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 rounded-lg text-base font-semibold transition-all duration-200 shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Creating Account...
                            </>
                          ) : (
                            <>
                              <Rocket size={16} />
                              Start Free Trial
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
                    className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2"
                  >
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    <span>{success}</span>
                  </motion.div>
                )}
              </form>

              {/* Terms and Login Link */}
              <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-500 mb-2">
                  By registering, you agree to our{' '}
                  <a href="/terms" className="text-amber-400 hover:text-amber-300">Terms of Service</a> and{' '}
                  <a href="/privacy" className="text-amber-400 hover:text-amber-300">Privacy Policy</a>
                </p>
                <p className="text-sm text-slate-500">
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      if (onBackToLogin) {
                        onBackToLogin();
                      } else {
                        navigate('/login');
                      }
                    }}
                    className="text-amber-400 hover:text-amber-300 font-medium"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Benefits Section - Larger, more prominent */}
          <div className="space-y-6">
            {/* Global Trust Badge */}
            <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 rounded-xl border border-amber-500/20 p-6 text-center">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 rounded-full px-3 py-1 mb-4">
                <Globe size={14} className="text-amber-400" />
                <span className="text-amber-400 text-xs font-medium">Trusted Worldwide</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Best Construction
                <span className="block text-amber-400">Software Platform</span>
              </h2>
              <p className="text-slate-400">Join 500+ construction companies worldwide</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl border border-white/10 p-4 text-center">
                <p className="text-2xl font-bold text-white">40%</p>
                <p className="text-xs text-slate-400">Cost Reduction</p>
              </div>
              <div className="bg-white/5 rounded-xl border border-white/10 p-4 text-center">
                <p className="text-2xl font-bold text-white">20h</p>
                <p className="text-xs text-slate-400">Weekly Saved</p>
              </div>
              <div className="bg-white/5 rounded-xl border border-white/10 p-4 text-center">
                <p className="text-2xl font-bold text-white">99.9%</p>
                <p className="text-xs text-slate-400">Accuracy</p>
              </div>
            </div>

            {/* Features List */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400" />
                Why Companies Choose BOCHI
              </h3>
              <div className="space-y-3">
                {[
                  "Save 20+ hours weekly on admin work",
                  "Reduce operational costs by up to 40%",
                  "Real-time financial insights and reporting",
                  "Stakeholder portal for client transparency",
                  "Automated procurement workflow",
                  "Subcontractor & workforce management"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-amber-400" />
                    <span className="text-slate-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating Section */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6 text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-white font-medium">Rated 4.9/5</p>
              <p className="text-xs text-slate-400">by Construction Professionals Worldwide</p>
            </div>

            {/* Free Trial Badge */}
            <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 rounded-xl border border-amber-500/20 p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Shield size={14} className="text-amber-400" />
                <span className="text-sm text-white">14-day free trial</span>
                <span className="text-xs text-slate-500">• No credit card required</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Cancel anytime during trial</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}