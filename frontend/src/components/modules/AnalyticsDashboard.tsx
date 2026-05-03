import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { formatCurrency } from '@/lib/formatters';
import { exportToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, 
  RefreshCw, Download, ArrowUpRight, ArrowDownRight,
  Target, Activity, Building2, Award
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart,
  Pie, Cell, AreaChart, Area, ComposedChart
} from 'recharts';

// Professional color palette - matches your app's primary color
const COLORS = {
  primary: '#f59e0b',
  success: '#10b981',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  orange: '#f97316',
};

export function AnalyticsDashboard() {
  const { selectedProjectId } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [filterProject, setFilterProject] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [projects, setProjects] = useState([]);
  const [data, setData] = useState({
    monthlyData: [],
    projectPerformance: [],
    categoryData: [],
    kpis: {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      profitMargin: 0,
      revenueGrowth: 0,
      expenseGrowth: 0,
      profitGrowth: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalProjects: 0,
      avgProjectValue: 0,
    }
  });

  useEffect(() => {
    async function loadProjects() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://buildify-backend-kye8.onrender.com/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const projectsData = await res.json();
        setProjects(projectsData.filter((p: any) => p.status === 'Active'));
      } catch (err) {
        console.error('Error loading projects:', err);
      }
    }
    loadProjects();
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        let income = await fetch('https://buildify-backend-kye8.onrender.com/api/income', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        
        let expenses = await fetch('https://buildify-backend-kye8.onrender.com/api/expenses', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        
        let projectsData = await fetch('https://buildify-backend-kye8.onrender.com/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        
        // Apply filters
        if (selectedProjectId && selectedProjectId !== 'all') {
          const pid = parseInt(selectedProjectId);
          income = income.filter((i: any) => i.project_id === pid);
          expenses = expenses.filter((e: any) => e.project_id === pid);
          projectsData = projectsData.filter((p: any) => p.id === pid);
        }
        if (filterProject !== 'all') {
          const pid = parseInt(filterProject);
          income = income.filter((i: any) => i.project_id === pid);
          expenses = expenses.filter((e: any) => e.project_id === pid);
          projectsData = projectsData.filter((p: any) => p.id === pid);
        }
        if (dateRange.start) {
          income = income.filter((i: any) => i.date >= dateRange.start);
          expenses = expenses.filter((e: any) => e.date >= dateRange.start);
        }
        if (dateRange.end) {
          income = income.filter((i: any) => i.date <= dateRange.end);
          expenses = expenses.filter((e: any) => e.date <= dateRange.end);
        }
        
        const currentRevenue = income.reduce((s: number, i: any) => s + (i.amount_received || i.gross_amount || 0), 0);
        const currentExpenses = expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);
        const currentProfit = currentRevenue - currentExpenses;
        const profitMargin = currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0;
        
        // Previous period
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const prevIncome = income.filter((i: any) => new Date(i.date) < threeMonthsAgo).reduce((s: number, i: any) => s + (i.amount_received || i.gross_amount || 0), 0);
        const prevExpenses = expenses.filter((e: any) => new Date(e.date) < threeMonthsAgo).reduce((s: number, e: any) => s + (e.amount || 0), 0);
        
        // Monthly data
        const monthMap = new Map();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        [...income, ...expenses].forEach((t: any) => {
          if (t.date) {
            const d = new Date(t.date);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            if (!monthMap.has(key)) {
              monthMap.set(key, { month: months[d.getMonth()], year: d.getFullYear(), revenue: 0, expenses: 0 });
            }
          }
        });
        
        const sortedMonths = Array.from(monthMap.keys()).sort();
        const monthlyData = sortedMonths.map(key => {
          const m = monthMap.get(key);
          const rev = income.filter((i: any) => new Date(i.date).toISOString().slice(0, 7) === key).reduce((s: number, i: any) => s + (i.amount_received || i.gross_amount || 0), 0);
          const exp = expenses.filter((e: any) => new Date(e.date).toISOString().slice(0, 7) === key).reduce((s: number, e: any) => s + (e.amount || 0), 0);
          const profit = rev - exp;
          const margin = rev > 0 ? (profit / rev) * 100 : 0;
          return { month: `${m.month} ${m.year}`, revenue: rev, expenses: exp, profit, margin: margin.toFixed(1) };
        });
        
        // Project performance
        const projectPerformance = projectsData.map((p: any) => {
          const rev = income.filter((i: any) => i.project_id === p.id).reduce((s: number, i: any) => s + (i.amount_received || i.gross_amount || 0), 0);
          const exp = expenses.filter((e: any) => e.project_id === p.id).reduce((s: number, e: any) => s + (e.amount || 0), 0);
          const profit = rev - exp;
          const margin = rev > 0 ? (profit / rev) * 100 : 0;
          const progress = p.contract_sum > 0 ? (rev / p.contract_sum) * 100 : 0;
          return { name: p.name, revenue: rev, expenses: exp, profit, margin: margin.toFixed(1), progress: Math.min(100, progress) };
        }).filter((p: any) => p.revenue > 0 || p.expenses > 0).sort((a: any, b: any) => b.revenue - a.revenue);
        
        // Expense categories
        const catMap = new Map();
        expenses.forEach((e: any) => {
          const cat = e.category || 'Other';
          catMap.set(cat, (catMap.get(cat) || 0) + (e.amount || 0));
        });
        const categoryData = Array.from(catMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
        
        const activeProjects = projectsData.filter((p: any) => p.status === 'Active').length;
        const completedProjects = projectsData.filter((p: any) => p.status === 'Completed').length;
        const avgProjectValue = projectsData.length > 0 ? projectsData.reduce((s: number, p: any) => s + (p.contract_sum || 0), 0) / projectsData.length : 0;
        
        setData({
          monthlyData,
          projectPerformance,
          categoryData,
          kpis: {
            totalRevenue: currentRevenue,
            totalExpenses: currentExpenses,
            netProfit: currentProfit,
            profitMargin,
            revenueGrowth: prevIncome > 0 ? ((currentRevenue - prevIncome) / prevIncome) * 100 : 0,
            expenseGrowth: prevExpenses > 0 ? ((currentExpenses - prevExpenses) / prevExpenses) * 100 : 0,
            profitGrowth: (prevIncome - prevExpenses) > 0 ? ((currentProfit - (prevIncome - prevExpenses)) / (prevIncome - prevExpenses)) * 100 : 0,
            activeProjects,
            completedProjects,
            totalProjects: projectsData.length,
            avgProjectValue,
          }
        });
        setLoading(false);
      } catch (err) {
        console.error('Error loading analytics:', err);
        setLoading(false);
      }
    }
    loadData();
  }, [selectedProjectId, filterProject, dateRange.start, dateRange.end]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw size={32} className="mx-auto mb-3 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Prepare margin trend data
  const marginData = data.monthlyData.map(m => ({ month: m.month, margin: parseFloat(m.margin) }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
          <p className="text-xs font-semibold mb-1">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} className="text-xs" style={{ color: p.color }}>
              {p.name}: {formatCurrency(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 size={24} className="text-primary" />
            Executive Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">Key metrics and performance insights</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
          >
            <option value="all">All Projects</option>
            {projects.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input
            type="date"
            className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
          <input
            type="date"
            className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
          {(dateRange.start || dateRange.end) && (
            <button
              className="px-3 py-1.5 text-sm text-red-500 hover:text-red-700"
              onClick={() => setDateRange({ start: '', end: '' })}
            >
              Clear
            </button>
          )}
          <Button variant="outline" size="sm" onClick={() => exportToCSV(data.projectPerformance, 'executive_dashboard')}>
            <Download size={14} className="mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(data.kpis.totalRevenue)}</p>
                <div className={`flex items-center gap-1 mt-1 text-xs ${data.kpis.revenueGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {data.kpis.revenueGrowth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(data.kpis.revenueGrowth).toFixed(1)}% vs last quarter
                </div>
              </div>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <DollarSign size={20} className="text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">{formatCurrency(data.kpis.totalExpenses)}</p>
                <div className={`flex items-center gap-1 mt-1 text-xs ${data.kpis.expenseGrowth <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {data.kpis.expenseGrowth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(data.kpis.expenseGrowth).toFixed(1)}% vs last quarter
                </div>
              </div>
              <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                <TrendingDown size={20} className="text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground">Net Profit</p>
                <p className={`text-2xl font-bold ${data.kpis.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(data.kpis.netProfit))}
                </p>
                <div className={`flex items-center gap-1 mt-1 text-xs ${data.kpis.profitGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {data.kpis.profitGrowth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(data.kpis.profitGrowth).toFixed(1)}% vs last quarter
                </div>
              </div>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <TrendingUp size={20} className="text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold text-purple-600">{data.kpis.profitMargin.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">of total revenue</p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Target size={20} className="text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards Row 2 - Projects */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-blue-600 uppercase font-semibold">Active Projects</p>
            <p className="text-2xl font-bold text-blue-700">{data.kpis.activeProjects}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-emerald-600 uppercase font-semibold">Completed</p>
            <p className="text-2xl font-bold text-emerald-700">{data.kpis.completedProjects}</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-amber-600 uppercase font-semibold">Avg Project Value</p>
            <p className="text-sm font-bold text-amber-700">{formatCurrency(data.kpis.avgProjectValue)}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-purple-600 uppercase font-semibold">Total Projects</p>
            <p className="text-2xl font-bold text-purple-700">{data.kpis.totalProjects}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart - Revenue vs Expenses with Profit Line */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Revenue & Expenses Trend</CardTitle>
          <CardDescription>Monthly financial performance with profit analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={data.monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke={COLORS.primary} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill={COLORS.success} radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="expenses" name="Expenses" fill={COLORS.danger} radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="profit" name="Profit" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Secondary Charts - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Margin Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Profit Margin Trend</CardTitle>
            <CardDescription>Monthly profitability percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={marginData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <defs>
                  <linearGradient id="marginGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Area type="monotone" dataKey="margin" name="Profit Margin" stroke={COLORS.primary} fill="url(#marginGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Expense Distribution</CardTitle>
            <CardDescription>Breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RePieChart>
                <Pie
                  data={data.categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {data.categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={[COLORS.primary, COLORS.success, COLORS.info, COLORS.purple, COLORS.orange][index % 5]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Projects Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Award size={18} className="text-primary" />
            Top Performing Projects
          </CardTitle>
          <CardDescription>Revenue, profit margin, and completion progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.projectPerformance.slice(0, 5).map((project, idx) => {
              const revenuePercent = data.kpis.totalRevenue > 0 ? (project.revenue / data.kpis.totalRevenue) * 100 : 0;
              return (
                <div key={project.name} className="group">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary w-6">#{idx + 1}</span>
                      <span className="font-medium">{project.name}</span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-emerald-600 font-mono">{formatCurrency(project.revenue)}</span>
                      <span className={`font-mono ${parseFloat(project.margin) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{project.margin}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-amber-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${revenuePercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">{project.progress.toFixed(0)}%</span>
                  </div>
                  <div className="flex gap-3 text-[10px] text-muted-foreground mt-1">
                    <span>Profit: {formatCurrency(project.profit)}</span>
                    <span>Expenses: {formatCurrency(project.expenses)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Projects Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Projects Performance Matrix</CardTitle>
          <CardDescription>Complete breakdown of all projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-3 py-2 text-left text-xs font-semibold">Project</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold">Revenue</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold">Expenses</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold">Profit</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold">Margin</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.projectPerformance.map(p => (
                  <tr key={p.name} className="hover:bg-muted/20">
                    <td className="px-3 py-2 font-medium">{p.name}</td>
                    <td className="px-3 py-2 text-right font-mono text-emerald-600">{formatCurrency(p.revenue)}</td>
                    <td className="px-3 py-2 text-right font-mono text-red-600">{formatCurrency(p.expenses)}</td>
                    <td className={`px-3 py-2 text-right font-mono font-bold ${p.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(p.profit)}</td>
                    <td className={`px-3 py-2 text-right font-mono ${parseFloat(p.margin) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{p.margin}%</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-1.5">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="text-xs">{p.progress.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}