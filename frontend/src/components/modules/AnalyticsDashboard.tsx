import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { formatCurrency } from '@/lib/formatters';
import { exportToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Target, RefreshCw, Download, Building2, Activity, PieChart, BarChart3 } from 'lucide-react';

export function AnalyticsDashboard() {
  const { selectedProjectId } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [filterProject, setFilterProject] = useState('all');
  const [projects, setProjects] = useState([]);
  const [data, setData] = useState({
    monthlyData: [],
    projectPerformance: [],
    categoryData: [],
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalProjects: 0,
    revenueGrowth: 0,
    expenseGrowth: 0,
    profitGrowth: 0,
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
        
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const prevRevenue = income.filter((i: any) => new Date(i.date) < threeMonthsAgo).reduce((s: number, i: any) => s + (i.amount_received || i.gross_amount || 0), 0);
        const prevExpenses = expenses.filter((e: any) => new Date(e.date) < threeMonthsAgo).reduce((s: number, e: any) => s + (e.amount || 0), 0);
        
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
        
        const projectPerformance = projectsData.map((p: any) => {
          const rev = income.filter((i: any) => i.project_id === p.id).reduce((s: number, i: any) => s + (i.amount_received || i.gross_amount || 0), 0);
          const exp = expenses.filter((e: any) => e.project_id === p.id).reduce((s: number, e: any) => s + (e.amount || 0), 0);
          const profit = rev - exp;
          const margin = rev > 0 ? (profit / rev) * 100 : 0;
          const progress = p.contract_sum > 0 ? (rev / p.contract_sum) * 100 : 0;
          return { name: p.name, revenue: rev, expenses: exp, profit, margin: margin.toFixed(1), progress: Math.min(100, progress) };
        }).filter((p: any) => p.revenue > 0).sort((a: any, b: any) => b.revenue - a.revenue);
        
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
          totalRevenue: currentRevenue,
          totalExpenses: currentExpenses,
          netProfit: currentProfit,
          profitMargin,
          activeProjects: projectsData.filter((p: any) => p.status === 'Active').length,
          completedProjects: projectsData.filter((p: any) => p.status === 'Completed').length,
          totalProjects: projectsData.length,
          revenueGrowth: prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0,
          expenseGrowth: prevExpenses > 0 ? ((currentExpenses - prevExpenses) / prevExpenses) * 100 : 0,
          profitGrowth: (prevRevenue - prevExpenses) > 0 ? ((currentProfit - (prevRevenue - prevExpenses)) / (prevRevenue - prevExpenses)) * 100 : 0,
        });
        setLoading(false);
      } catch (err) {
        console.error('Error loading analytics:', err);
        setLoading(false);
      }
    }
    loadData();
  }, [filterProject, selectedProjectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  const maxRevenue = Math.max(...data.monthlyData.map(m => m.revenue), 1);
  const categoryTotal = data.categoryData.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BarChart3 size={24} className="text-primary" />
          Executive Dashboard
        </h2>
        <div className="flex gap-2">
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
          <Button variant="outline" size="sm" onClick={() => exportToCSV(data.projectPerformance, 'executive_dashboard')}>
            <Download size={14} className="mr-1" /> Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</p>
                <p className={`text-xs ${data.revenueGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {data.revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(data.revenueGrowth).toFixed(1)}%
                </p>
              </div>
              <DollarSign size={24} className="text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500">
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">{formatCurrency(data.totalExpenses)}</p>
                <p className={`text-xs ${data.expenseGrowth <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {data.expenseGrowth >= 0 ? '↑' : '↓'} {Math.abs(data.expenseGrowth).toFixed(1)}%
                </p>
              </div>
              <TrendingDown size={24} className="text-rose-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Net Profit</p>
                <p className={`text-2xl font-bold ${data.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(data.netProfit))}
                </p>
                <p className={`text-xs ${data.profitGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {data.profitGrowth >= 0 ? '↑' : '↓'} {Math.abs(data.profitGrowth).toFixed(1)}%
                </p>
              </div>
              <TrendingUp size={24} className="text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold text-purple-600">{data.profitMargin.toFixed(1)}%</p>
              </div>
              <Target size={24} className="text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-blue-50">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-blue-600">Active</p>
            <p className="text-2xl font-bold text-blue-700">{data.activeProjects}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-green-600">Completed</p>
            <p className="text-2xl font-bold text-green-700">{data.completedProjects}</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-amber-600">Total Projects</p>
            <p className="text-2xl font-bold text-amber-700">{data.totalProjects}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-purple-600">Avg Profit</p>
            <p className="text-sm font-bold text-purple-700">{formatCurrency(data.netProfit / Math.max(1, data.activeProjects))}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Expenses (Monthly)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.monthlyData.map((item, idx) => {
              const revPercent = (item.revenue / maxRevenue) * 100;
              const expPercent = (item.expenses / maxRevenue) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{item.month}</span>
                    <div className="flex gap-3">
                      <span className="text-green-600">{formatCurrency(item.revenue)}</span>
                      <span className="text-red-600">{formatCurrency(item.expenses)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className="flex-1 bg-green-100 rounded-full h-6 overflow-hidden">
                      <div className="bg-green-500 h-full text-right px-2 text-[10px] text-white" style={{ width: `${revPercent}%` }}>
                        {revPercent > 15 && `${(item.revenue / 1000).toFixed(0)}k`}
                      </div>
                    </div>
                    <div className="flex-1 bg-red-100 rounded-full h-6 overflow-hidden">
                      <div className="bg-red-500 h-full text-right px-2 text-[10px] text-white" style={{ width: `${expPercent}%` }}>
                        {expPercent > 15 && `${(item.expenses / 1000).toFixed(0)}k`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.categoryData.slice(0, 6).map((cat) => {
                const percent = (cat.value / categoryTotal) * 100;
                return (
                  <div key={cat.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{cat.name}</span>
                      <span>{formatCurrency(cat.value)} ({percent.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Performing Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.projectPerformance.slice(0, 5).map((project, idx) => (
                <div key={project.name}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{idx + 1}. {project.name}</span>
                    <span className="text-green-600">{formatCurrency(project.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Profit: {formatCurrency(project.profit)}</span>
                    <span>Margin: {project.margin}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}