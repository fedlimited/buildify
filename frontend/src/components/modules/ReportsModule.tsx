import { API_BASE_URL } from '@/config/api';
import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { formatCurrency, calculateVAT, calculateRetention } from '@/lib/formatters';
import { exportToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BarChart3, DollarSign, FileSpreadsheet, Receipt, Users, ShoppingCart, Warehouse, TrendingUp, PieChart, Hammer, Truck, BookOpen, Clipboard } from 'lucide-react';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const reportCards: ReportCard[] = [
  { id: 'pnl', title: 'Profit & Loss', description: 'Income vs expenses summary', icon: <DollarSign size={24} /> },
  { id: 'project', title: 'Project Summary', description: 'All projects with progress', icon: <BarChart3 size={24} /> },
  { id: 'cashflow', title: 'Cash Flow', description: 'Monthly income and expenses', icon: <TrendingUp size={24} /> },
  { id: 'expense-trade', title: 'Expenses by Category', description: 'Category-wise breakdown', icon: <PieChart size={24} /> },
  { id: 'vat', title: 'VAT Summary', description: 'Output, input, and net VAT', icon: <Receipt size={24} /> },
  { id: 'payroll-summary', title: 'Payroll Summary', description: 'Payroll totals by project', icon: <Users size={24} /> },
  { id: 'orders', title: 'Orders Report', description: 'Purchase order summary', icon: <ShoppingCart size={24} /> },
  { id: 'stores', title: 'Stores Ledger', description: 'Inventory levels & movements', icon: <Warehouse size={24} /> },
  { id: 'subcontractors-ledger', title: 'Subcontractors Ledger', description: 'Contracted, paid & balances', icon: <Hammer size={24} /> },
  { id: 'suppliers-ledger', title: 'Suppliers Ledger', description: 'Orders, payments & balances', icon: <Truck size={24} /> },
  { id: 'income-ledger', title: 'Income Ledger', description: 'Certificate-wise income tracking', icon: <BookOpen size={24} /> },
  { id: 'site-diary', title: 'Site Diary', description: 'Daily site activities & workers', icon: <Clipboard size={24} /> },

];




export function ReportsModule() {
  const [open, setOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<string>('');

  const openReport = (id: string) => { setActiveReport(id); setOpen(true); };





const renderReport = () => {
  switch (activeReport) {
    case 'pnl': return <PnLReport />;
    case 'project': return <ProjectReport />;
    case 'cashflow': return <CashFlowReport />;
    case 'expense-trade': return <ExpenseByCategoryReport />;
    case 'vat': return <VATReport />;
    case 'payroll-summary': return <PayrollSummaryReport />;
    case 'orders': return <OrdersReport />;
    case 'stores': return <StoresSummaryReport />;
    case 'subcontractors-ledger': return <SubcontractorsLedgerReport />;
    case 'suppliers-ledger': return <SuppliersLedgerReport />;
    case 'income-ledger': return <IncomeLedgerReport />;
    case 'site-diary': return <SiteDiaryReport />;
    default: return null;
  }
};






  return (
    <div className="space-y-4 fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportCards.map(r => (
          <button key={r.id} onClick={() => openReport(r.id)} className="bg-card rounded-xl border border-border p-5 text-left hover:shadow-md hover:border-accent/50 transition-all group">
            <div className="text-accent mb-3 group-hover:scale-110 transition-transform">{r.icon}</div>
            <h3 className="font-semibold text-sm text-card-foreground">{r.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
          </button>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[90vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{reportCards.find(r => r.id === activeReport)?.title}</DialogTitle></DialogHeader>
          <div className="py-2">{renderReport()}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}





function PnLReport() {
  const { selectedProjectId } = useAppStore();
  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterProject, setFilterProject] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);  // ← ADD THIS
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadProjects() {
      try {
        const token = localStorage.getItem('token');
        const projectsRes = await fetch(`${API_BASE_URL}/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const projectsData = await projectsRes.json();
        setAllProjects(projectsData);  // ← Store ALL projects
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
        
        let income = await fetch(`${API_BASE_URL}/income`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        
        let expenses = await fetch(`${API_BASE_URL}/expenses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        
        // Apply global project filter
        if (selectedProjectId && selectedProjectId !== 'all') {
          const projectIdNum = parseInt(selectedProjectId);
          income = income.filter(i => i.project_id === projectIdNum);
          expenses = expenses.filter(e => e.project_id === projectIdNum);
        }
        
        // Apply local project filter
        if (filterProject !== 'all') {
          const projectIdNum = parseInt(filterProject);
          income = income.filter(i => i.project_id === projectIdNum);
          expenses = expenses.filter(e => e.project_id === projectIdNum);
        }
        
        // Apply date range filter
        if (dateRange.start) {
          income = income.filter(i => i.date >= dateRange.start);
          expenses = expenses.filter(e => e.date >= dateRange.start);
        }
        if (dateRange.end) {
          income = income.filter(i => i.date <= dateRange.end);
          expenses = expenses.filter(e => e.date <= dateRange.end);
        }
        
        const totalIncome = income.reduce((s, i) => s + (i.amount_received || i.gross_amount || 0), 0);
        const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
        const profit = totalIncome - totalExpenses;
        const profitMargin = totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(1) : 0;
        
        // Group by project - USE ALLPROJECTS TO GET CORRECT NAMES
        const projectBreakdown = {};
        
        income.forEach(i => {
          // ✅ Get project name from the projects list, not from income record
          const project = allProjects.find(p => p.id === i.project_id);
          const projectName = project?.name || `Project ${i.project_id}`;
          if (!projectBreakdown[projectName]) {
            projectBreakdown[projectName] = { income: 0, expenses: 0 };
          }
          projectBreakdown[projectName].income += (i.amount_received || i.gross_amount || 0);
        });
        
        expenses.forEach(e => {
          // ✅ Get project name from the projects list, not from expense record
          const project = allProjects.find(p => p.id === e.project_id);
          const projectName = project?.name || `Project ${e.project_id}`;
          if (!projectBreakdown[projectName]) {
            projectBreakdown[projectName] = { income: 0, expenses: 0 };
          }
          projectBreakdown[projectName].expenses += (e.amount || 0);
        });
        
        const projectDetails = Object.entries(projectBreakdown).map(([name, values]) => ({
          project: name,
          income: values.income,
          expenses: values.expenses,
          profit: values.income - values.expenses,
          margin: values.income > 0 ? (((values.income - values.expenses) / values.income) * 100).toFixed(1) : 0
        })).sort((a, b) => b.profit - a.profit);
        
        setData({
          totalIncome,
          totalExpenses,
          profit,
          profitMargin,
          projectDetails
        });
        setFilteredData({
          totalIncome,
          totalExpenses,
          profit,
          profitMargin,
          projectDetails
        });
        setLoading(false);
      } catch (err) {
        console.error('Error loading P&L data:', err);
        setLoading(false);
      }
    }
    loadData();
  }, [selectedProjectId, filterProject, dateRange.start, dateRange.end, allProjects]); // ← Add allProjects to dependencies

  // Apply search filter to project details
  useEffect(() => {
    if (data && searchTerm) {
      const filteredProjects = data.projectDetails.filter(p => 
        p.project.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData({
        ...data,
        projectDetails: filteredProjects
      });
    } else if (data) {
      setFilteredData(data);
    }
  }, [searchTerm, data]);

  if (loading) {
    return React.createElement('div', { className: "text-center py-8" }, "Loading profit & loss data...");
  }

  if (!filteredData) {
    return React.createElement('div', { className: "text-center py-8" }, "No data available");
  }

  const projectTableRows = filteredData.projectDetails.map(d => 
    React.createElement('tr', { key: d.project },
      React.createElement('td', { className: "px-3 py-2 font-medium" }, d.project),
      React.createElement('td', { className: "px-3 py-2 text-right font-mono text-success" }, formatCurrency(d.income)),
      React.createElement('td', { className: "px-3 py-2 text-right font-mono text-destructive" }, formatCurrency(d.expenses)),
      React.createElement('td', { className: `px-3 py-2 text-right font-mono font-bold ${d.profit >= 0 ? 'text-success' : 'text-destructive'}` }, formatCurrency(d.profit)),
      React.createElement('td', { className: "px-3 py-2 text-right" }, d.margin, "%")
    )
  );

  return React.createElement('div', { className: "space-y-4" },
    // Filters
    React.createElement('div', { className: "flex flex-wrap gap-4 justify-between items-center" },
      React.createElement('div', { className: "flex gap-2 flex-wrap" },
        React.createElement('input', {
          type: "text",
          placeholder: "🔍 Search project...",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background w-48",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value)
        }),
        React.createElement('select', {
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: filterProject,
          onChange: (e) => setFilterProject(e.target.value)
        },
          React.createElement('option', { value: "all" }, "All Projects"),
          projects.map(p => React.createElement('option', { key: p.id, value: p.id }, p.name))
        ),
        React.createElement('input', {
          type: "date",
          placeholder: "Start Date",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: dateRange.start,
          onChange: (e) => setDateRange({ ...dateRange, start: e.target.value })
        }),
        React.createElement('input', {
          type: "date",
          placeholder: "End Date",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: dateRange.end,
          onChange: (e) => setDateRange({ ...dateRange, end: e.target.value })
        }),
        (dateRange.start || dateRange.end) && React.createElement('button', {
          className: "px-3 py-1.5 text-sm text-red-500 hover:text-red-700",
          onClick: () => setDateRange({ start: '', end: '' })
        }, "Clear Dates")
      ),
      React.createElement('p', { className: "text-xs text-muted-foreground" }, 
        `${filteredData.projectDetails.length} projects`
      )
    ),
    
    // Summary Cards
    React.createElement('div', { className: "grid grid-cols-2 md:grid-cols-4 gap-4" },
      React.createElement('div', { className: "bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-800" },
        React.createElement('p', { className: "text-xs text-blue-600 dark:text-blue-400" }, "Total Income"),
        React.createElement('p', { className: "text-2xl font-bold text-blue-700 dark:text-blue-300" }, formatCurrency(filteredData.totalIncome))
      ),
      React.createElement('div', { className: "bg-red-50 dark:bg-red-950/30 rounded-lg p-4 text-center border border-red-200 dark:border-red-800" },
        React.createElement('p', { className: "text-xs text-red-600 dark:text-red-400" }, "Total Expenses"),
        React.createElement('p', { className: "text-2xl font-bold text-red-700 dark:text-red-300" }, formatCurrency(filteredData.totalExpenses))
      ),
      React.createElement('div', { className: `rounded-lg p-4 text-center border ${filteredData.profit >= 0 ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' : 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'}` },
        React.createElement('p', { className: `text-xs ${filteredData.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}` }, "Net Profit/(Loss)"),
        React.createElement('p', { className: `text-2xl font-bold ${filteredData.profit >= 0 ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}` }, 
          formatCurrency(Math.abs(filteredData.profit)), filteredData.profit >= 0 ? '' : ' (Loss)'
        )
      ),
      React.createElement('div', { className: "bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 text-center border border-purple-200 dark:border-purple-800" },
        React.createElement('p', { className: "text-xs text-purple-600 dark:text-purple-400" }, "Profit Margin"),
        React.createElement('p', { className: "text-2xl font-bold text-purple-700 dark:text-purple-300" }, filteredData.profitMargin, "%")
      )
    ),
    
    // Detailed Breakdown by Project
    React.createElement('div', { className: "mt-4" },
      React.createElement('h3', { className: "text-md font-semibold mb-3" }, "Breakdown by Project"),
      React.createElement('div', { className: "overflow-x-auto" },
        React.createElement('table', { className: "w-full text-sm" },
          React.createElement('thead', null,
            React.createElement('tr', { className: "border-b border-border" },
              React.createElement('th', { className: "px-3 py-2 text-left text-xs font-medium text-muted-foreground" }, "Project"),
              React.createElement('th', { className: "px-3 py-2 text-right text-xs font-medium text-muted-foreground" }, "Income"),
              React.createElement('th', { className: "px-3 py-2 text-right text-xs font-medium text-muted-foreground" }, "Expenses"),
              React.createElement('th', { className: "px-3 py-2 text-right text-xs font-medium text-muted-foreground" }, "Profit"),
              React.createElement('th', { className: "px-3 py-2 text-right text-xs font-medium text-muted-foreground" }, "Margin")
            )
          ),
          React.createElement('tbody', { className: "divide-y divide-border" }, projectTableRows)
        )
      )
    ),
    
    // Export Button
    React.createElement(Button, { variant: "outline", size: "sm", onClick: () => exportToCSV(filteredData.projectDetails, 'profit_loss_report') }, "Export CSV")
  );
}





function ProjectReport() {
  const { selectedProjectId } = useAppStore();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterProject, setFilterProject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [projects, setProjects] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalContract: 0,
    totalIncome: 0,
    totalExpenses: 0,
    totalProfit: 0,
    avgMargin: 0
  });

  useEffect(() => {
    async function loadProjects() {
      try {
        const token = localStorage.getItem('token');
        const projectsRes = await fetch(`${API_BASE_URL}/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const projectsData = await projectsRes.json();
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
        
        let projectsData = await fetch(`${API_BASE_URL}/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        
        let income = await fetch(`${API_BASE_URL}/income`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        
        let expenses = await fetch(`${API_BASE_URL}/expenses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        
        // Apply global project filter
        if (selectedProjectId && selectedProjectId !== 'all') {
          const projectIdNum = parseInt(selectedProjectId);
          projectsData = projectsData.filter(p => p.id === projectIdNum);
          income = income.filter(i => i.project_id === projectIdNum);
          expenses = expenses.filter(e => e.project_id === projectIdNum);
        }
        
        // Apply local project filter
        if (filterProject !== 'all') {
          const projectIdNum = parseInt(filterProject);
          projectsData = projectsData.filter(p => p.id === projectIdNum);
          income = income.filter(i => i.project_id === projectIdNum);
          expenses = expenses.filter(e => e.project_id === projectIdNum);
        }
        
        // Apply date range filter
        if (dateRange.start) {
          income = income.filter(i => i.date >= dateRange.start);
          expenses = expenses.filter(e => e.date >= dateRange.start);
        }
        if (dateRange.end) {
          income = income.filter(i => i.date <= dateRange.end);
          expenses = expenses.filter(e => e.date <= dateRange.end);
        }
        
        const results = projectsData.map(p => {
          const pIncome = income.filter(i => i.project_id === p.id).reduce((s, i) => s + (i.amount_received || 0), 0);
          const pExpenses = expenses.filter(e => e.project_id === p.id).reduce((s, e) => s + (e.amount || 0), 0);
          const profit = pIncome - pExpenses;
          const progress = p.contract_sum > 0 ? ((pIncome / p.contract_sum) * 100).toFixed(1) : '0';
          const margin = pIncome > 0 ? ((profit / pIncome) * 100).toFixed(1) : '0';
          
          return {
            id: p.id,
            name: p.name,
            client: p.client,
            contract: p.contract_sum,
            income: pIncome,
            expenses: pExpenses,
            profit: profit,
            progress: progress,
            margin: margin,
            status: p.status,
            startDate: p.start_date,
            endDate: p.end_date
          };
        });
        
        // Calculate summary stats
        const totalContract = results.reduce((sum, p) => sum + p.contract, 0);
        const totalIncome = results.reduce((sum, p) => sum + p.income, 0);
        const totalExpenses = results.reduce((sum, p) => sum + p.expenses, 0);
        const totalProfit = totalIncome - totalExpenses;
        const avgMargin = totalIncome > 0 ? ((totalProfit / totalIncome) * 100).toFixed(1) : 0;
        
        setSummaryStats({
          totalContract,
          totalIncome,
          totalExpenses,
          totalProfit,
          avgMargin
        });
        
        setData(results);
        setFilteredData(results);
        setLoading(false);
      } catch (err) {
        console.error('Error loading project data:', err);
        setLoading(false);
      }
    }
    loadData();
  }, [selectedProjectId, filterProject, dateRange.start, dateRange.end]);

  // Apply search filter
  useEffect(() => {
    if (searchTerm) {
      const filtered = data.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchTerm, data]);

  if (loading) {
    return React.createElement('div', { className: "text-center py-8" }, "Loading project data...");
  }

  const tableRows = filteredData.map(d => 
    React.createElement('tr', { key: d.id },
      React.createElement('td', { className: "px-3 py-2 font-medium" }, d.name),
      React.createElement('td', { className: "px-3 py-2 text-xs text-muted-foreground" }, d.client),
      React.createElement('td', { className: "px-3 py-2 text-right font-mono" }, formatCurrency(d.contract)),
      React.createElement('td', { className: "px-3 py-2 text-right font-mono text-success" }, formatCurrency(d.income)),
      React.createElement('td', { className: "px-3 py-2 text-right font-mono text-destructive" }, formatCurrency(d.expenses)),
      React.createElement('td', { className: `px-3 py-2 text-right font-mono font-bold ${d.profit >= 0 ? 'text-success' : 'text-destructive'}` }, formatCurrency(d.profit)),
      React.createElement('td', { className: "px-3 py-2 text-right" }, 
        React.createElement('div', { className: "flex items-center justify-end gap-2" },
          React.createElement('div', { className: "w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2" },
            React.createElement('div', { className: "bg-accent h-2 rounded-full", style: { width: `${Math.min(100, d.progress)}%` } })
          ),
          React.createElement('span', { className: "text-xs" }, d.progress, "%")
        )
      ),
      React.createElement('td', { className: "px-3 py-2 text-center" },
        React.createElement('span', { className: `text-xs px-2 py-0.5 rounded-full ${d.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}` }, d.status)
      )
    )
  );

  return React.createElement('div', { className: "space-y-4" },
    // Filters
    React.createElement('div', { className: "flex flex-wrap gap-4 justify-between items-center" },
      React.createElement('div', { className: "flex gap-2 flex-wrap" },
        React.createElement('input', {
          type: "text",
          placeholder: "🔍 Search project or client...",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background w-56",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value)
        }),
        React.createElement('select', {
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: filterProject,
          onChange: (e) => setFilterProject(e.target.value)
        },
          React.createElement('option', { value: "all" }, "All Projects"),
          projects.map(p => React.createElement('option', { key: p.id, value: p.id }, p.name))
        ),
        React.createElement('input', {
          type: "date",
          placeholder: "Start Date",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: dateRange.start,
          onChange: (e) => setDateRange({ ...dateRange, start: e.target.value })
        }),
        React.createElement('input', {
          type: "date",
          placeholder: "End Date",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: dateRange.end,
          onChange: (e) => setDateRange({ ...dateRange, end: e.target.value })
        }),
        (dateRange.start || dateRange.end) && React.createElement('button', {
          className: "px-3 py-1.5 text-sm text-red-500 hover:text-red-700",
          onClick: () => setDateRange({ start: '', end: '' })
        }, "Clear Dates")
      ),
      React.createElement('p', { className: "text-xs text-muted-foreground" }, `${filteredData.length} projects`)
    ),
    
    // Summary Cards
    React.createElement('div', { className: "grid grid-cols-2 md:grid-cols-5 gap-4" },
      React.createElement('div', { className: "bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-800" },
        React.createElement('p', { className: "text-xs text-blue-600 dark:text-blue-400" }, "Total Contract"),
        React.createElement('p', { className: "text-xl font-bold text-blue-700 dark:text-blue-300" }, formatCurrency(summaryStats.totalContract))
      ),
      React.createElement('div', { className: "bg-green-50 dark:bg-green-950/30 rounded-lg p-4 text-center border border-green-200 dark:border-green-800" },
        React.createElement('p', { className: "text-xs text-green-600 dark:text-green-400" }, "Total Income"),
        React.createElement('p', { className: "text-xl font-bold text-green-700 dark:text-green-300" }, formatCurrency(summaryStats.totalIncome))
      ),
      React.createElement('div', { className: "bg-red-50 dark:bg-red-950/30 rounded-lg p-4 text-center border border-red-200 dark:border-red-800" },
        React.createElement('p', { className: "text-xs text-red-600 dark:text-red-400" }, "Total Expenses"),
        React.createElement('p', { className: "text-xl font-bold text-red-700 dark:text-red-300" }, formatCurrency(summaryStats.totalExpenses))
      ),
      React.createElement('div', { className: `rounded-lg p-4 text-center border ${summaryStats.totalProfit >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' : 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'}` },
        React.createElement('p', { className: `text-xs ${summaryStats.totalProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}` }, "Total Profit"),
        React.createElement('p', { className: `text-xl font-bold ${summaryStats.totalProfit >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-orange-700 dark:text-orange-300'}` }, 
          formatCurrency(Math.abs(summaryStats.totalProfit)), summaryStats.totalProfit >= 0 ? '' : ' (Loss)'
        )
      ),
      React.createElement('div', { className: "bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 text-center border border-purple-200 dark:border-purple-800" },
        React.createElement('p', { className: "text-xs text-purple-600 dark:text-purple-400" }, "Avg Margin"),
        React.createElement('p', { className: "text-xl font-bold text-purple-700 dark:text-purple-300" }, summaryStats.avgMargin, "%")
      )
    ),
    
    // Main Table
    React.createElement('div', { className: "overflow-x-auto" },
      React.createElement('table', { className: "w-full text-sm" },
        React.createElement('thead', null,
          React.createElement('tr', { className: "border-b border-border" },
            React.createElement('th', { className: "px-3 py-2 text-left text-xs font-medium text-muted-foreground" }, "Project"),
            React.createElement('th', { className: "px-3 py-2 text-left text-xs font-medium text-muted-foreground" }, "Client"),
            React.createElement('th', { className: "px-3 py-2 text-right text-xs font-medium text-muted-foreground" }, "Contract"),
            React.createElement('th', { className: "px-3 py-2 text-right text-xs font-medium text-muted-foreground" }, "Income"),
            React.createElement('th', { className: "px-3 py-2 text-right text-xs font-medium text-muted-foreground" }, "Expenses"),
            React.createElement('th', { className: "px-3 py-2 text-right text-xs font-medium text-muted-foreground" }, "Profit"),
            React.createElement('th', { className: "px-3 py-2 text-right text-xs font-medium text-muted-foreground" }, "Progress"),
            React.createElement('th', { className: "px-3 py-2 text-center text-xs font-medium text-muted-foreground" }, "Status")
          )
        ),
        React.createElement('tbody', { className: "divide-y divide-border" }, tableRows),
        filteredData.length === 0 && React.createElement('tbody', null,
          React.createElement('tr', null,
            React.createElement('td', { colSpan: "8", className: "px-3 py-8 text-center text-muted-foreground" }, "No projects found")
          )
        )
      )
    ),
    
    // Export Button
    React.createElement(Button, { variant: "outline", size: "sm", onClick: () => exportToCSV(filteredData, 'project_summary') }, "Export CSV")
  );
}







function CashFlowReport() {
  const { selectedProjectId } = useAppStore();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterProject, setFilterProject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    async function loadProjects() {
      try {
        const token = localStorage.getItem('token');
        const projectsRes = await fetch(`${API_BASE_URL}/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const projectsData = await projectsRes.json();
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
        
        let income = await fetch(`${API_BASE_URL}/income`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        
        let expenses = await fetch(`${API_BASE_URL}/expenses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        
        // Apply global project filter
        if (selectedProjectId && selectedProjectId !== 'all') {
          const projectIdNum = parseInt(selectedProjectId);
          income = income.filter(i => i.project_id === projectIdNum);
          expenses = expenses.filter(e => e.project_id === projectIdNum);
        }
        
        // Apply local project filter
        if (filterProject !== 'all') {
          const projectIdNum = parseInt(filterProject);
          income = income.filter(i => i.project_id === projectIdNum);
          expenses = expenses.filter(e => e.project_id === projectIdNum);
        }
        
        // Apply date range filter
        if (dateRange.start) {
          income = income.filter(i => i.date >= dateRange.start);
          expenses = expenses.filter(e => e.date >= dateRange.start);
        }
        if (dateRange.end) {
          income = income.filter(i => i.date <= dateRange.end);
          expenses = expenses.filter(e => e.date <= dateRange.end);
        }
        
        // Group by month
        const monthsMap = new Map();
        
        [...income, ...expenses].forEach(transaction => {
          const date = transaction.date;
          if (date) {
            const monthKey = date.substring(0, 7);
            const monthLabel = new Date(date).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
            if (!monthsMap.has(monthKey)) {
              monthsMap.set(monthKey, { label: monthLabel, income: 0, expenses: 0, key: monthKey });
            }
          }
        });
        
        // Sort months chronologically
        const sortedMonths = Array.from(monthsMap.values()).sort((a, b) => a.key.localeCompare(b.key));
        
        const results = sortedMonths.map(m => {
          const mIncome = income.filter(i => i.date.startsWith(m.key)).reduce((s, i) => s + (i.amount_received || 0), 0);
          const mExpense = expenses.filter(e => e.date.startsWith(m.key)).reduce((s, e) => s + (e.amount || 0), 0);
          return { month: m.label, income: mIncome, expenses: mExpense, net: mIncome - mExpense };
        });
        
        setData(results);
        setFilteredData(results);
        setLoading(false);
      } catch (err) {
        console.error('Error loading cash flow data:', err);
        setLoading(false);
      }
    }
    loadData();
  }, [selectedProjectId, filterProject, dateRange.start, dateRange.end]);

  // Apply search filter
  useEffect(() => {
    if (searchTerm) {
      const filtered = data.filter(item => 
        item.month.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchTerm, data]);

  const totals = filteredData.reduce((acc, d) => ({
    income: acc.income + d.income,
    expenses: acc.expenses + d.expenses,
    net: acc.net + d.net
  }), { income: 0, expenses: 0, net: 0 });

  if (loading) {
    return React.createElement('div', { className: "text-center py-8" }, "Loading cash flow data...");
  }

  const tableRows = filteredData.map(d => 
    React.createElement('tr', { key: d.month },
      React.createElement('td', { className: "px-3 py-2" }, d.month),
      React.createElement('td', { className: "px-3 py-2 text-right font-mono text-success" }, formatCurrency(d.income)),
      React.createElement('td', { className: "px-3 py-2 text-right font-mono text-destructive" }, formatCurrency(d.expenses)),
      React.createElement('td', { className: `px-3 py-2 text-right font-mono font-bold ${d.net >= 0 ? 'text-success' : 'text-destructive'}` }, formatCurrency(d.net))
    )
  );

  return React.createElement('div', { className: "space-y-4" },
    React.createElement('div', { className: "flex flex-wrap gap-4 justify-between items-center" },
      React.createElement('div', { className: "flex gap-2 flex-wrap" },
        React.createElement('input', {
          type: "text",
          placeholder: "🔍 Search month...",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background w-40",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value)
        }),
        React.createElement('select', {
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: filterProject,
          onChange: (e) => setFilterProject(e.target.value)
        },
          React.createElement('option', { value: "all" }, "All Projects"),
          projects.map(p => React.createElement('option', { key: p.id, value: p.id }, p.name))
        ),
        React.createElement('input', {
          type: "date",
          placeholder: "Start Date",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: dateRange.start,
          onChange: (e) => setDateRange({ ...dateRange, start: e.target.value })
        }),
        React.createElement('input', {
          type: "date",
          placeholder: "End Date",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: dateRange.end,
          onChange: (e) => setDateRange({ ...dateRange, end: e.target.value })
        }),
        (dateRange.start || dateRange.end) && React.createElement('button', {
          className: "px-3 py-1.5 text-sm text-red-500 hover:text-red-700",
          onClick: () => setDateRange({ start: '', end: '' })
        }, "Clear Dates")
      ),
      React.createElement('p', { className: "text-xs text-muted-foreground" }, `${filteredData.length} months`)
    ),
    // Summary Cards
    React.createElement('div', { className: "grid grid-cols-3 gap-4" },
      React.createElement('div', { className: "bg-green-50 dark:bg-green-950/30 rounded-lg p-4 text-center border border-green-200 dark:border-green-800" },
        React.createElement('p', { className: "text-xs text-green-600 dark:text-green-400" }, "Total Income"),
        React.createElement('p', { className: "text-xl font-bold text-green-700 dark:text-green-300" }, formatCurrency(totals.income))
      ),
      React.createElement('div', { className: "bg-red-50 dark:bg-red-950/30 rounded-lg p-4 text-center border border-red-200 dark:border-red-800" },
        React.createElement('p', { className: "text-xs text-red-600 dark:text-red-400" }, "Total Expenses"),
        React.createElement('p', { className: "text-xl font-bold text-red-700 dark:text-red-300" }, formatCurrency(totals.expenses))
      ),
      React.createElement('div', { className: `rounded-lg p-4 text-center border ${totals.net >= 0 ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' : 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'}` },
        React.createElement('p', { className: `text-xs ${totals.net >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}` }, "Net Cash Flow"),
        React.createElement('p', { className: `text-xl font-bold ${totals.net >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'}` }, formatCurrency(Math.abs(totals.net)), totals.net >= 0 ? '' : ' (Negative)')
      )
    ),
    React.createElement('div', { className: "overflow-x-auto" },
      React.createElement('table', { className: "w-full text-sm" },
        React.createElement('thead', null,
          React.createElement('tr', { className: "border-b border-border" },
            React.createElement('th', { className: "px-3 py-2 text-left text-xs" }, "Month"),
            React.createElement('th', { className: "px-3 py-2 text-right text-xs" }, "Income"),
            React.createElement('th', { className: "px-3 py-2 text-right text-xs" }, "Expenses"),
            React.createElement('th', { className: "px-3 py-2 text-right text-xs" }, "Net")
          )
        ),
        React.createElement('tbody', { className: "divide-y divide-border" }, tableRows)
      )
    ),
    React.createElement(Button, { variant: "outline", size: "sm", onClick: () => exportToCSV(filteredData, 'cashflow_report') }, "Export CSV")
  );
}






function ExpenseByCategoryReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterProject, setFilterProject] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function loadProjects() {
      try {
        const token = localStorage.getItem('token');
        const projectsRes = await fetch(`${API_BASE_URL}/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const projectsData = await projectsRes.json();
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
        
        let expenses = await fetch(`${API_BASE_URL}/expenses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        
        if (filterProject !== 'all') {
          const projectIdNum = parseInt(filterProject);
          expenses = expenses.filter(e => e.project_id === projectIdNum);
        }
        
        if (dateRange.start) {
          expenses = expenses.filter(e => e.date >= dateRange.start);
        }
        if (dateRange.end) {
          expenses = expenses.filter(e => e.date <= dateRange.end);
        }
        
        const cats = expenses.reduce((acc, e) => {
          const category = e.category || 'Uncategorized';
          acc[category] = (acc[category] || 0) + (e.amount || 0);
          return acc;
        }, {});
        
        const totalAmount = Object.values(cats).reduce((s, v) => s + v, 0);
        const results = Object.entries(cats)
          .sort((a, b) => b[1] - a[1])
          .map(([cat, amount]) => ({
            category: cat,
            amount: amount,
            percentage: totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : '0'
          }));
        
        setData(results);
        setTotal(totalAmount);
        setLoading(false);
      } catch (err) {
        console.error('Error loading expense data:', err);
        setLoading(false);
      }
    }
    loadData();
  }, [filterProject, dateRange.start, dateRange.end]);

  if (loading) {
    return React.createElement('div', { className: "text-center py-8" }, "Loading expense data...");
  }

  const tableRows = data.map(d => 
    React.createElement('tr', { key: d.category },
      React.createElement('td', { className: "px-3 py-2 font-medium" }, d.category),
      React.createElement('td', { className: "px-3 py-2 text-right font-mono" }, formatCurrency(d.amount)),
      React.createElement('td', { className: "px-3 py-2 text-right" }, d.percentage, "%")
    )
  );

  return React.createElement('div', { className: "space-y-4" },
    React.createElement('div', { className: "flex flex-wrap gap-4 justify-between items-center" },
      React.createElement('div', { className: "flex gap-2 flex-wrap" },
        React.createElement('select', {
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: filterProject,
          onChange: (e) => setFilterProject(e.target.value)
        },
          React.createElement('option', { value: "all" }, "All Projects"),
          projects.map(p => React.createElement('option', { key: p.id, value: p.id }, p.name))
        ),
        React.createElement('input', {
          type: "date",
          placeholder: "Start Date",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: dateRange.start,
          onChange: (e) => setDateRange({ ...dateRange, start: e.target.value })
        }),
        React.createElement('input', {
          type: "date",
          placeholder: "End Date",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: dateRange.end,
          onChange: (e) => setDateRange({ ...dateRange, end: e.target.value })
        }),
        (dateRange.start || dateRange.end) && React.createElement('button', {
          className: "px-3 py-1.5 text-sm text-red-500 hover:text-red-700",
          onClick: () => setDateRange({ start: '', end: '' })
        }, "Clear Dates")
      ),
      React.createElement('p', { className: "text-xs text-muted-foreground" }, `${data.length} categories`)
    ),
    React.createElement('div', { className: "overflow-x-auto" },
      React.createElement('table', { className: "w-full text-sm" },
        React.createElement('thead', null,
          React.createElement('tr', { className: "border-b border-border" },
            React.createElement('th', { className: "px-3 py-2 text-left text-xs" }, "Category"),
            React.createElement('th', { className: "px-3 py-2 text-right text-xs" }, "Amount"),
            React.createElement('th', { className: "px-3 py-2 text-right text-xs" }, "%")
          )
        ),
        React.createElement('tbody', { className: "divide-y divide-border" }, tableRows),
        React.createElement('tfoot', { className: "border-t-2 border-border" },
          React.createElement('tr', { className: "font-bold" },
            React.createElement('td', { className: "px-3 py-2" }, "TOTAL"),
            React.createElement('td', { className: "px-3 py-2 text-right font-mono" }, formatCurrency(total)),
            React.createElement('td', { className: "px-3 py-2 text-right" }, "100%")
          )
        )
      )
    ),
    React.createElement(Button, { variant: "outline", size: "sm", onClick: () => exportToCSV(data, 'expense_by_category') }, "Export CSV")
  );
}







function VATReport() {
  const [output, setOutput] = useState(0);
  const [input, setInput] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterProject, setFilterProject] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    async function loadProjects() {
      try {
        const token = localStorage.getItem('token');
        const projectsRes = await fetch(`${API_BASE_URL}/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const projectsData = await projectsRes.json();
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
        
        let income = await fetch(`${API_BASE_URL}/income`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        
        let expenses = await fetch(`${API_BASE_URL}/expenses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        
        if (filterProject !== 'all') {
          const projectIdNum = parseInt(filterProject);
          income = income.filter(i => i.project_id === projectIdNum);
          expenses = expenses.filter(e => e.project_id === projectIdNum);
        }
        
        if (dateRange.start) {
          income = income.filter(i => i.date >= dateRange.start);
          expenses = expenses.filter(e => e.date >= dateRange.start);
        }
        if (dateRange.end) {
          income = income.filter(i => i.date <= dateRange.end);
          expenses = expenses.filter(e => e.date <= dateRange.end);
        }
        
        const outputVAT = income.reduce((s, i) => s + calculateVAT(i.gross_amount), 0);
        const inputVAT = expenses.reduce((s, e) => s + (e.vat || 0), 0);
        
        setOutput(outputVAT);
        setInput(inputVAT);
        setLoading(false);
      } catch (err) {
        console.error('Error loading VAT data:', err);
        setLoading(false);
      }
    }
    loadData();
  }, [filterProject, dateRange.start, dateRange.end]);

  if (loading) {
    return React.createElement('div', { className: "text-center py-8" }, "Loading VAT data...");
  }

  return React.createElement('div', { className: "space-y-4" },
    React.createElement('div', { className: "flex flex-wrap gap-4 justify-between items-center" },
      React.createElement('div', { className: "flex gap-2 flex-wrap" },
        React.createElement('select', {
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: filterProject,
          onChange: (e) => setFilterProject(e.target.value)
        },
          React.createElement('option', { value: "all" }, "All Projects"),
          projects.map(p => React.createElement('option', { key: p.id, value: p.id }, p.name))
        ),
        React.createElement('input', {
          type: "date",
          placeholder: "Start Date",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: dateRange.start,
          onChange: (e) => setDateRange({ ...dateRange, start: e.target.value })
        }),
        React.createElement('input', {
          type: "date",
          placeholder: "End Date",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: dateRange.end,
          onChange: (e) => setDateRange({ ...dateRange, end: e.target.value })
        }),
        (dateRange.start || dateRange.end) && React.createElement('button', {
          className: "px-3 py-1.5 text-sm text-red-500 hover:text-red-700",
          onClick: () => setDateRange({ start: '', end: '' })
        }, "Clear Dates")
      )
    ),
    React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
      React.createElement('div', { className: "bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-800" },
        React.createElement('p', { className: "text-xs text-blue-600 dark:text-blue-400" }, "Output VAT (16% of gross income)"),
        React.createElement('p', { className: "text-2xl font-bold text-blue-700 dark:text-blue-300" }, formatCurrency(output))
      ),
      React.createElement('div', { className: "bg-green-50 dark:bg-green-950/30 rounded-lg p-4 text-center border border-green-200 dark:border-green-800" },
        React.createElement('p', { className: "text-xs text-green-600 dark:text-green-400" }, "Input VAT (from expenses)"),
        React.createElement('p', { className: "text-2xl font-bold text-green-700 dark:text-green-300" }, formatCurrency(input))
      ),
      React.createElement('div', { className: `rounded-lg p-4 text-center border ${output - input >= 0 ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800' : 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800'}` },
        React.createElement('p', { className: `text-xs ${output - input >= 0 ? 'text-orange-600 dark:text-orange-400' : 'text-purple-600 dark:text-purple-400'}` }, "Net VAT"),
        React.createElement('p', { className: `text-2xl font-bold ${output - input >= 0 ? 'text-orange-700 dark:text-orange-300' : 'text-purple-700 dark:text-purple-300'}` }, 
          formatCurrency(Math.abs(output - input)), output - input >= 0 ? ' (Payable)' : ' (Refundable)'
        )
      )
    )
  );
}








function PayrollSummaryReport() {
  const { payrollRecords, projects, selectedProjectId } = useAppStore();
  const [data, setData] = useState([]);
  const [filterProject, setFilterProject] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filteredRecords, setFilteredRecords] = useState([]);

  useEffect(() => {
    let records = payrollRecords || [];
    
    // Filter by project
    if (filterProject !== 'all') {
      const projectIdNum = parseInt(filterProject);
      records = records.filter(r => r.projectId === projectIdNum || r.project_id === projectIdNum);
    }
    
    // Filter by date range
    if (dateRange.start) {
      records = records.filter(r => r.weekEnd >= dateRange.start || r.date >= dateRange.start);
    }
    if (dateRange.end) {
      records = records.filter(r => r.weekEnd <= dateRange.end || r.date <= dateRange.end);
    }
    
    setFilteredRecords(records);
    
    // Group by project
    let projectsToUse = projects || [];
    if (filterProject !== 'all') {
      projectsToUse = projectsToUse.filter(p => p.id === parseInt(filterProject));
    }
    
    const results = projectsToUse.map(p => {
      const recordsForProject = records.filter(r => r.projectId === p.id || r.project_id === p.id);
      const totalPaid = recordsForProject
        .filter(r => r.status === 'Paid')
        .reduce((s, r) => s + (r.totalGrossPay || r.total_gross_pay || 0), 0);
      const totalPending = recordsForProject
        .filter(r => r.status !== 'Paid')
        .reduce((s, r) => s + (r.totalGrossPay || r.total_gross_pay || 0), 0);
      
      return {
        project: p.name,
        weeks: recordsForProject.length,
        totalPaid: totalPaid,
        totalPending: totalPending
      };
    }).filter(d => d.weeks > 0);
    
    setData(results);
  }, [payrollRecords, projects, filterProject, dateRange.start, dateRange.end]);

  const uniqueProjects = (projects || []).filter(p => 
    (payrollRecords || []).some(r => r.projectId === p.id || r.project_id === p.id)
  );

  const totals = data.reduce((acc, d) => ({
    paid: acc.paid + d.totalPaid,
    pending: acc.pending + d.totalPending
  }), { paid: 0, pending: 0 });

  if (!payrollRecords || payrollRecords.length === 0) {
    return React.createElement('div', { className: "text-center py-8 text-muted-foreground" }, 
      "No payroll records found. Please add payroll data first."
    );
  }

  const tableRows = data.map(d => 
    React.createElement('tr', { key: d.project },
      React.createElement('td', { className: "px-3 py-2" }, d.project),
      React.createElement('td', { className: "px-3 py-2 text-center" }, d.weeks),
      React.createElement('td', { className: "px-3 py-2 text-right font-mono text-success" }, formatCurrency(d.totalPaid)),
      React.createElement('td', { className: "px-3 py-2 text-right font-mono text-warning" }, formatCurrency(d.totalPending))
    )
  );

  return React.createElement('div', { className: "space-y-4" },
    React.createElement('div', { className: "flex flex-wrap gap-4 justify-between items-center" },
      React.createElement('div', { className: "flex gap-2 flex-wrap" },
        React.createElement('select', {
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: filterProject,
          onChange: (e) => setFilterProject(e.target.value)
        },
          React.createElement('option', { value: "all" }, "All Projects"),
          uniqueProjects.map(p => React.createElement('option', { key: p.id, value: p.id }, p.name))
        ),
        React.createElement('input', {
          type: "date",
          placeholder: "Start Date",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: dateRange.start,
          onChange: (e) => setDateRange({ ...dateRange, start: e.target.value })
        }),
        React.createElement('input', {
          type: "date",
          placeholder: "End Date",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: dateRange.end,
          onChange: (e) => setDateRange({ ...dateRange, end: e.target.value })
        }),
        (dateRange.start || dateRange.end) && React.createElement('button', {
          className: "px-3 py-1.5 text-sm text-red-500 hover:text-red-700",
          onClick: () => setDateRange({ start: '', end: '' })
        }, "Clear Dates")
      ),
      React.createElement('p', { className: "text-xs text-muted-foreground" }, `${data.length} projects, ${filteredRecords.length} records`)
    ),
    // Summary Cards
    React.createElement('div', { className: "grid grid-cols-2 gap-4" },
      React.createElement('div', { className: "bg-green-50 dark:bg-green-950/30 rounded-lg p-4 text-center border border-green-200 dark:border-green-800" },
        React.createElement('p', { className: "text-xs text-green-600 dark:text-green-400" }, "Total Paid"),
        React.createElement('p', { className: "text-2xl font-bold text-green-700 dark:text-green-300" }, formatCurrency(totals.paid))
      ),
      React.createElement('div', { className: "bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-4 text-center border border-yellow-200 dark:border-yellow-800" },
        React.createElement('p', { className: "text-xs text-yellow-600 dark:text-yellow-400" }, "Total Pending"),
        React.createElement('p', { className: "text-2xl font-bold text-yellow-700 dark:text-yellow-300" }, formatCurrency(totals.pending))
      )
    ),
    React.createElement('table', { className: "w-full text-sm" },
      React.createElement('thead', null,
        React.createElement('tr', { className: "border-b border-border" },
          React.createElement('th', { className: "px-3 py-2 text-left text-xs" }, "Project"),
          React.createElement('th', { className: "px-3 py-2 text-center text-xs" }, "Weeks"),
          React.createElement('th', { className: "px-3 py-2 text-right text-xs" }, "Paid"),
          React.createElement('th', { className: "px-3 py-2 text-right text-xs" }, "Pending")
        )
      ),
      React.createElement('tbody', { className: "divide-y divide-border" }, tableRows)
    ),
    React.createElement(Button, { variant: "outline", size: "sm", onClick: () => exportToCSV(data, 'payroll_summary') }, "Export CSV")
  );
}





function OrdersReport() {
  const [ordered, setOrdered] = useState([]);
  const [supplied, setSupplied] = useState([]);
  const [unpaid, setUnpaid] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterProject, setFilterProject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [projects, setProjects] = useState([]);
  const [allOrders, setAllOrders] = useState([]);

  useEffect(() => {
    async function loadProjects() {
      try {
        const token = localStorage.getItem('token');
        const projectsRes = await fetch(`${API_BASE_URL}/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const projectsData = await projectsRes.json();
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
        let orders = await fetch(`${API_BASE_URL}/purchase-orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        
        if (filterProject !== 'all') {
          const projectIdNum = parseInt(filterProject);
          orders = orders.filter(o => o.project_id === projectIdNum);
        }
        
        if (dateRange.start) {
          orders = orders.filter(o => o.order_date >= dateRange.start);
        }
        if (dateRange.end) {
          orders = orders.filter(o => o.order_date <= dateRange.end);
        }
        
        setAllOrders(orders);
        setOrdered(orders.filter(o => o.status === 'Ordered'));
        setSupplied(orders.filter(o => o.status === 'Supplied'));
        setUnpaid(orders.filter(o => o.payment_status === 'Unpaid'));
        setFilteredOrders(orders);
        setLoading(false);
      } catch (err) {
        console.error('Error loading orders:', err);
        setLoading(false);
      }
    }
    loadData();
  }, [filterProject, dateRange.start, dateRange.end]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = allOrders.filter(order => 
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.project_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
      setOrdered(filtered.filter(o => o.status === 'Ordered'));
      setSupplied(filtered.filter(o => o.status === 'Supplied'));
      setUnpaid(filtered.filter(o => o.payment_status === 'Unpaid'));
    } else {
      setFilteredOrders(allOrders);
      setOrdered(allOrders.filter(o => o.status === 'Ordered'));
      setSupplied(allOrders.filter(o => o.status === 'Supplied'));
      setUnpaid(allOrders.filter(o => o.payment_status === 'Unpaid'));
    }
  }, [searchTerm, allOrders]);

  if (loading) {
    return React.createElement('div', { className: "text-center py-8" }, "Loading orders data...");
  }

  const totals = {
    orderedValue: ordered.reduce((s, o) => s + o.total, 0),
    suppliedValue: supplied.reduce((s, o) => s + o.total, 0),
    unpaidValue: unpaid.reduce((s, o) => s + o.total, 0)
  };

  return React.createElement('div', { className: "space-y-4" },
    React.createElement('div', { className: "flex flex-wrap gap-4 justify-between items-center" },
      React.createElement('div', { className: "flex gap-2 flex-wrap" },
        React.createElement('input', {
          type: "text",
          placeholder: "🔍 Search PO #, supplier...",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background w-48",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value)
        }),
        React.createElement('select', {
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: filterProject,
          onChange: (e) => setFilterProject(e.target.value)
        },
          React.createElement('option', { value: "all" }, "All Projects"),
          projects.map(p => React.createElement('option', { key: p.id, value: p.id }, p.name))
        ),
        React.createElement('input', {
          type: "date",
          placeholder: "Start Date",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: dateRange.start,
          onChange: (e) => setDateRange({ ...dateRange, start: e.target.value })
        }),
        React.createElement('input', {
          type: "date",
          placeholder: "End Date",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: dateRange.end,
          onChange: (e) => setDateRange({ ...dateRange, end: e.target.value })
        }),
        (dateRange.start || dateRange.end) && React.createElement('button', {
          className: "px-3 py-1.5 text-sm text-red-500 hover:text-red-700",
          onClick: () => setDateRange({ start: '', end: '' })
        }, "Clear Dates")
      ),
      React.createElement('p', { className: "text-xs text-muted-foreground" }, `${filteredOrders.length} orders`)
    ),
    React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
      React.createElement('div', { className: "bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-800" },
        React.createElement('p', { className: "text-xs text-blue-600 dark:text-blue-400" }, "Pending Delivery"),
        React.createElement('p', { className: "text-xl font-bold text-blue-700 dark:text-blue-300" }, ordered.length),
        React.createElement('p', { className: "text-xs text-muted-foreground" }, formatCurrency(totals.orderedValue))
      ),
      React.createElement('div', { className: "bg-green-50 dark:bg-green-950/30 rounded-lg p-4 text-center border border-green-200 dark:border-green-800" },
        React.createElement('p', { className: "text-xs text-green-600 dark:text-green-400" }, "Supplied"),
        React.createElement('p', { className: "text-xl font-bold text-green-700 dark:text-green-300" }, supplied.length),
        React.createElement('p', { className: "text-xs text-muted-foreground" }, formatCurrency(totals.suppliedValue))
      ),
      React.createElement('div', { className: "bg-red-50 dark:bg-red-950/30 rounded-lg p-4 text-center border border-red-200 dark:border-red-800" },
        React.createElement('p', { className: "text-xs text-red-600 dark:text-red-400" }, "Unpaid"),
        React.createElement('p', { className: "text-xl font-bold text-red-700 dark:text-red-300" }, unpaid.length),
        React.createElement('p', { className: "text-xs text-muted-foreground" }, formatCurrency(totals.unpaidValue))
      )
    )
  );
}





function StoresSummaryReport() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterProject, setFilterProject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    async function loadProjects() {
      try {
        const token = localStorage.getItem('token');
        const projectsRes = await fetch(`${API_BASE_URL}/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const projectsData = await projectsRes.json();
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
        let transactions = await fetch(`${API_BASE_URL}/store-transactions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        
        if (filterProject !== 'all') {
          const projectIdNum = parseInt(filterProject);
          transactions = transactions.filter(t => t.project_id === projectIdNum);
        }
        
        if (dateRange.start) {
          transactions = transactions.filter(t => t.date >= dateRange.start);
        }
        if (dateRange.end) {
          transactions = transactions.filter(t => t.date <= dateRange.end);
        }
        
        const map = new Map();
        transactions.forEach(t => {
          const key = `${t.project_id}-${t.item_id}`;
          if (!map.has(key)) {
            map.set(key, {
              item: `${t.item_name} (${t.project_name})`,
              projectId: t.project_id,
              projectName: t.project_name,
              supplied: 0,
              issued: 0,
              returned: 0,
              balance: 0
            });
          }
          const b = map.get(key);
          b.supplied += t.quantity_supplied || 0;
          b.issued += t.quantity_issued || 0;
          b.returned += t.quantity_returned || 0;
          b.balance = b.supplied - b.issued + b.returned;
        });
        
        const results = Array.from(map.values());
        setData(results);
        setFilteredData(results);
        setLoading(false);
      } catch (err) {
        console.error('Error loading store data:', err);
        setLoading(false);
      }
    }
    loadData();
  }, [filterProject, dateRange.start, dateRange.end]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = data.filter(item => 
        item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.projectName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchTerm, data]);

  if (loading) {
    return React.createElement('div', { className: "text-center py-8" }, "Loading store data...");
  }

  const tableRows = filteredData.map(d => 
    React.createElement('tr', { key: d.item },
      React.createElement('td', { className: "px-3 py-2" }, d.item),
      React.createElement('td', { className: "px-3 py-2 text-center font-mono" }, d.supplied),
      React.createElement('td', { className: "px-3 py-2 text-center font-mono" }, d.issued),
      React.createElement('td', { className: "px-3 py-2 text-center font-mono" }, d.returned),
      React.createElement('td', { className: `px-3 py-2 text-center font-mono font-bold ${d.balance <= 10 ? 'text-destructive' : ''}` }, d.balance)
    )
  );

  return React.createElement('div', { className: "space-y-4" },
    React.createElement('div', { className: "flex flex-wrap gap-4 justify-between items-center" },
      React.createElement('div', { className: "flex gap-2 flex-wrap" },
        React.createElement('input', {
          type: "text",
          placeholder: "🔍 Search item or project...",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background w-56",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value)
        }),
        React.createElement('select', {
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: filterProject,
          onChange: (e) => setFilterProject(e.target.value)
        },
          React.createElement('option', { value: "all" }, "All Projects"),
          projects.map(p => React.createElement('option', { key: p.id, value: p.id }, p.name))
        ),
        React.createElement('input', {
          type: "date",
          placeholder: "Start Date",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: dateRange.start,
          onChange: (e) => setDateRange({ ...dateRange, start: e.target.value })
        }),
        React.createElement('input', {
          type: "date",
          placeholder: "End Date",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: dateRange.end,
          onChange: (e) => setDateRange({ ...dateRange, end: e.target.value })
        }),
        (dateRange.start || dateRange.end) && React.createElement('button', {
          className: "px-3 py-1.5 text-sm text-red-500 hover:text-red-700",
          onClick: () => setDateRange({ start: '', end: '' })
        }, "Clear Dates")
      ),
      React.createElement('p', { className: "text-xs text-muted-foreground" }, `${filteredData.length} items`)
    ),
    React.createElement('div', { className: "overflow-x-auto" },
      React.createElement('table', { className: "w-full text-sm" },
        React.createElement('thead', null,
          React.createElement('tr', { className: "border-b border-border" },
            React.createElement('th', { className: "px-3 py-2 text-left text-xs" }, "Item (Project)"),
            React.createElement('th', { className: "px-3 py-2 text-center text-xs" }, "Supplied"),
            React.createElement('th', { className: "px-3 py-2 text-center text-xs" }, "Issued"),
            React.createElement('th', { className: "px-3 py-2 text-center text-xs" }, "Returned"),
            React.createElement('th', { className: "px-3 py-2 text-center text-xs" }, "Balance")
          )
        ),
        React.createElement('tbody', { className: "divide-y divide-border" }, tableRows)
      )
    ),
    React.createElement(Button, { variant: "outline", size: "sm", onClick: () => exportToCSV(filteredData, 'stores_ledger') }, "Export CSV")
  );
}







function SiteDiaryReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterProject, setFilterProject] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    async function loadProjects() {
      try {
        const token = localStorage.getItem('token');
        const projectsRes = await fetch(`${API_BASE_URL}/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const projectsData = await projectsRes.json();
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
        let entries = await fetch(`${API_BASE_URL}/site-diary-entries`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        
        if (filterProject !== 'all') {
          const projectIdNum = parseInt(filterProject);
          entries = entries.filter(e => e.projectId === projectIdNum);
        }
        
        if (dateRange.start) {
          entries = entries.filter(e => e.date >= dateRange.start);
        }
        if (dateRange.end) {
          entries = entries.filter(e => e.date <= dateRange.end);
        }
        
        const results = entries.map(entry => ({
          date: entry.date,
          project: entry.projectName,
          weather: entry.weather?.condition || 'N/A',
          workers: entry.totalWorkers || 0,
          activities: entry.activities?.map(a => a.description).join(', ') || 'None',
          equipment: [...new Set(entry.activities?.map(a => a.equipment_used).filter(Boolean))].join(', '),
          materials: [...new Set(entry.activities?.map(a => a.materials_used).filter(Boolean))].join(', '),
          challenges: entry.challenges?.join(', ') || 'None'
        }));
        
        setData(results);
        setLoading(false);
      } catch (err) {
        console.error('Error loading site diary data:', err);
        setLoading(false);
      }
    }
    loadData();
  }, [filterProject, dateRange.start, dateRange.end]);

  if (loading) {
    return React.createElement('div', { className: "text-center py-8" }, "Loading site diary data...");
  }

  // Summary statistics
  const totalWorkers = data.reduce((sum, d) => sum + d.workers, 0);
  const totalDays = data.length;
  const avgWorkersPerDay = totalDays > 0 ? (totalWorkers / totalDays).toFixed(1) : 0;

  const tableRows = data.map((d, idx) => 
    React.createElement('tr', { key: idx },
      React.createElement('td', { className: "px-3 py-2" }, d.date),
      React.createElement('td', { className: "px-3 py-2 font-medium" }, d.project),
      React.createElement('td', { className: "px-3 py-2 text-center" }, d.weather),
      React.createElement('td', { className: "px-3 py-2 text-center" }, d.workers),
      React.createElement('td', { className: "px-3 py-2 text-xs max-w-[200px] truncate" }, d.activities),
      React.createElement('td', { className: "px-3 py-2 text-xs max-w-[150px] truncate" }, d.challenges)
    )
  );

  return React.createElement('div', { className: "space-y-4" },
    React.createElement('div', { className: "flex flex-wrap gap-4 justify-between items-center" },
      React.createElement('div', { className: "flex gap-2 flex-wrap" },
        React.createElement('select', {
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: filterProject,
          onChange: (e) => setFilterProject(e.target.value)
        },
          React.createElement('option', { value: "all" }, "All Projects"),
          projects.map(p => React.createElement('option', { key: p.id, value: p.id }, p.name))
        ),
        React.createElement('input', {
          type: "date",
          placeholder: "Start Date",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: dateRange.start,
          onChange: (e) => setDateRange({ ...dateRange, start: e.target.value })
        }),
        React.createElement('input', {
          type: "date",
          placeholder: "End Date",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: dateRange.end,
          onChange: (e) => setDateRange({ ...dateRange, end: e.target.value })
        }),
        (dateRange.start || dateRange.end) && React.createElement('button', {
          className: "px-3 py-1.5 text-sm text-red-500 hover:text-red-700",
          onClick: () => setDateRange({ start: '', end: '' })
        }, "Clear Dates")
      ),
      React.createElement('p', { className: "text-xs text-muted-foreground" }, `${data.length} entries`)
    ),
    
    // Summary Cards
    React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
      React.createElement('div', { className: "bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-800" },
        React.createElement('p', { className: "text-xs text-blue-600 dark:text-blue-400" }, "Total Days"),
        React.createElement('p', { className: "text-2xl font-bold text-blue-700 dark:text-blue-300" }, totalDays)
      ),
      React.createElement('div', { className: "bg-green-50 dark:bg-green-950/30 rounded-lg p-4 text-center border border-green-200 dark:border-green-800" },
        React.createElement('p', { className: "text-xs text-green-600 dark:text-green-400" }, "Total Worker Days"),
        React.createElement('p', { className: "text-2xl font-bold text-green-700 dark:text-green-300" }, totalWorkers)
      ),
      React.createElement('div', { className: "bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 text-center border border-purple-200 dark:border-purple-800" },
        React.createElement('p', { className: "text-xs text-purple-600 dark:text-purple-400" }, "Avg Workers/Day"),
        React.createElement('p', { className: "text-2xl font-bold text-purple-700 dark:text-purple-300" }, avgWorkersPerDay)
      ),
      React.createElement('div', { className: "bg-orange-50 dark:bg-orange-950/30 rounded-lg p-4 text-center border border-orange-200 dark:border-orange-800" },
        React.createElement('p', { className: "text-xs text-orange-600 dark:text-orange-400" }, "Projects"),
        React.createElement('p', { className: "text-2xl font-bold text-orange-700 dark:text-orange-300" }, [...new Set(data.map(d => d.project))].length)
      )
    ),
    
    // Main Table
    React.createElement('div', { className: "overflow-x-auto" },
      React.createElement('table', { className: "w-full text-sm" },
        React.createElement('thead', null,
          React.createElement('tr', { className: "border-b border-border" },
            React.createElement('th', { className: "px-3 py-2 text-left text-xs font-medium text-muted-foreground" }, "Date"),
            React.createElement('th', { className: "px-3 py-2 text-left text-xs font-medium text-muted-foreground" }, "Project"),
            React.createElement('th', { className: "px-3 py-2 text-center text-xs font-medium text-muted-foreground" }, "Weather"),
            React.createElement('th', { className: "px-3 py-2 text-center text-xs font-medium text-muted-foreground" }, "Workers"),
            React.createElement('th', { className: "px-3 py-2 text-left text-xs font-medium text-muted-foreground" }, "Activities"),
            React.createElement('th', { className: "px-3 py-2 text-left text-xs font-medium text-muted-foreground" }, "Challenges")
          )
        ),
        React.createElement('tbody', { className: "divide-y divide-border" }, tableRows),
        data.length === 0 && React.createElement('tbody', null,
          React.createElement('tr', null,
            React.createElement('td', { colSpan: "6", className: "px-3 py-8 text-center text-muted-foreground" }, "No site diary entries found")
          )
        )
      )
    ),
    React.createElement(Button, { variant: "outline", size: "sm", onClick: () => exportToCSV(data, 'site_diary_report') }, "Export CSV")
  );
}









function SubcontractorsLedgerReport() {
  const { selectedProjectId } = useAppStore();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterProject, setFilterProject] = useState('all');
  const [filterSubcontractor, setFilterSubcontractor] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [projects, setProjects] = useState([]);
  const [subcontractors, setSubcontractors] = useState([]);

  useEffect(() => {
    async function loadProjectsAndSubcontractors() {
      try {
        const token = localStorage.getItem('token');
        const [projectsRes, subsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/projects`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/subcontractors`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        const projectsData = await projectsRes.json();
        const subsData = await subsRes.json();
        setProjects(projectsData.filter(p => p.status === 'Active'));
        setSubcontractors(subsData);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    }
    loadProjectsAndSubcontractors();
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        let quotations = await fetch(`${API_BASE_URL}/quotations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        
        let expenses = await fetch(`${API_BASE_URL}/expenses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        
        let allSubcontractors = await fetch(`${API_BASE_URL}/subcontractors`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        
        // Apply global project filter
        if (selectedProjectId && selectedProjectId !== 'all') {
          const projectIdNum = parseInt(selectedProjectId);
          quotations = quotations.filter(q => q.project_id === projectIdNum);
          expenses = expenses.filter(e => e.project_id === projectIdNum);
        }
        
        // Apply local project filter
        if (filterProject !== 'all') {
          const projectIdNum = parseInt(filterProject);
          quotations = quotations.filter(q => q.project_id === projectIdNum);
          expenses = expenses.filter(e => e.project_id === projectIdNum);
        }
        
        // Apply date range filter
        if (dateRange.start) {
          quotations = quotations.filter(q => q.date >= dateRange.start);
          expenses = expenses.filter(e => e.date >= dateRange.start);
        }
        if (dateRange.end) {
          quotations = quotations.filter(q => q.date <= dateRange.end);
          expenses = expenses.filter(e => e.date <= dateRange.end);
        }
        
        const subExpenses = expenses.filter(e => e.category === 'Subcontractor' && e.status === 'Paid');
        
        // Apply subcontractor filter
        let subsToUse = allSubcontractors;
        if (filterSubcontractor !== 'all') {
          subsToUse = subsToUse.filter(s => s.id === parseInt(filterSubcontractor));
        }
        
        const results = subsToUse.map(sub => {
          const subQuotes = quotations.filter(q => q.subcontractor_id === sub.id);
          const totalContracted = subQuotes.reduce((sum, q) => sum + (q.amount || 0), 0);
          const subPayments = subExpenses.filter(e => (e.subcontractor_id || e.subcontractorId) === sub.id);
          const totalPaid = subPayments.reduce((sum, e) => sum + (e.amount || 0), 0);
          
          if (totalContracted === 0 && totalPaid === 0) return null;
          
          return {
            id: sub.id,
            name: sub.name,
            specialization: sub.specialization || '-',
            contracted: totalContracted,
            paid: totalPaid,
            balance: totalContracted - totalPaid,
            payments: subPayments.length,
            quotes: subQuotes.length
          };
        }).filter(Boolean);
        
        setData(results);
        setFilteredData(results);
        setLoading(false);
      } catch (err) {
        console.error('Error loading subcontractor ledger:', err);
        setLoading(false);
      }
    }
    loadData();
  }, [selectedProjectId, filterProject, filterSubcontractor, dateRange.start, dateRange.end]);

  // Apply search filter
  useEffect(() => {
    if (searchTerm) {
      const filtered = data.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchTerm, data]);

  if (loading) {
    return React.createElement('div', { className: "text-center py-8" }, "Loading subcontractor ledger...");
  }

  const totals = filteredData.reduce((acc, d) => ({
    contracted: acc.contracted + d.contracted,
    paid: acc.paid + d.paid,
    balance: acc.balance + d.balance
  }), { contracted: 0, paid: 0, balance: 0 });

  const tableRows = filteredData.map(d => 
    React.createElement('tr', { key: d.id },
      React.createElement('td', { className: "px-3 py-2 font-medium" }, d.name),
      React.createElement('td', { className: "px-3 py-2 text-muted-foreground" }, d.specialization),
      React.createElement('td', { className: "px-3 py-2 text-right font-mono" }, formatCurrency(d.contracted)),
      React.createElement('td', { className: "px-3 py-2 text-right font-mono text-success" }, formatCurrency(d.paid)),
      React.createElement('td', { className: `px-3 py-2 text-right font-mono font-bold ${d.balance > 0 ? 'text-red-600' : d.balance < 0 ? 'text-orange-600' : 'text-green-600'}` },
        formatCurrency(Math.abs(d.balance)), d.balance > 0 ? ' (Owed)' : d.balance < 0 ? ' (Overpaid)' : ' (Settled)'
      ),
      React.createElement('td', { className: "px-3 py-2 text-center" }, d.quotes),
      React.createElement('td', { className: "px-3 py-2 text-center" }, d.payments)
    )
  );

  return React.createElement('div', { className: "space-y-4" },
    // Filters
    React.createElement('div', { className: "flex flex-wrap gap-4 justify-between items-center" },
      React.createElement('div', { className: "flex gap-2 flex-wrap" },
        React.createElement('input', {
          type: "text",
          placeholder: "🔍 Search subcontractor...",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background w-48",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value)
        }),
        React.createElement('select', {
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: filterProject,
          onChange: (e) => setFilterProject(e.target.value)
        },
          React.createElement('option', { value: "all" }, "All Projects"),
          projects.map(p => React.createElement('option', { key: p.id, value: p.id }, p.name))
        ),
        React.createElement('select', {
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: filterSubcontractor,
          onChange: (e) => setFilterSubcontractor(e.target.value)
        },
          React.createElement('option', { value: "all" }, "All Subcontractors"),
          subcontractors.map(s => React.createElement('option', { key: s.id, value: s.id }, s.name))
        ),
        React.createElement('input', {
          type: "date",
          placeholder: "Start Date",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: dateRange.start,
          onChange: (e) => setDateRange({ ...dateRange, start: e.target.value })
        }),
        React.createElement('input', {
          type: "date",
          placeholder: "End Date",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: dateRange.end,
          onChange: (e) => setDateRange({ ...dateRange, end: e.target.value })
        }),
        (dateRange.start || dateRange.end) && React.createElement('button', {
          className: "px-3 py-1.5 text-sm text-red-500 hover:text-red-700",
          onClick: () => setDateRange({ start: '', end: '' })
        }, "Clear Dates")
      ),
      React.createElement('p', { className: "text-xs text-muted-foreground" }, `${filteredData.length} subcontractors`)
    ),
    
    // Summary Cards
    React.createElement('div', { className: "grid grid-cols-3 gap-4" },
      React.createElement('div', { className: "bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-800" },
        React.createElement('p', { className: "text-xs text-blue-600 dark:text-blue-400" }, "Total Contracted"),
        React.createElement('p', { className: "text-xl font-bold text-blue-700 dark:text-blue-300" }, formatCurrency(totals.contracted))
      ),
      React.createElement('div', { className: "bg-green-50 dark:bg-green-950/30 rounded-lg p-4 text-center border border-green-200 dark:border-green-800" },
        React.createElement('p', { className: "text-xs text-green-600 dark:text-green-400" }, "Total Paid"),
        React.createElement('p', { className: "text-xl font-bold text-green-700 dark:text-green-300" }, formatCurrency(totals.paid))
      ),
      React.createElement('div', { className: `rounded-lg p-4 text-center border ${totals.balance > 0 ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800' : totals.balance < 0 ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'}` },
        React.createElement('p', { className: `text-xs ${totals.balance > 0 ? 'text-orange-600 dark:text-orange-400' : totals.balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}` }, "Net Balance"),
        React.createElement('p', { className: `text-xl font-bold ${totals.balance > 0 ? 'text-orange-700 dark:text-orange-300' : totals.balance < 0 ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'}` }, 
          formatCurrency(Math.abs(totals.balance)), 
          totals.balance > 0 ? ' (Owed)' : totals.balance < 0 ? ' (Overpaid)' : ' (Settled)'
        )
      )
    ),
    
    // Main Table
    React.createElement('div', { className: "overflow-x-auto" },
      React.createElement('table', { className: "w-full text-sm" },
        React.createElement('thead', null,
          React.createElement('tr', { className: "border-b border-border" },
            React.createElement('th', { className: "px-3 py-2 text-left text-xs font-medium text-muted-foreground" }, "Subcontractor"),
            React.createElement('th', { className: "px-3 py-2 text-left text-xs font-medium text-muted-foreground" }, "Specialization"),
            React.createElement('th', { className: "px-3 py-2 text-right text-xs font-medium text-muted-foreground" }, "Contracted"),
            React.createElement('th', { className: "px-3 py-2 text-right text-xs font-medium text-muted-foreground" }, "Paid"),
            React.createElement('th', { className: "px-3 py-2 text-right text-xs font-medium text-muted-foreground" }, "Balance"),
            React.createElement('th', { className: "px-3 py-2 text-center text-xs font-medium text-muted-foreground" }, "Quotes"),
            React.createElement('th', { className: "px-3 py-2 text-center text-xs font-medium text-muted-foreground" }, "Payments")
          )
        ),
        React.createElement('tbody', { className: "divide-y divide-border" }, tableRows),
        filteredData.length === 0 && React.createElement('tbody', null,
          React.createElement('tr', null,
            React.createElement('td', { colSpan: "7", className: "px-3 py-8 text-center text-muted-foreground" }, "No subcontractor data found")
          )
        ),
        filteredData.length > 0 && React.createElement('tfoot', { className: "border-t-2 border-border" },
          React.createElement('tr', { className: "font-bold" },
            React.createElement('td', { colSpan: "2", className: "px-3 py-2" }, "TOTALS"),
            React.createElement('td', { className: "px-3 py-2 text-right font-mono" }, formatCurrency(totals.contracted)),
            React.createElement('td', { className: "px-3 py-2 text-right font-mono text-success" }, formatCurrency(totals.paid)),
            React.createElement('td', { className: `px-3 py-2 text-right font-mono ${totals.balance > 0 ? 'text-orange-600' : totals.balance < 0 ? 'text-red-600' : 'text-green-600'}` },
              formatCurrency(Math.abs(totals.balance))
            ),
            React.createElement('td', { colSpan: "2" })
          )
        )
      )
    ),
    
    // Export Button
    React.createElement(Button, { variant: "outline", size: "sm", onClick: () => exportToCSV(filteredData, 'subcontractors_ledger') }, "Export CSV")
  );
}








function SuppliersLedgerReport() {
  const { suppliers, purchaseOrders, expenses } = useAppStore();

  const data = useMemo(() => {
    return suppliers.map(sup => {
      const orders = purchaseOrders.filter(o => o.supplierId === sup.id);
      const totalOrdered = orders.reduce((s, o) => s + o.total, 0);
      const totalPaidOrders = orders.filter(o => o.paymentStatus === 'Paid').reduce((s, o) => s + o.total, 0);
      const supplierExpenses = expenses.filter(e => e.category === 'Supplier' && e.description.includes(sup.name) && e.status === 'Paid');
      const totalPaid = totalPaidOrders || supplierExpenses.reduce((s, e) => s + e.amount, 0);
      const balance = totalOrdered - totalPaid;
      return { name: sup.name, phone: sup.phone, orders: orders.length, totalOrdered, totalPaid, balance };
    }).filter(d => d.orders > 0);
  }, [suppliers, purchaseOrders, expenses]);

  const totals = data.reduce((acc, d) => ({ ordered: acc.ordered + d.totalOrdered, paid: acc.paid + d.totalPaid, balance: acc.balance + d.balance }), { ordered: 0, paid: 0, balance: 0 });

  if (data.length === 0) {
    return React.createElement('div', { className: "text-center py-8 text-muted-foreground" }, "No supplier orders found");
  }

  return React.createElement('div', { className: "space-y-4" },
    React.createElement('table', { className: "w-full text-sm" },
      React.createElement('thead', null,
        React.createElement('tr', { className: "border-b border-border" },
          React.createElement('th', { className: "px-3 py-2 text-left text-xs" }, "Supplier"),
          React.createElement('th', { className: "px-3 py-2 text-center text-xs" }, "Orders"),
          React.createElement('th', { className: "px-3 py-2 text-right text-xs" }, "Total Ordered"),
          React.createElement('th', { className: "px-3 py-2 text-right text-xs" }, "Total Paid"),
          React.createElement('th', { className: "px-3 py-2 text-right text-xs" }, "Balance")
        )
      ),
      React.createElement('tbody', { className: "divide-y divide-border" },
        data.map(d => 
          React.createElement('tr', { key: d.name },
            React.createElement('td', { className: "px-3 py-2 font-medium" }, d.name),
            React.createElement('td', { className: "px-3 py-2 text-center" }, d.orders),
            React.createElement('td', { className: "px-3 py-2 text-right font-mono" }, formatCurrency(d.totalOrdered)),
            React.createElement('td', { className: "px-3 py-2 text-right font-mono text-success" }, formatCurrency(d.totalPaid)),
            React.createElement('td', { className: "px-3 py-2 text-right font-mono font-bold " + (d.balance > 0 ? 'text-destructive' : 'text-success') }, formatCurrency(d.balance))
          )
        ),
        React.createElement('tr', { className: "font-bold border-t-2 border-border" },
          React.createElement('td', { className: "px-3 py-2" }, "TOTALS"),
          React.createElement('td', { className: "px-3 py-2" }, ""),
          React.createElement('td', { className: "px-3 py-2 text-right font-mono" }, formatCurrency(totals.ordered)),
          React.createElement('td', { className: "px-3 py-2 text-right font-mono text-success" }, formatCurrency(totals.paid)),
          React.createElement('td', { className: "px-3 py-2 text-right font-mono " + (totals.balance > 0 ? 'text-destructive' : 'text-success') }, formatCurrency(totals.balance))
        )
      )
    ),
    React.createElement(Button, { variant: "outline", size: "sm", onClick: () => exportToCSV(data, 'suppliers_ledger') }, "Export CSV")
  );
}







function IncomeLedgerReport() {
  const { selectedProjectId } = useAppStore();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterProject, setFilterProject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    async function loadProjects() {
      try {
        const token = localStorage.getItem('token');
        const projectsRes = await fetch(`${API_BASE_URL}/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const projectsData = await projectsRes.json();
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
        
        let income = await fetch(`${API_BASE_URL}/income`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        
        let allProjects = await fetch(`${API_BASE_URL}/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
        
        // Apply global project filter
        if (selectedProjectId && selectedProjectId !== 'all') {
          const projectIdNum = parseInt(selectedProjectId);
          income = income.filter(i => i.project_id === projectIdNum);
        }
        
        // Apply local project filter
        if (filterProject !== 'all') {
          const projectIdNum = parseInt(filterProject);
          income = income.filter(i => i.project_id === projectIdNum);
        }
        
        const processedData = income.map(i => {
          const proj = allProjects.find(p => p.id === i.project_id);
          const vat = calculateVAT(i.gross_amount);
          const ret = calculateRetention(i.gross_amount, i.retention_percent);
          const net = (i.gross_amount + vat) - ret;
          return {
            project: proj?.name || 'Unknown Project',
            projectId: i.project_id,
            certificate: i.certificate_no,
            date: i.date,
            gross: i.gross_amount,
            vat: vat,
            retention: ret,
            netPayable: net,
            received: i.amount_received || 0,
            balance: net - (i.amount_received || 0),
            status: i.status,
          };
        });
        
        setData(processedData);
        setFilteredData(processedData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading income ledger:', err);
        setLoading(false);
      }
    }
    loadData();
  }, [selectedProjectId, filterProject]);

  // Apply search filter
  useEffect(() => {
    if (searchTerm) {
      const filtered = data.filter(item => 
        item.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.certificate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.date.includes(searchTerm)
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchTerm, data]);

  if (loading) {
    return React.createElement('div', { className: "text-center py-8" }, "Loading income ledger...");
  }

  const totals = filteredData.reduce((acc, d) => ({
    gross: acc.gross + d.gross,
    vat: acc.vat + d.vat,
    retention: acc.retention + d.retention,
    netPayable: acc.netPayable + d.netPayable,
    received: acc.received + d.received,
    balance: acc.balance + d.balance,
  }), { gross: 0, vat: 0, retention: 0, netPayable: 0, received: 0, balance: 0 });

  const tableRows = filteredData.map((d, idx) => 
    React.createElement('tr', { key: idx },
      React.createElement('td', { className: "px-3 py-2 font-medium" }, d.project),
      React.createElement('td', { className: "px-3 py-2 font-mono text-xs" }, d.certificate),
      React.createElement('td', { className: "px-3 py-2 text-xs" }, d.date),
      React.createElement('td', { className: "px-3 py-2 text-right font-mono" }, formatCurrency(d.gross)),
      React.createElement('td', { className: "px-3 py-2 text-right font-mono text-muted-foreground" }, formatCurrency(d.vat)),
      React.createElement('td', { className: "px-3 py-2 text-right font-mono text-muted-foreground" }, formatCurrency(d.retention)),
      React.createElement('td', { className: "px-3 py-2 text-right font-mono font-medium" }, formatCurrency(d.netPayable)),
      React.createElement('td', { className: "px-3 py-2 text-right font-mono text-success" }, formatCurrency(d.received)),
      React.createElement('td', { className: `px-3 py-2 text-right font-mono font-bold ${d.balance > 0 ? 'text-warning' : 'text-success'}` },
        formatCurrency(Math.abs(d.balance)), d.balance > 0 ? ' (Pending)' : ''
      )
    )
  );

  return React.createElement('div', { className: "space-y-4" },
    React.createElement('div', { className: "flex gap-4 justify-between items-center" },
      React.createElement('div', { className: "flex gap-2" },
        React.createElement('input', {
          type: "text",
          placeholder: "🔍 Search project, certificate...",
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background w-64",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value)
        }),
        React.createElement('select', {
          className: "px-3 py-1.5 text-sm border border-border rounded-md bg-background",
          value: filterProject,
          onChange: (e) => setFilterProject(e.target.value)
        },
          React.createElement('option', { value: "all" }, "All Projects"),
          projects.map(p => React.createElement('option', { key: p.id, value: p.id }, p.name))
        )
      ),
      React.createElement('p', { className: "text-xs text-muted-foreground" }, `${filteredData.length} records`)
    ),
    React.createElement('div', { className: "grid grid-cols-4 gap-4" },
      React.createElement('div', { className: "bg-muted rounded-lg p-4 text-center" },
        React.createElement('p', { className: "text-xs text-muted-foreground" }, "Total Gross"),
        React.createElement('p', { className: "text-xl font-bold" }, formatCurrency(totals.gross))
      ),
      React.createElement('div', { className: "bg-muted rounded-lg p-4 text-center" },
        React.createElement('p', { className: "text-xs text-muted-foreground" }, "Total VAT"),
        React.createElement('p', { className: "text-xl font-bold" }, formatCurrency(totals.vat))
      ),
      React.createElement('div', { className: "bg-muted rounded-lg p-4 text-center" },
        React.createElement('p', { className: "text-xs text-muted-foreground" }, "Total Retention"),
        React.createElement('p', { className: "text-xl font-bold" }, formatCurrency(totals.retention))
      ),
      React.createElement('div', { className: "bg-muted rounded-lg p-4 text-center" },
        React.createElement('p', { className: "text-xs text-muted-foreground" }, "Net Balance"),
        React.createElement('p', { className: `text-xl font-bold ${totals.balance > 0 ? 'text-warning' : 'text-success'}` },
          formatCurrency(Math.abs(totals.balance))
        ),
        React.createElement('p', { className: "text-xs text-muted-foreground mt-1" },
          totals.balance > 0 ? '(Pending)' : '(Settled)'
        )
      )
    ),
    React.createElement('div', { className: "overflow-x-auto" },
      React.createElement('table', { className: "w-full text-sm" },
        React.createElement('thead', null,
          React.createElement('tr', { className: "border-b border-border" },
            React.createElement('th', { className: "px-3 py-2 text-left text-xs" }, "Project"),
            React.createElement('th', { className: "px-3 py-2 text-left text-xs" }, "Cert No"),
            React.createElement('th', { className: "px-3 py-2 text-left text-xs" }, "Date"),
            React.createElement('th', { className: "px-3 py-2 text-right text-xs" }, "Gross"),
            React.createElement('th', { className: "px-3 py-2 text-right text-xs" }, "VAT"),
            React.createElement('th', { className: "px-3 py-2 text-right text-xs" }, "Retention"),
            React.createElement('th', { className: "px-3 py-2 text-right text-xs" }, "Net Payable"),
            React.createElement('th', { className: "px-3 py-2 text-right text-xs" }, "Received"),
            React.createElement('th', { className: "px-3 py-2 text-right text-xs" }, "Balance")
          )
        ),
        React.createElement('tbody', { className: "divide-y divide-border" }, tableRows)
      )
    ),
    React.createElement(Button, { variant: "outline", size: "sm", onClick: () => exportToCSV(filteredData, 'income_ledger') }, "Export CSV")
  );
}