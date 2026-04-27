import React, { useEffect, useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';

export function SubscriptionPlansTable() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://buildify-backend-kye8.onrender.com/api/subscription/plans')
      .then(r => r.json())
      .then(data => { setPlans(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  const allFeatures = [
    'Projects', 'Workers', 'Users', 'Income Records', 'Storage',
    'Basic Reports', 'Expenses', 'Income', 'Payroll', 'Procurement',
    'Store', 'Site Diary', 'Email Support', 'Priority Support',
    'Gantt Charts', 'Time Tracking', 'Receipt Scanning',
    'Low Stock Alerts', 'API Access', 'Export Excel', 'Custom Reports',
    'Dedicated Support', 'White Label', 'SSO', 'Phone Support',
    'Custom Integrations', 'Audit Logs'
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-semibold text-card-foreground mb-4">Plan Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-3 font-medium">Feature</th>
              {plans.map((plan: any) => (
                <th key={plan.id} className="text-center py-3 px-3 font-medium">
                  <p className="text-sm">{plan.display_name || plan.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {plan.price_monthly_kes > 0 ? `KES ${plan.price_monthly_kes.toLocaleString()}/mo` : 'Free'}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 px-3">Max Projects</td>
              {plans.map((p: any) => (
                <td key={p.id} className="text-center py-2 px-3">
                  {p.max_projects === 999999 ? 'Unlimited' : p.max_projects}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="py-2 px-3">Max Workers</td>
              {plans.map((p: any) => (
                <td key={p.id} className="text-center py-2 px-3">
                  {p.max_workers === 999999 ? 'Unlimited' : p.max_workers}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="py-2 px-3">Max Users</td>
              {plans.map((p: any) => (
                <td key={p.id} className="text-center py-2 px-3">
                  {p.max_users === 999999 ? 'Unlimited' : p.max_users}
                </td>
              ))}
            </tr>
            {allFeatures.map((feature) => {
              const featureKey = feature.toLowerCase().replace(/\s+/g, '_');
              return (
                <tr key={feature} className="border-b">
                  <td className="py-2 px-3">{feature}</td>
                  {plans.map((p: any) => {
                    const hasFeature = p.features?.some((f: string) => 
                      f.toLowerCase().replace(/\s+/g, '_').includes(featureKey)
                    ) || (p.name === 'premier');
                    return (
                      <td key={p.id} className="text-center py-2 px-3">
                        {hasFeature ? (
                          <Check className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}