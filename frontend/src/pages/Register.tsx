import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Mail, Phone, MapPin, Key, User, Globe, 
  Sparkles, Shield, CheckCircle2, ArrowRight, Eye, 
  TrendingUp, Clock, Users, Award, Quote, HardHat,
  AlertCircle, CheckCircle
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
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
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

  const rotatingPhrases = [
    "Streamline project finances →",
    "Track costs in real-time →",
    "Automate procurement workflow →",
    "Manage inventory seamlessly →",
    "Generate instant reports →"
  ];

  const testimonials = [
    { quote: "Saved us 20+ hours weekly on reporting", author: "John Doe", company: "Heights Construction" },
    { quote: "Most intuitive financial tool we've used", author: "Sarah Wanjiku", company: "Kenya Builders Ltd" },
    { quote: "Transformed our project cost visibility", author: "Michael Otieno", company: "Ace Developers" }
  ];

  // Rotating animations
  useState(() => {
    const phraseInterval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % rotatingPhrases.length);
    }, 2800);

    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => {
      clearInterval(phraseInterval);
      clearInterval(testimonialInterval);
    };
  });

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

      setSuccess(`🎉 Welcome to BOCHI! Your company "${form.name}" has been successfully registered.`);

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
      } else if (message.includes('password')) {
        setError('Password too weak');
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
    <div className="min-h-screen flex">
      {/* LEFT SIDE - Registration Form */}
      <div className="w-full lg:w-2/5 bg-black flex flex-col relative overflow-hidden min-h-screen">
        {/* Background decorative elements */}
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

        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

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
              className="group flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm border border-amber-500/40 hover:border-amber-500 rounded-full text-amber-400 text-sm font-medium transition-all duration-300"
            >
              Sign in
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Registration Card */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-8 py-8 -mt-16">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <img 
                  src="/Bochi_logo_transparent.png" 
                  alt="BOCHI Logo" 
                  className="h-12 w-auto"
                />
              </div>
              <h1 className="text-3xl font-bold text-white mb-1">Start Free Trial</h1>
              <p className="text-gray-400 text-sm">Join 500+ construction companies using BOCHI Suite</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded border border-white/10 p-6">
              {/* Step Indicator */}
              <div className="flex justify-between mb-6">
                <div className="flex-1 text-center">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center transition-all duration-300 ${
                    step >= 1 ? 'bg-amber-500 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                    1
                  </div>
                  <span className={`text-xs font-medium ${step >= 1 ? 'text-amber-400' : 'text-gray-500'}`}>
                    Company Details
                  </span>
                </div>
                <div className="flex-1 text-center">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center transition-all duration-300 ${
                    step >= 2 ? 'bg-amber-500 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                    2
                  </div>
                  <span className={`text-xs font-medium ${step >= 2 ? 'text-amber-400' : 'text-gray-500'}`}>
                    Admin Account
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
                      className="space-y-4"
                    >
                      <div>
                        <label className="text-xs font-medium text-gray-300 mb-1.5 block">Company Name *</label>
                        <input
                          id="name"
                          type="text"
                          placeholder="e.g., Acme Construction Ltd"
                          value={form.name}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-300 mb-1.5 block">Your Company URL *</label>
                        <div className="flex">
                          <input
                            id="subdomain"
                            type="text"
                            placeholder="acme"
                            value={form.subdomain}
                            onChange={handleChange}
                            className="flex-1 px-3 py-2.5 bg-black/50 border border-gray-700 rounded-l text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                          />
                          <span className="px-3 py-2.5 bg-gray-900 border border-l-0 border-gray-700 rounded-r text-sm text-gray-400">
                            .bochi.ke
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Use only letters, numbers, and hyphens
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-300 mb-1.5 block">Company Email</label>
                          <input
                            id="email"
                            type="email"
                            placeholder="info@acme.com"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-300 mb-1.5 block">Phone</label>
                          <input
                            id="phone"
                            type="text"
                            placeholder="+254 700 000 000"
                            value={form.phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-300 mb-1.5 block">Address</label>
                        <input
                          id="address"
                          type="text"
                          placeholder="Nairobi, Kenya"
                          value={form.address}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-300 mb-1.5 block">KRA PIN (Optional)</label>
                        <input
                          id="kra_pin"
                          type="text"
                          placeholder="P051012345Z"
                          value={form.kra_pin}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={!isStep1Valid}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-2.5 rounded text-sm font-semibold transition-all duration-200 shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                      >
                        Continue to Admin Account
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
                      className="space-y-4"
                    >
                      <div>
                        <label className="text-xs font-medium text-gray-300 mb-1.5 block">Admin Name *</label>
                        <input
                          id="admin_name"
                          type="text"
                          placeholder="John Doe"
                          value={form.admin_name}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-300 mb-1.5 block">Admin Email *</label>
                        <input
                          id="admin_email"
                          type="email"
                          placeholder="admin@acme.com"
                          value={form.admin_email}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This will be your login email
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-300 mb-1.5 block">Password *</label>
                          <input
                            id="admin_password"
                            type="password"
                            placeholder="********"
                            value={form.admin_password}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-300 mb-1.5 block">Confirm Password *</label>
                          <input
                            id="confirm_password"
                            type="password"
                            placeholder="********"
                            value={form.confirm_password}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="flex-1 bg-transparent border border-gray-600 hover:border-amber-500 text-white py-2.5 rounded text-sm font-semibold transition-all duration-200"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading || !isStep2Valid}
                          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-2.5 rounded text-sm font-semibold transition-all duration-200 shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Creating Account...' : 'Start Free Trial'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm flex items-center gap-2"
                  >
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-sm flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    <span>{success}</span>
                  </motion.div>
                )}
              </form>

              <div className="mt-6 pt-4 border-t border-gray-800 text-center">
                <p className="text-xs text-gray-500">
                  By registering, you agree to our{' '}
                  <a href="/terms" className="text-amber-400 hover:text-amber-300 hover:underline">Terms of Service</a> and{' '}
                  <a href="/privacy" className="text-amber-400 hover:text-amber-300 hover:underline">Privacy Policy</a>
                </p>
              </div>
            </div>

            {/* Bottom stats */}
            <div className="mt-6 flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Building2 size={12} className="text-amber-400" />
                </div>
                <span className="text-gray-500 text-xs">500+ Companies</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Users size={12} className="text-amber-400" />
                </div>
                <span className="text-gray-500 text-xs">10k+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Award size={12} className="text-amber-400" />
                </div>
                <span className="text-gray-500 text-xs">4.9 Rating</span>
              </div>
            </div>
            <p className="text-center text-gray-600 text-xs mt-3">
              Trusted by construction companies across the globe
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Hero Section */}
      <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden min-h-screen">
        <div className="absolute inset-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="premiumGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.08"/>
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.03"/>
              </linearGradient>
              <pattern id="premiumDots" width="50" height="50" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#f59e0b" fillOpacity="0.08"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#premiumDots)" />
            <rect width="100%" height="100%" fill="url(#premiumGrad)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-center max-w-2xl mx-auto px-12 py-16 my-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm rounded-full px-4 py-1.5 border border-amber-500/20">
              <HardHat size={14} className="text-amber-400" />
              <span className="text-amber-400 text-xs font-medium">Trusted by 500+ Construction Companies</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-4xl font-bold text-white mb-3 leading-tight">
              Construction Financial
              <span className="block text-amber-400">Management Simplified</span>
            </h2>
            <p className="text-gray-300 text-base">
              Streamline project finances, track costs in real-time, and make data-driven decisions with confidence.
            </p>
          </motion.div>

          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { icon: TrendingUp, value: "40%", label: "Cost Reduction" },
              { icon: Clock, value: "20h", label: "Weekly Saved" },
              { icon: CheckCircle2, value: "99.9%", label: "Accuracy" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="text-center"
              >
                <stat.icon size={28} className="mx-auto mb-2 text-amber-400" />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded p-6 border border-white/10 mb-8">
            <p className="text-amber-400 text-sm font-medium mb-3 flex items-center gap-2">
              <Sparkles size={14} /> What you can achieve
            </p>
            <div className="h-14">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentPhrase}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.5 }}
                  className="text-white text-xl font-semibold"
                >
                  {rotatingPhrases[currentPhrase]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          <div className="bg-black/20 rounded p-5 border border-white/5">
            <Quote size={20} className="text-amber-400/50 mb-3" />
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-white text-base leading-relaxed mb-3">
                  "{testimonials[currentTestimonial].quote}"
                </p>
                <div>
                  <p className="text-white font-medium text-sm">{testimonials[currentTestimonial].author}</p>
                  <p className="text-gray-400 text-xs">{testimonials[currentTestimonial].company}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-1.5 mt-4 pt-3 border-t border-white/10">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTestimonial(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    currentTestimonial === idx
                      ? 'w-6 h-1 bg-amber-400'
                      : 'w-3 h-1 bg-white/20 hover:bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6">
            {[
              "Real-time financial reporting",
              "Automated procurement workflow",
              "Inventory & stores management",
              "Payroll with timesheets",
              "Subcontractor management",
              "Project profitability tracking"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-amber-400 flex-shrink-0" />
                <span className="text-gray-300 text-xs">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
              Join 500+ construction companies already using BOCHI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}