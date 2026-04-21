
import { useAppStore } from '@/hooks/useAppStore';
import { ModuleId } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import {
  LayoutDashboard, FolderKanban, TrendingUp, TrendingDown,
  Users, ShoppingCart, Warehouse, BookOpen, Receipt, BarChart3, Settings,
  ChevronLeft, ChevronRight, HardHat, LogOut, UserCog, Hammer, FileText,
  HelpCircle, Scale, CreditCard
} from 'lucide-react';

interface NavGroup {
  title: string;
  items: { id: ModuleId; label: string; icon: React.ReactNode; path?: string }[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
      { id: 'projects', label: 'Projects', icon: <FolderKanban size={20} />, path: '/dashboard' },
    ],
  },
  {
    title: 'Finance',
    items: [
      { id: 'income', label: 'Income', icon: <TrendingUp size={20} />, path: '/dashboard' },
      { id: 'expenses', label: 'Expenses', icon: <TrendingDown size={20} />, path: '/dashboard' },
      { id: 'invoices', label: 'Invoices', icon: <FileText size={20} />, path: '/dashboard' },
      { id: 'vat', label: 'VAT', icon: <Receipt size={20} />, path: '/dashboard' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { id: 'payroll', label: 'Payroll', icon: <Users size={20} />, path: '/dashboard' },
      { id: 'procurement', label: 'Procurement', icon: <ShoppingCart size={20} />, path: '/dashboard' },
      { id: 'stores', label: 'Stores', icon: <Warehouse size={20} />, path: '/dashboard' },
      { id: 'subcontractors', label: 'Subcontractors', icon: <Hammer size={20} />, path: '/dashboard' },
      { id: 'sitediary', label: 'Site Diary', icon: <BookOpen size={20} />, path: '/dashboard' },
    ],
  },
  {
    title: 'Admin',
    items: [
      { id: 'billing', label: 'Billing', icon: <CreditCard size={20} />, path: '/dashboard/billing' },
      { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} />, path: '/dashboard' },
      { id: 'users', label: 'User Mgmt', icon: <UserCog size={20} />, path: '/dashboard' },
      { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '/dashboard' },
    ],
  },
  {
    title: 'Support',
    items: [
      { id: 'help', label: 'Help', icon: <HelpCircle size={20} />, path: '/dashboard' },
      { id: 'legal', label: 'Legal', icon: <Scale size={20} />, path: '/dashboard' },
    ],
  },
];

// Free plan allowed modules
const FREE_PLAN_ALLOWED_MODULES: ModuleId[] = [
  'dashboard', 'projects', 'workers', 'expenses', 'reports', 'settings', 'billing', 'help', 'legal'
];

export function Sidebar() {
  const navigate = useNavigate();
  const { activeModule, setActiveModule, sidebarCollapsed, toggleSidebar, authUser, logout } = useAppStore();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const userPermissions = authUser?.permissions;
  const isAdmin = authUser?.role === 'admin';

  // Fetch subscription on mount
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        const response = await fetch('https://buildify-backend-kye8.onrender.com/api/subscription/current', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setSubscription(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  // Check if module is accessible based on subscription plan
  const canAccessModule = (id: ModuleId): boolean => {
    // Admin always has access
    if (isAdmin) return true;
    
    // Check user permissions
    if (!userPermissions) return true;
    if (!userPermissions.includes(id)) return false;
    
    // Free plan restrictions
    const planName = subscription?.plan_name;
    if (planName === 'free') {
      return FREE_PLAN_ALLOWED_MODULES.includes(id);
    }
    
    // Paid plans have full access
    return true;
  };

  const canAccess = (id: ModuleId) => {
    if (isAdmin) return true;
    if (!userPermissions) return true;
    return userPermissions.includes(id);
  };

  const handleNavigation = (item: { id: ModuleId; path?: string }) => {
    setActiveModule(item.id);
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-sidebar-bg text-sidebar-fg flex flex-col z-30 sidebar-transition ${sidebarCollapsed ? 'w-[48px]' : 'w-[180px]'}`}
    >
      {/* Logo + Collapse */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-hover shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <HardHat size={20} className="text-accent-foreground" />
          </div>
          {!sidebarCollapsed && (
            <span className="text-lg font-bold tracking-tight">BOCHI</span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-sidebar-hover transition-colors shrink-0"
          title={sidebarCollapsed ? 'Expand' : 'Collapse'}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navGroups.map(group => {
          const visibleItems = group.items.filter(item => canAccess(item.id) && canAccessModule(item.id));
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.title}>
              {!sidebarCollapsed && (
                <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider opacity-40">
                  {group.title}
                </p>
              )}
              {sidebarCollapsed && <div className="h-2" />}
              {visibleItems.map(item => {
                const active = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item)}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${active
                        ? 'bg-sidebar-hover text-sidebar-active'
                        : 'hover:bg-sidebar-hover hover:text-sidebar-active/80'
                      }
                      ${sidebarCollapsed ? 'justify-center' : ''}
                    `}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User info & logout */}
      <div className="p-2 border-t border-sidebar-hover space-y-1 shrink-0">
        {authUser && !sidebarCollapsed && (
          <div className="px-3 py-2 text-xs truncate">
            <p className="font-medium">{authUser.name}</p>
            <p className="opacity-60">{authUser.role}</p>
            {subscription?.plan_name === 'free' && (
              <p className="text-[10px] text-amber-500 mt-0.5">Free Plan</p>
            )}
            {subscription?.status === 'trial' && subscription?.trial_days_remaining > 0 && (
              <p className="text-[10px] text-green-500 mt-0.5">
                Trial: {subscription.trial_days_remaining} days left
              </p>
            )}
          </div>
        )}
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-hover transition-colors text-destructive/80" title={sidebarCollapsed ? 'Logout' : undefined}>
          <LogOut size={18} />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}