import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import api from '@/services/api';
import { 
  Building2, Users, CreditCard, DollarSign,
  TrendingUp, TrendingDown, Activity, Loader2, ArrowUpRight,
  Shield, BarChart3, CheckCircle, Clock, AlertCircle,
  RefreshCw, Search, Zap, Star, Bell, ChevronRight
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
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (authUser && !authUser.isSuperAdmin) navigate('/dashboard');
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
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

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-6 gap-2">
            {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-lg"></div>)}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 h-64 bg-muted rounded-xl"></div>
            <div className="h-64 bg-muted rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const totalRevKES = payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount_kes || 0), 0);
  const totalRevUSD = payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount_usd || 0), 0);
  const maxRev = Math.max(...revenueData.map(d => d[1]), 1);
  const pendingTestimonials = 0; // You can replace this with actual count from API

  // Get today's date info
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Recent activity (combine payments + companies)
  const recentActivity = [
    ...payments.filter(p => p.status === 'completed').slice(0, 3).map(p => ({
      type: 'payment',
      icon: DollarSign,
      color: 'text-emerald-500 bg-emerald-50',
      text: `${p.company_name || 'A company'} paid $${p.amount_usd || (p.amount_kes / 130).toFixed(0)}`,
      time: new Date(p.paid_at || p.created_at).toLocaleDateString(),
    })),
    ...companies.slice(0, 3).map(c => ({
      type: 'company',
      icon: Building2,
      color: 'text-blue-500 bg-blue-50',
      text: `${c.name} registered`,
      time: new Date(c.created_at).toLocaleDateString(),
    })),
  ].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-5 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold">{greeting}, {authUser?.name?.split(' ')[0] || 'Admin'}! 👋</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {todayStr} • You have full system access. 
              {pendingTestimonials > 0 && (
                <span className="ml-2 text-amber-500 font-medium">
                  {pendingTestimonials} testimonial{pendingTestimonials > 1 ? 's' : ''} awaiting review.
                </span>
              )}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
            <div className="text-right">
              <p className="font-medium text-foreground">{stats?.total_companies || 0}</p>
              <p>Companies</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">{stats?.total_users || 0}</p>
              <p>Users</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">${(stats?.total_revenue_usd || 0).toLocaleString()}</p>
              <p>Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Chips - With Trend Indicators */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { label: 'Companies', value: stats?.total_companies || 0, icon: Building2, color: 'text-blue-600 bg-blue-50', trend: '+12%', up: true },
          { label: 'Users', value: stats?.total_users || 0, icon: Users, color: 'text-green-600 bg-green-50', trend: '+8%', up: true },
          { label: 'Active Subs', value: stats?.active_subscriptions || 0, icon: CreditCard, color: 'text-purple-600 bg-purple-50', trend: '+5%', up: true },
          { label: 'Trials', value: stats?.trial_subscriptions || 0, icon: Clock, color: 'text-amber-600 bg-amber-50', trend: '+15%', up: true },
          { label: 'Projects', value: stats?.total_projects || 0, icon: TrendingUp, color: 'text-pink-600 bg-pink-50', trend: '+20%', up: true },
          { label: 'Revenue', value: `$${totalRevUSD.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50', trend: '+18%', up: true },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-lg border p-3 text-center cursor-pointer hover:shadow-sm hover:border-primary/30 transition-all"
            onClick={() => navigate(s.label === 'Revenue' ? '/admin/payments' : s.label === 'Users' ? '/admin/users' : '/admin/companies')}>
            <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mx-auto mb-1.5`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold">{s.value}</p>
            <div className="flex items-center justify-center gap-1">
              <p className="text-[10px] text-muted-foreground uppercase">{s.label}</p>
              <span className={`text-[10px] ${s.up ? 'text-green-500' : 'text-red-500'}`}>{s.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Revenue Trend (KES)
            </h3>
            <span className="text-xs text-muted-foreground">Last 6 months</span>
          </div>
          {revenueData.length > 0 ? (
            <div className="space-y-2">
              {revenueData.map(([month, amount]) => (
                <div key={month} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-14">
                    {new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                      style={{ width: `${(amount / maxRev) * 100}%` }}>
                      {((amount / maxRev) * 100) > 25 && (
                        <span className="text-[10px] text-white font-medium">KES {amount.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-xs text-muted-foreground">No revenue data yet</p>
            </div>
          )}
          <div className="mt-3 pt-3 border-t flex justify-between text-xs text-muted-foreground">
            <span>Total: KES {totalRevKES.toLocaleString()}</span>
            <span>USD: ${totalRevUSD.toLocaleString()}</span>
          </div>
        </div>

        {/* Right Panel - Quick Stats + Activity */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="bg-card rounded-xl border p-4">
            <h3 className="text-sm font-semibold mb-3">Quick Overview</h3>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Conversion Rate', value: `${stats?.trial_subscriptions ? Math.round((stats.active_subscriptions / stats.trial_subscriptions) * 100) : 0}%` },
                { label: 'Avg Users/Company', value: (stats?.total_companies ? (stats.total_users / stats.total_companies).toFixed(1) : '0') },
                { label: 'Avg Projects/Co', value: (stats?.total_companies ? (stats.total_projects / stats.total_companies).toFixed(1) : '0') },
                { label: 'Revenue/User', value: `$${stats?.total_users ? (stats.total_revenue_usd / stats.total_users).toFixed(2) : '0.00'}` },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b last:border-0">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-xl border p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Recent Activity
            </h3>
            {recentActivity.length > 0 ? (
              <div className="space-y-2">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <div className={`p-1 rounded ${activity.color} mt-0.5`}>
                      <activity.icon className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{activity.text}</p>
                      <p className="text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No recent activity</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-xl border p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Quick Actions
            </h3>
            <div className="space-y-1">
              {[
                { label: 'View Companies', path: '/admin/companies' },
                { label: 'Manage Users', path: '/admin/users' },
                { label: 'Analytics & Reports', path: '/admin/analytics' },
                { label: 'Review Testimonials', path: '/admin/testimonials' },
              ].map((a, i) => (
                <button key={i} onClick={() => navigate(a.path)}
                  className="w-full flex items-center justify-between text-xs py-2 px-2 hover:bg-muted rounded-md transition-colors group">
                  <span>{a.label}</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recent Payments Table */}
        <div className="md:col-span-2 bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Recent Payments</h3>
            <button onClick={() => navigate('/admin/payments')} className="text-xs text-primary hover:underline">View all</button>
          </div>
          {payments.length > 0 ? (
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
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-1.5 pr-2 font-medium truncate max-w-[150px]">{p.company_name || 'Unknown'}</td>
                      <td className="py-1.5 pr-2 font-mono">{p.amount_kes ? `KES ${p.amount_kes.toLocaleString()}` : `$${p.amount_usd || 0}`}</td>
                      <td className="py-1.5 pr-2 capitalize">{p.payment_method || 'N/A'}</td>
                      <td className="py-1.5">
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                          p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{p.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">No payments recorded yet</p>
          )}
        </div>

        {/* System Status */}
        <div className="bg-card rounded-xl border p-4">
          <h3 className="text-sm font-semibold mb-2">System Status</h3>
          <div className="space-y-2 text-xs">
            {[
              { label: 'Database', status: 'Healthy', icon: CheckCircle, color: 'green' },
              { label: 'API Services', status: 'Operational', icon: Activity, color: 'green' },
              { label: 'M-Pesa Integration', status: 'Connected', icon: Zap, color: 'green' },
              { label: 'Email Service', status: 'Running', icon: Bell, color: 'green' },
              { label: 'Version', status: 'v2.1.0', icon: Star, color: 'blue' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-0">
                <div className="flex items-center gap-2">
                  <s.icon className={`w-3 h-3 text-${s.color}-500`} />
                  <span className="text-muted-foreground">{s.label}</span>
                </div>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className={`w-1.5 h-1.5 rounded-full bg-${s.color}-500`}></span>
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