import { useAppStore } from '@/hooks/useAppStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Moon, Sun } from 'lucide-react';

export function TopBar() {
  const { activeModule, projects, selectedProjectId, setSelectedProjectId, theme, toggleTheme } = useAppStore();

  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    projects: 'Projects',
    income: 'Income & Certificates',
    expenses: 'Expenses',
    payroll: 'Payroll',
    procurement: 'Procurement',
    stores: 'Stores',
    sitediary: 'Site Diary',
    vat: 'VAT',
    reports: 'Reports',
    settings: 'Settings',
    users: 'User Management',
    subcontractors: 'Subcontractors',
    invoices: 'Invoices',
  };

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-semibold text-foreground">{titles[activeModule] || 'BOCHABERI'}</h1>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <Select value={selectedProjectId?.toString() || 'all'} onValueChange={(v) => setSelectedProjectId(v === 'all' ? null : Number(v))}>
          <SelectTrigger className="w-[220px] h-9 text-sm">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(p => (
              <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}