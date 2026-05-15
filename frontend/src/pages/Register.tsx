import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Mail, Phone, MapPin, Key, User, Globe, 
  Sparkles, Shield, CheckCircle2, ArrowRight, ArrowLeft,
  TrendingUp, Clock, Users, Award, Quote, HardHat,
  AlertCircle, CheckCircle, Info, HelpCircle, Eye,
  ChevronRight, Rocket, Target, Briefcase, Calendar, DollarSign, Star
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

  // Help text for users
  const helpTexts = {
    companyName: "Your company's legal or trading name as it will appear on invoices and reports",
    subdomain: "This creates your unique login URL. Example: yourcompany.bochi.ke",
    subdomainFormat: "Use only lowercase letters, numbers, and hyphens (no spaces or special characters)",
    adminEmail: "This will be your primary login email for accessing BOCHI",
    password: "Minimum 6 characters. Choose something you'll remember but is secure",
    kraPin: "Optional - used for tax compliance and invoice generation"
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
          throw new Error('This subdomain is already taken. Please try another one.');
        } else if (errorMsg.includes('email')) {
          throw new Error('This email is already registered. Please use a different email or login.');
        } else {
          throw new Error('Please check your details and try again');
        }
      }

      setSuccess(`🎉 Welcome aboard, ${form.admin_name}! Your company "${form.name}" has been successfully registered. Redirecting to login...`);

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
        setError('Unable to connect. Please check your internet connection.');
      } else {
        setError(message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isStep1Valid = form.name && form.subdomain;
  const isStep2Valid = form.admin_name && form.admin_email && form.admin_password && form.confirm_password;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header Section - No yellow banner */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/Bochi_logo_transparent.png" 
              alt="BOCHI Logo" 
              className="h-12 w-auto"
            />
          </div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-white mb-3"
          >
            Register Your Company
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-slate-400 text-base max-w-2xl mx-auto"
          >
            Join the best construction management software trusted by 500+ companies across Kenya
          </motion.p>

          {/* Trust Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-amber-500/10 rounded-full border border-amber-500/20"
          >
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-amber-400 text-xs font-medium">Rated 4.9/5 by Construction Professionals</span>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between max-w-md">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      step >= 1 ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25' : 'bg-slate-700 text-slate-400'
                    }`}>
                      1
                    </div>
                    <div className={`flex-1 h-1 mx-3 rounded transition-all duration-300 ${
                      step >= 2 ? 'bg-amber-500' : 'bg-slate-700'
                    }`} />
                  </div>
                  <p className={`text-xs mt-2 font-medium ${step >= 1 ? 'text-amber-400' : 'text-slate-500'}`}>
                    Company Details
                  </p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      step >= 2 ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25' : 'bg-slate-700 text-slate-400'
                    }`}>
                      2
                    </div>
                  </div>
                  <p className={`text-xs mt-2 font-medium ${step >= 2 ? 'text-amber-400' : 'text-slate-500'}`}>
                    Admin Account
                  </p>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white">
                  {step === 1 ? 'Tell us about your company' : 'Set up your admin account'}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  {step === 1 
                    ? "We'll use this information to set up your company workspace" 
                    : "Create the master account for your company administrator"}
                </p>
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
                      className="space-y-5"
                    >
                      {/* Company Name */}
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                          Company Name <span className="text-amber-400">*</span>
                        </label>
                        <div className="relative">
                          <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            id="name"
                            type="text"
                            placeholder="e.g., Acme Construction Ltd"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                            autoFocus
                          />
                        </div>
                        <div className="flex items-center gap-1 mt-1.5">
                          <Info size={12} className="text-slate-500" />
                          <p className="text-xs text-slate-500">{helpTexts.companyName}</p>
                        </div>
                      </div>

                      {/* Subdomain */}
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                          Your Unique URL <span className="text-amber-400">*</span>
                        </label>
                        <div className="flex">
                          <input
                            id="subdomain"
                            type="text"
                            placeholder="acme"
                            value={form.subdomain}
                            onChange={handleChange}
                            className="flex-1 px-3 py-3 bg-slate-800/50 border border-slate-700 rounded-l-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                          />
                          <span className="px-4 py-3 bg-slate-800 border border-l-0 border-slate-700 rounded-r-xl text-sm text-slate-400">
                            .bochi.ke
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1.5">
                          <button
                            type="button"
                            onClick={() => setShowSubdomainHint(!showSubdomainHint)}
                            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
                          >
                            <HelpCircle size={12} />
                            Why do I need this?
                          </button>
                        </div>
                        {showSubdomainHint && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
                          >
                            <p className="text-xs text-amber-300">
                              Your subdomain creates a personalized login URL for your team. 
                              For example, if you choose "acme", your team will log in at 
                              <span className="font-mono block mt-1 text-amber-400">acme.bochi.ke</span>
                              This keeps your data secure and gives you a professional branded portal.
                            </p>
                          </motion.div>
                        )}
                        <p className="text-xs text-slate-500 mt-1">{helpTexts.subdomainFormat}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Company Email */}
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                            Company Email
                          </label>
                          <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                              id="email"
                              type="email"
                              placeholder="info@acme.com"
                              value={form.email}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                            />
                          </div>
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                              id="phone"
                              type="text"
                              placeholder="+254 700 000 000"
                              value={form.phone}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                          Business Address
                        </label>
                        <div className="relative">
                          <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            id="address"
                            type="text"
                            placeholder="Nairobi, Kenya"
                            value={form.address}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                          />
                        </div>
                      </div>

                      {/* KRA PIN */}
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                          KRA PIN <span className="text-slate-500 text-xs">(Optional)</span>
                        </label>
                        <div className="relative">
                          <Target size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            id="kra_pin"
                            type="text"
                            placeholder="P051012345Z"
                            value={form.kra_pin}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{helpTexts.kraPin}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={!isStep1Valid}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                      >
                        Continue to Admin Setup
                        <ChevronRight size={16} />
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
                        <label className="text-sm font-medium text-slate-300 mb-1.5 block">
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
                            className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Admin Email */}
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-1.5 block">
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
                            className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{helpTexts.adminEmail}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Password */}
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-1.5 block">
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
                              className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                            />
                          </div>
                          <div className="flex items-center gap-1 mt-1.5">
                            <button
                              type="button"
                              onClick={() => setShowPasswordHint(!showPasswordHint)}
                              className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
                            >
                              <HelpCircle size={12} />
                              Password requirements?
                            </button>
                          </div>
                          {showPasswordHint && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                            >
                              <p className="text-xs text-slate-300">
                                Your password must:
                              </p>
                              <ul className="text-xs text-slate-400 list-disc list-inside mt-1 space-y-0.5">
                                <li>Be at least 6 characters long</li>
                                <li>Be something you'll remember</li>
                                <li>Keep your account secure</li>
                              </ul>
                            </motion.div>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-1.5 block">
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
                              className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="flex-1 bg-transparent border border-slate-600 hover:border-amber-500 text-white py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <ArrowLeft size={16} />
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading || !isStep2Valid}
                          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2"
                  >
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    <span>{success}</span>
                  </motion.div>
                )}
              </form>

              {/* Terms and Login Link */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-500 text-center mb-3">
                  By registering, you agree to our{' '}
                  <a href="/terms" className="text-amber-400 hover:text-amber-300 hover:underline">Terms of Service</a> and{' '}
                  <a href="/privacy" className="text-amber-400 hover:text-amber-300 hover:underline">Privacy Policy</a>
                </p>
                <p className="text-xs text-slate-500 text-center">
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      if (onBackToLogin) {
                        onBackToLogin();
                      } else {
                        navigate('/login');
                      }
                    }}
                    className="text-amber-400 hover:text-amber-300 hover:underline font-medium"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Guidance & Benefits */}
          <div className="space-y-6">
            {/* "Best Software" Message */}
            <div className="bg-gradient-to-br from-amber-500/15 to-amber-600/5 rounded-2xl border border-amber-500/20 p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/20 mb-4">
                <Sparkles size={24} className="text-amber-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">
                Why BOCHI is the Best Construction Software in Kenya
              </h3>
              <p className="text-slate-300 text-sm mb-3">
                Trusted by 500+ construction companies, BOCHI helps you:
              </p>
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-amber-400" />
                  <span className="text-slate-300 text-sm">Save 20+ hours weekly on admin work</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-amber-400" />
                  <span className="text-slate-300 text-sm">Reduce costs by up to 40%</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-amber-400" />
                  <span className="text-slate-300 text-sm">Get real-time financial insights</span>
                </div>
              </div>
            </div>

            {/* Quick Guide Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <HelpCircle size={16} className="text-amber-400" />
                </div>
                <h3 className="text-white font-semibold">Quick Registration Guide</h3>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <p className="text-white text-sm font-medium">Company Details</p>
                    <p className="text-slate-400 text-xs">Tell us about your construction company</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <p className="text-white text-sm font-medium">Admin Account</p>
                    <p className="text-slate-400 text-xs">Create your master administrator login</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <p className="text-white text-sm font-medium">Start Exploring</p>
                    <p className="text-slate-400 text-xs">Log in and start managing your projects</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What You Get Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Rocket size={18} className="text-amber-400" />
                <h3 className="text-white font-semibold">What's included in your trial</h3>
              </div>
              <div className="space-y-3">
                {[
                  "Full access to all Pro features",
                  "Subcontractor & workforce management",
                  "Financial tracking & reporting",
                  "Project Gantt charts & timeline",
                  "Stakeholder portal access",
                  "Email & chat support"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-amber-400 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Signals */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-white">500+</p>
                  <p className="text-xs text-slate-400">Companies</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">10k+</p>
                  <p className="text-xs text-slate-400">Users</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">14</p>
                  <p className="text-xs text-slate-400">Day Trial</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Shield size={12} className="text-amber-400" />
                  <span className="text-xs text-slate-400">No credit card required</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Cancel anytime during trial</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}