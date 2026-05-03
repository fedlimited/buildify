import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { formatCurrency } from '@/lib/formatters';
import { exportToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, 
  RefreshCw, Download, Calendar, ArrowUpRight, ArrowDownRight,
  Target, Activity, Building2, Users, Package, Truck, Timer
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart,
  Pie, Cell, AreaChart, Area, ComposedChart, Scatter
} from 'recharts';

// Professional color palette matching your app
const COLORS = {
  primary: '#f59e0b',
  success: '#10b981',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  orange: '#f97316',
  teal: '#14b8b6',
  pink: '#ec4899',
  gray: '#6b7280',
};

const CHART_COLORS = [
  COLORS.primary, COLORS.success, COLORS.info, COLORS.purple, 
  COLORS.orange, COLORS.teal, COLORS.pink, COLORS.gray
];

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  prefix?: string;
  suffix?: string;
}

function KpiCard({ title, value, change, icon, color, prefix = '', suffix = '' }: KpiCardProps) {
  const isPositive = change && change > 0;
  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-all duration-200 group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold text-foreground">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                <span>{Math.abs(change).toFixed(1)}% from last period</span>
              </div>
            )}
          </div>
          <div className={`w-10 h-10 rounded-xl bg-${color}-100 dark:bg-${color}-950/30 flex items-center justify-center text-${color}-600 dark:text-${color}-400 group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboard() {
  const { selectedProjectId } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [filterProject, setFilterProject] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [projects, setProjects] = useState([]);
  const [data, setData] = useState({
    revenue: [],
    expenses: [],
    monthlyData: [],
    projectPerformance: [],
    categoryData: [],
    kpis: {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      profitMargin: 0,
      previousRevenue: 0,
      previousExpenses: 0,
      revenueGrowth: 0,
      expenseGrowth: 0,
      profitGrowth: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalProjects: 0,
      completionRate: 0,
      avgProjectValue: 0,
      topProject: null,
      projectedRevenue: 0,
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
        setProjects(projectsData.filter(p => p.status === 'Active'));
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
          income = income.filter(i => i.project_id === pid);
          expenses = expenses.filter(e => e.project_id === pid);
          projectsData = projectsData.filter(p => p.id === pid);
        }
        if (filterProject !== 'all') {
          const pid = parseInt(filterProject);
          income = income.filter(i => i.project_id === pid);
          expenses = expenses.filter(e => e.project_id === pid);
          projectsData = projectsData.filter(p => p.id === pid);
        }
        if (dateRange.start) {
          income = income.filter(i => i.date >= dateRange.start);
          expenses = expenses.filter(e => e.date >= dateRange.start);
        }
        if (dateRange.end) {
          income = income.filter(i => i.date <= dateRange.end);
          expenses = expenses.filter(e => e.date <= dateRange.end);
        }
        
        // Calculate totals
        const currentRevenue = income.reduce((s, i) => s + (i.amount_received || i.gross_amount || 0), 0);
        const currentExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
        const currentProfit = currentRevenue - currentExpenses;
        const profitMargin = currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0;
        
        // Previous period for growth calculation
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const prevIncome = income.filter(i => new Date(i.date) < threeMonthsAgo).reduce((s, i) => s + (i.amount_received || i.gross_amount || 0), 0);
        const prevExpenses = expenses.filter(e => new Date(e.date) < threeMonthsAgo).reduce((s, e) => s + (e.amount || 0), 0);
        
        // Monthly data for charts
        const monthMap = new Map();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        [...income, ...expenses].forEach(t => {
          if (t.date) {
            const d = new Date(t.date);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            if (!monthMap.has(key)) {
              monthMap.set(key, { month: months[d.getMonth()], year: d.getFullYear(), revenue: 0, expenses: 0, profit: 0 });
            }
          }
        });
        
        const sortedMonths = Array.from(monthMap.keys()).sort();
        const monthlyData = sortedMonths.map(key => {
          const m = monthMap.get(key);
          const rev = income.filter(i => new Date(i.date).toISOString().slice(0, 7) === key).reduce((s, i) => s + (i.amount_received || i.gross_amount || 0), 0);
          const exp = expenses.filter(e => new Date(e.date).toISOString().slice(0, 7) === key).reduce((s, e) => s + (e.amount || 0), 0);
          return { month: `${m.month} ${m.year}`, revenue: rev, expenses: exp, profit: rev - exp };
        });
        
        // Project performance
        const projectPerformance = projectsData.map(p => {
          const rev = income.filter(i => i.project_id === p.id).reduce((s, i) => s + (i.amount_received || i.gross_amount || 0), 0);
          const exp = expenses.filter(e => e.project_id === p.id).reduce((s, e) => s + (e.amount || 0), 0);
          const profit = rev - exp;
          const margin = rev > 0 ? (profit / rev) * 100 : 0;
          const progress = p.contract_sum > 0 ? (rev / p.contract_sum) * 100 : 0;
          return { name: p.name, revenue: rev, expenses: exp, profit, margin: margin.toFixed(1), progress: Math.min(100, progress) };
        }).filter(p => p.revenue > 0 || p.expenses > 0).sort((a, b) => b.revenue - a.revenue);
        
        // Expense categories for pie chart
        const catMap = new Map();
        expenses.forEach(e => {
          const cat = e.category || 'Other';
          catMap.set(cat, (catMap.get(cat) || 0) + (e.amount || 0));
        });
        const categoryData = Array.from(catMap.entries()).map(([name, value]) => ({ name, value, percentage: currentExpenses > 0 ? (value / currentExpenses) * 100 : 0 })).sort((a, b) => b.value - a.value);
        
        // Top project
        const topProject = projectPerformance[0] || null;
        
        // Simple forecast for next 3 months
        const revenueValues = monthlyData.map(m => m.revenue);
        const avgRevenue = revenueValues.length > 0 ? revenueValues.reduce((a, b) => a + b, 0) / revenueValues.length : 0;
        
        setData({
          revenue: income,
          expenses: expenses,
          monthlyData,
          projectPerformance,
          categoryData,
          kpis: {
            totalRevenue: currentRevenue,
            totalExpenses: currentExpenses,
            netProfit: currentProfit,
            profitMargin,
            previousRevenue: prevIncome,
            previousExpenses: prevExpenses,
            revenueGrowth: prevIncome > 0 ? ((currentRevenue - prevIncome) / prevIncome) * 100 : 0,
            expenseGrowth: prevExpenses > 0 ? ((currentExpenses - prevExpenses) / prevExpenses) * 100 : 0,
            profitGrowth: (prevIncome - prevExpenses) > 0 ? ((currentProfit - (prevIncome - prevExpenses)) / (prevIncome - prevExpenses)) * 100 : 0,
            activeProjects: projectsData.filter(p => p.status === 'Active').length,
            completedProjects: projectsData.filter(p => p.status === 'Completed').length,
            totalProjects: projectsData.length,
            completionRate: projectsData.length > 0 ? (projectsData.filter(p => p.status === 'Completed').length / projectsData.length) * 100 : 0,
            avgProjectValue: projectsData.length > 0 ? projectsData.reduce((s, p) => s + (p.contract_sum || 0), 0) / projectsData.length : 0,
            topProject,
            projectedRevenue: avgRevenue * 3,
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
        <div className="text-center text-muted-foreground">
          <RefreshCw size={32} className="mx-auto mb-3 animate-spin" />
          <p>Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="text-xs font-semibold mb-2">{label}</p>
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
    <div className="space-y-6 fade-in">
      {/* Header with Filters */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3 size={20} className="text-primary" />
            Executive Dashboard
          </h2>
          <p className="text-xs text-muted-foreground">Key metrics and performance insights</p>
        </div>
        <div className="flex gap-2">
          <select
            className="px-3 py-1.5 text-sm border border-border rounded-lg bg-background"
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
            className="px-3 py-1.5 text-sm border border-border rounded-lg bg-background"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
          <input
            type="date"
            className="px-3 py-1.5 text-sm border border-border rounded-lg bg-background"
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

      {/* KPI Row 1 - Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Revenue"
          value={data.kpis.totalRevenue}
          change={data.kpis.revenueGrowth}
          icon={<DollarSign size={20} />}
          color="emerald"
          prefix="KES "
        />
        <KpiCard
          title="Total Expenses"
          value={data.kpis.totalExpenses}
          change={data.kpis.expenseGrowth}
          icon={<TrendingDown size={20} />}
          color="rose"
          prefix="KES "
        />
        <KpiCard
          title="Net Profit"
          value={data.kpis.netProfit}
          change={data.kpis.profitGrowth}
          icon={<TrendingUp size={20} />}
          color={data.kpis.netProfit >= 0 ? "green" : "orange"}
          prefix="KES "
        />
        <KpiCard
          title="Profit Margin"
          value={data.kpis.profitMargin.toFixed(1)}
          icon={<Target size={20} />}
          color="purple"
          suffix="%"
        />
      </div>

      {/* KPI Row 2 - Project Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-wider">Active</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{data.kpis.activeProjects}</p>
              </div>
              <Building2 size={20} className="text-blue-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-green-600 dark:text-green-400 uppercase tracking-wider">Completed</p>
                <p className="text-xl font-bold text-green-700 dark:text-green-300">{data.kpis.completedProjects}</p>
              </div>
              <CheckCircle size={20} className="text-green-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-wider">Completion</p>
                <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{data.kpis.completionRate.toFixed(0)}%</p>
              </div>
              <Activity size={20} className="text-amber-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-purple-600 dark:text-purple-400 uppercase tracking-wider">Avg Project</p>
                <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{formatCurrency(data.kpis.avgProjectValue)}</p>
              </div>
              <Timer size={20} className="text-purple-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/50 dark:border-cyan-800/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Forecast</p>
                <p className="text-xl font-bold text-cyan-700 dark:text-cyan-300">{formatCurrency(data.kpis.projectedRevenue)}</p>
              </div>
              <TrendingUp size={20} className="text-cyan-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart 1: Revenue vs Expenses */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 size={16} className="text-primary" />
            Revenue vs Expenses Trend
          </CardTitle>
          <CardDescription className="text-xs">Monthly comparison with trend analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="revenue" name="Revenue" fill={COLORS.success} radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill={COLORS.danger} radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="profit" name="Profit" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 2: Profit Margin Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            Profit Margin Trend
          </CardTitle>
          <CardDescription className="text-xs">Monthly profitability percentage</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.monthlyData.map(m => ({ month: m.month, margin: m.revenue > 0 ? (m.profit / m.revenue) * 100 : 0 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="margin" name="Profit Margin" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 3: Expense Distribution Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PieChart size={16} className="text-primary" />
              Expense Distribution
            </CardTitle>
            <CardDescription className="text-xs">Breakdown by category</CardDescription>
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
                  outerRadius={100}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data.categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </RePieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-3">
              {data.categoryData.slice(0, 5).map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-[10px] text-muted-foreground">{cat.name}: {cat.percentage.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chart 4: Top Projects */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 size={16} className="text-primary" />
              Top Projects by Revenue
            </CardTitle>
            <CardDescription className="text-xs">Best performing projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.projectPerformance.slice(0, 5).map((project, idx) => (
                <div key={project.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium truncate flex-1">{idx + 1}. {project.name}</span>
                    <span className="text-success font-mono">{formatCurrency(project.revenue)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-primary to-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (project.revenue / data.kpis.totalRevenue) * 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                    <span>Profit: {formatCurrency(project.profit)}</span>
                    <span>Margin: {project.margin}%</span>
                  </div>
                </div>
              ))}
              {data.projectPerformance.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">No project data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Performance Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity size={16} className="text-primary" />
            All Projects Performance
          </CardTitle>
          <CardDescription className="text-xs">Detailed breakdown by project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Project</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Revenue</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Expenses</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Profit</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Margin</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.projectPerformance.map(p => (
                  <tr key={p.name} className="hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium">{p.name}</td>
                    <td className="px-3 py-2 text-right font-mono text-success">{formatCurrency(p.revenue)}</td>
                    <td className="px-3 py-2 text-right font-mono text-destructive">{formatCurrency(p.expenses)}</td>
                    <td className={`px-3 py-2 text-right font-mono font-bold ${p.profit >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(p.profit)}</td>
                    <td className={`px-3 py-2 text-right ${p.profit >= 0 ? 'text-success' : 'text-destructive'}`}>{p.margin}%</td>
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

      {/* Top Performer Spotlight */}
      {data.kpis.topProject && (
        <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🏆</span>
                <div>
                  <p className="text-xs text-amber-600 dark:text-amber-400">Top Performing Project</p>
                  <p className="font-semibold text-amber-800 dark:text-amber-300">{data.kpis.topProject.name}</p>
                </div>
              </div>
              <div className="flex-1" />
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-[10px] text-amber-600 dark:text-amber-400">Revenue</p>
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-300">{formatCurrency(data.kpis.topProject.revenue)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-amber-600 dark:text-amber-400">Profit Margin</p>
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-300">{data.kpis.topProject.margin}%</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-amber-600 dark:text-amber-400">Progress</p>
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-300">{data.kpis.topProject.progress.toFixed(0)}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper component for CheckCircle
function CheckCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}