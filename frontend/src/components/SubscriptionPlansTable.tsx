import { Check, X, Crown, Sparkles, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PlanFeature {
  name: string;
  free: string | boolean;
  pro: string | boolean;
  business: string | boolean;
}

const features: PlanFeature[] = [
  // PROJECTS
  { name: 'Active Projects', free: '1 project', pro: 'Unlimited', business: 'Unlimited' },
  { name: 'Archived Projects', free: 'Read-only', pro: 'Full access', business: 'Full access' },
  { name: 'Project Templates', free: '❌', pro: '✅', business: '✅' },
  
  // WORKERS
  { name: 'Active Workers', free: '10 workers', pro: 'Unlimited', business: 'Unlimited' },
  { name: 'Worker Categories', free: '5 categories', pro: 'Unlimited', business: 'Unlimited' },
  { name: 'Payroll Processing', free: 'Basic', pro: 'Advanced', business: 'Enterprise' },
  { name: 'Timesheets', free: '❌', pro: '✅', business: '✅' },
  
  // FINANCE
  { name: 'Income Records', free: '10 per month', pro: 'Unlimited', business: 'Unlimited' },
  { name: 'Expense Tracking', free: '✅', pro: '✅', business: '✅' },
  { name: 'Invoice Generation', free: '5 per month', pro: 'Unlimited', business: 'Unlimited' },
  { name: 'VAT Management', free: 'Basic', pro: 'Full', business: 'Full' },
  { name: 'Financial Reports', free: 'Basic', pro: 'Advanced', business: 'Custom' },
  { name: 'Multi-currency', free: '❌', pro: '✅', business: '✅' },
  
  // PROCUREMENT
  { name: 'Suppliers', free: '10 suppliers', pro: 'Unlimited', business: 'Unlimited' },
  { name: 'Purchase Orders', free: '10 per month', pro: 'Unlimited', business: 'Unlimited' },
  { name: 'Store Management', free: 'Basic', pro: 'Full', business: 'Full' },
  { name: 'Inventory Tracking', free: '❌', pro: '✅', business: '✅' },
  
  // SITE MANAGEMENT
  { name: 'Site Diary', free: '30 entries', pro: 'Unlimited', business: 'Unlimited' },
  { name: 'Subcontractors', free: '5 subs', pro: 'Unlimited', business: 'Unlimited' },
  { name: 'Site Photos', free: '50 MB', pro: '5 GB', business: '20 GB' },
  { name: 'Daily Reports', free: '✅', pro: '✅', business: '✅' },
  
  // TEAM
  { name: 'Team Members', free: '1 user', pro: '5 users', business: 'Unlimited' },
  { name: 'User Permissions', free: 'Basic', pro: 'Advanced', business: 'Custom' },
  { name: 'Activity Logs', free: '7 days', pro: '30 days', business: '1 year' },
  { name: 'Audit Trail', free: '❌', pro: '✅', business: '✅' },
  
  // SUPPORT
  { name: 'Customer Support', free: 'Email', pro: 'Priority Email', business: '24/7 Phone & Email' },
  { name: 'Training', free: 'Documentation', pro: 'Video tutorials', business: 'One-on-one' },
  { name: 'SLA', free: '❌', pro: 'Standard', business: 'Premium' },
  
  // ADVANCED
  { name: 'Data Export', free: 'CSV', pro: 'CSV, PDF', business: 'API Access' },
  { name: 'Backup & Restore', free: 'Manual', pro: 'Auto daily', business: 'Auto real-time' },
  { name: 'Commercial Rights', free: '❌', pro: '✅', business: '✅' },
  { name: 'Early Access Features', free: '❌', pro: '✅', business: '✅' },
  { name: 'API Access', free: '❌', pro: '❌', business: '✅' },
];

interface SubscriptionPlansTableProps {
  compact?: boolean;
  highlightFeature?: string;
  onUpgrade?: () => void;
}

export function SubscriptionPlansTable({ compact = false, highlightFeature, onUpgrade }: SubscriptionPlansTableProps) {
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Navigate to billing tab
      const billingTab = document.querySelector('[value="billing"]') as HTMLElement;
      if (billingTab) {
        billingTab.click();
      }
    }
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-lg bg-muted/30">
            <span className="text-2xl block">🆓</span>
            <h4 className="font-bold mt-1">Free</h4>
            <p className="text-xs text-muted-foreground">KSh 0/mo</p>
          </div>
          <div className="p-3 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-500">
            <Crown className="h-5 w-5 text-amber-500 mx-auto" />
            <h4 className="font-bold mt-1">Pro</h4>
            <p className="text-xs text-muted-foreground">KSh 2,500/mo</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <Sparkles className="h-5 w-5 text-purple-500 mx-auto" />
            <h4 className="font-bold mt-1">Business</h4>
            <p className="text-xs text-muted-foreground">Custom</p>
          </div>
        </div>
        
        {highlightFeature && (
          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              Need more {highlightFeature}? 
              <button onClick={handleUpgrade} className="text-amber-600 font-medium ml-1 hover:underline">
                Upgrade to Pro →
              </button>
            </p>
          </div>
        )}
        
        <Button onClick={handleUpgrade} className="w-full bg-gradient-to-r from-amber-500 to-orange-500">
          Upgrade Now
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">




        {/* Simple Column Headers */}
        <div className="grid grid-cols-4 gap-4 mb-4 px-4 py-2 bg-muted/30 rounded-lg">
          <div className="font-semibold text-sm text-muted-foreground">Feature</div>
          <div className="font-semibold text-sm text-center text-muted-foreground">Free</div>
          <div className="font-semibold text-sm text-center text-amber-600 dark:text-amber-400">Pro</div>
          <div className="font-semibold text-sm text-center text-muted-foreground">Business</div>
        </div>




        {/* Features Table */}
        <div className="border rounded-lg overflow-hidden">
          {!compact && (
            <>
              {/* Section: Projects */}
              <div className="bg-muted/50 px-4 py-2 font-semibold text-sm">
                📋 PROJECT MANAGEMENT
              </div>
              {features.slice(0, 3).map((feature, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-4 border-b last:border-b-0">
                  <div className="p-3 text-sm font-medium">{feature.name}</div>
                  <div className="p-3 text-sm text-center">{feature.free}</div>
                  <div className="p-3 text-sm text-center font-medium text-amber-600 dark:text-amber-400">{feature.pro}</div>
                  <div className="p-3 text-sm text-center">{feature.business}</div>
                </div>
              ))}

              {/* Section: Workers */}
              <div className="bg-muted/50 px-4 py-2 font-semibold text-sm mt-2">
                👥 WORKFORCE MANAGEMENT
              </div>
              {features.slice(3, 7).map((feature, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-4 border-b last:border-b-0">
                  <div className="p-3 text-sm font-medium">{feature.name}</div>
                  <div className="p-3 text-sm text-center">{feature.free}</div>
                  <div className="p-3 text-sm text-center font-medium text-amber-600 dark:text-amber-400">{feature.pro}</div>
                  <div className="p-3 text-sm text-center">{feature.business}</div>
                </div>
              ))}

              {/* Section: Finance */}
              <div className="bg-muted/50 px-4 py-2 font-semibold text-sm mt-2">
                💰 FINANCE & ACCOUNTING
              </div>
              {features.slice(7, 14).map((feature, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-4 border-b last:border-b-0">
                  <div className="p-3 text-sm font-medium">{feature.name}</div>
                  <div className="p-3 text-sm text-center">
                    {typeof feature.free === 'boolean' ? (
                      feature.free ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-red-500 mx-auto" />
                    ) : (
                      feature.free
                    )}
                  </div>
                  <div className="p-3 text-sm text-center font-medium text-amber-600 dark:text-amber-400">
                    {typeof feature.pro === 'boolean' ? (
                      feature.pro ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-red-500 mx-auto" />
                    ) : (
                      feature.pro
                    )}
                  </div>
                  <div className="p-3 text-sm text-center">
                    {typeof feature.business === 'boolean' ? (
                      feature.business ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-red-500 mx-auto" />
                    ) : (
                      feature.business
                    )}
                  </div>
                </div>
              ))}

              {/* Section: Procurement */}
              <div className="bg-muted/50 px-4 py-2 font-semibold text-sm mt-2">
                🚚 PROCUREMENT & STORES
              </div>
              {features.slice(14, 18).map((feature, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-4 border-b last:border-b-0">
                  <div className="p-3 text-sm font-medium">{feature.name}</div>
                  <div className="p-3 text-sm text-center">{feature.free}</div>
                  <div className="p-3 text-sm text-center font-medium text-amber-600 dark:text-amber-400">{feature.pro}</div>
                  <div className="p-3 text-sm text-center">{feature.business}</div>
                </div>
              ))}

              {/* Section: Team */}
              <div className="bg-muted/50 px-4 py-2 font-semibold text-sm mt-2">
                👨‍💼 TEAM & ACCESS
              </div>
              {features.slice(18, 22).map((feature, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-4 border-b last:border-b-0">
                  <div className="p-3 text-sm font-medium">{feature.name}</div>
                  <div className="p-3 text-sm text-center">{feature.free}</div>
                  <div className="p-3 text-sm text-center font-medium text-amber-600 dark:text-amber-400">{feature.pro}</div>
                  <div className="p-3 text-sm text-center">{feature.business}</div>
                </div>
              ))}

              {/* Section: Support */}
              <div className="bg-muted/50 px-4 py-2 font-semibold text-sm mt-2">
                🎧 SUPPORT & TRAINING
              </div>
              {features.slice(22, 25).map((feature, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-4 border-b last:border-b-0">
                  <div className="p-3 text-sm font-medium">{feature.name}</div>
                  <div className="p-3 text-sm text-center">{feature.free}</div>
                  <div className="p-3 text-sm text-center font-medium text-amber-600 dark:text-amber-400">{feature.pro}</div>
                  <div className="p-3 text-sm text-center">{feature.business}</div>
                </div>
              ))}

              {/* Section: Advanced */}
              <div className="bg-muted/50 px-4 py-2 font-semibold text-sm mt-2">
                ⚡ ADVANCED FEATURES
              </div>
              {features.slice(25, 30).map((feature, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-4 border-b last:border-b-0">
                  <div className="p-3 text-sm font-medium">{feature.name}</div>
                  <div className="p-3 text-sm text-center">
                    {typeof feature.free === 'boolean' ? (
                      feature.free ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-red-500 mx-auto" />
                    ) : (
                      feature.free
                    )}
                  </div>
                  <div className="p-3 text-sm text-center font-medium text-amber-600 dark:text-amber-400">
                    {typeof feature.pro === 'boolean' ? (
                      feature.pro ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-red-500 mx-auto" />
                    ) : (
                      feature.pro
                    )}
                  </div>
                  <div className="p-3 text-sm text-center">
                    {typeof feature.business === 'boolean' ? (
                      feature.business ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-red-500 mx-auto" />
                    ) : (
                      feature.business
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg text-center text-sm text-muted-foreground">
          <p>📌 <strong>Note:</strong> All plans include core features like Projects, Site Diary, Expenses, and Reports.</p>
          <p className="mt-1">🔄 When downgrading, data is preserved but limited to plan capacity. Upgrade anytime to restore full access.</p>
        </div>
      </div>
    </div>
  );
}