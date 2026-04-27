import React, { useEffect, useState } from 'react';
import { Check, X, Loader2, Infinity, Zap, Crown } from 'lucide-react';

export function SubscriptionPlansTable() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://buildify-backend-kye8.onrender.com/api/subscription/plans')
      .then(r => r.json())
      .then(data => { setPlans(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
    </div>
  );

  const featureRows = [
    { label: 'Max Projects', type: 'number', key: 'max_projects', icon: '📁' },
    { label: 'Max Workers', type: 'number', key: 'max_workers', icon: '👷' },
    { label: 'Max Users', type: 'number', key: 'max_users', icon: '👥' },
    { label: 'Income Records', type: 'feature', key: 'income', category: 'Finance' },
    { label: 'Basic Reports', type: 'feature', key: 'basic_reports', category: 'Finance' },
    { label: 'Expenses', type: 'feature', key: 'expenses', category: 'Finance' },
    { label: 'Income', type: 'feature', key: 'income', category: 'Finance' },
    { label: 'Payroll', type: 'feature', key: 'payroll', category: 'Operations' },
    { label: 'Procurement', type: 'feature', key: 'procurement', category: 'Operations' },
    { label: 'Store / Inventory', type: 'feature', key: 'store', category: 'Operations' },
    { label: 'Site Diary', type: 'feature', key: 'site_diary', category: 'Operations' },
    { label: 'Email Support', type: 'feature', key: 'email_support', category: 'Support' },
    { label: 'Priority Support', type: 'feature', key: 'priority_support', category: 'Support' },
    { label: 'Gantt Charts', type: 'feature', key: 'gantt_charts', category: 'Advanced' },
    { label: 'Time Tracking', type: 'feature', key: 'time_tracking', category: 'Advanced' },
    { label: 'Receipt Scanning', type: 'feature', key: 'receipt_scanning', category: 'Advanced' },
    { label: 'Low Stock Alerts', type: 'feature', key: 'low_stock_alerts', category: 'Advanced' },
    { label: 'API Access', type: 'feature', key: 'api_access', category: 'Advanced' },
    { label: 'Export Excel', type: 'feature', key: 'export_excel', category: 'Advanced' },
  ];

  const getFeatures = (plan: any): string[] => {
    if (!plan.features) return [];
    if (Array.isArray(plan.features)) return plan.features;
    try { return JSON.parse(plan.features); } catch { return []; }
  };

  // Group features by category
  const categories = [...new Set(featureRows.filter(r => r.category).map(r => r.category))];

  const getPlanColor = (plan: any) => {
    switch (plan.name) {
      case 'free': return 'bg-gray-50 border-gray-200';
      case 'basic': return 'bg-blue-50/30 border-blue-200';
      case 'pro': return 'bg-amber-50/30 border-amber-200';
      case 'premier': return 'bg-purple-50/30 border-purple-200';
      default: return 'bg-white border-gray-200';
    }
  };

  const getPlanBadge = (plan: any) => {
    if (plan.name === 'pro') return (
      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap">
        <Crown size={10} /> Most Popular
      </span>
    );
    return null;
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-6 py-4 border-b">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Plan Comparison
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Compare features across all plans to find your perfect fit</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Plan Headers */}
          <thead>
            <tr className="border-b bg-muted/20">
              <th className="text-left py-4 px-5 font-semibold text-sm sticky left-0 bg-muted/20 z-10 min-w-[160px]">Features</th>
              {plans.map((plan: any) => (
                <th key={plan.id} className={`text-center py-4 px-4 min-w-[140px] relative ${getPlanColor(plan)}`}>
                  {getPlanBadge(plan)}
                  <p className="text-base font-bold text-foreground">{plan.display_name || plan.name}</p>
                  <div className="mt-1">
                    {plan.price_monthly_kes > 0 ? (
                      <div className="flex items-baseline justify-center gap-0.5">
                        <span className="text-xs text-muted-foreground">KES</span>
                        <span className="text-xl font-bold text-foreground">
                          {plan.price_monthly_kes.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">/mo</span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-green-600">Free</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Number rows (Project/Worker/User limits) */}
            {featureRows.filter(r => r.type === 'number').map((row, idx) => (
              <tr key={row.key} className={`border-b hover:bg-muted/10 transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-muted/5'}`}>
                <td className="py-3 px-5 font-medium text-sm text-foreground sticky left-0 bg-inherit">
                  <span className="mr-2">{row.icon}</span>
                  {row.label}
                </td>
                {plans.map((plan: any) => {
                  const val = plan[row.key];
                  const display = val === 999999 ? (
                    <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                      <Infinity size={14} /> Unlimited
                    </span>
                  ) : (val || 0);
                  return (
                    <td key={plan.id} className="text-center py-3 px-4">
                      <span className="text-sm font-semibold text-foreground">{display}</span>
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Category headers + Feature rows */}
            {categories.map(category => {
              const catRows = featureRows.filter(r => r.category === category);
              if (catRows.length === 0) return null;
              return (
                <React.Fragment key={category}>
                  {/* Category Header */}
                  <tr className="bg-muted/30">
                    <td colSpan={plans.length + 1} className="py-2 px-5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {category}
                      </span>
                    </td>
                  </tr>
                  {/* Feature Rows */}
                  {catRows.map((row, idx) => (
                    <tr key={row.key} className={`border-b hover:bg-muted/10 transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-muted/5'}`}>
                      <td className="py-2.5 px-5 text-sm text-foreground sticky left-0 bg-inherit">{row.label}</td>
                      {plans.map((plan: any) => {
                        const features = getFeatures(plan);
                        const hasFeature = plan.name === 'premier' || features.includes(row.key);
                        return (
                          <td key={plan.id} className="text-center py-2.5 px-4">
                            {hasFeature ? (
                              <Check className="w-4 h-4 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-muted/10 border-t px-6 py-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>All prices in Kenyan Shillings (KES)</span>
        <span className="flex items-center gap-1">
          <Check className="w-3 h-3 text-green-500" /> = Included
          <X className="w-3 h-3 text-slate-300 ml-2" /> = Not included
        </span>
      </div>
    </div>
  );
}