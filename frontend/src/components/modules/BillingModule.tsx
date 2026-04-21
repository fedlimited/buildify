import React, { useState, useEffect } from 'react'; 
import { useAppStore } from '@/hooks/useAppStore'; 
import { Check, Smartphone, Loader2 } from 'lucide-react'; 
import api from '@/services/api'; 
 
interface Plan { 
  id: number; 
  name: string; 
  display_name: string; 
  description: string; 
  price_monthly_kes: number; 
  price_yearly_kes: number; 
  max_projects: number; 
  max_workers: number; 
  max_users: number; 
  features: string[]; 
} 
 
export const BillingModule = () =
  const { authUser } = useAppStore(); 
  const [plans, setPlans] = useState([]); 
  const [currentPlan, setCurrentPlan] = useState(null); 
  const [selectedPlan, setSelectedPlan] = useState(null); 
  const [selectedCycle, setSelectedCycle] = useState('monthly'); 
  const [showPaymentModal, setShowPaymentModal] = useState(false); 
  const [phoneNumber, setPhoneNumber] = useState(''); 
  const [paymentStatus, setPaymentStatus] = useState('idle'); 
  const [paymentError, setPaymentError] = useState(''); 
 
  useEffect(() =
    fetchPlans(); 
    fetchCurrentSubscription(); 
  }, []); 
 
  const fetchPlans = async () =
    const data = await api.request('/subscription/plans'); 
    setPlans(data); 
  }; 
 
  const fetchCurrentSubscription = async () =
    const data = await api.request('/subscription/current'); 
    setCurrentPlan(data); 
  }; 
 
  const handleUpgrade = (plan) =
    setSelectedPlan(plan); 
    setShowPaymentModal(true); 
  }; 
 
  const initiatePayment = async () =
      setPaymentError('Please enter a valid M-Pesa phone number'); 
      return; 
    } 
    setPaymentStatus('processing'); 
    setPaymentError(''); 
    try { 
      const response = await api.request('/subscription/pay', { 
        method: 'POST', 
        body: JSON.stringify({ 
          planId: selectedPlan.id, 
          phoneNumber: phoneNumber, 
          billingCycle: selectedCycle 
        }) 
      }); 
      if (response.success) { 
        setPaymentStatus('sent'); 
        pollPaymentStatus(response.paymentId); 
      } 
    } catch (error) { 
      setPaymentStatus('error'); 
      setPaymentError(error.message); 
    } 
  }; 
 
  const pollPaymentStatus = async (paymentId) =
    const interval = setInterval(async () =
      const status = await api.request(`/subscription/payment-status/${paymentId}`); 
      if (status.status === 'completed') { 
        clearInterval(interval); 
        setPaymentStatus('completed'); 
        setTimeout(() =
          setShowPaymentModal(false); 
          fetchCurrentSubscription(); 
        }, 2000); 
      } else if (status.status === 'failed') { 
        clearInterval(interval); 
        setPaymentStatus('error'); 
        setPaymentError('Payment failed. Please try again.'); 
      } 
    }, 3000); 
  }; 
 
  const getPrice = (plan) =
    return selectedCycle === 'monthly' ? plan.price_monthly_kes : plan.price_yearly_kes; 
  }; 
 
  return ( 
    <div className="p-6"> 
      <p className="text-gray-600 mb-6">Choose the plan that fits your construction business</p> 
 
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"> 
          <p className="text-green-800"> 
            Current Plan: <strong>{currentPlan.display_name}</strong>  
            Valid until {new Date(currentPlan.end_date).toLocaleDateString()} 
          </p> 
        </div> 
      )} 
 
      <div className="mb-4 flex justify-end"> 
        <div className="bg-gray-100 rounded-lg p-1"> 
          <button 
            onClick={() =
            className={`px-4 py-2 rounded-md text-sm ${selectedCycle === 'monthly' ? 'bg-white shadow-sm' : ''}`}> 
            Monthly 
          </button> 
          <button 
            onClick={() =
            className={`px-4 py-2 rounded-md text-sm ${selectedCycle === 'yearly' ? 'bg-white shadow-sm' : ''}`}> 
            Yearly (Save 15%) 
          </button> 
        </div> 
      </div> 
 
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4"> 
        {plans.map((plan) =
          <div key={plan.id} className={`border rounded-lg p-4 ${currentPlan?.plan_name === plan.name ? 'ring-2 ring-green-500' : ''}`}> 
            <h3 className="text-xl font-bold">{plan.display_name}</h3> 
            <div className="mt-2"> 
              <span className="text-2xl font-bold">KSh {getPrice(plan).toLocaleString()}</span> 
              <span className="text-gray-500">/{selectedCycle}</span> 
            </div> 
            <div className="mt-4 space-y-2 text-sm"> 
              <p>?? {plan.max_projects === 999999 ? 'Unlimited' : plan.max_projects} projects</p> 
              <p>?? {plan.max_workers === 999999 ? 'Unlimited' : plan.max_workers} workers</p> 
              <p>?? {plan.max_users === 999999 ? 'Unlimited' : plan.max_users} users</p> 
            </div> 
            <button 
              onClick={() =
              disabled={currentPlan?.plan_name === plan.name} 
              className={`mt-4 w-full py-2 rounded-lg ${ 
                currentPlan?.plan_name === plan.name 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : plan.name === 'free' 
                  ? 'border border-gray-300 text-gray-700 hover:bg-gray-50' 
                  : 'bg-green-600 text-white hover:bg-green-700' 
              }`}> 
              {currentPlan?.plan_name === plan.name ? 'Current Plan' : plan.name === 'free' ? 'Get Started' : 'Upgrade'} 
            </button> 
          </div> 
        ))} 
      </div> 
 
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"> 
          <div className="bg-white rounded-lg p-6 max-w-md w-full"> 
            <h3 className="text-lg font-bold mb-4">Upgrade to {selectedPlan?.display_name}</h3> 
            <p className="text-2xl font-bold text-green-600 mb-4">KSh {getPrice(selectedPlan).toLocaleString()}</p> 
              <
                <div className="mb-4"> 
                  <label className="block text-sm font-medium mb-1">M-Pesa Phone Number</label> 
                  <div className="flex items-center border rounded-lg"> 
                    <Smartphone size={20} className="ml-3 text-gray-400" /> 
                    <input 
                      type="tel" 
                      placeholder="0712345678" 
                      className="flex-1 p-3 outline-none" 
                      value={phoneNumber} 
                      onChange={(e) =
                    /> 
                  </div> 
                </div> 
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{paymentError}</div> 
                )} 
                <div className="flex gap-3"> 
                  <button onClick={() = className="flex-1 py-2 border rounded">Cancel</button> 
                  <button onClick={initiatePayment} className="flex-1 py-2 bg-green-600 text-white rounded">Pay Now</button> 
                </div> 
              </> 
            )} 
              <div className="text-center py-8"> 
                <Loader2 className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" /> 
                <p>Sending payment request to your phone...</p> 
              </div> 
            )} 
              <div className="text-center py-8"> 
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"> 
                  <Smartphone size={32} className="text-green-600" /> 
                </div> 
                <p className="font-medium">Check your phone</p> 
                <p className="text-sm text-gray-500 mt-1">Enter your M-Pesa PIN to complete payment</p> 
              </div> 
            )} 
              <div className="text-center py-8"> 
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"> 
                  <Check size={32} className="text-green-600" /> 
                </div> 
                <p className="font-bold text-green-600">Payment Successful!</p> 
                <p className="text-sm text-gray-500 mt-1">Your plan has been upgraded</p> 
              </div> 
            )} 
          </div> 
        </div> 
      )} 
    </div> 
  ); 
}; 
