import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { HardHat, Mail, ArrowRight, Sparkles, CheckCircle2, Quote, Shield, Building2, Users, Award, TrendingUp, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { fetchProjects, fetchIncome, fetchExpenses, fetchInvoices, fetchPurchaseOrders, fetchCompanySettings, fetchCurrencySettings } = useAppStore();
  const [email, setEmail] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

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

  useEffect(() => {
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
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.sendLoginOTP(email, subdomain);
      if (response && response.success) {
        setStep('otp');
        setResendCooldown(60);
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(response?.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.verifyLoginOTP(email, otpCode, subdomain);
      if (response && response.success && response.token) {
        localStorage.setItem('token', response.token);

        if (response.user) {
          localStorage.setItem('authUser', JSON.stringify(response.user));
        }

        await Promise.all([
          fetchProjects(),
          fetchIncome(),
          fetchExpenses(),
          fetchInvoices(),
          fetchPurchaseOrders(),
          fetchCompanySettings(),
          fetchCurrencySettings()
        ]).catch(err => console.error('Fetch error:', err));

        window.location.href = '/dashboard';
      } else {
        setError(response?.message || 'Invalid OTP code');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    try {
      const response = await api.sendLoginOTP(email, subdomain);
      if (response && response.success) {
        setError('');
        setResendCooldown(60);
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err: any) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE - OTP Login */}
      <div className="w-full lg:w-2/5 bg-black flex flex-col relative overflow-hidden min-h-screen">
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

        {/* Top Start Free Trial Button */}
        <div className="relative z-10 w-full px-8 pt-6">
          <div className="flex justify-end">
            <button
              onClick={() => navigate('/register')}
              className="group flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm border border-amber-500/40 hover:border-amber-500 rounded-full text-amber-400 text-sm font-medium transition-all duration-300"
            >
              <Sparkles size={14} className="text-amber-400" />
              Start Free Trial
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* OTP Login Card */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-8 py-8">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <HardHat size={20} className="text-white" />
                </div>
                <span className="text-white font-semibold text-xl tracking-tight">BOCHABERI</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-1">Welcome back</h1>
              <p className="text-gray-400 text-sm">Please enter your details to sign in</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded border border-white/10 p-6">
              {step === 'email' ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-300 mb-1.5 block">Company Domain</label>
                    <div className="flex">
                      <input
                        type="text"
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="acme"
                        className="flex-1 px-3 py-2.5 bg-black/50 border border-gray-700 rounded-l text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                        autoFocus
                      />
                      <span className="px-3 py-2.5 bg-gray-900 border border-l-0 border-gray-700 rounded-r text-sm text-gray-400">
                        .bochaberi.com
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-300 mb-1.5 block">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full px-3 py-2.5 pl-10 bg-black/50 border border-gray-700 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                      <p className="text-xs text-red-400">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-2.5 rounded text-sm font-semibold transition-all duration-200 shadow-lg shadow-amber-500/25 disabled:opacity-50"
                  >
                    {loading ? 'Sending code...' : 'Send verification code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-300 mb-1.5 block">Verification Code</label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="w-full px-3 py-2.5 bg-black/50 border border-gray-700 rounded text-white text-sm placeholder-gray-500 text-center text-xl tracking-widest focus:outline-none focus:border-amber-500 transition-colors"
                      autoFocus
                    />
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      We sent a code to <span className="text-amber-400">{email}</span>
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                      <p className="text-xs text-red-400">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-2.5 rounded text-sm font-semibold transition-all duration-200 shadow-lg shadow-amber-500/25 disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify & Login'}
                  </button>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendCooldown > 0 || loading}
                      className="flex-1 text-xs text-amber-400 hover:text-amber-300 disabled:text-gray-500 transition-colors"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      disabled={loading}
                      className="flex-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      Back to email
                    </button>
                  </div>
                </form>
              )}

              {/* Bottom Start Free Trial Button */}
              <div className="mt-6 pt-4 border-t border-gray-800 text-center">
                <p className="text-gray-400 text-xs mb-2">New to BOCHABERI?</p>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-transparent border-2 border-amber-500 hover:bg-amber-500/10 text-amber-400 py-3 rounded text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Start Free Trial <Sparkles size={16} />
                </button>
                <p className="text-gray-500 text-xs mt-2">No credit card required • 14-day trial</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative element */}
        <div className="relative z-10 w-full pb-8">
          <div className="flex justify-center gap-6">
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
              <Shield size={14} className="text-amber-400" />
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
              Join 500+ construction companies already using BOCHABERI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;