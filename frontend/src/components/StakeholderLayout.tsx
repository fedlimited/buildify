import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';



import { 
  LayoutDashboard, 
  FolderKanban, 
  FileText, 
  Calendar, 
  MessagesSquare,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  ArrowLeft,
  Sun,
  Moon
} from 'lucide-react';


import { useAppStore } from '@/hooks/useAppStore';

interface StakeholderLayoutProps {
  children: React.ReactNode;
}

export function StakeholderLayout({ children }: StakeholderLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser, logout } = useAppStore();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  // Apply dark mode class
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);


  // Check if we're on a project page and get project ID
  const isProjectPage = location.pathname.includes('/stakeholder/projects/');
  const projectId = React.useMemo(() => {
    const match = location.pathname.match(/\/stakeholder\/projects\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }, [location.pathname]);

  // Also check for project parameter in URL (for documents, meetings pages)
  const urlProjectId = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    const projectParam = params.get('project');
    return projectParam ? parseInt(projectParam) : null;
  }, [location.search]);

  const activeProjectId = projectId || urlProjectId;

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };




  // Get navigation path with project context preserved
const getNavPath = (basePath: string) => {
  if (activeProjectId) {
    return `${basePath}?project=${activeProjectId}`;
  }
  return basePath;
};



  const navItems = [
    { path: '/stakeholder/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/stakeholder/dashboard', label: 'My Projects', icon: FolderKanban },
    { path: '/stakeholder/documents', label: 'Documents', icon: FileText },
    { path: '/stakeholder/meetings', label: 'Meetings', icon: Calendar },
    { path: '/stakeholder/comments', label: 'Discussions', icon: MessagesSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 flex flex-col ${
          sidebarCollapsed ? 'w-[68px]' : 'w-[260px]'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Building2 size={16} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">Stakeholder Portal</span>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center mx-auto">
              <Building2 size={16} className="text-white" />
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Project Banner - Shows when viewing a project */}
        {activeProjectId && (
          <div className="m-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-amber-500" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Currently Viewing</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  Project
                </p>
              </div>
              <button
                onClick={() => navigate('/stakeholder/dashboard')}
                className="p-1 text-amber-500 hover:text-amber-600"
                title="Back to Dashboard"
              >
                <ArrowLeft size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const targetPath = getNavPath(item.path);
            const isActive = location.pathname === item.path || 
                            (location.pathname === '/stakeholder/dashboard' && item.path === '/stakeholder/dashboard');
            
            return (
              <NavLink
                key={item.path}
                to={targetPath}
                className={({ isActive: navIsActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    (navIsActive || isActive) && !activeProjectId
                      ? 'bg-amber-500 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`
                }
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon size={18} />
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          {/* User Info */}
          {!sidebarCollapsed && (
            <div className="px-3 py-2 mb-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {authUser?.name || 'Stakeholder'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {authUser?.stakeholderType || 'Project Stakeholder'}
              </p>
            </div>
          )}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title={sidebarCollapsed ? 'Logout' : undefined}
          >
            <LogOut size={18} />
            {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[68px]' : 'ml-[260px]'}`}>
        {/* Top Bar */}
        <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            {activeProjectId && (
              <button
                onClick={() => navigate('/stakeholder/dashboard')}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-amber-500 transition"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </button>
            )}
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white ml-2">
              {activeProjectId ? 'Project Portal' : `Welcome, ${authUser?.name?.split(' ')[0] || 'Guest'}`}
            </h1>
          </div>



          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <Sun size={18} className="text-yellow-500" />
              ) : (
                <Moon size={18} className="text-gray-600 dark:text-gray-300" />
              )}
            </button>
            
            {/* Bell Icon */}
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition relative">
              <Bell size={18} className="text-gray-600 dark:text-gray-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>



        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}