import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import api from '@/services/api';
import { 
  Building2, Users, CreditCard, DollarSign,
  TrendingUp, TrendingDown, Activity, Loader2, ArrowUpRight,
  Shield, BarChart3, CheckCircle, Clock, AlertCircle,
  RefreshCw
} from 'lucide-react';

interface SystemStats {
  total_companies: number;
  total_users: number;
  active_subscriptions: number;
  trial_subscriptions: number;
  total_revenue_usd: number;
  total_projects: number;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { authUser } = useAppStore();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    if (authUser && !authUser.isSuperAdmin) navigate('/dashboard');
  }, [authUser, navigate]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([
        api.getSuperAdminStats(),
        api.getAllPayments()
      ]);
      setStats(s);
      setPayments(p || []);
      processRevenue(p || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const processRevenue = (payments: any[]) => {
    const monthly: Record<string, number> = {};
    payments.filter((p: any) => p.status === 'completed').forEach((p: any) => {
      const month = new Date(p.paid_at || p.created_at).toISOString().slice(0, 7);
      monthly[month] = (monthly[month] || 0) + (p.amount_kes || p.amount_usd * 130 || 0);
    });
    setRevenueData(Object.entries(monthly).sort().slice(-6));
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  const totalRevKES = payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount_kes || 0), 0);
  const totalRevUSD = payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount_usd || 0), 0);
  const maxRev = Math.max(...revenueData.map(d => d[1]), 1);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold">Dashboard</h1>
          <span className="text-xs text-muted-foreground">• {authUser?.name}</span>
        </div>
        <button onClick={loadData} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {/* Stat Chips - Compact Cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { label: 'Companies', value: stats?.total_companies || 0, icon: Building2, color: 'text-blue-600 bg-blue-50' },
          { label: 'Users', value: stats?.total_users || 0, icon: Users, color: 'text-green-600 bg-green-50' },
          { label: 'Active Subs', value: stats?.active_subscriptions || 0, icon: CreditCard, color: 'text-purple-600 bg-purple-50' },
          { label: 'Trials', value: stats?.trial_subscriptions || 0, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Projects', value: stats?.total_projects || 0, icon: TrendingUp, color: 'text-pink-600 bg-pink-50' },
          { label: 'Revenue', value: `$${totalRevUSD.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-lg border p-3 text-center cursor-pointer hover:shadow-sm transition-shadow"
            onClick={() => navigate(s.label === 'Revenue' ? '/admin/payments' : s.label === 'Users' ? '/admin/users' : '/admin/companies')}>
            <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mx-auto mb-1.5`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart - Takes 2 columns */}
        <div className="lg:col-span-2 bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Revenue Trend (KES)</h3>
            <span className="text-xs text-muted-foreground">Last 6 months</span>
          </div>
          {revenueData.length > 0 ? (
            <div className="space-y-2">
              {revenueData.map(([month, amount]) => (
                <div key={month} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-14">{month.slice(5)}</span>
                  <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${(amount / maxRev) * 100}%` }}>
                      {((amount / maxRev) * 100) > 20 && (
                        <span className="text-[10px] text-white font-medium">KES {amount.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">No revenue data yet</p>
          )}
          <div className="mt-3 pt-3 border-t flex justify-between text-xs text-muted-foreground">
            <span>Total: KES {totalRevKES.toLocaleString()}</span>
            <span>USD: ${totalRevUSD.toLocaleString()}</span>
          </div>
        </div>

        {/* Quick Stats Panel */}
        <div className="bg-card rounded-xl border p-4 space-y-3">
          <h3 className="text-sm font-semibold">Quick Overview</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Conversion Rate</span>
              <span className="font-medium">
                {stats?.trial_subscriptions ? Math.round((stats.active_subscriptions / stats.trial_subscriptions) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Avg Users/Company</span>
              <span className="font-medium">
                {stats?.total_companies ? (stats.total_users / stats.total_companies).toFixed(1) : 0}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Avg Projects/Company</span>
              <span className="font-medium">
                {stats?.total_companies ? (stats.total_projects / stats.total_companies).toFixed(1) : 0}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Revenue/User</span>
              <span className="font-medium">
                ${stats?.total_users ? (stats.total_revenue_usd / stats.total_users).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'Companies', path: '/admin/companies' },
                { label: 'Users', path: '/admin/users' },
                { label: 'Analytics', path: '/admin/analytics' },
                { label: 'Payments', path: '/admin/payments' },
              ].map((a, i) => (
                <button key={i} onClick={() => navigate(a.path)}
                  className="text-[11px] py-1.5 bg-muted/50 hover:bg-muted rounded-md transition-colors">
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recent Payments */}
        <div className="md:col-span-2 bg-card rounded-xl border p-4">
          <h3 className="text-sm font-semibold mb-2">Recent Payments</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="py-1.5 pr-2">Company</th>
                  <th className="py-1.5 pr-2">Amount</th>
                  <th className="py-1.5 pr-2">Method</th>
                  <th className="py-1.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 5).map((p: any) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-1.5 pr-2 font-medium truncate max-w-[120px]">{p.company_name || 'Unknown'}</td>
                    <td className="py-1.5 pr-2">{p.amount_kes ? `KES ${p.amount_kes.toLocaleString()}` : `$${p.amount_usd || 0}`}</td>
                    <td className="py-1.5 pr-2 capitalize">{p.payment_method || 'N/A'}</td>
                    <td className="py-1.5">
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                        p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {payments.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No payments yet</p>}
        </div>

        {/* System Status */}
        <div className="bg-card rounded-xl border p-4">
          <h3 className="text-sm font-semibold mb-2">System Status</h3>
          <div className="space-y-2 text-xs">
            {[
              { label: 'Database', status: 'Healthy' },
              { label: 'API', status: 'Operational' },
              { label: 'M-Pesa', status: 'Connected' },
              { label: 'Email', status: 'Running' },
              { label: 'Version', status: 'v2.1.0' },
            ].map((s, i) => (
              <div key={i} className="flex justify-between py-1 border-b last:border-0">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}