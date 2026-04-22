import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import Index from './pages/Index';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { BillingModule } from '@/components/modules/BillingModule';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { adminRoutes } from './adminRoutes';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authUser } = useAppStore();

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

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

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Regular Dashboard Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/billing"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <BillingModule />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Super Admin Routes */}
        {adminRoutes}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}