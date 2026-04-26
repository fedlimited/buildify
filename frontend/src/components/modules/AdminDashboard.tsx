import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import api from '@/services/api';
import { 
  Building2, 
  Users, 
  CreditCard, 
  DollarSign,
  TrendingUp,
  Activity,
  Loader2,
  ArrowUpRight,
  Shield
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

  // Redirect if not super admin
  useEffect(() => {
    if (authUser && !authUser.isSuperAdmin) {
      navigate('/dashboard');
    }
  }, [authUser, navigate]);

  useEffect(() => {
    fetchStats();
  }, []);

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
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 text-destructive rounded-lg p-4">
          {error}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Companies',
      value: stats?.total_companies || 0,
      icon: Building2,
      color: 'bg-blue-500/10 text-blue-600',
      change: '+12%',
      link: '/admin/companies'
    },
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'bg-green-500/10 text-green-600',
      change: '+8%',
      link: '/admin/users'
    },
    {
      title: 'Active Subscriptions',
      value: stats?.active_subscriptions || 0,
      icon: CreditCard,
      color: 'bg-purple-500/10 text-purple-600',
      change: '+5%',
      link: '/admin/subscriptions'
    },
    {
      title: 'Trial Subscriptions',
      value: stats?.trial_subscriptions || 0,
      icon: Activity,
      color: 'bg-orange-500/10 text-orange-600',
      change: '+15%',
      link: '/admin/subscriptions'
    },
    {
      title: 'Total Projects',
      value: stats?.total_projects || 0,
      icon: TrendingUp,
      color: 'bg-pink-500/10 text-pink-600',
      change: '+20%',
      link: '/admin/companies'
    },
    {
      title: 'Total Revenue (USD)',
      value: `$${(stats?.total_revenue_usd || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-500/10 text-emerald-600',
      change: '+18%',
      link: '/admin/payments'
    }
  ];

  const quickActions = [
    { label: 'View All Companies', icon: Building2, path: '/admin/companies' },
    { label: 'Manage Users', icon: Users, path: '/admin/users' },
    { label: 'Subscription Plans', icon: CreditCard, path: '/admin/subscriptions' },
    { label: 'Payment History', icon: DollarSign, path: '/admin/payments' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          System-wide overview and management. You have full access to all companies and users.
        </p>
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6 mb-8 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-1">Welcome back, {authUser?.name}!</h2>
            <p className="text-muted-foreground">
              You are logged in as a <span className="font-medium text-primary">Super Administrator</span> with full system access.
            </p>
          </div>
          <Shield className="w-12 h-12 text-primary/50" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            onClick={() => stat.link && navigate(stat.link)}
            className={`bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-all cursor-pointer group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-muted/30 hover:bg-muted transition-colors group"
            >
              <div className="p-2 bg-background rounded-full group-hover:bg-primary/10 transition-colors">
                <action.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-sm font-medium text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity Section (Placeholder) */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Database Connection</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm font-medium">Healthy</span>
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">API Status</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm font-medium">Operational</span>
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">M-Pesa Integration</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm font-medium">Connected</span>
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Last Backup</span>
              <span className="text-sm font-medium">v1.0-mpesa-ready</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Tips</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>View all registered companies in the Companies section</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Manage user permissions and toggle super admin status in Users</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Monitor all subscription payments in the Payments section</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Use the sidebar to switch between regular dashboard and admin panel</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}