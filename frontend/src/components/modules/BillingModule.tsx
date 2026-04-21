import React, { useState, useEffect } from 'react';
import { Check, Smartphone, CreditCard, Globe, MapPin, Loader2 } from 'lucide-react';
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
    return paymentMethod === 'mpesa' ? 'KSh' : '$';
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
    if (plan.name === 'free') return 'Get Started';
    return 'Upgrade';
  };

  const getButtonClass = (plan: Plan) => {
    if (isCurrentPlan(plan)) {
      return 'w-full py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed';
    }
    if (plan.name === 'free') {
      return 'w-full py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors';
    }
    if (paymentMethod === 'mpesa') {
      return 'w-full py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors';
    }
    return 'w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription & Billing</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Choose the plan that fits your construction business</p>
      </div>

      {/* Payment Method Toggle */}
      <div className="mb-8 flex justify-center">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 inline-flex">
          <button
            onClick={() => setPaymentMethod('mpesa')}
            className={`px-6 py-2 rounded-md flex items-center gap-2 transition-all ${
              paymentMethod === 'mpesa'
                ? 'bg-white dark:bg-gray-900 shadow-md text-green-700 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Smartphone size={18} />
            <span>M-Pesa (KES)</span>
          </button>
          <button
            onClick={() => setPaymentMethod('card')}
            className={`px-6 py-2 rounded-md flex items-center gap-2 transition-all ${
              paymentMethod === 'card'
                ? 'bg-white dark:bg-gray-900 shadow-md text-blue-700 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CreditCard size={18} />
            <span>Visa / Mastercard (USD)</span>
          </button>
        </div>
      </div>

      {/* Regional Notice */}
      <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 text-sm ${
        paymentMethod === 'mpesa'
          ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
          : 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
      }`}>
        {paymentMethod === 'mpesa' ? (
          <>
            <MapPin size={16} />
            <span>Local Payment: Kenyan Shillings (KES) via M-Pesa Paybill 222111</span>
          </>
        ) : (
          <>
            <Globe size={16} />
            <span>International Payment: US Dollars (USD) via Visa/Mastercard (Coming Soon)</span>
          </>
        )}
      </div>

      {/* Billing Cycle Toggle */}
      <div className="mb-6 flex justify-end">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setSelectedCycle('monthly')}
            className={`px-4 py-2 rounded-md text-sm transition-all ${
              selectedCycle === 'monthly' ? 'bg-white dark:bg-gray-900 shadow-sm' : ''
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedCycle('yearly')}
            className={`px-4 py-2 rounded-md text-sm transition-all ${
              selectedCycle === 'yearly' ? 'bg-white dark:bg-gray-900 shadow-sm' : ''
            }`}
          >
            Yearly <span className="text-green-600 dark:text-green-400 text-xs ml-1">Save 15%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-xl border transition-all ${
              isCurrentPlan(plan)
                ? 'border-green-500 ring-2 ring-green-500 shadow-lg bg-white dark:bg-gray-900'
                : 'border-gray-200 dark:border-gray-700 hover:shadow-md bg-white dark:bg-gray-900'
            }`}
          >
            {/* Current Plan Badge */}
            {isCurrentPlan(plan) && (
              <div className="absolute -mt-3 ml-4">
                <span className="bg-green-500 text-white text-xs px-3 py-0.5 rounded-full">Current</span>
              </div>
            )}

            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.display_name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{plan.description}</p>
              
              <div className="mt-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {getCurrencySymbol()} {getPrice(plan).toLocaleString()}
                </span>
                <span className="text-gray-500 dark:text-gray-400">/{selectedCycle}</span>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500" />
                  <span>{plan.max_projects === 999999 ? 'Unlimited' : plan.max_projects} Projects</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500" />
                  <span>{plan.max_workers === 999999 ? 'Unlimited' : plan.max_workers} Workers</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500" />
                  <span>{plan.max_users === 999999 ? 'Unlimited' : plan.max_users} Users</span>
                </div>
              </div>

              <button
                onClick={() => handleUpgrade(plan)}
                disabled={isCurrentPlan(plan)}
                className={`mt-6 ${getButtonClass(plan)}`}
              >
                {getButtonText(plan)}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Modal - Dark Mode Compatible */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {paymentMethod === 'mpesa' ? 'M-Pesa Payment' : 'Card Payment'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Upgrading to</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedPlan.display_name}</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {getCurrencySymbol()} {getPrice(selectedPlan).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{selectedCycle} subscription</p>
              </div>

              {status === 'idle' && paymentMethod === 'mpesa' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      M-Pesa Phone Number
                    </label>
                    <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-green-500 bg-white dark:bg-gray-800">
                      <span className="pl-3 text-gray-500 dark:text-gray-400">+254</span>
                      <input
                        type="tel"
                        placeholder="712345678"
                        className="flex-1 p-3 outline-none rounded-lg bg-transparent text-gray-900 dark:text-white"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      You will receive an STK push on this number
                    </p>
                  </div>
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  <button
                    onClick={handlePay}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Pay with M-Pesa
                  </button>
                </>
              )}

              {status === 'idle' && paymentMethod === 'card' && (
                <>
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-center">
                    <CreditCard size={40} className="mx-auto text-blue-500 dark:text-blue-400 mb-2" />
                    <p className="text-blue-700 dark:text-blue-400 font-medium">Visa/Mastercard Coming Soon</p>
                    <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">
                      International payments will be available soon.
                      Please use M-Pesa for now.
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
                  <Loader2 className="animate-spin h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Processing payment...</p>
                </div>
              )}

              {status === 'sent' && (
                <div className="text-center py-8">
                  <Smartphone size={48} className="text-green-600 dark:text-green-400 mx-auto mb-4" />
                  <p className="font-medium text-gray-900 dark:text-white">Check your phone</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your M-Pesa PIN to complete payment</p>
                </div>
              )}

              {status === 'completed' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-green-600 dark:text-green-400" />
                  </div>
                  <p className="font-bold text-green-600 dark:text-green-400 text-lg">Payment Successful!</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Your plan has been upgraded</p>
                </div>
              )}

              {status === 'error' && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-600 dark:text-red-400 text-2xl">!</span>
                  </div>
                  <p className="font-medium text-red-600 dark:text-red-400">Payment Failed</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{error}</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700"
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