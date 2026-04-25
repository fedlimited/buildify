import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  DollarSign,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  BarChart3
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser, sidebarCollapsed, toggleSidebar, logout } = useAppStore();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { 
      path: '/admin', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      exact: true 
    },
    { 
      path: '/admin/analytics', 
      label: 'Analytics', 
      icon: BarChart3 
    },
    { 
      path: '/admin/companies', 
      label: 'Companies', 
      icon: Building2 
    },
    { 
      path: '/admin/users', 
      label: 'Users', 
      icon: Users 
    },
    { 
      path: '/admin/subscriptions', 
      label: 'Subscriptions', 
      icon: CreditCard 
    },
    { 
      path: '/admin/payments', 
      label: 'Payments', 
      icon: DollarSign 
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-card border-r transition-all duration-300 z-40 ${
          sidebarCollapsed ? 'w-[68px]' : 'w-[260px]'
        }`}
      >
        {/* Logo / Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">Super Admin</span>
            </div>
          )}
          {sidebarCollapsed && (
            <Shield className="w-6 h-6 text-primary mx-auto" />
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                } ${sidebarCollapsed ? 'justify-center' : ''}`
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t">
          {/* Return to App */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              } ${sidebarCollapsed ? 'justify-center' : ''}`
            }
            title={sidebarCollapsed ? 'Return to App' : undefined}
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Return to App</span>}
          </NavLink>

          {/* User Info & Logout */}
          {!sidebarCollapsed && (
            <div className="mt-3 pt-3 border-t">
              <div className="px-3 py-2">
                <p className="text-sm font-medium truncate">{authUser?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{authUser?.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Shield className="w-3 h-3 text-amber-500" />
                  <span className="text-xs text-amber-600 dark:text-amber-400">Super Admin</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title={sidebarCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[68px]' : 'ml-[260px]'}`}>
        {/* Top Bar */}
        <header className="h-16 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-30 flex items-center px-6">
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{authUser?.name}</p>
              <p className="text-xs text-muted-foreground">Super Administrator</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}