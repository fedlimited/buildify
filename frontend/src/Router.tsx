import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import Index from './pages/Index';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { BillingModule } from '@/components/modules/BillingModule';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';

// Direct import for main admin entry (not lazy - always included)
import { AdminDashboard } from '@/components/modules/AdminDashboard';
import { AdminLayout } from '@/components/AdminLayout';

// Lazy imports for other admin pages
const AdminCompanies = lazy(() => import('@/components/modules/AdminCompanies').then(m => ({ default: m.AdminCompanies })));
const AdminUsers = lazy(() => import('@/components/modules/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminSubscriptions = lazy(() => import('@/components/modules/AdminSubscriptions').then(m => ({ default: m.AdminSubscriptions })));
const AdminPayments = lazy(() => import('@/components/modules/AdminPayments').then(m => ({ default: m.AdminPayments })));

function AdminEntry() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
}

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

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/dashboard/billing" element={<ProtectedRoute><DashboardLayout><BillingModule /></DashboardLayout></ProtectedRoute>} />

        {/* Super Admin Routes */}
        <Route path="/admin" element={<AdminEntry />} />
        <Route path="/admin/companies" element={<Suspense fallback={<div className="p-8 text-center">Loading...</div>}><AdminCompanies /></Suspense>} />
        <Route path="/admin/users" element={<Suspense fallback={<div className="p-8 text-center">Loading...</div>}><AdminUsers /></Suspense>} />
        <Route path="/admin/subscriptions" element={<Suspense fallback={<div className="p-8 text-center">Loading...</div>}><AdminSubscriptions /></Suspense>} />
        <Route path="/admin/payments" element={<Suspense fallback={<div className="p-8 text-center">Loading...</div>}><AdminPayments /></Suspense>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}