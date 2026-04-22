// This file CANNOT be tree-shaken because it's imported with side effects
import { Route } from 'react-router-dom';
import { AdminDashboard, AdminCompanies, AdminUsers, AdminSubscriptions, AdminPayments } from '@/components/modules/admin-exports';
import { AdminLayout } from '@/components/AdminLayout';
import { useAppStore } from '@/hooks/useAppStore';
import { Navigate } from 'react-router-dom';

// Force this file to be included
console.log('🚀 ADMIN ROUTES FILE LOADED 🚀');

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { authUser } = useAppStore();
  if (!authUser) return <Navigate to="/login" replace />;
  if (!authUser.isSuperAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export const adminRoutes = (
  <>
    <Route path="/admin" element={<SuperAdminRoute><AdminLayout><AdminDashboard /></AdminLayout></SuperAdminRoute>} />
    <Route path="/admin/companies" element={<SuperAdminRoute><AdminLayout><AdminCompanies /></AdminLayout></SuperAdminRoute>} />
    <Route path="/admin/users" element={<SuperAdminRoute><AdminLayout><AdminUsers /></AdminLayout></SuperAdminRoute>} />
    <Route path="/admin/subscriptions" element={<SuperAdminRoute><AdminLayout><AdminSubscriptions /></AdminLayout></SuperAdminRoute>} />
    <Route path="/admin/payments" element={<SuperAdminRoute><AdminLayout><AdminPayments /></AdminLayout></SuperAdminRoute>} />
  </>
);