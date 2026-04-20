import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { API_BASE_URL } from '@/config/api';
import { formatCurrency } from '@/lib/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, FolderKanban, Banknote, Crown, ChevronRight } from 'lucide-react';
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
  const pieColors = ['hsl(210,80%,52%)', 'hsl(152,60%,40%)', 'hsl(38,92%,50%)', 'hsl(0,72%,51%)', 'hsl(270,60%,55%)', 'hsl(180,50%,45%)'];

  const cards = [
    { label: 'Active Projects', value: activeProjects.toString(), icon: <FolderKanban size={18} />, color: 'text-info' },
    { label: 'Total Income', value: formatCurrency(totalIncome), icon: <TrendingUp size={18} />, color: 'text-success' },
    { label: 'Total Expenses', value: formatCurrency(totalExpenses), icon: <TrendingDown size={18} />, color: 'text-destructive' },
    { label: 'Cash Flow', value: formatCurrency(cashFlow), icon: <Banknote size={18} />, color: cashFlow >= 0 ? 'text-success' : 'text-destructive' },
  ];

  const customTooltipStyles = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 'var(--radius)',
    fontSize: '11px',
    color: 'hsl(var(--card-foreground))',
    padding: '6px 10px',
  };

  // Progress bar component
  const ProgressBar = ({ used, limit, label }: { used: number; limit: number; label: string }) => {
    const percentage = Math.min((used / limit) * 100, 100);
    const isAtLimit = used >= limit;
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 w-12">{label}</span>
        <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${isAtLimit ? 'bg-red-500' : 'bg-amber-500'}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <span className={`text-xs font-mono ${isAtLimit ? 'text-red-400' : 'text-slate-400'}`}>
          {used}/{limit}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-5 fade-in">
      {/* Header with Dashboard title and Subscription info */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        
        {/* Compact Subscription Info */}
        <div className="flex items-center gap-4 bg-slate-800/50 rounded-lg px-3 py-1.5 border border-slate-700">
          <div className="flex items-center gap-2">
            <Crown size={14} className="text-amber-400" />
            <span className="text-sm font-medium text-white">{subscription?.display_name || 'Free'}</span>
            {trialDays && (
              <span className="text-xs text-amber-400">{trialDays}d left</span>
            )}
          </div>
          
          <div className="h-4 w-px bg-slate-600" />
          
          <div className="flex items-center gap-3">
            <ProgressBar used={limits.projects.current} limit={limits.projects.max} label="Projects" />
            <ProgressBar used={limits.workers.current} limit={limits.workers.max} label="Workers" />
            <ProgressBar used={limits.users.current} limit={limits.users.max} label="Team" />
          </div>
          
          {subscription?.plan_name !== 'premier' && subscription?.plan_name !== 'pro' && (
            <>
              <div className="h-4 w-px bg-slate-600" />
              <Button 
                size="sm"
                onClick={handleUpgrade}
                className="h-6 text-xs bg-amber-500 hover:bg-amber-600 px-3"
              >
                Upgrade <ChevronRight size={12} className="ml-0.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Metric Cards - 4 in a row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(c => (
          <div key={c.label} className="bg-card rounded-xl border border-border p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">{c.label}</span>
              <span className={c.color}>{c.icon}</span>
            </div>
            <p className="text-lg font-bold text-card-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Charts - Side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-4">
          <h3 className="text-xs font-semibold text-card-foreground mb-3">Monthly Cash Flow (Millions)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cashFlowData}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={customTooltipStyles} />
              <Bar dataKey="income" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-xs font-semibold text-card-foreground mb-3">Expenses by Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}>
                  {pieData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={customTooltipStyles} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-xs">No expense data</div>
          )}
        </div>
      </div>

      {/* Recent Transactions - Compact */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-xs font-semibold text-card-foreground mb-3">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-1.5 font-medium text-muted-foreground">Date</th>
                <th className="pb-1.5 font-medium text-muted-foreground">Type</th>
                <th className="pb-1.5 font-medium text-muted-foreground">Description</th>
                <th className="pb-1.5 font-medium text-muted-foreground text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ...filteredIncome.map(i => ({ date: i.paymentDate || i.date, type: 'Income' as const, desc: `Certificate ${i.certificateNo}`, amount: i.amountReceived })),
                ...filteredExpenses.map(e => ({ date: e.date, type: 'Expense' as const, desc: e.description, amount: -e.amount })),
              ]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((t, i) => (
                  <tr key={i} className="hover:bg-muted/50">
                    <td className="py-2">{new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td><span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${t.type === 'Income' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{t.type}</span></td>
                    <td className="text-card-foreground max-w-[150px] truncate">{t.desc}</td>
                    <td className={`text-right font-mono ${t.amount >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(Math.abs(t.amount))}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}