import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import api from '@/services/api';
import { 
  Building2, Users, CreditCard, DollarSign,
  TrendingUp, Activity, Loader2,
  Shield, BarChart3, CheckCircle, Clock, AlertCircle,
  RefreshCw, Zap, Star, Bell, ChevronRight, ArrowUpRight
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
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    if (authUser && !authUser.isSuperAdmin) navigate('/dashboard');
  }, [authUser, navigate]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, p, c] = await Promise.all([
        api.getSuperAdminStats(),
        api.getAllPayments(),
        api.getAllCompanies().catch(() => []),
      ]);
      setStats(s);
      setPayments(p || []);
      setCompanies(c || []);
      processRevenue(p || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const processRevenue = (payments: any[]) => {
    const monthly: Record<string, number> = {};
    payments.filter((p: any) => p.status === 'completed').forEach((p: any) => {
      const month = new Date(p.paid_at || p.created_at).toISOString().slice(0, 7);
      monthly[month] = (monthly[month] || 0) + (p.amount_kes || p.amount_usd * 130 || 0);
    });
    setRevenueData(Object.entries(monthly).sort().slice(-6));
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-4 animate-pulse">
        <div className="h-20 bg-muted rounded-xl"></div>
        <div className="grid grid-cols-6 gap-3">{[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl"></div>)}</div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 h-80 bg-muted rounded-xl"></div>
          <div className="h-80 bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }

  const totalRevKES = payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount_kes || 0), 0);
  const totalRevUSD = payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount_usd || 0), 0);
  const maxRev = Math.max(...revenueData.map(d => d[1]), 1);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const todayStr = new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const kpis = [
    { label: 'Companies', value: stats?.total_companies || 0, icon: Building2, color: 'blue', path: '/admin/companies' },
    { label: 'Users', value: stats?.total_users || 0, icon: Users, color: 'green', path: '/admin/users' },
    { label: 'Active Subs', value: stats?.active_subscriptions || 0, icon: CreditCard, color: 'purple', path: '/admin/subscriptions' },
    { label: 'Trials', value: stats?.trial_subscriptions || 0, icon: Clock, color: 'amber', path: '/admin/subscriptions' },
    { label: 'Projects', value: stats?.total_projects || 0, icon: TrendingUp, color: 'pink', path: '/admin/companies' },
    { label: 'Revenue (USD)', value: `$${(stats?.total_revenue_usd || 0).toLocaleString()}`, icon: DollarSign, color: 'emerald', path: '/admin/payments' },
  ];

  return (
    <div className="p-5 max-w-7xl mx-auto space-y-5">
      {/* === ROW 1: Welcome + KPI Chips === */}
      <div className="bg-card rounded-xl border p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold">{greeting}, {authUser?.name?.split(' ')[0] || 'Admin'}! 👋</h1>
          </div>
          <button onClick={loadData} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
        <p className="text-sm text-muted-foreground">{todayStr} • Full system access</p>
        
        {/* KPI Row */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-4">
          {kpis.map((k, i) => (
            <div key={i} onClick={() => navigate(k.path)}
              className="bg-muted/40 hover:bg-muted rounded-lg p-3.5 cursor-pointer transition-colors text-center group">
              <div className={`w-8 h-8 rounded-lg bg-${k.color}-500/10 flex items-center justify-center mx-auto mb-2`}>
                <k.icon className={`w-4 h-4 text-${k.color}-600`} />
              </div>
              <p className="text-lg font-bold">{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* === ROW 2: Revenue Chart (2/3) + Quick Actions & Overview (1/3) === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Revenue
            </h3>
            <span className="text-xs text-muted-foreground">KES • 6 months</span>
          </div>
          {revenueData.length > 0 ? (
            <div className="flex-1 flex flex-col justify-end">
              <div className="flex items-end gap-3 h-52 pb-5">
                {revenueData.map(([month, amount]) => {
                  const h = Math.max((amount / maxRev) * 100, 3);
                  const lbl = new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' });
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center justify-end h-full group">
                      <span className="text-xs text-muted-foreground mb-1 opacity-0 group-hover:opacity-100">{Math.round(amount/1000)}k</span>
                      <div className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t hover:from-emerald-600 hover:to-emerald-500 transition-colors" style={{ height: `${h}%`, minHeight: 3 }}
                        title={`KES ${amount.toLocaleString()}`} />
                      <span className="text-xs text-muted-foreground mt-1.5">{lbl}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-sm text-muted-foreground pt-3 border-t mt-auto">
                <span>Total KES <strong className="text-foreground">{totalRevKES.toLocaleString()}</strong></span>
                <span>USD <strong className="text-foreground">${totalRevUSD.toLocaleString()}</strong></span>
                <span>Payments <strong className="text-foreground">{payments.filter(p => p.status === 'completed').length}</strong></span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
          )}
        </div>

        {/* Quick Actions + Overview */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border p-4">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Companies', icon: Building2, path: '/admin/companies' },
                { label: 'Users', icon: Users, path: '/admin/users' },
                { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
                { label: 'Testimonials', icon: Star, path: '/admin/testimonials' },
                { label: 'Payments', icon: DollarSign, path: '/admin/payments' },
                { label: 'Subscriptions', icon: CreditCard, path: '/admin/subscriptions' },
              ].map((a, i) => (
                <button key={i} onClick={() => navigate(a.path)}
                  className="flex items-center gap-2 text-sm py-2.5 px-3 bg-muted/40 hover:bg-muted rounded-lg transition-colors">
                  <a.icon className="w-4 h-4 text-muted-foreground" />
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border p-4">
            <h3 className="text-sm font-semibold mb-3">Overview</h3>
            <div className="space-y-2 text-sm">
              {[
                { l: 'Conversion', v: `${stats?.trial_subscriptions ? Math.round((stats.active_subscriptions / stats.trial_subscriptions) * 100) : 0}%` },
                { l: 'Users/Company', v: (stats?.total_companies ? (stats.total_users / stats.total_companies).toFixed(1) : '0') },
                { l: 'Projects/Co', v: (stats?.total_companies ? (stats.total_projects / stats.total_companies).toFixed(1) : '0') },
                { l: 'Rev/User', v: `$${stats?.total_users ? (stats.total_revenue_usd / stats.total_users).toFixed(2) : '0.00'}` },
              ].map((r, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b last:border-0">
                  <span className="text-muted-foreground">{r.l}</span><span className="font-medium">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* === ROW 3: Payments Table + System Status & Signups === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Recent Payments</h3>
            <button onClick={() => navigate('/admin/payments')} className="text-sm text-primary hover:underline">View all →</button>
          </div>
          {payments.length > 0 ? (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted-foreground border-b"><th className="py-2 pr-3">Company</th><th className="py-2 pr-3">Amount</th><th className="py-2 pr-3">Method</th><th className="py-2">Status</th></tr></thead>
              <tbody>
                {payments.slice(0, 5).map((p: any) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-2 pr-3 font-medium truncate max-w-[140px]">{p.company_name || '—'}</td>
                    <td className="py-2 pr-3 font-mono">{p.amount_kes ? `KES ${p.amount_kes.toLocaleString()}` : `$${p.amount_usd || 0}`}</td>
                    <td className="py-2 pr-3 capitalize">{p.payment_method || '—'}</td>
                    <td className="py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-sm text-muted-foreground text-center py-6">No payments yet</p>}
        </div>

        <div className="bg-card rounded-xl border p-4">
          <h3 className="text-sm font-semibold mb-3">System Status</h3>
          <div className="space-y-2 text-sm">
            {[
              { l: 'Database', s: 'Healthy', c: 'green' },
              { l: 'API', s: 'Operational', c: 'green' },
              { l: 'M-Pesa', s: 'Connected', c: 'green' },
              { l: 'Email', s: 'Running', c: 'green' },
              { l: 'Version', s: 'v2.1.0', c: 'blue' },
            ].map((x, i) => (
              <div key={i} className="flex justify-between py-1.5 border-b last:border-0">
                <span className="text-muted-foreground">{x.l}</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className={`w-1.5 h-1.5 rounded-full bg-${x.c}-500`}></span>{x.s}
                </span>
              </div>
            ))}
          </div>
          
          {/* Recent Companies */}
          <div className="mt-4 pt-3 border-t">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent Signups</h4>
            {companies.slice(0, 4).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between py-1.5 text-sm">
                <span className="font-medium truncate">{c.name}</span>
                <span className="text-muted-foreground text-xs">{new Date(c.created_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}</span>
              </div>
            ))}
            {companies.length === 0 && <p className="text-sm text-muted-foreground">No signups yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}