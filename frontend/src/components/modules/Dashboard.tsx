import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { API_BASE_URL } from '@/config/api';
import { formatCurrency } from '@/lib/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, FolderKanban, Banknote, Crown, Rocket, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Dashboard() {
  const navigate = useNavigate();
  const { projects, income, expenses, selectedProjectId } = useAppStore();
  const [subscription, setSubscription] = useState<any>(null);
  const [limits, setLimits] = useState({
    projects: { current: 0, max: 0 },
    workers: { current: 0, max: 0 },
    users: { current: 0, max: 0 }
  });

  const filteredIncome = selectedProjectId ? income.filter(i => i.projectId === selectedProjectId) : income;
  const filteredExpenses = selectedProjectId ? expenses.filter(e => e.projectId === selectedProjectId) : expenses;

  const totalIncome = filteredIncome.reduce((s, i) => s + i.amountReceived, 0);
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const cashFlow = totalIncome - totalExpenses;
  const activeProjects = projects.filter(p => p.status === 'Active').length;

  useEffect(() => {
    fetchSubscription();
    fetchLimits();
  }, []);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/subscription/current`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchLimits = async () => {
    const token = localStorage.getItem('token');
    try {
      const [projectRes, workerRes, userRes] = await Promise.all([
        fetch(`${API_BASE_URL}/subscription/check-limit?type=project`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/subscription/check-limit?type=worker`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/subscription/check-limit?type=user`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      setLimits({
        projects: await projectRes.json(),
        workers: await workerRes.json(),
        users: await userRes.json()
      });
    } catch (error) {
      console.error('Error fetching limits:', error);
    }
  };

  const handleUpgrade = () => {
    navigate('/settings/billing');
  };

  const trialDays = subscription?.status === 'trial' && subscription?.trial_days_remaining > 0 
    ? subscription.trial_days_remaining 
    : null;

  const getNextPlan = () => {
    const currentPlan = subscription?.plan_name;
    if (currentPlan === 'free') return 'Basic';
    if (currentPlan === 'basic') return 'Pro';
    if (currentPlan === 'pro') return 'Premier';
    return null;
  };

  const nextPlan = getNextPlan();

  // Monthly cash flow
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { month: d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }), key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` };
  });

  const cashFlowData = months.map(m => {
    const mIncome = filteredIncome.filter(i => i.paymentDate?.startsWith(m.key)).reduce((s, i) => s + i.amountReceived, 0);
    const mExpense = filteredExpenses.filter(e => e.date.startsWith(m.key)).reduce((s, e) => s + e.amount, 0);
    return { name: m.month, income: mIncome / 1000000, expenses: mExpense / 1000000 };
  });

  // Expense by category
  const catMap = filteredExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);
  const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value }));
  const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const cards = [
    { label: 'Active Projects', value: activeProjects.toString(), icon: <FolderKanban size={18} />, color: 'text-blue-400' },
    { label: 'Total Income', value: formatCurrency(totalIncome), icon: <TrendingUp size={18} />, color: 'text-green-400' },
    { label: 'Total Expenses', value: formatCurrency(totalExpenses), icon: <TrendingDown size={18} />, color: 'text-red-400' },
    { label: 'Cash Flow', value: formatCurrency(cashFlow), icon: <Banknote size={18} />, color: cashFlow >= 0 ? 'text-green-400' : 'text-red-400' },
  ];

  const customTooltipStyles = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '11px',
    padding: '6px 10px',
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Single Top Bar with Dashboard and all subscription info */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Dashboard Title */}
          <div>
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
          </div>
          
          {/* Subscription Info - All in one line */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Plan Badge */}
            <div className="flex items-center gap-2">
              <div className="p-1 bg-amber-500/10 rounded-lg">
                <Crown size={14} className="text-amber-400" />
              </div>
              <span className="font-medium text-white text-sm">{subscription?.display_name || 'Free'}</span>
              {trialDays && (
                <span className="text-xs text-amber-400">{trialDays}d left</span>
              )}
            </div>
            
            {/* Divider */}
            <div className="h-5 w-px bg-slate-600" />
            
            {/* Progress Bars - Compact horizontal */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-12">Projects</span>
                <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min((limits.projects.current / limits.projects.max) * 100, 100)}%` }} />
                </div>
                <span className="text-xs text-slate-400">{limits.projects.current}/{limits.projects.max}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-12">Workers</span>
                <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min((limits.workers.current / limits.workers.max) * 100, 100)}%` }} />
                </div>
                <span className="text-xs text-slate-400">{limits.workers.current}/{limits.workers.max}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-12">Team</span>
                <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min((limits.users.current / limits.users.max) * 100, 100)}%` }} />
                </div>
                <span className="text-xs text-slate-400">{limits.users.current}/{limits.users.max}</span>
              </div>
            </div>
            
            {/* Upgrade Button */}
            {subscription?.plan_name !== 'premier' && nextPlan && (
              <>
                <div className="h-5 w-px bg-slate-600" />
                <Button 
                  size="sm"
                  onClick={handleUpgrade}
                  className="h-7 text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-3 gap-1"
                >
                  <Rocket size={12} />
                  Upgrade to {nextPlan}
                  <ChevronRight size={12} />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Metric Cards - 4 in a row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-card rounded-xl border border-border p-4 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{c.label}</span>
              <span className={c.color}>{c.icon}</span>
            </div>
            <p className="text-2xl font-bold text-card-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Charts - Side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-card-foreground">Monthly Cash Flow</h3>
            <span className="text-xs text-muted-foreground">(in millions)</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={cashFlowData}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#334155" />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#334155" />
              <Tooltip contentStyle={customTooltipStyles} />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Expenses by Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={{ stroke: '#64748b' }}>
                  {pieData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={customTooltipStyles} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No expense data</div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 font-medium text-muted-foreground">Date</th>
                <th className="pb-2 font-medium text-muted-foreground">Type</th>
                <th className="pb-2 font-medium text-muted-foreground">Description</th>
                <th className="pb-2 font-medium text-muted-foreground text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ...filteredIncome.map(i => ({ date: i.paymentDate || i.date, type: 'Income' as const, desc: `Certificate ${i.certificateNo}`, amount: i.amountReceived })),
                ...filteredExpenses.map(e => ({ date: e.date, type: 'Expense' as const, desc: e.description, amount: -e.amount })),
              ]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 6)
                .map((t, i) => (
                  <tr key={i} className="hover:bg-muted/50 transition-colors">
                    <td className="py-2.5">{new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td><span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${t.type === 'Income' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{t.type}</span></td>
                    <td className="text-card-foreground">{t.desc}</td>
                    <td className={`text-right font-mono ${t.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(Math.abs(t.amount))}</td>
                  </tr>
                ))}
              {filteredIncome.length === 0 && filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">No transactions yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}