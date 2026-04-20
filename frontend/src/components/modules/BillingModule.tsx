import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { API_BASE_URL } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Rocket, Check, AlertCircle, Calendar, CreditCard, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface Plan {
  id: number;
  name: string;
  display_name: string;
  description: string;
  price_monthly_usd: number;
  price_yearly_usd: number;
  price_monthly_kes: number;
  price_yearly_kes: number;
  max_projects: number;
  max_workers: number;
  max_users: number;
  features: string[];
  is_active: boolean;
  display_order: number;
}

interface CurrentSubscription {
  id: number;
  plan_id: number;
  plan_name: string;
  display_name: string;
  status: string;
  start_date: string;
  end_date: string;
  trial_end_date: string;
  trial_days_remaining: number;
  max_projects: number;
  max_workers: number;
  max_users: number;
  features: string[];
}

export function BillingModule() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/subscription/plans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/subscription/current`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCurrentSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
    setLoading(false);
  };

  const handleUpgrade = (planName: string) => {
    // For now, show upgrade prompt
    alert(`Upgrade to ${planName} - Payment integration coming soon!`);
    // Future: Redirect to Stripe/M-Pesa checkout
  };

  const getPriceDisplay = (plan: Plan) => {
    const price = billingCycle === 'monthly' ? plan.price_monthly_usd : plan.price_yearly_usd;
    const period = billingCycle === 'monthly' ? 'month' : 'year';
    if (price === 0) return 'Free';
    return `$${price.toLocaleString()}/${period}`;
  };

  const isCurrentPlan = (planName: string) => {
    return currentSubscription?.plan_name === planName;
  };

  const getStatusBadge = () => {
    if (!currentSubscription) return null;
    
    if (currentSubscription.status === 'trial' && currentSubscription.trial_days_remaining > 0) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
          <AlertCircle size={14} className="text-amber-400" />
          <span className="text-sm text-amber-400">
            Trial: {currentSubscription.trial_days_remaining} days remaining
          </span>
        </div>
      );
    }
    
    if (currentSubscription.status === 'active') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-lg border border-green-500/20">
          <Check size={14} className="text-green-400" />
          <span className="text-sm text-green-400">Active</span>
        </div>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Billing & Subscription</h2>
        <p className="text-sm text-muted-foreground">Manage your plan and payment methods</p>
      </div>

      {/* Current Plan Card */}
      {currentSubscription && (
        <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown size={20} className="text-amber-400" />
              Current Plan: {currentSubscription.display_name}
            </CardTitle>
            <CardDescription>
              {currentSubscription.status === 'trial' 
                ? `Your trial ends on ${new Date(currentSubscription.trial_end_date).toLocaleDateString()}`
                : `Next billing date: ${new Date(currentSubscription.end_date).toLocaleDateString()}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-muted-foreground" />
                <span>Started: {new Date(currentSubscription.start_date).toLocaleDateString()}</span>
              </div>
              {getStatusBadge()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 text-sm rounded-md transition-all ${
              billingCycle === 'monthly' 
                ? 'bg-amber-500 text-white shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-1.5 text-sm rounded-md transition-all ${
              billingCycle === 'yearly' 
                ? 'bg-amber-500 text-white shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yearly <span className="text-xs text-green-500 ml-1">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan, idx) => {
          const isCurrent = isCurrentPlan(plan.name);
          const isFree = plan.price_monthly_usd === 0;
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-card rounded-xl border p-4 transition-all ${
                isCurrent 
                  ? 'border-amber-500 shadow-lg shadow-amber-500/10' 
                  : 'border-border hover:border-amber-500/30'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-card-foreground">{plan.display_name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                </div>
                {isCurrent && (
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              
              <div className="mb-3">
                <span className="text-2xl font-bold text-card-foreground">{getPriceDisplay(plan)}</span>
              </div>
              
              <ul className="space-y-1.5 mb-4">
                <li className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Check size={12} className="text-green-500" />
                  {plan.max_projects === 999999 ? 'Unlimited projects' : `${plan.max_projects} projects`}
                </li>
                <li className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Check size={12} className="text-green-500" />
                  {plan.max_workers === 999999 ? 'Unlimited workers' : `${plan.max_workers} workers`}
                </li>
                <li className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Check size={12} className="text-green-500" />
                  {plan.max_users === 999999 ? 'Unlimited users' : `${plan.max_users} users`}
                </li>
                {plan.features.slice(0, 2).map((feature, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Check size={12} className="text-green-500" />
                    {feature.replace(/_/g, ' ').toUpperCase()}
                  </li>
                ))}
                {plan.features.length > 2 && (
                  <li className="text-xs text-muted-foreground">
                    +{plan.features.length - 2} more features
                  </li>
                )}
              </ul>
              
              {!isCurrent && !isFree && (
                <Button
                  onClick={() => handleUpgrade(plan.display_name)}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                >
                  <Rocket size={14} className="mr-1" />
                  Upgrade to {plan.display_name}
                </Button>
              )}
              
              {isFree && !isCurrent && (
                <Button
                  variant="outline"
                  onClick={() => handleUpgrade(plan.display_name)}
                  className="w-full"
                >
                  Downgrade to Free
                </Button>
              )}
              
              {isCurrent && !isFree && (
                <Button
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  Your Current Plan
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Methods</CardTitle>
          <CardDescription>We accept the following payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
              <CreditCard size={16} />
              <span className="text-sm">Visa / Mastercard</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
              <Zap size={16} />
              <span className="text-sm">M-Pesa (Coming Soon)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}