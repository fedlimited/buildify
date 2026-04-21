import React, { useState, useEffect } from 'react';
import { Check, Smartphone, CreditCard, Globe, MapPin, Loader2, Zap, Building2, Users, FileText, Shield, HelpCircle, TrendingUp, Clock } from 'lucide-react';
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

type PaymentMethod = 'mpesa' | 'card';

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

  const formatPrice = (price: number) => {
    return price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
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
      if (!phone || phone.length < 10) {
        setError('Enter valid M-Pesa number (e.g., 0712345678)');
        return;
      }
    }

    setStatus('processing');
    setError('');

    try {
      if (paymentMethod === 'mpesa') {
        const res = await api.request('/subscription/pay', {
          method: 'POST',
          body: JSON.stringify({
            planId: selectedPlan?.id,
            phoneNumber: phone,
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
      } else {
        setStatus('error');
        setError('Visa/Mastercard payments coming soon. Please use M-Pesa for now.');
      }
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
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
      return 'w-full py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm font-medium cursor-not-allowed transition-all';
    }
    if (plan.name === 'free') {
      return 'w-full py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all';
    }
    if (paymentMethod === 'mpesa') {
      return 'w-full py-2.5 rounded-lg bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] text-white text-sm font-medium hover:from-[#45a049] hover:to-[#1b5e20] transition-all shadow-sm';
    }
    return 'w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm';
  };

  const getPlanBadge = (plan: Plan) => {
    if (isCurrentPlan(plan)) {
      return <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-medium px-3 py-0.5 rounded-full shadow-sm">Current Plan</span>;
    }
    if (plan.name === 'pro') {
      return <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium px-3 py-0.5 rounded-full shadow-sm">Most Popular</span>;
    }
    return null;
  };

  const getSavingsBadge = (plan: Plan) => {
    if (selectedCycle === 'yearly' && plan.name !== 'free') {
      const monthlyTotal = getPrice(plan) / 12;
      const savings = ((monthlyTotal * 12 - getPrice(plan)) / (monthlyTotal * 12) * 100).toFixed(0);
      return <span className="text-xs text-green-600 dark:text-green-400 font-medium">Save {savings}%</span>;
    }
    return null;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Simple, Transparent Pricing</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Choose the plan that grows with your construction business</p>
      </div>

      {/* Payment Method Toggle */}
      <div className="mb-8 flex justify-center">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1 inline-flex">
          <button
            onClick={() => setPaymentMethod('mpesa')}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${
              paymentMethod === 'mpesa'
                ? 'bg-white dark:bg-gray-900 shadow-md text-[#2E7D32] dark:text-[#4CAF50]'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Smartphone size={16} />
            <span>M-Pesa (KES)</span>
          </button>
          <button
            onClick={() => setPaymentMethod('card')}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${
              paymentMethod === 'card'
                ? 'bg-white dark:bg-gray-900 shadow-md text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CreditCard size={16} />
            <span>Visa / Mastercard (USD)</span>
          </button>
        </div>
      </div>

      {/* Regional Notice */}
      <div className={`mb-6 p-3 rounded-xl flex items-center justify-center gap-2 text-sm ${
        paymentMethod === 'mpesa'
          ? 'bg-[#E8F5E9] dark:bg-[#1B5E20]/20 text-[#2E7D32] dark:text-[#4CAF50] border border-[#A5D6A7] dark:border-[#2E7D32]'
          : 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
      }`}>
        {paymentMethod === 'mpesa' ? (
          <>
            <Smartphone size={14} />
            <span>Pay securely with M-Pesa Paybill 222111 | Instant confirmation</span>
          </>
        ) : (
          <>
            <Globe size={14} />
            <span>International payments via Visa/Mastercard (Coming Soon)</span>
          </>
        )}
      </div>

      {/* Billing Cycle Toggle */}
      <div className="mb-8 flex justify-end">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1 inline-flex">
          <button
            onClick={() => setSelectedCycle('monthly')}
            className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedCycle === 'monthly' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedCycle('yearly')}
            className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedCycle === 'yearly' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Yearly
            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400">Save 15%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards - Equal Height with Flex */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-xl border transition-all duration-200 flex flex-col h-full ${
              isCurrentPlan(plan)
                ? 'border-green-500 ring-2 ring-green-500 shadow-lg bg-white dark:bg-gray-900'
                : plan.name === 'pro'
                ? 'border-amber-500 shadow-md bg-white dark:bg-gray-900'
                : 'border-gray-200 dark:border-gray-700 hover:shadow-md bg-white dark:bg-gray-900'
            }`}
          >
            {/* Plan Badge */}
            {getPlanBadge(plan)}

            <div className="p-6 flex flex-col flex-1">
              {/* Plan Name */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.display_name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1.5 leading-relaxed">{plan.description}</p>
              </div>
              
              {/* Price - Smaller, more elegant */}
              <div className="mt-5 text-center">
                <div className="flex items-baseline justify-center gap-0.5">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{getCurrencySymbol()}</span>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {formatPrice(getPrice(plan))}
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">/{selectedCycle}</span>
                {getSavingsBadge(plan) && (
                  <div className="mt-1">{getSavingsBadge(plan)}</div>
                )}
              </div>

              {/* Limits - Clean icons */}
              <div className="mt-5 space-y-2.5">
                <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
                  <Building2 size={14} className="text-green-500 dark:text-green-400 shrink-0" />
                  <span className="text-sm">{plan.max_projects === 999999 ? 'Unlimited Projects' : `${plan.max_projects} Project${plan.max_projects !== 1 ? 's' : ''}`}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
                  <Users size={14} className="text-green-500 dark:text-green-400 shrink-0" />
                  <span className="text-sm">{plan.max_workers === 999999 ? 'Unlimited Workers' : `${plan.max_workers} Worker${plan.max_workers !== 1 ? 's' : ''}`}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
                  <Users size={14} className="text-green-500 dark:text-green-400 shrink-0" />
                  <span className="text-sm">{plan.max_users === 999999 ? 'Unlimited Users' : `${plan.max_users} User${plan.max_users !== 1 ? 's' : ''}`}</span>
                </div>
              </div>

              {/* Key Features Preview - With icons */}
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="space-y-2">
                  {plan.features?.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Zap size={11} className="text-amber-500 shrink-0" />
                      <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                        {feature.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                  {plan.features?.length > 3 && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 pl-5">
                      +{plan.features.length - 3} more features
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button - Always at bottom */}
              <div className="mt-auto pt-5">
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={isCurrentPlan(plan)}
                  className={`${getButtonClass(plan)}`}
                >
                  {getButtonText(plan)}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Indicators */}
      <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-wrap justify-center gap-8 text-center">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-green-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Secure SSL Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-green-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">24/7 Support</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-green-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone size={16} className="text-green-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">M-Pesa Secure Payment</span>
          </div>
        </div>
      </div>

      {/* Payment Modal - Dark Mode Compatible */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  {paymentMethod === 'mpesa' ? (
                    <Smartphone size={20} className="text-[#2E7D32]" />
                  ) : (
                    <CreditCard size={20} className="text-blue-600" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {paymentMethod === 'mpesa' ? 'Complete Your Upgrade' : 'Card Payment'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className={`rounded-xl p-4 mb-5 ${
                paymentMethod === 'mpesa' 
                  ? 'bg-[#E8F5E9] dark:bg-[#1B5E20]/20 border border-[#A5D6A7] dark:border-[#2E7D32]'
                  : 'bg-gray-50 dark:bg-gray-800'
              }`}>
                <p className="text-sm text-gray-600 dark:text-gray-400">Selected Plan</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">{selectedPlan.display_name}</p>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getCurrencySymbol()} {formatPrice(getPrice(selectedPlan))}
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
                    <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-xl focus-within:ring-2 focus-within:ring-[#4CAF50] bg-white dark:bg-gray-800">
                      <span className="pl-3 text-gray-500 dark:text-gray-400 text-sm">+254</span>
                      <input
                        type="tel"
                        placeholder="712345678"
                        className="flex-1 p-3 outline-none rounded-xl bg-transparent text-gray-900 dark:text-white text-sm"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      You will receive a payment prompt on this number
                    </p>
                  </div>
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-xl text-sm">
                      {error}
                    </div>
                  )}
                  <button
                    onClick={handlePay}
                    className="w-full py-3 bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] text-white rounded-xl font-medium hover:from-[#45a049] hover:to-[#1b5e20] transition-all shadow-sm"
                  >
                    Pay {getCurrencySymbol()} {formatPrice(getPrice(selectedPlan))}
                  </button>
                </>
              )}

              {status === 'idle' && paymentMethod === 'card' && (
                <>
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-center">
                    <CreditCard size={40} className="mx-auto text-blue-500 dark:text-blue-400 mb-2" />
                    <p className="text-blue-700 dark:text-blue-400 font-medium">Coming Soon</p>
                    <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">
                      Visa/Mastercard payments will be available soon
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </>
              )}

              {status === 'processing' && (
                <div className="text-center py-8">
                  <Loader2 className="animate-spin h-10 w-10 text-[#4CAF50] mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Processing payment...</p>
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
                    <Check size={28} className="text-green-600" />
                  </div>
                  <p className="font-semibold text-green-600 dark:text-green-400">Payment Successful!</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your plan has been upgraded</p>
                </div>
              )}

              {status === 'error' && (
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-600 text-xl">!</span>
                  </div>
                  <p className="font-medium text-red-600">Payment Failed</p>
                  <p className="text-sm text-gray-500 mt-1">{error}</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-4 px-4 py-2 bg-gray-200 rounded-xl text-sm hover:bg-gray-300 transition-colors"
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