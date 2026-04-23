import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import Index from './pages/Index';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { BillingModule } from '@/components/modules/BillingModule';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authUser } = useAppStore();
  if (!authUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useAppStore();
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={`sidebar-transition ${sidebarCollapsed ? 'ml-[68px]' : 'ml-[260px]'}`}>
        <TopBar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

const baseRoutes: RouteObject[] = [
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/', element: <ProtectedRoute><Index /></ProtectedRoute> },
  { path: '/dashboard', element: <ProtectedRoute><Index /></ProtectedRoute> },
  { path: '/dashboard/billing', element: <ProtectedRoute><DashboardLayout><BillingModule /></DashboardLayout></ProtectedRoute> },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
];

export function Router() {
  const [routes, setRoutes] = useState<RouteObject[]>(baseRoutes);

  useEffect(() => {
    import('./adminRoutesConfig').then((m) => {
      const fallback = baseRoutes.pop();
      setRoutes([...baseRoutes, ...m.adminRouteObjects, fallback!]);
    }).catch((err) => {
      console.error('Failed to load admin routes:', err);
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route, i) => (
          <Route key={i} path={route.path} element={route.element} />
        ))}
      </Routes>
    </BrowserRouter>
  );
}