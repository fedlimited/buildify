import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { formatCurrency } from '@/lib/formatters';
import { exportToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, 
  RefreshCw, Download, ArrowUpRight, ArrowDownRight,
  Target, Activity, Building2, Award, CalendarDays, Users,
  Package, Truck, CreditCard
} from 'lucide-react';

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
  const colorClasses = {
    emerald: 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20',
    rose: 'border-l-rose-500 bg-rose-50/50 dark:bg-rose-950/20',
    blue: 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20',
    purple: 'border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20',
    amber: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20',
    cyan: 'border-l-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20',
  };
  const iconColors = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    rose: 'text-rose-600 dark:text-rose-400',
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    amber: 'text-amber-600 dark:text-amber-400',
    cyan: 'text-cyan-600 dark:text-cyan-400',
  };

  return (
    <Card className={`border-l-4 ${colorClasses[color as keyof typeof colorClasses]} hover:shadow-md transition-all`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-foreground">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                <span>{Math.abs(change).toFixed(1)}% from last period</span>
              </div>
            )}
          </div>
          <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} ${iconColors[color as keyof typeof iconColors]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Simple but elegant bar chart using CSS
function RevenueExpensesChart({ data }: { data: any[] }) {
  const maxValue = Math.max(...data.map(d => Math.max(d.revenue, d.expenses)), 1);
  
  return (
    <div className="space-y-4">
      {data.map((item, idx) => {
        const revPercent = (item.revenue / maxValue) * 100;
        const expPercent = (item.expenses / maxValue) * 100;
        const profit = item.revenue - item.expenses;
        
        return (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-foreground">{item.month}</span>
              <div className="flex gap-3">
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(item.revenue)}</span>
                <span className="text-rose-600 dark:text-rose-400 font-mono">{formatCurrency(item.expenses)}</span>
                <span className={`font-mono ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {profit >= 0 ? '▲' : '▼'} {formatCurrency(Math.abs(profit))}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <div className="flex-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full h-6 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full flex items-center justify-end px-2 text-[10px] font-medium text-white"
                  style={{ width: `${revPercent}%` }}
                >
                  {revPercent > 12 && `${(item.revenue / 1000).toFixed(0)}k`}
                </div>
              </div>
              <div className="flex-1 bg-rose-100 dark:bg-rose-900/30 rounded-full h-6 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-rose-500 to-rose-600 h-full rounded-full flex items-center justify-end px-2 text-[10px] font-medium text-white"
                  style={{ width: `${expPercent}%` }}
                >
                  {expPercent > 12 && `${(item.expenses / 1000).toFixed(0)}k`}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Category distribution chart
function CategoryChart({ data, total }: { data: any[]; total: number }) {
  const colors = [
    'bg-amber-500', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 
    'bg-rose-500', 'bg-cyan-500', 'bg-orange-500', 'bg-teal-500'
  ];
  
  return (
    <div className="space-y-3">
      {data.slice(0, 7).map((cat, idx) => {
        const percent = total > 0 ? (cat.value / total) * 100 : 0;
        return (
          <div key={cat.name}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{cat.name}</span>
              <div className="flex gap-2">
                <span className="font-mono text-foreground">{formatCurrency(cat.value)}</span>
                <span className="text-muted-foreground w-12 text-right">{percent.toFixed(0)}%</span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className={`${colors[idx % colors.length]} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AnalyticsDashboard() {
  const { selectedProjectId } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [filterProject, setFilterProject] = useState('all');
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
      totalWorkers: 0,
      totalSuppliers: 0,
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
        
        let suppliersData = await fetch('https://buildify-backend-kye8.onrender.com/api/suppliers', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        
        let workersData = await fetch('https://buildify-backend-kye8.onrender.com/api/workers', {
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
        
        const currentRevenue = income.reduce((s: number, i: any) => s + (i.amount_received || i.gross_amount || 0), 0);
        const currentExpenses = expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);
        const currentProfit = currentRevenue - currentExpenses;
        const profitMargin = currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0;
        
        // Previous period for growth
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const prevRevenue = income.filter((i: any) => new Date(i.date) < threeMonthsAgo).reduce((s: number, i: any) => s + (i.amount_received || i.gross_amount || 0), 0);
        const prevExpenses = expenses.filter((e: any) => new Date(e.date) < threeMonthsAgo).reduce((s: number, e: any) => s + (e.amount || 0), 0);
        
        // Monthly data
        const monthMap = new Map();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        [...income, ...expenses].forEach((t: any) => {
          if (t.date) {
            const d = new Date(t.date);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            if (!monthMap.has(key)) {
              monthMap.set(key, { month: months[d.getMonth()], year: d.getFullYear() });
            }
          }
        });
        
        const sortedMonths = Array.from(monthMap.keys()).sort();
        const monthlyData = sortedMonths.map(key => {
          const m = monthMap.get(key);
          const rev = income.filter((i: any) => new Date(i.date).toISOString().slice(0, 7) === key).reduce((s: number, i: any) => s + (i.amount_received || i.gross_amount || 0), 0);
          const exp = expenses.filter((e: any) => new Date(e.date).toISOString().slice(0, 7) === key).reduce((s: number, e: any) => s + (e.amount || 0), 0);
          return { month: `${m.month} ${m.year}`, revenue: rev, expenses: exp };
        });
        
        // Project performance
        const projectPerformance = projectsData.map((p: any) => {
          const rev = income.filter((i: any) => i.project_id === p.id).reduce((s: number, i: any) => s + (i.amount_received || i.gross_amount || 0), 0);
          const exp = expenses.filter((e: any) => e.project_id === p.id).reduce((s: number, e: any) => s + (e.amount || 0), 0);
          const profit = rev - exp;
          const margin = rev > 0 ? (profit / rev) * 100 : 0;
          const progress = p.contract_sum > 0 ? (rev / p.contract_sum) * 100 : 0;
          return { name: p.name, revenue: rev, profit, margin: margin.toFixed(1), progress: Math.min(100, progress) };
        }).filter((p: any) => p.revenue > 0).sort((a: any, b: any) => b.revenue - a.revenue);
        
        // Expense categories
        const catMap = new Map();
        expenses.forEach((e: any) => {
          const cat = e.category || 'Other';
          catMap.set(cat, (catMap.get(cat) || 0) + (e.amount || 0));
        });
        const categoryData = Array.from(catMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
        
        setData({
          monthlyData,
          projectPerformance,
          categoryData,
          kpis: {
            totalRevenue: currentRevenue,
            totalExpenses: currentExpenses,
            netProfit: currentProfit,
            profitMargin,
            revenueGrowth: prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0,
            expenseGrowth: prevExpenses > 0 ? ((currentExpenses - prevExpenses) / prevExpenses) * 100 : 0,
            profitGrowth: (prevRevenue - prevExpenses) > 0 ? ((currentProfit - (prevRevenue - prevExpenses)) / (prevRevenue - prevExpenses)) * 100 : 0,
            activeProjects: projectsData.filter((p: any) => p.status === 'Active').length,
            completedProjects: projectsData.filter((p: any) => p.status === 'Completed').length,
            totalProjects: projectsData.length,
            totalWorkers: workersData.length,
            totalSuppliers: suppliersData.length,
          }
        });
        setLoading(false);
      } catch (err) {
        console.error('Error loading analytics:', err);
        setLoading(false);
      }
    }
    loadData();
  }, [selectedProjectId, filterProject]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw size={32} className="mx-auto mb-3 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  const categoryTotal = data.categoryData.reduce((sum, c) => sum + c.value, 0);

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
            className="px-3 py-1.5 text-sm border border-border rounded-lg bg-background"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
          >
            <option value="all">All Projects</option>
            {projects.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={() => exportToCSV(data.projectPerformance, 'executive_dashboard')}>
            <Download size={14} className="mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Main KPI Row */}
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
          color={data.kpis.netProfit >= 0 ? "emerald" : "rose"}
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

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50">
          <CardContent className="p-3 text-center">
            <Building2 size={18} className="mx-auto mb-1 text-blue-500" />
            <p className="text-[10px] text-blue-600 uppercase font-semibold">Active Projects</p>
            <p className="text-xl font-bold text-blue-700">{data.kpis.activeProjects}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50">
          <CardContent className="p-3 text-center">
            <Award size={18} className="mx-auto mb-1 text-emerald-500" />
            <p className="text-[10px] text-emerald-600 uppercase font-semibold">Completed</p>
            <p className="text-xl font-bold text-emerald-700">{data.kpis.completedProjects}</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50">
          <CardContent className="p-3 text-center">
            <Users size={18} className="mx-auto mb-1 text-amber-500" />
            <p className="text-[10px] text-amber-600 uppercase font-semibold">Workers</p>
            <p className="text-xl font-bold text-amber-700">{data.kpis.totalWorkers}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50">
          <CardContent className="p-3 text-center">
            <Truck size={18} className="mx-auto mb-1 text-purple-500" />
            <p className="text-[10px] text-purple-600 uppercase font-semibold">Suppliers</p>
            <p className="text-xl font-bold text-purple-700">{data.kpis.totalSuppliers}</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/50">
          <CardContent className="p-3 text-center">
            <Package size={18} className="mx-auto mb-1 text-cyan-500" />
            <p className="text-[10px] text-cyan-600 uppercase font-semibold">Total Projects</p>
            <p className="text-xl font-bold text-cyan-700">{data.kpis.totalProjects}</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue vs Expenses Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 size={18} className="text-primary" />
            Revenue vs Expenses Trend
          </CardTitle>
          <CardDescription>Monthly financial performance</CardDescription>
        </CardHeader>
        <CardContent>
          {data.monthlyData.length > 0 ? (
            <RevenueExpensesChart data={data.monthlyData} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">No data available</div>
          )}
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieChart size={18} className="text-primary" />
              Expense Distribution
            </CardTitle>
            <CardDescription>Breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            {data.categoryData.length > 0 ? (
              <CategoryChart data={data.categoryData} total={categoryTotal} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">No expense data available</div>
            )}
          </CardContent>
        </Card>

        {/* Top Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Award size={18} className="text-primary" />
              Top Performing Projects
            </CardTitle>
            <CardDescription>Highest revenue generating projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.projectPerformance.slice(0, 5).map((project, idx) => {
                const percent = data.kpis.totalRevenue > 0 ? (project.revenue / data.kpis.totalRevenue) * 100 : 0;
                return (
                  <div key={project.name} className="group">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold w-6 ${idx === 0 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                          #{idx + 1}
                        </span>
                        <span className="font-medium text-sm truncate">{project.name}</span>
                      </div>
                      <div className="flex gap-3 text-sm">
                        <span className="text-emerald-600 font-mono">{formatCurrency(project.revenue)}</span>
                        <span className={`font-mono ${parseFloat(project.margin) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {project.margin}%
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-primary to-amber-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">{project.progress.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
              {data.projectPerformance.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No project data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity size={18} className="text-primary" />
            Projects Performance Matrix
          </CardTitle>
          <CardDescription>Complete breakdown of all projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">Project</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider">Revenue</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider">Profit</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider">Margin</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.projectPerformance.map(p => (
                  <tr key={p.name} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2 font-medium">{p.name}</td>
                    <td className="px-4 py-2 text-right font-mono text-emerald-600">{formatCurrency(p.revenue)}</td>
                    <td className={`px-4 py-2 text-right font-mono font-bold ${p.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatCurrency(p.profit)}
                    </td>
                    <td className={`px-4 py-2 text-right font-mono ${parseFloat(p.margin) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {p.margin}%
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-1.5">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="text-xs font-mono w-10">{p.progress.toFixed(0)}%</span>
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