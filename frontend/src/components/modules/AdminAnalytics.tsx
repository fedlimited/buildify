import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import api from '@/services/api';
import {
  TrendingUp, TrendingDown, DollarSign, Users, CreditCard,
  Activity, BarChart3, PieChart, Loader2, Download, Printer,
  Calendar, ArrowUpRight, ArrowDownRight, RefreshCw,
  FileText, Receipt, Calculator
} from 'lucide-react';

interface RevenueData {
  month: string;
  revenue_kes: number;
  revenue_usd: number;
  transactions: number;
}

interface PlanRevenue {
  plan_name: string;
  revenue: number;
  count: number;
}

interface GrowthData {
  month: string;
  new_companies: number;
  new_users: number;
  churned: number;
}

export function AdminAnalytics() {
  const navigate = useNavigate();
  const { authUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'growth' | 'tax'>('overview');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [planRevenue, setPlanRevenue] = useState<PlanRevenue[]>([]);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState('12');

  useEffect(() => {
    if (authUser && !authUser.isSuperAdmin) {
      navigate('/dashboard');
    }
  }, [authUser, navigate]);

  useEffect(() => {
    loadAllData();
  }, [dateRange]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsData, paymentsData] = await Promise.all([
        api.getSuperAdminStats(),
        api.getAllPayments(),
      ]);
      setStats(statsData);
      setPayments(paymentsData);
      
      // Process revenue data from payments
      processRevenueData(paymentsData);
      processGrowthData(statsData);
      processPlanRevenue(paymentsData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const processRevenueData = (payments: any[]) => {
    const monthly: Record<string, RevenueData> = {};
    payments.filter(p => p.status === 'completed').forEach(p => {
      const month = new Date(p.paid_at || p.created_at).toISOString().slice(0, 7);
      if (!monthly[month]) {
        monthly[month] = { month, revenue_kes: 0, revenue_usd: 0, transactions: 0 };
      }
      monthly[month].revenue_kes += p.amount_kes || 0;
      monthly[month].revenue_usd += p.amount_usd || 0;
      monthly[month].transactions += 1;
    });
    setRevenueData(Object.values(monthly).sort((a, b) => b.month.localeCompare(a.month)));
  };

  const processPlanRevenue = (payments: any[]) => {
    const plans: Record<string, PlanRevenue> = {};
    payments.filter(p => p.status === 'completed').forEach(p => {
      const plan = p.plan_name || 'Unknown';
      if (!plans[plan]) plans[plan] = { plan_name: plan, revenue: 0, count: 0 };
      plans[plan].revenue += p.amount_kes || 0;
      plans[plan].count += 1;
    });
    setPlanRevenue(Object.values(plans));
  };

  const processGrowthData = (stats: any) => {
    // Simplified - you can expand with real growth data
    setGrowthData([
      { month: new Date().toISOString().slice(0, 7), new_companies: stats.total_companies || 0, new_users: stats.total_users || 0, churned: 0 }
    ]);
  };

  const totalRevenueKES = payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount_kes || 0), 0);
  const totalRevenueUSD = payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount_usd || 0), 0);
  const vatRate = 0.16;
  const vatOwed = totalRevenueKES * vatRate;

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue_kes), 1);
  const maxPlanRevenue = Math.max(...planRevenue.map(d => d.revenue), 1);

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'revenue' as const, label: 'Revenue', icon: DollarSign },
    { id: 'growth' as const, label: 'Growth', icon: TrendingUp },
    { id: 'tax' as const, label: 'Tax & Invoices', icon: Calculator },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Analytics & Reports</h1>
        <p className="text-muted-foreground">Comprehensive business intelligence and financial analysis</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
        <div className="flex-1" />
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-background text-sm"
        >
          <option value="3">Last 3 months</option>
          <option value="6">Last 6 months</option>
          <option value="12">Last 12 months</option>
          <option value="all">All time</option>
        </select>
        <button onClick={loadAllData} className="p-2 hover:bg-muted rounded-lg" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* ========== OVERVIEW TAB ========== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={DollarSign} label="Total Revenue (KES)" value={`KES ${totalRevenueKES.toLocaleString()}`} color="emerald" />
            <StatCard icon={DollarSign} label="Total Revenue (USD)" value={`$${totalRevenueUSD.toLocaleString()}`} color="blue" />
            <StatCard icon={Receipt} label="Completed Payments" value={payments.filter(p => p.status === 'completed').length} color="purple" />
            <StatCard icon={Calculator} label="VAT Owed (16%)" value={`KES ${vatOwed.toLocaleString()}`} color="amber" />
          </div>

          {/* Revenue Bar Chart */}
          <div className="bg-card rounded-xl border p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Revenue (KES)</h3>
            <div className="space-y-3">
              {revenueData.slice(0, 6).reverse().map(d => (
                <div key={d.month} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20">{d.month}</span>
                  <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all flex items-center justify-end pr-2"
                      style={{ width: `${(d.revenue_kes / maxRevenue) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">
                        KES {d.revenue_kes.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {revenueData.length === 0 && <p className="text-center text-muted-foreground py-8">No revenue data yet</p>}
            </div>
          </div>

          {/* Plan Distribution */}
          <div className="bg-card rounded-xl border p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue by Plan</h3>
            <div className="space-y-3">
              {planRevenue.map(p => (
                <div key={p.plan_name} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-20">{p.plan_name}</span>
                  <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(p.revenue / maxPlanRevenue) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">
                        KES {p.revenue.toLocaleString()} ({p.count} payments)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== REVENUE TAB ========== */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon={TrendingUp} label="MRR (Monthly)" value={`KES ${(totalRevenueKES / 12).toLocaleString()}`} color="emerald" />
            <StatCard icon={Users} label="ARPU (Avg)" value={`KES ${stats?.total_users ? (totalRevenueKES / stats.total_users).toLocaleString() : 0}`} color="blue" />
            <StatCard icon={Activity} label="Avg Transaction" value={`KES ${payments.filter(p => p.status === 'completed').length ? (totalRevenueKES / payments.filter(p => p.status === 'completed').length).toLocaleString() : 0}`} color="purple" />
          </div>

          {/* Revenue Table */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Revenue Breakdown</h3>
              <button className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4">Month</th>
                  <th className="text-right py-3 px-4">Revenue (KES)</th>
                  <th className="text-right py-3 px-4">Revenue (USD)</th>
                  <th className="text-right py-3 px-4">Transactions</th>
                  <th className="text-right py-3 px-4">Growth</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.map((d, i) => {
                  const prev = revenueData[i + 1];
                  const growth = prev ? ((d.revenue_kes - prev.revenue_kes) / prev.revenue_kes * 100) : 0;
                  return (
                    <tr key={d.month} className="border-t hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium">{d.month}</td>
                      <td className="py-3 px-4 text-right font-mono">KES {d.revenue_kes.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono">${d.revenue_usd.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">{d.transactions}</td>
                      <td className={`py-3 px-4 text-right font-medium ${growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : ''}`}>
                        {i === revenueData.length - 1 ? '—' : `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========== GROWTH TAB ========== */}
      {activeTab === 'growth' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard icon={Building2} label="Total Companies" value={stats?.total_companies || 0} color="blue" />
            <StatCard icon={Users} label="Total Users" value={stats?.total_users || 0} color="green" />
            <StatCard icon={CreditCard} label="Active Subscriptions" value={stats?.active_subscriptions || 0} color="purple" />
            <StatCard icon={Activity} label="Trial Subscriptions" value={stats?.trial_subscriptions || 0} color="amber" />
          </div>

          {/* Conversion Rate */}
          <div className="bg-card rounded-xl border p-6">
            <h3 className="text-lg font-semibold mb-4">Trial → Paid Conversion</h3>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-amber-500">{stats?.trial_subscriptions || 0}</p>
                <p className="text-sm text-muted-foreground">Trials</p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-4xl font-bold text-green-500">{stats?.active_subscriptions || 0}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
              <div className="text-center ml-4">
                <p className="text-2xl font-bold">
                  {stats?.trial_subscriptions ? Math.round((stats.active_subscriptions / stats.trial_subscriptions) * 100) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== TAX & INVOICES TAB ========== */}
      {activeTab === 'tax' && (
        <div className="space-y-6">
          {/* Tax Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon={DollarSign} label="Gross Revenue (KES)" value={`KES ${totalRevenueKES.toLocaleString()}`} color="emerald" />
            <StatCard icon={Calculator} label="VAT @ 16%" value={`KES ${vatOwed.toLocaleString()}`} color="amber" />
            <StatCard icon={Receipt} label="Net Revenue" value={`KES ${(totalRevenueKES - vatOwed).toLocaleString()}`} color="blue" />
          </div>

          {/* Printable Tax Report */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Tax Report</h3>
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">
                <Printer className="w-4 h-4" /> Print Report
              </button>
            </div>
            <div className="border rounded-lg p-4 bg-muted/20">
              <h4 className="font-bold text-lg mb-2">BOCHI Construction Suite - Tax Summary</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Period: All Time | Generated: {new Date().toLocaleDateString()}
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Amount (KES)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="py-2">Gross Revenue</td><td className="text-right font-mono">{totalRevenueKES.toLocaleString()}</td></tr>
                  <tr className="border-b"><td className="py-2">VAT (16%)</td><td className="text-right font-mono">{vatOwed.toLocaleString()}</td></tr>
                  <tr className="font-bold"><td className="py-2">Net Revenue After VAT</td><td className="text-right font-mono">{(totalRevenueKES - vatOwed).toLocaleString()}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Invoices */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Recent Payments (Printable Invoices)</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Company</th>
                  <th className="text-left py-3 px-4">Method</th>
                  <th className="text-right py-3 px-4">Amount (KES)</th>
                  <th className="text-center py-3 px-4">Status</th>
                  <th className="text-center py-3 px-4">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 10).map(p => (
                  <tr key={p.id} className="border-t hover:bg-muted/30">
                    <td className="py-3 px-4">{new Date(p.paid_at || p.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{p.company_name}</td>
                    <td className="py-3 px-4 capitalize">{p.payment_method || 'N/A'}</td>
                    <td className="py-3 px-4 text-right font-mono">KES {p.amount_kes?.toLocaleString() || 0}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{p.status}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => alert(`Invoice for ${p.company_name}\nAmount: KES ${p.amount_kes?.toLocaleString()}\nDate: ${new Date(p.paid_at || p.created_at).toLocaleDateString()}\nMethod: ${p.payment_method}\nReference: ${p.mpesa_transaction_id || p.stripe_payment_intent_id || 'N/A'}`)}
                        className="p-1.5 hover:bg-muted rounded-lg"
                        title="View Invoice"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Component
function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-600',
    blue: 'bg-blue-500/10 text-blue-600',
    purple: 'bg-purple-500/10 text-purple-600',
    amber: 'bg-amber-500/10 text-amber-600',
    green: 'bg-green-500/10 text-green-600',
  };
  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colors[color] || colors.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}