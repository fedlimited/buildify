import React, { useState, useEffect } from 'react';
import { Check, Smartphone, Loader2 } from 'lucide-react';
import api from '@/services/api';

interface Plan {
  id: number;
  name: string;
  display_name: string;
  price_monthly_kes: number;
  price_yearly_kes: number;
  max_projects: number;
  max_workers: number;
  max_users: number;
}

export const BillingModule = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedCycle, setSelectedCycle] = useState('monthly');
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
    return selectedCycle === 'monthly' ? plan.price_monthly_kes : plan.price_yearly_kes;
  };

  const handlePay = async () => {
    if (!phone || phone.length < 10) {
      setError('Enter valid M-Pesa number');
      return;
    }
    setStatus('processing');
    setError('');
    try {
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
          }
        }, 3000);
      }
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Subscription Plans</h2>

      <div className="mb-4 flex justify-end">
        <div className="bg-gray-100 rounded-lg p-1">
          <button 
            onClick={() => setSelectedCycle('monthly')} 
            className={`px-4 py-2 rounded-md ${selectedCycle === 'monthly' ? 'bg-white shadow' : ''}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setSelectedCycle('yearly')} 
            className={`px-4 py-2 rounded-md ${selectedCycle === 'yearly' ? 'bg-white shadow' : ''}`}
          >
            Yearly (Save 15%)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`border rounded-lg p-4 ${currentPlan?.name === plan.name ? 'ring-2 ring-green-500' : ''}`}
          >
            <h3 className="text-xl font-bold">{plan.display_name}</h3>
            <div className="mt-2">
              <span className="text-2xl font-bold">KSh {getPrice(plan).toLocaleString()}</span>
              <span className="text-gray-500">/{selectedCycle}</span>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <p>📁 {plan.max_projects === 999999 ? 'Unlimited' : plan.max_projects} projects</p>
              <p>👷 {plan.max_workers === 999999 ? 'Unlimited' : plan.max_workers} workers</p>
              <p>👤 {plan.max_users === 999999 ? 'Unlimited' : plan.max_users} users</p>
            </div>
            <button
              onClick={() => { setSelectedPlan(plan); setShowModal(true); }}
              disabled={currentPlan?.name === plan.name}
              className={`mt-4 w-full py-2 rounded-lg ${
                currentPlan?.name === plan.name
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : plan.name === 'free'
                  ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {currentPlan?.name === plan.name ? 'Current Plan' : plan.name === 'free' ? 'Get Started' : 'Upgrade'}
            </button>
          </div>
        ))}
      </div>

      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Upgrade to {selectedPlan.display_name}</h3>
            <p className="text-2xl font-bold text-green-600 mb-4">KSh {getPrice(selectedPlan).toLocaleString()}</p>
            {status === 'idle' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">M-Pesa Number</label>
                  <input 
                    type="tel" 
                    placeholder="0712345678" 
                    className="w-full p-3 border rounded-lg" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                  />
                </div>
                {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
                <div className="flex gap-3">
                  <button onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded">Cancel</button>
                  <button onClick={handlePay} className="flex-1 py-2 bg-green-600 text-white rounded">Pay Now</button>
                </div>
              </>
            )}
            {status === 'processing' && (
              <div className="text-center py-8">
                <Loader2 className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" />
                <p>Sending request...</p>
              </div>
            )}
            {status === 'sent' && (
              <div className="text-center py-8">
                <Smartphone size={48} className="text-green-600 mx-auto mb-4" />
                <p className="font-medium">Check your phone</p>
                <p className="text-sm text-gray-500">Enter PIN to complete payment</p>
              </div>
            )}
            {status === 'completed' && (
              <div className="text-center py-8">
                <Check size={48} className="text-green-600 mx-auto mb-4" />
                <p className="font-bold text-green-600">Payment Successful!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};