import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { API_BASE_URL } from '@/config/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Crown, Rocket, ChevronRight, Users, Briefcase, UserCheck } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function TopBar() {
  const navigate = useNavigate();
  const { activeModule, projects, selectedProjectId, setSelectedProjectId, theme, toggleTheme, setActiveModule } = useAppStore();
  const [subscription, setSubscription] = useState<any>(null);
  const [limits, setLimits] = useState({
    projects: { current: 0, max: 0 },
    workers: { current: 0, max: 0 },
    users: { current: 0, max: 0 }
  });

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
    billing: 'Billing',
  };

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

  // UPDATED: Navigate directly to billing page
  const handleUpgrade = () => {
    setActiveModule('billing');
    navigate('/dashboard/billing');
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

  // Progress bar component for top bar
  const TopProgressBar = ({ used, limit, label, icon }: { used: number; limit: number; label: string; icon: React.ReactNode }) => {
    const percentage = Math.min((used / limit) * 100, 100);
    const isAtLimit = used >= limit;
    const isUnlimited = limit >= 999999;
    
    if (isUnlimited) return null;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-help">
              {icon}
              <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${isAtLimit ? 'bg-red-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <span className={`text-xs font-mono ${isAtLimit ? 'text-red-400' : 'text-slate-400'}`}>
                {used}/{limit}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{label}: {used} of {limit} used</p>
            {isAtLimit && <p className="text-red-400">Limit reached. Upgrade for more.</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      {/* Left side - Title */}
      <h1 className="text-lg font-semibold text-foreground">{titles[activeModule] || 'BOCHI'}</h1>
      
      {/* Right side - Subscription Info + Project Filter + Theme Toggle */}
      <div className="flex items-center gap-3">
        {/* Subscription Info - Compact */}
        {subscription && (
          <div className="flex items-center gap-3 px-3 py-1.5 bg-muted/30 rounded-lg border border-border/50">
            {/* Plan Name */}
            <div className="flex items-center gap-1.5">
              <Crown size={14} className="text-amber-400" />
              <span className="text-sm font-medium text-foreground">{subscription.display_name}</span>
              {trialDays && (
                <span className="text-xs text-amber-400">{trialDays}d</span>
              )}
            </div>
            
            {/* Divider */}
            <div className="h-4 w-px bg-border" />
            
            {/* Progress Bars */}
            <div className="flex items-center gap-2">
              <TopProgressBar used={limits.projects.current} limit={limits.projects.max} label="Projects" icon={<Briefcase size={12} className="text-slate-500" />} />
              <TopProgressBar used={limits.workers.current} limit={limits.workers.max} label="Workers" icon={<Users size={12} className="text-slate-500" />} />
              <TopProgressBar used={limits.users.current} limit={limits.users.max} label="Team members" icon={<UserCheck size={12} className="text-slate-500" />} />
            </div>
            
            {/* Upgrade Button with Tooltip */}
            {nextPlan && (
              <>
                <div className="h-4 w-px bg-border" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleUpgrade}
                        className="h-7 px-2 text-xs gap-1 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                      >
                        <Rocket size={12} />
                        Upgrade
                        <ChevronRight size={10} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Upgrade to <span className="font-semibold text-amber-400">{nextPlan}</span> plan</p>
                      <p className="text-xs text-slate-400">Get more projects, workers, and features</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>
        )}
        
        {/* Project Filter - KEPT ORIGINAL */}
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
        
        {/* Theme Toggle - KEPT ORIGINAL */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
}