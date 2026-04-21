import React, { useState, useEffect } from 'react';
import { Check, Smartphone, CreditCard, Globe, MapPin, Loader2, Zap, Building2, Users, Shield, TrendingUp, Clock } from 'lucide-react';
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
    return 'Upgrade';
  };

  const getButtonClass = (plan: Plan) => {
    if (isCurrentPlan(plan)) {
      return 'w-full py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm font-medium cursor-not-allowed transition-all';
    }
    if (plan.name === 'free') {
      return 'w-full py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all';
    }
    if (paymentMethod === 'mpesa') {
      return 'w-full py-2 rounded-lg bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] text-white text-sm font-medium hover:from-[#45a049] hover:to-[#1b5e20] transition-all shadow-sm';
    }
    return 'w-full py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm';
  };

  const getPlanBadge = (plan: Plan) => {
    if (isCurrentPlan(plan)) {
      return <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full shadow-sm">Current</span>;
    }
    if (plan.name === 'pro') {
      return <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full shadow-sm">Popular</span>;
    }
    return null;
  };

  return (
    <div className="py-4 px-6 max-w-7xl mx-auto">
      {/* Compact Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Subscription Plans</h2>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Choose the plan that fits your business</p>
      </div>

      {/* Payment Method Toggle - Compact */}
      <div className="mb-4 flex justify-center">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 inline-flex">
          <button
            onClick={() => setPaymentMethod('mpesa')}
            className={`px-5 py-1.5 rounded-md flex items-center gap-1.5 transition-all text-xs font-medium ${
              paymentMethod === 'mpesa'
                ? 'bg-white dark:bg-gray-900 shadow-sm text-[#2E7D32] dark:text-[#4CAF50]'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Smartphone size={13} />
            <span>M-Pesa (KES)</span>
          </button>
          <button
            onClick={() => setPaymentMethod('card')}
            className={`px-5 py-1.5 rounded-md flex items-center gap-1.5 transition-all text-xs font-medium ${
              paymentMethod === 'card'
                ? 'bg-white dark:bg-gray-900 shadow-sm text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CreditCard size={13} />
            <span>Card (USD)</span>
          </button>
        </div>
      </div>

      {/* Compact Notice */}
      <div className={`mb-4 p-2 rounded-lg flex items-center justify-center gap-1.5 text-xs ${
        paymentMethod === 'mpesa'
          ? 'bg-[#E8F5E9] dark:bg-[#1B5E20]/20 text-[#2E7D32] dark:text-[#4CAF50]'
          : 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
      }`}>
        {paymentMethod === 'mpesa' ? (
          <>
            <Smartphone size={11} />
            <span>Paybill 222111 | Instant M-Pesa payment</span>
          </>
        ) : (
          <>
            <CreditCard size={11} />
            <span>Visa/Mastercard (Coming Soon)</span>
          </>
        )}
      </div>

      {/* Billing Cycle Toggle - Compact */}
      <div className="mb-5 flex justify-end">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 inline-flex">
          <button
            onClick={() => setSelectedCycle('monthly')}
            className={`px-4 py-1 rounded-md text-xs font-medium transition-all ${
              selectedCycle === 'monthly' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedCycle('yearly')}
            className={`px-4 py-1 rounded-md text-xs font-medium transition-all ${
              selectedCycle === 'yearly' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Yearly
            <span className="ml-1 text-[9px] font-semibold text-green-600 dark:text-green-400">-15%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards - Compact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-lg border transition-all duration-200 flex flex-col h-full ${
              isCurrentPlan(plan)
                ? 'border-green-500 ring-1 ring-green-500 shadow-md bg-white dark:bg-gray-900'
                : plan.name === 'pro'
                ? 'border-amber-500 shadow-sm bg-white dark:bg-gray-900'
                : 'border-gray-200 dark:border-gray-700 hover:shadow-sm bg-white dark:bg-gray-900'
            }`}
          >
            {/* Plan Badge */}
            {getPlanBadge(plan)}

            <div className="p-4 flex flex-col flex-1">
              {/* Plan Name - Compact */}
              <div className="text-center">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">{plan.display_name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-[10px] mt-0.5 leading-tight">{plan.description}</p>
              </div>
              
              {/* Price - Smaller, compact */}
              <div className="mt-3 text-center">
                <div className="flex items-baseline justify-center gap-0.5">
                  <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{getCurrencySymbol()}</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {formatPrice(getPrice(plan))}
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">/{selectedCycle}</span>
              </div>

              {/* Limits - Compact icons */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <Building2 size={11} className="text-green-500 dark:text-green-400 shrink-0" />
                  <span className="text-[11px]">{plan.max_projects === 999999 ? 'Unlimited Projects' : `${plan.max_projects} Projects`}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <Users size={11} className="text-green-500 dark:text-green-400 shrink-0" />
                  <span className="text-[11px]">{plan.max_workers === 999999 ? 'Unlimited Workers' : `${plan.max_workers} Workers`}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <Users size={11} className="text-green-500 dark:text-green-400 shrink-0" />
                  <span className="text-[11px]">{plan.max_users === 999999 ? 'Unlimited Users' : `${plan.max_users} Users`}</span>
                </div>
              </div>

              {/* Features Preview - Compact */}
              <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="space-y-1">
                  {plan.features?.slice(0, 2).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Zap size={9} className="text-amber-500 shrink-0" />
                      <span className="text-[10px] text-gray-600 dark:text-gray-400 capitalize truncate">
                        {feature.replace(/_/g, ' ').slice(0, 20)}
                      </span>
                    </div>
                  ))}
                  {plan.features?.length > 2 && (
                    <div className="text-[9px] text-gray-400 dark:text-gray-500 pl-5">
                      +{plan.features.length - 2} more
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button - Always at bottom, compact */}
              <div className="mt-auto pt-3">
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={isCurrentPlan(plan)}
                  className={`${getButtonClass(plan)} text-xs py-1.5`}
                >
                  {getButtonText(plan)}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Indicators - Compact */}
      <div className="mt-5 pt-3 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-1.5">
            <Shield size={11} className="text-green-500" />
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Secure</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-green-500" />
            <span className="text-[10px] text-gray-500 dark:text-gray-400">24/7 Support</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={11} className="text-green-500" />
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Smartphone size={11} className="text-green-500" />
            <span className="text-[10px] text-gray-500 dark:text-gray-400">M-Pesa</span>
          </div>
        </div>
      </div>

      {/* Payment Modal - Keep same but compact */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  {paymentMethod === 'mpesa' ? (
                    <Smartphone size={18} className="text-[#2E7D32]" />
                  ) : (
                    <CreditCard size={18} className="text-blue-600" />
                  )}
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {paymentMethod === 'mpesa' ? 'M-Pesa Payment' : 'Card Payment'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className={`rounded-lg p-3 mb-4 ${
                paymentMethod === 'mpesa' 
                  ? 'bg-[#E8F5E9] dark:bg-[#1B5E20]/20'
                  : 'bg-gray-50 dark:bg-gray-800'
              }`}>
                <p className="text-xs text-gray-600 dark:text-gray-400">Selected Plan</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedPlan.display_name}</p>
                <div className="mt-1">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {getCurrencySymbol()} {formatPrice(getPrice(selectedPlan))}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">/{selectedCycle}</span>
                </div>
              </div>

              {status === 'idle' && paymentMethod === 'mpesa' && (
                <>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      M-Pesa Number
                    </label>
                    <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-[#4CAF50] bg-white dark:bg-gray-800">
                      <span className="pl-3 text-gray-500 dark:text-gray-400 text-xs">+254</span>
                      <input
                        type="tel"
                        placeholder="712345678"
                        className="flex-1 p-2.5 outline-none rounded-lg bg-transparent text-gray-900 dark:text-white text-sm"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">
                      You'll receive a payment prompt on this number
                    </p>
                  </div>
                  {error && (
                    <div className="mb-3 p-2 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-lg text-xs">
                      {error}
                    </div>
                  )}
                  <button
                    onClick={handlePay}
                    className="w-full py-2.5 bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] text-white rounded-lg font-medium text-sm hover:from-[#45a049] hover:to-[#1b5e20] transition-all"
                  >
                    Pay Now
                  </button>
                </>
              )}

              {status === 'idle' && paymentMethod === 'card' && (
                <>
                  <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-center">
                    <CreditCard size={32} className="mx-auto text-blue-500 mb-1" />
                    <p className="text-blue-700 dark:text-blue-400 text-sm font-medium">Coming Soon</p>
                    <p className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">Visa/Mastercard coming soon</p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-2.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm"
                  >
                    Close
                  </button>
                </>
              )}

              {status === 'processing' && (
                <div className="text-center py-6">
                  <Loader2 className="animate-spin h-8 w-8 text-[#4CAF50] mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Processing...</p>
                </div>
              )}

              {status === 'sent' && (
                <div className="text-center py-6">
                  <Smartphone size={40} className="text-[#4CAF50] mx-auto mb-3" />
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Check your phone</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter PIN to complete payment</p>
                </div>
              )}

              {status === 'completed' && (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check size={24} className="text-green-600" />
                  </div>
                  <p className="font-semibold text-green-600 text-sm">Payment Successful!</p>
                  <p className="text-xs text-gray-500 mt-1">Your plan has been upgraded</p>
                </div>
              )}

              {status === 'error' && (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-red-600 text-lg">!</span>
                  </div>
                  <p className="font-medium text-red-600 text-sm">Payment Failed</p>
                  <p className="text-xs text-gray-500 mt-1">{error}</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-3 px-3 py-1.5 bg-gray-200 rounded-lg text-xs hover:bg-gray-300 transition-colors"
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