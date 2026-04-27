import React, { useState, useEffect } from 'react';
import { Check, Smartphone, CreditCard, Globe, MapPin, Loader2, Zap, Building2, Users, Shield, TrendingUp, Clock, Crown, Sparkles } from 'lucide-react';
import api from '@/services/api';
import { SubscriptionPlansTable } from '@/components/SubscriptionPlansTable';

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

type PaymentMethod = 'mpesa' | 'card';

// Helper function to format M-Pesa number
const formatMpesaNumber = (value: string): string => {
  let cleaned = value.replace(/\D/g, '');
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    cleaned = '0' + cleaned.substring(3);
  }
  if (cleaned.length > 10) {
    cleaned = cleaned.substring(0, 10);
  }
  return cleaned;
};

export const BillingModule = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedCycle, setSelectedCycle] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const plansData = await api.request('/subscription/plans');
        setPlans(plansData);
        const subData = await api.request('/subscription/current');
        setCurrentPlan(subData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const getPrice = (plan: Plan) => {
    if (paymentMethod === 'mpesa') {
      return selectedCycle === 'monthly' ? plan.price_monthly_kes : plan.price_yearly_kes;
    } else {
      return selectedCycle === 'monthly' ? plan.price_monthly_usd : plan.price_yearly_usd;
    }
  };

  const getCurrencySymbol = () => {
    return paymentMethod === 'mpesa' ? 'KES' : 'USD';
  };

  const formatPriceWithCommas = (price: number) => {
    const rounded = Math.round(price * 100) / 100;
    const parts = rounded.toString().split('.');
    const wholeWithCommas = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const decimal = parts[1] ? parts[1].padEnd(2, '0') : '00';
    return `${wholeWithCommas}.${decimal}`;
  };

  const handleUpgrade = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
    setStatus('idle');
    setError('');
    setPhone('');
  };

  const handlePay = async () => {
    if (paymentMethod === 'mpesa') {
      let formattedPhone = phone;
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('254') && formattedPhone.length >= 9) {
        formattedPhone = '254' + formattedPhone;
      }
      if (!phone || phone.length < 9) {
        setError('Enter valid M-Pesa number (e.g., 0712345678 or 712345678)');
        return;
      }
      const apiPhone = formattedPhone;
      setStatus('processing');
      setError('');
      try {
        const res = await api.request('/subscription/pay', {
          method: 'POST',
          body: JSON.stringify({
            planId: selectedPlan?.id,
            phoneNumber: apiPhone,
            billingCycle: selectedCycle
          })
        });
        if (res.success) {
          setStatus('sent');
          const interval = setInterval(async () => {
            const statusRes = await api.request(`/subscription/payment-status/${res.paymentId}`);
            if (statusRes.status === 'completed') {
              clearInterval(interval);
              setStatus('completed');
              setTimeout(() => {
                setShowModal(false);
                window.location.reload();
              }, 2000);
            } else if (statusRes.status === 'failed') {
              clearInterval(interval);
              setStatus('error');
              setError('Payment failed. Please try again.');
            }
          }, 3000);
        } else {
          setStatus('error');
          setError(res.error || 'Payment initiation failed');
        }
      } catch (err: any) {
        setStatus('error');
        setError(err.message);
      }
    } else {
      setStatus('error');
      setError('Visa/Mastercard payments coming soon. Please use M-Pesa for now.');
    }
  };

  const isCurrentPlan = (plan: Plan) => {
    return currentPlan?.plan_name === plan.name;
  };

  const getButtonText = (plan: Plan) => {
    if (isCurrentPlan(plan)) return 'Current Plan';
    if (plan.name === 'free') return 'Start Free Trial';
    return 'Upgrade Now';
  };

  const getButtonClass = (plan: Plan) => {
    if (isCurrentPlan(plan)) {
      return 'w-full py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm font-medium cursor-not-allowed';
    }
    if (plan.name === 'free') {
      return 'w-full py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all';
    }
    if (paymentMethod === 'mpesa') {
      return 'w-full py-2.5 rounded-lg bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] text-white text-sm font-medium hover:from-[#45a049] hover:to-[#1b5e20] transition-all shadow-sm';
    }
    // Card payment button - using yellow/amber theme
    return 'w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-sm';
  };

  const getPlanBadge = (plan: Plan) => {
    if (isCurrentPlan(plan)) {
      return <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-medium px-3 py-0.5 rounded-full shadow-md flex items-center gap-1"><Crown size={10} /> Current</span>;
    }
    if (plan.name === 'pro') {
      return <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium px-3 py-0.5 rounded-full shadow-md flex items-center gap-1"><Sparkles size={10} /> Most Popular</span>;
    }
    return null;
  };

  return (
    <div id="payment-section" className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Subscription Plans</h2>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Choose the plan that fits your business</p>
      </div>

      {/* Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 inline-flex">
          <button
            onClick={() => setPaymentMethod('mpesa')}
            className={`px-5 py-1.5 rounded-md flex items-center gap-2 transition-all text-sm font-medium ${
              paymentMethod === 'mpesa'
                ? 'bg-white dark:bg-gray-900 shadow-md text-[#2E7D32] dark:text-[#4CAF50]'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Smartphone size={14} />
            <span>M-Pesa (KES)</span>
          </button>
          <button
            onClick={() => setPaymentMethod('card')}
            className={`px-5 py-1.5 rounded-md flex items-center gap-2 transition-all text-sm font-medium ${
              paymentMethod === 'card'
                ? 'bg-white dark:bg-gray-900 shadow-md text-amber-600 dark:text-amber-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CreditCard size={14} />
            <span>Visa / Mastercard (USD)</span>
          </button>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 inline-flex">
          <button
            onClick={() => setSelectedCycle('monthly')}
            className={`px-5 py-1.5 rounded-md text-sm font-medium transition-all ${
              selectedCycle === 'monthly' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedCycle('yearly')}
            className={`px-5 py-1.5 rounded-md text-sm font-medium transition-all ${
              selectedCycle === 'yearly' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Yearly
            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400">Save 15%</span>
          </button>
        </div>
      </div>

      {/* Regional Notice */}
      <div className={`mb-5 p-2 rounded-lg flex items-center justify-center gap-2 text-xs ${
        paymentMethod === 'mpesa'
          ? 'bg-[#E8F5E9] dark:bg-[#1B5E20]/20 text-[#2E7D32] dark:text-[#4CAF50]'
          : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
      }`}>
        {paymentMethod === 'mpesa' ? (
          <>
            <Smartphone size={12} />
            <span>Pay securely with M-Pesa Paybill <strong>222111</strong> | Instant confirmation</span>
          </>
        ) : (
          <>
            <CreditCard size={12} />
            <span>International payments via Visa/Mastercard (Coming Soon)</span>
          </>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {plans.map((plan) => {
          const price = getPrice(plan);
          const currencySymbol = getCurrencySymbol();
          const isPopular = plan.name === 'pro';
          
          return (
            <div key={plan.id}
              className={`relative bg-white dark:bg-gray-800/50 rounded-xl border p-5 flex flex-col ${
                isPopular ? 'border-amber-500 shadow-lg shadow-amber-500/10' : 'border-gray-200 dark:border-gray-700'
              } hover:shadow-md transition-all`}
            >
              {getPlanBadge(plan)}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.display_name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
              
              <div className="mt-4 mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-gray-400 text-sm">{currencySymbol}</span>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatPriceWithCommas(price)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">/{selectedCycle}</span>
              </div>

              <ul className="space-y-2 mb-4 flex-grow">
                <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Check size={14} className="text-green-500" />
                  {plan.max_projects === 999999 ? 'Unlimited' : plan.max_projects} Projects
                </li>
                <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Check size={14} className="text-green-500" />
                  {plan.max_workers === 999999 ? 'Unlimited' : plan.max_workers} Workers
                </li>
                <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Check size={14} className="text-green-500" />
                  {plan.max_users === 999999 ? 'Unlimited' : plan.max_users} Users
                </li>
              </ul>

              <button
                onClick={() => handleUpgrade(plan)}
                disabled={isCurrentPlan(plan)}
                className={getButtonClass(plan)}
              >
                {getButtonText(plan)}
              </button>
            </div>
          );
        })}
      </div>









 
      {/* Detailed Plans Comparison Table */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Compare All Features</h3>
        <SubscriptionPlansTable currency={paymentMethod === 'mpesa' ? 'KES' : 'USD'} />
      </div>

      {/* Trust Indicators */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-wrap justify-center gap-5">
          <div className="flex items-center gap-1.5">
            <Shield size={12} className="text-green-500" />
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Secure SSL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-green-500" />
            <span className="text-[11px] text-gray-500 dark:text-gray-400">24/7 Support</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={12} className="text-green-500" />
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Smartphone size={12} className="text-green-500" />
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Instant M-Pesa</span>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  {paymentMethod === 'mpesa' ? (
                    <Smartphone size={20} className="text-[#2E7D32]" />
                  ) : (
                    <CreditCard size={20} className="text-amber-500" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Complete Your Upgrade
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className={`rounded-lg p-4 mb-5 ${
                paymentMethod === 'mpesa' 
                  ? 'bg-[#E8F5E9] dark:bg-[#1B5E20]/20'
                  : 'bg-amber-50 dark:bg-amber-950/20'
              }`}>
                <p className="text-sm text-gray-600 dark:text-gray-400">Selected Plan</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">{selectedPlan.display_name}</p>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getCurrencySymbol()} {formatPriceWithCommas(getPrice(selectedPlan))}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">/{selectedCycle}</span>
                </div>
              </div>

              {status === 'idle' && paymentMethod === 'mpesa' && (
                <>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      M-Pesa Phone Number
                    </label>
                    <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-[#4CAF50] bg-white dark:bg-gray-800">
                      <div className="flex items-center gap-1 pl-3 pr-2 py-3 text-gray-500 dark:text-gray-400 text-sm border-r border-gray-300 dark:border-gray-700">
                        <Smartphone size={14} className="text-[#4CAF50]" />
                        <span>+254</span>
                      </div>
                      <input
                        type="tel"
                        placeholder="712345678 or 0712345678"
                        className="flex-1 p-3 outline-none rounded-lg bg-transparent text-gray-900 dark:text-white text-sm"
                        value={phone}
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          const formatted = formatMpesaNumber(rawValue);
                          setPhone(formatted);
                          if (error) setError('');
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Enter your M-Pesa number (e.g., <strong>0712345678</strong>)
                      </p>
                    </div>
                  </div>
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm border border-red-200 dark:border-red-800">
                      {error}
                    </div>
                  )}
                  <button
                    onClick={handlePay}
                    className="w-full py-3 bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] text-white rounded-lg font-medium hover:from-[#45a049] hover:to-[#1b5e20] transition-all"
                  >
                    Pay Now
                  </button>
                </>
              )}

              {status === 'idle' && paymentMethod === 'card' && (
                <>
                  <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-center border border-amber-200 dark:border-amber-800">
                    <CreditCard size={40} className="mx-auto text-amber-500 dark:text-amber-400 mb-2" />
                    <p className="text-amber-700 dark:text-amber-400 font-medium">Coming Soon</p>
                    <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                      Visa/Mastercard payments will be available soon
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </>
              )}

              {status === 'processing' && (
                <div className="text-center py-8">
                  <Loader2 className="animate-spin h-10 w-10 text-amber-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Processing payment...</p>
                </div>
              )}

              {status === 'sent' && (
                <div className="text-center py-8">
                  <Smartphone size={48} className="text-[#4CAF50] mx-auto mb-4" />
                  <p className="font-medium text-gray-900 dark:text-white">Check your phone</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your M-Pesa PIN to complete payment</p>
                </div>
              )}

              {status === 'completed' && (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={28} className="text-green-600 dark:text-green-400" />
                  </div>
                  <p className="font-semibold text-green-600 dark:text-green-400">Payment Successful!</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your plan has been upgraded</p>
                </div>
              )}

              {status === 'error' && (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-600 dark:text-red-400 text-xl">!</span>
                  </div>
                  <p className="font-medium text-red-600 dark:text-red-400">Payment Failed</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{error}</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};