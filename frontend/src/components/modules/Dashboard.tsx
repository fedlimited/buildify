import { useAppStore } from '@/hooks/useAppStore';
import { formatCurrency, calculateVAT, calculateRetention } from '@/lib/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, FolderKanban, Banknote } from 'lucide-react';

export function Dashboard() {
  const { projects, income, expenses, selectedProjectId, theme } = useAppStore();

  const filteredIncome = selectedProjectId ? income.filter(i => i.projectId === selectedProjectId) : income;
  const filteredExpenses = selectedProjectId ? expenses.filter(e => e.projectId === selectedProjectId) : expenses;

  const totalIncome = filteredIncome.reduce((s, i) => s + i.amountReceived, 0);
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const cashFlow = totalIncome - totalExpenses;
  const activeProjects = projects.filter(p => p.status === 'Active').length;

  // Monthly cash flow (last 6 months)
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
    { label: 'Active Projects', value: activeProjects.toString(), icon: <FolderKanban size={22} />, color: 'text-info' },
    { label: 'Total Income', value: formatCurrency(totalIncome), icon: <TrendingUp size={22} />, color: 'text-success' },
    { label: 'Total Expenses', value: formatCurrency(totalExpenses), icon: <TrendingDown size={22} />, color: 'text-destructive' },
    { label: 'Cash Flow', value: formatCurrency(cashFlow), icon: <Banknote size={22} />, color: cashFlow >= 0 ? 'text-success' : 'text-destructive' },
  ];

  // Custom tooltip styles that respect the theme
  const customTooltipStyles = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 'var(--radius)',
    fontSize: '12px',
    color: 'hsl(var(--card-foreground))',
    padding: '8px 12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const customLabelStyles = {
    color: 'hsl(var(--card-foreground))',
    fontWeight: 500,
  };

  const customItemStyles = {
    color: 'hsl(var(--card-foreground))',
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-card rounded-xl border border-border p-5 slide-up">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">{c.label}</span>
              <span className={c.color}>{c.icon}</span>
            </div>
            <p className="text-xl font-bold text-card-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Monthly Cash Flow (Millions)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={cashFlowData}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                stroke="hsl(var(--muted-foreground))" 
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                stroke="hsl(var(--muted-foreground))" 
              />
              <Tooltip 
                contentStyle={customTooltipStyles}
                labelStyle={customLabelStyles}
                itemStyle={customItemStyles}
                cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
              />
              <Bar dataKey="income" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Expenses by Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie 
                  data={pieData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={50} 
                  outerRadius={90} 
                  dataKey="value" 
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                >
                  {pieData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                </Pie>
                <Tooltip 
                  formatter={(v: number) => formatCurrency(v)}
                  contentStyle={customTooltipStyles}
                  labelStyle={customLabelStyles}
                  itemStyle={customItemStyles}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No expense data</div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card rounded-xl border border-border p-5">
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
                .slice(0, 8)
                .map((t, i) => (
                  <tr key={i} className="hover:bg-muted/50 transition-colors">
                    <td className="py-2.5">{new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td><span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${t.type === 'Income' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{t.type}</span></td>
                    <td className="text-card-foreground">{t.desc}</td>
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