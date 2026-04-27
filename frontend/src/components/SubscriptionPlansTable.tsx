import React, { useEffect, useState } from 'react';
import { Check, X, Loader2, Infinity } from 'lucide-react';

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

  // Feature rows exactly matching database features
  const featureRows = [
    { section: 'Limits' },
    { label: 'Projects', type: 'number', key: 'max_projects' },
    { label: 'Workers', type: 'number', key: 'max_workers' },
    { label: 'Users', type: 'number', key: 'max_users' },
    { section: 'Core Features' },
    { label: 'Basic Reports', type: 'feature', key: 'basic_reports' },
    { label: 'Expenses', type: 'feature', key: 'expenses' },
    { label: 'Income', type: 'feature', key: 'income' },
    { label: 'Payroll', type: 'feature', key: 'payroll' },
    { label: 'Procurement', type: 'feature', key: 'procurement' },
    { label: 'Store / Inventory', type: 'feature', key: 'store' },
    { label: 'Site Diary', type: 'feature', key: 'site_diary' },
    { section: 'Support & Advanced' },
    { label: 'Email Support', type: 'feature', key: 'email_support' },
    { label: 'Priority Support', type: 'feature', key: 'priority_support' },
    { label: 'Gantt Charts', type: 'feature', key: 'gantt_charts' },
    { label: 'Time Tracking', type: 'feature', key: 'time_tracking' },
    { label: 'Receipt Scanning', type: 'feature', key: 'receipt_scanning' },
    { label: 'Low Stock Alerts', type: 'feature', key: 'low_stock_alerts' },
    { label: 'API Access', type: 'feature', key: 'api_access' },
    { label: 'Export Excel', type: 'feature', key: 'export_excel' },
  ];

  const getFeatures = (plan: any): string[] => {
    if (!plan.features) return [];
    if (Array.isArray(plan.features)) return plan.features;
    try { return JSON.parse(plan.features); } catch { return []; }
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-4 font-semibold text-sm text-muted-foreground bg-muted/30 border-b border-border min-w-[180px]">
                Feature
              </th>
              {plans.map((plan: any) => (
                <th key={plan.id} 
                  className={`text-center p-4 border-b border-border min-w-[140px] relative ${
                    plan.name === 'pro' ? 'bg-amber-50/5 dark:bg-amber-950/10 border-x border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]' : ''
                  }`}>
                  {plan.name === 'pro' && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[11px] font-semibold px-3 py-0.5 rounded-full shadow-lg shadow-amber-500/25 whitespace-nowrap">
                      Most Popular
                    </span>
                  )}
                  <p className="text-sm font-semibold text-foreground">{plan.display_name || plan.name}</p>
                  <div className="mt-1.5">
                    {plan.price_monthly_kes > 0 ? (
                      <div className="flex items-baseline justify-center gap-0.5">
                        <span className="text-xs text-muted-foreground font-medium">KES</span>
                        <span className={`text-xl font-bold ${plan.name === 'pro' ? 'text-amber-500' : 'text-foreground'}`}>
                          {plan.price_monthly_kes.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">/mo</span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">Free</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {featureRows.map((row, idx) => {
              // Section header
              if ('section' in row) {
                return (
                  <tr key={row.section}>
                    <td colSpan={plans.length + 1} className="py-2.5 px-4 bg-muted/20 border-b border-border">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {row.section}
                      </span>
                    </td>
                  </tr>
                );
              }

              const isPro = false; // We'll set per plan
              return (
                <tr key={row.key} 
                  className={`border-b border-border transition-colors ${
                    idx % 2 === 0 ? 'bg-transparent' : 'bg-muted/5'
                  } hover:bg-muted/10`}>
                  <td className="py-3 px-4 text-sm text-foreground">
                    {row.label}
                  </td>
                  {plans.map((plan: any) => {
                    const highlightPro = plan.name === 'pro';
                    
                    if (row.type === 'number') {
                      const val = plan[row.key!];
                      const display = val === 999999 ? (
                        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                          <Infinity size={14} /> Unlimited
                        </span>
                      ) : val || 0;
                      return (
                        <td key={plan.id} className={`text-center py-3 px-4 ${highlightPro ? 'bg-amber-50/5 dark:bg-amber-950/5 border-x border-amber-500/20' : ''}`}>
                          <span className="text-sm font-semibold text-foreground">{display}</span>
                        </td>
                      );
                    }

                    const features = getFeatures(plan);
                    const hasFeature = plan.name === 'premier' || features.includes(row.key!);
                    
                    return (
                      <td key={plan.id} className={`text-center py-3 px-4 ${highlightPro ? 'bg-amber-50/5 dark:bg-amber-950/5 border-x border-amber-500/20' : ''}`}>
                        <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                          hasFeature 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                        }`}>
                          {hasFeature ? <Check size={14} /> : <X size={14} />}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/20 border-t border-border text-xs text-muted-foreground">
        <span>All prices in Kenyan Shillings (KES) • Annual billing saves 15%</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"><Check size={11} /></span>
            Included
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600"><X size={11} /></span>
            Not Included
          </span>
        </div>
      </div>
    </div>
  );
}