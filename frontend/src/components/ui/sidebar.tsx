import { useAppStore } from '@/hooks/useAppStore';
import { ModuleId } from '@/lib/types';
import {
  LayoutDashboard, FolderKanban, TrendingUp, TrendingDown,
  Users, ShoppingCart, Warehouse, BookOpen, Receipt, BarChart3, Settings,
  HardHat, LogOut, UserCog, Hammer, FileText
} from 'lucide-react';

interface NavGroup {
  title: string;
  items: { id: ModuleId; label: string; icon: React.ReactNode }[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { id: 'projects', label: 'Projects', icon: <FolderKanban size={20} /> },
    ],
  },
  {
    title: 'Finance',
    items: [
      { id: 'income', label: 'Income', icon: <TrendingUp size={20} /> },
      { id: 'expenses', label: 'Expenses', icon: <TrendingDown size={20} /> },
      { id: 'invoices', label: 'Invoices', icon: <FileText size={20} /> },
      { id: 'vat', label: 'VAT', icon: <Receipt size={20} /> },
    ],
  },
  {
    title: 'Operations',
    items: [
      { id: 'payroll', label: 'Payroll', icon: <Users size={20} /> },
      { id: 'procurement', label: 'Procurement', icon: <ShoppingCart size={20} /> },
      { id: 'stores', label: 'Stores', icon: <Warehouse size={20} /> },
      { id: 'subcontractors', label: 'Subcontractors', icon: <Hammer size={20} /> },
      { id: 'sitediary', label: 'Site Diary', icon: <BookOpen size={20} /> },
    ],
  },
  {
    title: 'Admin',
    items: [
      { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} /> },
      { id: 'users', label: 'User Mgmt', icon: <UserCog size={20} /> },
      { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
    ],
  },
];

export function Sidebar() {
  const { activeModule, setActiveModule, sidebarCollapsed, authUser, logout } = useAppStore();

  const userPermissions = authUser?.permissions;
  const isAdmin = authUser?.role === 'admin';

  const canAccess = (id: ModuleId) => {
    if (isAdmin) return true;
    if (!userPermissions) return true;
    return userPermissions.includes(id);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col z-30 transition-all duration-300 ${sidebarCollapsed ? 'w-[68px]' : 'w-[260px]'}`}
    >
      {/* Logo - No collapse button here anymore */}
      <div className="flex items-center justify-center px-4 h-16 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500 dark:bg-blue-600 flex items-center justify-center shrink-0">
            <HardHat size={20} className="text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">BOCHABERI</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navGroups.map(group => {
          const visibleItems = group.items.filter(item => canAccess(item.id));
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.title}>
              {!sidebarCollapsed && (
                <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500">
                  {group.title}
                </p>
              )}
              {sidebarCollapsed && <div className="h-2" />}
              {visibleItems.map(item => {
                const active = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${active
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
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
      <div className="p-2 border-t border-gray-200 dark:border-gray-800 space-y-1 shrink-0">
        {authUser && !sidebarCollapsed && (
          <div className="px-3 py-2 text-xs truncate">
            <p className="font-medium text-gray-900 dark:text-white">{authUser.name}</p>
            <p className="text-gray-500 dark:text-gray-400">{authUser.role}</p>
          </div>
        )}
        <button 
          onClick={logout} 
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-600 dark:text-red-400" 
          title={sidebarCollapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}