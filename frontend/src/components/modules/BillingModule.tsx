import React, { useState, useEffect } from 'react';
import { Check, Smartphone, CreditCard, Globe, MapPin, Loader2, Zap, Building2, Users, Shield, TrendingUp, Clock, Crown, Sparkles } from 'lucide-react';
import api from '@/services/api';
import { SubscriptionPlansTable } from '@/components/SubscriptionPlansTable';
import { API_BASE_URL } from '@/config/api';

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
  max_stakeholders: number;
  features: string[];
}

type PaymentMethod = 'mpesa' | 'paystack';

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
  
  // Installment payment states
  const [installmentProgress, setInstallmentProgress] = useState<any>(null);
  const [installmentPlan, setInstallmentPlan] = useState<any>(null);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [currentInstallment, setCurrentInstallment] = useState<any>(null);
  const [installmentPaymentStatus, setInstallmentPaymentStatus] = useState('idle');
  const [paystackLoading, setPaystackLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [paystackUrl, setPaystackUrl] = useState('');
  const [showPaystack, setShowPaystack] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const plansData = await api.request('/subscription/plans');
        setPlans(plansData);
        const subData = await api.request('/subscription/current');
        setCurrentPlan(subData);
        
        // Fetch installment progress
        try {
          const progressData = await api.request('/subscription/installment-progress');
          if (progressData.hasInstallmentPlan && !progressData.isComplete) {
            setInstallmentProgress(progressData);
          }
        } catch (err) {
          console.error('Error fetching installment progress:', err);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Get user email for Paystack
  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const user = await response.json();
        setUserEmail(user.email);
        console.log('User email loaded:', user.email);
      } catch (err) {
        console.error('Failed to get user email:', err);
      }
    };
    
    if (!userEmail) {
      getUserEmail();
    }
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
    setInstallmentPlan(null);
  };

  // Create installment plan for large payments
  const createInstallmentPlan = async () => {
    setInstallmentPaymentStatus('processing');
    try {
      const res = await api.request('/subscription/create-installment-plan', {
        method: 'POST',
        body: JSON.stringify({
          planId: selectedPlan?.id,
          billingCycle: selectedCycle
        })
      });
      if (res.success && res.requiresSplit) {
        setInstallmentPlan(res);
        setShowInstallmentModal(true);
        setShowModal(false);
        setInstallmentPaymentStatus('idle');
      } else {
        setInstallmentPaymentStatus('error');
        setError(res.error || 'Could not create installment plan');
      }
    } catch (err: any) {
      setInstallmentPaymentStatus('error');
      setError(err.message);
    }
  };

  // Pay a specific installment
  const payInstallment = async (installmentId: number, amount: number) => {
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
    
    setInstallmentPaymentStatus('processing');
    setError('');
    
    try {
      const res = await api.request('/subscription/pay-installment', {
        method: 'POST',
        body: JSON.stringify({
          installmentId: installmentId,
          phoneNumber: formattedPhone
        })
      });
      
      if (res.success) {
        setInstallmentPaymentStatus('sent');
        // Poll for payment status
        const interval = setInterval(async () => {
          const statusRes = await api.request(`/subscription/payment-status/${res.paymentId}`);
          if (statusRes.status === 'completed') {
            clearInterval(interval);
            setInstallmentPaymentStatus('completed');
            // Refresh installment progress
            const progressData = await api.request('/subscription/installment-progress');
            if (progressData.hasInstallmentPlan && !progressData.isComplete) {
              setInstallmentProgress(progressData);
              setCurrentInstallment(progressData.nextInstallment);
            } else if (progressData.isComplete) {
              setInstallmentProgress(null);
              setCurrentInstallment(null);
              setTimeout(() => {
                setShowInstallmentModal(false);
                setShowModal(false);
                window.location.reload();
              }, 2000);
            } else {
              setTimeout(() => {
                setShowInstallmentModal(false);
                setShowModal(false);
                window.location.reload();
              }, 2000);
            }
          } else if (statusRes.status === 'failed') {
            clearInterval(interval);
            setInstallmentPaymentStatus('error');
            setError('Installment payment failed. Please try again.');
          }
        }, 3000);
      } else {
        setInstallmentPaymentStatus('error');
        setError(res.error || 'Payment initiation failed');
      }
    } catch (err: any) {
      setInstallmentPaymentStatus('error');
      setError(err.message);
    }
  };

  const handlePay = async () => {
    // Check if this is an installment payment
    if (currentInstallment) {
      await payInstallment(currentInstallment.id, currentInstallment.amount);
      return;
    }

    // Handle Paystack Payment
    if (paymentMethod === 'paystack') {
      setPaystackLoading(true);
      setError('');

      const amount = getPrice(selectedPlan);
      const token = localStorage.getItem('token');
      
      // Debug logging
      console.log('=== PAYSTACK REQUEST ===');
      console.log('Selected plan:', selectedPlan?.display_name);
      console.log('Raw amount from getPrice:', amount);
      console.log('Amount type:', typeof amount);
      
      // Validate amount
      if (!amount || amount <= 0) {
        setError(`Invalid amount: ${amount}. Please select a valid plan.`);
        setPaystackLoading(false);
        return;
      }
      
      // Convert to cents as required by backend (amount × 100)
      const amountToSend = Math.round(amount);
      
      console.log('Amount to send:', amountToSend);
      console.log('Plan ID:', selectedPlan?.id);
      console.log('Selected cycle:', selectedCycle);
      
      const reference = `BOCHI-${selectedPlan?.id}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      try {
        const response = await fetch(`${API_BASE_URL}/paystack/initialize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            planId: selectedPlan?.id,
            billingCycle: selectedCycle,
            email: userEmail,
            amount: amountToSend,
            currency: 'KES',
            reference: reference
          })
        });

        const data = await response.json();
        console.log('Paystack response:', data);

        if (data.success && data.authorization_url) {
          // Open Paystack payment window in a new tab
          window.open(data.authorization_url, '_blank');
          setPaystackLoading(false);
          setShowModal(false);
          // Optional: Show success message
          alert('Payment window opened. Complete payment to activate your subscription.');
        } else {
          setError(data.error || data.message || 'Payment initialization failed');
          setPaystackLoading(false);
        }
      } catch (err: any) {
        console.error('Paystack error:', err);
        setError(err.message || 'Payment failed');
        setPaystackLoading(false);
      }
      return;
    }

    // Handle M-Pesa payment
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
        
        // Check if response requires split payment
        if (res.requiresSplit) {
          setStatus('idle');
          const confirmSplit = window.confirm(
            `${res.error || res.message}\n\nWould you like to pay in ${res.numberOfInstallments || 3} installments of KES ${(res.installmentAmount || res.firstPayment || Math.ceil(res.totalAmount / 3)).toLocaleString()} each?`
          );
          if (confirmSplit) {
            await createInstallmentPlan();
          }
          return;
        }
        
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
    if (paymentMethod === 'paystack') {
      return 'w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-sm';
    }
    if (paymentMethod === 'mpesa') {
      return 'w-full py-2.5 rounded-lg bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] text-white text-sm font-medium hover:from-[#45a049] hover:to-[#1b5e20] transition-all shadow-sm';
    }
    return 'w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-sm';
  };

  const getPlanBadge = (plan: Plan) => {
    if (isCurrentPlan(plan)) {
      return <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-medium px-3 py-0.5 rounded-full shadow-md flex items-center gap-1"><Crown size={10} /> Current Plan</span>;
    }
    if (plan.name === 'pro') {
      return <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium px-3 py-0.5 rounded-full shadow-md flex items-center gap-1"><Sparkles size={10} /> Most Popular</span>;
    }
    if (plan.name === 'premier') {
      return <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium px-3 py-0.5 rounded-full shadow-md flex items-center gap-1"><Crown size={10} /> Enterprise</span>;
    }
    return null;
  };

  // Helper function to get daily cost
  const getDailyCost = (monthlyPrice: number) => {
    return Math.round(monthlyPrice / 30);
  };

  // Helper function to get value message
  const getValueMessage = (plan: Plan) => {
    if (plan.name === 'basic') {
      return `≈ ${getDailyCost(plan.price_monthly_kes)} KES/day`;
    }
    if (plan.name === 'pro') {
      return "Best value for growing teams";
    }
    if (plan.name === 'premier') {
      return "For large contractors";
    }
    return "";
  };

  return (
    <div id="payment-section" className="p-6 max-w-7xl mx-auto">

      {/* Header - Updated for new strategic pricing */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Simple, Transparent Pricing</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          No hidden fees • Cancel anytime • Secure payment
        </p>
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
            onClick={() => setPaymentMethod('paystack')}
            className={`px-5 py-1.5 rounded-md flex items-center gap-2 transition-all text-sm font-medium ${
              paymentMethod === 'paystack'
                ? 'bg-white dark:bg-gray-900 shadow-md text-amber-600 dark:text-amber-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CreditCard size={14} />
            <span>Card / M-Pesa via Paystack</span>
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
            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400">Save 2 months free</span>
          </button>
        </div>
      </div>

      {/* Payment Information */}
      {paymentMethod === 'mpesa' ? (
        <div className="mb-3 flex items-center justify-start gap-2">
          <div className="relative group">
            <div className="cursor-help">
              <Smartphone size={14} className="text-blue-500" />
              <span className="ml-1 text-xs text-gray-500">i</span>
            </div>
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
              <p className="font-medium mb-1">M-Pesa Limits</p>
              <p>• Max per transaction: <strong>KES 250,000</strong></p>
              <p>• Max daily per phone: <strong>KES 500,000</strong></p>
              <p>• Large payments split into installments</p>
              <p>• Use different phones for installments</p>
            </div>
          </div>
          <span className="text-xs text-gray-500">M-Pesa limits: KES 250k/transaction, 500k/day</span>
        </div>
      ) : (
        <div className="mb-3 flex items-center justify-start gap-2">
          <CreditCard size={14} className="text-amber-500" />
          <span className="text-xs text-gray-500">Pay with Card, M-Pesa, or Bank Transfer</span>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {plans.map((plan) => {
          const price = getPrice(plan);
          const currencySymbol = getCurrencySymbol();
          const isPopular = plan.name === 'pro';
          const valueMessage = getValueMessage(plan);
          
          return (
            <div key={plan.id}
              className={`relative bg-white dark:bg-gray-800/50 rounded-xl border p-5 flex flex-col ${
                isPopular ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-gray-200 dark:border-gray-700'
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
                
                {/* Value message */}
                {plan.name !== 'free' && valueMessage && (
                  <div className="mt-2">
                    {plan.name === 'basic' && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        💡 {valueMessage}
                      </div>
                    )}
                    {plan.name === 'pro' && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        ⭐ {valueMessage}
                      </div>
                    )}
                    {plan.name === 'premier' && (
                      <div className="text-xs text-amber-600 dark:text-amber-400">
                        👑 {valueMessage}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Annual savings note */}
                {selectedCycle === 'yearly' && plan.name !== 'free' && (
                  <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                    🎉 Save 2 months free!
                  </div>
                )}
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
                <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Check size={14} className="text-green-500" />
                  {plan.max_stakeholders === 0 ? 'No' : plan.max_stakeholders === 999999 ? 'Unlimited' : plan.max_stakeholders} Stakeholders
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

      {/* Installment Progress Banner - Compact Green */}
      {paymentMethod === 'mpesa' && installmentProgress && installmentProgress.hasInstallmentPlan && !installmentProgress.isComplete && (
        <div className="mb-4 p-3 bg-[#E8F5E9] dark:bg-[#1B5E20]/30 rounded-lg border border-[#4CAF50]/30">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs">
              <Smartphone size={14} className="text-[#2E7D32]" />
              <span className="text-[#2E7D32] font-medium">{installmentProgress.paidInstallments}/{installmentProgress.numberOfInstallments} paid</span>
              <div className="w-24 bg-gray-200 rounded-full h-1.5">
                <div className="bg-[#4CAF50] h-1.5 rounded-full" style={{ width: `${(installmentProgress.paidInstallments / installmentProgress.numberOfInstallments) * 100}%` }} />
              </div>
              <span className="text-[#2E7D32]">KES {installmentProgress.remainingAmount.toLocaleString()} left</span>
            </div>
            {installmentProgress.nextInstallment && (
              <button
                onClick={() => {
                  setSelectedPlan(plans.find(p => p.display_name === installmentProgress.plan_name));
                  setCurrentInstallment(installmentProgress.nextInstallment);
                  setShowModal(true);
                  setStatus('idle');
                  setPhone('');
                  setError('');
                }}
                className="px-3 py-1.5 bg-[#4CAF50] hover:bg-[#2E7D32] text-white rounded text-xs transition-colors"
              >
                Pay KES {installmentProgress.nextInstallment.amount.toLocaleString()}
              </button>
            )}
          </div>
        </div>
      )}

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
            <span className="text-[11px] text-gray-500 dark:text-gray-400">No Contracts</span>
          </div>
        </div>
      </div>

      {/* Regular Payment Modal */}
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

              {status === 'idle' && paymentMethod === 'paystack' && (
                <>
                  <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <CreditCard size={40} className="mx-auto text-amber-500 dark:text-amber-400 mb-2" />
                    <p className="text-center text-amber-700 dark:text-amber-400 font-medium">
                      Multiple Payment Options
                    </p>
                    <p className="text-xs text-center text-amber-600 dark:text-amber-500 mt-1">
                      Choose from: Card, M-Pesa, or Bank Transfer
                    </p>
                    <div className="flex justify-center gap-3 mt-2 text-xs">
                      <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded">💳 Card</span>
                      <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded">📱 M-Pesa</span>
                      <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded">🏦 Bank Transfer</span>
                    </div>
                  </div>
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  <button
                    onClick={handlePay}
                    disabled={paystackLoading}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50"
                  >
                    {paystackLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Opening payment window...</span>
                      </div>
                    ) : (
                      'Continue to Payment'
                    )}
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

      {/* Installment Payment Modal */}
      {showInstallmentModal && installmentPlan && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <Smartphone size={20} className="text-[#4CAF50]" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Installment Payment Plan
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowInstallmentModal(false);
                    setShowModal(true);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="bg-[#E8F5E9] dark:bg-[#1B5E20]/30 rounded-lg p-4 mb-5 border border-[#4CAF50]/30 dark:border-[#4CAF50]/20">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold text-[#2E7D32] dark:text-[#4CAF50]">
                  KES {formatPriceWithCommas(installmentPlan.totalAmount)}
                </p>
                <p className="text-xs text-[#2E7D32] dark:text-[#4CAF50] mt-2 flex items-center gap-1">
                  <Smartphone size={12} /> Split into {installmentPlan.numberOfInstallments} installments due to M-Pesa limit
                </p>
              </div>

              <div className="mb-5 space-y-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Installments:</p>
                {installmentPlan.installments?.map((inst: any, idx: number) => (
                  <div key={inst.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Installment {idx + 1} of {installmentPlan.numberOfInstallments}</p>
                      <p className="text-xs text-gray-500">Due: {inst.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">KES {formatPriceWithCommas(inst.amount)}</p>
                      {inst.status === 'paid' ? (
                        <span className="text-xs text-green-600">✓ Paid</span>
                      ) : (
                        <button
                          onClick={() => payInstallment(inst.id, inst.amount)}
                          disabled={installmentPaymentStatus !== 'idle'}
                          className="text-xs bg-[#4CAF50] hover:bg-[#2E7D32] text-white px-3 py-1 rounded transition-colors"
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {installmentPaymentStatus === 'processing' && (
                <div className="text-center py-4">
                  <Loader2 className="animate-spin h-8 w-8 text-[#4CAF50] mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Processing payment...</p>
                </div>
              )}

              {installmentPaymentStatus === 'sent' && (
                <div className="text-center py-4">
                  <Smartphone size={40} className="text-[#4CAF50] mx-auto mb-2" />
                  <p className="font-medium text-gray-900 dark:text-white">Check your phone</p>
                  <p className="text-xs text-gray-500">Enter your M-Pesa PIN to complete this installment</p>
                </div>
              )}

              {installmentPaymentStatus === 'completed' && (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-[#E8F5E9] dark:bg-[#1B5E20]/50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Check size={24} className="text-[#2E7D32] dark:text-[#4CAF50]" />
                  </div>
                  <p className="font-semibold text-green-600 dark:text-green-400">Installment Paid!</p>
                  <p className="text-xs text-gray-500 mt-1">Refreshing...</p>
                </div>
              )}

              {installmentPaymentStatus === 'error' && (
                <div className="text-center py-4">
                  <p className="text-red-600 text-sm">{error}</p>
                  <button
                    onClick={() => setInstallmentPaymentStatus('idle')}
                    className="mt-2 text-sm text-[#4CAF50] hover:underline"
                  >
                    Try Again
                  </button>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                  <Smartphone size={10} /> Your subscription will be activated after all installments are paid
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};