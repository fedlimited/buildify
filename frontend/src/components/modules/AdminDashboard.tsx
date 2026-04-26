import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import api from '@/services/api';
import { 
  Building2, Users, CreditCard, DollarSign,
  TrendingUp, Activity, Loader2, ArrowUpRight,
  Shield, BarChart3, CheckCircle, Clock, AlertCircle
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authUser && !authUser.isSuperAdmin) navigate('/dashboard');
  }, [authUser, navigate]);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getSuperAdminStats();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Failed to load system statistics');
    } finally {
      setLoading(false);
    }
  };

  if (!authUser?.isSuperAdmin) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (error) {
    return <div className="p-6"><div className="bg-destructive/10 text-destructive rounded-lg p-4">{error}</div></div>;
  }

  const statCards = [
    { title: 'Total Companies', value: stats?.total_companies || 0, icon: Building2, color: 'blue', path: '/admin/companies' },
    { title: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'green', path: '/admin/users' },
    { title: 'Active Subscriptions', value: stats?.active_subscriptions || 0, icon: CreditCard, color: 'purple', path: '/admin/subscriptions' },
    { title: 'Trial Subscriptions', value: stats?.trial_subscriptions || 0, icon: Clock, color: 'amber', path: '/admin/subscriptions' },
    { title: 'Total Projects', value: stats?.total_projects || 0, icon: TrendingUp, color: 'pink', path: '/admin/companies' },
    { title: 'Revenue (USD)', value: `$${(stats?.total_revenue_usd || 0).toLocaleString()}`, icon: DollarSign, color: 'emerald', path: '/admin/payments' },
  ];

  const quickActions = [
    { label: 'Companies', icon: Building2, path: '/admin/companies', desc: 'Manage all registered companies' },
    { label: 'Users', icon: Users, path: '/admin/users', desc: 'View and manage system users' },
    { label: 'Analytics', icon: BarChart3, path: '/admin/analytics', desc: 'Revenue, growth & tax reports' },
    { label: 'Testimonials', icon: CheckCircle, path: '/admin/testimonials', desc: 'Approve user testimonials' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Welcome back, {authUser?.name}. System overview at a glance.
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>Last updated: {new Date().toLocaleTimeString()}</p>
          <button onClick={fetchStats} className="text-primary hover:underline mt-1">Refresh</button>
        </div>
      </div>

      {/* Stat Cards - Clean 3-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            onClick={() => stat.path && navigate(stat.path)}
            className="group bg-card hover:bg-accent/5 rounded-xl border p-5 cursor-pointer transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-lg bg-${stat.color}-500/10`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl border p-5">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted transition-colors text-left group"
            >
              <div className="p-2 bg-background rounded-lg group-hover:bg-primary/10 transition-colors">
                <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{action.label}</p>
                <p className="text-xs text-muted-foreground truncate">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <div className="bg-card rounded-xl border p-5">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">System Status</h2>
          <div className="space-y-3">
            {[
              { label: 'Database', status: 'Healthy', color: 'green' },
              { label: 'API', status: 'Operational', color: 'green' },
              { label: 'M-Pesa Integration', status: 'Connected', color: 'green' },
              { label: 'Email Service', status: 'Running', color: 'green' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm">{item.label}</span>
                <span className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full bg-${item.color}-500`}></span>
                  <span className="text-muted-foreground">{item.status}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Info */}
        <div className="bg-card rounded-xl border p-5">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Information</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p>Use the sidebar to navigate between different admin sections. You have full system access.</p>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p>Company details page now has an "Edit Plan" button to manually upgrade/downgrade subscriptions.</p>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <p>Analytics section provides revenue reports, tax summaries, and printable VAT invoices.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}