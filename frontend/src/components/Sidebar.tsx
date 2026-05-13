import { useAppStore } from '@/hooks/useAppStore';
import { ModuleId } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
  LayoutDashboard, FolderKanban, TrendingUp, TrendingDown,
  Users, ShoppingCart, Warehouse, BookOpen, Receipt, BarChart3, Settings,
  ChevronLeft, ChevronRight, HardHat, LogOut, UserCog, Hammer, FileText,
  HelpCircle, Scale, CreditCard, Shield
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

export function Sidebar() {
  const navigate = useNavigate();
  const { activeModule, setActiveModule, sidebarCollapsed, toggleSidebar, authUser, logout } = useAppStore();

  // Ensure permissions are always an array
  let userPermissions: ModuleId[] = [];
  if (authUser?.permissions) {
    if (Array.isArray(authUser.permissions)) {
      userPermissions = authUser.permissions;
    } else if (typeof authUser.permissions === 'string') {
      try {
        const parsed = JSON.parse(authUser.permissions);
        if (Array.isArray(parsed)) userPermissions = parsed;
      } catch (e) {
        console.error('Failed to parse permissions in sidebar:', e);
      }
    }
  }
  
  const isAdmin = authUser?.role === 'admin';
  const isSuperAdmin = authUser?.isSuperAdmin || false;






const canAccess = (id: ModuleId) => {
  // Super Admin sees everything
  if (isSuperAdmin) return true;
  // Company Admin sees everything
  if (isAdmin) return true;
  // No permissions = no access
  if (!userPermissions || userPermissions.length === 0) return false;
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
      className={`fixed left-0 top-0 h-screen bg-sidebar-bg text-sidebar-fg flex flex-col z-30 sidebar-transition ${sidebarCollapsed ? 'w-[68px]' : 'w-[260px]'}`}
    >

      {/* Logo + Collapse */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-hover shrink-0">
        <div className="flex items-center gap-3">
          <img
            src="/Bochi_logo_transparent.png"
            alt="BOCHI Logo"
            className={`${sidebarCollapsed ? 'h-8 w-8' : 'h-10 w-auto'} object-contain`}
          />
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

      {/* Super Admin Quick Access */}
      {isSuperAdmin && (
        <div className="px-2 pt-2">
          <button
            onClick={() => navigate('/admin')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/20
              ${sidebarCollapsed ? 'justify-center' : ''}
            `}
            title={sidebarCollapsed ? 'Super Admin' : undefined}
          >
            <Shield size={20} className="shrink-0" />
            {!sidebarCollapsed && (
              <div className="flex-1 text-left">
                <span>Super Admin</span>
                <span className="block text-[10px] opacity-70">System Management</span>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navGroups.map(group => {
          const visibleItems = group.items.filter(item => canAccess(item.id));
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
            <p className="opacity-60">
              {authUser.role}
              {isSuperAdmin && (
                <span className="ml-1 text-amber-500"> • Super Admin</span>
              )}
            </p>
          </div>
        )}
        <button 
          onClick={logout} 
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-hover transition-colors text-destructive/80" 
          title={sidebarCollapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}