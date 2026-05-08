import { TermsOfService } from '@/pages/TermsOfService';
import { PrivacyPolicy } from '@/pages/PrivacyPolicy';
import { useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Login from '@/pages/Login';
import { Register } from '@/pages/Register';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, Outlet } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { AuthGate } from '@/components/AuthGate';
import { PaymentManager } from '@/components/admin/PaymentManager';
import { TenantManager } from '@/components/admin/TenantManager';
import { AdminTestimonials } from '@/components/modules/AdminTestimonials';
import { PaymentVerification } from '@/pages/PaymentVerification';
import { StakeholderLayout } from '@/components/StakeholderLayout';
import { StakeholderDashboard } from '@/pages/StakeholderDashboard';
import { StakeholderProjectPortal } from '@/pages/StakeholderProjectPortal';
import { StakeholderPreview } from '@/pages/StakeholderPreview';

// Admin components
import './components/modules/admin-exports';
import { AdminDashboard, AdminCompanies, AdminUsers, AdminSubscriptions, AdminPayments } from '@/components/modules/admin-exports';
import { AdminLayout } from '@/components/AdminLayout';
import { AdminAnalytics } from '@/components/modules/AdminAnalytics';

// Dummy reference to prevent tree-shaking
import { UsersModule } from '@/components/modules/UsersModule';

const ADMIN_COMPONENTS = { AdminDashboard, AdminCompanies, AdminUsers, AdminSubscriptions, AdminPayments, AdminLayout, AdminAnalytics, AdminTestimonials, UsersModule };
console.log('Admin components registered:', Object.keys(ADMIN_COMPONENTS));

const queryClient = new QueryClient();

const App = () => {
  // ========== GLOBAL FIX: Auto-fetch missing permissions ==========
  useEffect(() => {
    const token = localStorage.getItem('token');
    const authUser = JSON.parse(localStorage.getItem('authUser') || 'null');
    
    // Check if permissions are missing OR empty
    const hasNoPermissions = !authUser?.permissions || 
                             (Array.isArray(authUser.permissions) && authUser.permissions.length === 0);
    
    if (token && authUser && hasNoPermissions) {
      console.log('🔧 Global fix: Fetching permissions from /me');
      fetch('https://buildify-backend-kye8.onrender.com/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(data => {
        if (data.permissions && data.permissions.length > 0) {
          const updatedAuthUser = {
            ...authUser,
            permissions: data.permissions
          };
          localStorage.setItem('authUser', JSON.stringify(updatedAuthUser));
          console.log('✅ Global fix: Permissions added successfully', data.permissions);
          // Only reload if permissions were actually missing
          if (!authUser.permissions || authUser.permissions.length === 0) {
            window.location.reload();
          }
        } else if (data.permissions && data.permissions.length === 0) {
          console.log('⚠️ Global fix: User has no permissions assigned');
          // Set default dashboard permission
          const updatedAuthUser = {
            ...authUser,
            permissions: ['dashboard']
          };
          localStorage.setItem('authUser', JSON.stringify(updatedAuthUser));
          console.log('✅ Global fix: Set default dashboard permission');
          window.location.reload();
        }
      })
      .catch(err => console.error('Global fix failed:', err));
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public landing page - NO AUTH REQUIRED */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/payment-verification" element={<PaymentVerification />} />

            {/* Legal Pages */}
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />

            {/* Protected app routes - require authentication */}
            <Route path="/dashboard" element={
              <AuthGate>
                <Index />
              </AuthGate>
            } />
            <Route path="/dashboard/*" element={
              <AuthGate>
                <Index />
              </AuthGate>
            } />

            {/* Super Admin Routes */}
            <Route path="/admin" element={
              <AuthGate>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AuthGate>
            } />
            <Route path="/admin/companies" element={
              <AuthGate>
                <AdminLayout>
                  <AdminCompanies />
                </AdminLayout>
              </AuthGate>
            } />
            <Route path="/admin/companies/:companyId" element={
              <AuthGate>
                <AdminLayout>
                  <AdminCompanies />
                </AdminLayout>
              </AuthGate>
            } />
            <Route path="/admin/users" element={
              <AuthGate>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </AuthGate>
            } />
            <Route path="/admin/subscriptions" element={
              <AuthGate>
                <AdminLayout>
                  <AdminSubscriptions />
                </AdminLayout>
              </AuthGate>
            } />
            <Route path="/admin/payments" element={
              <AuthGate>
                <AdminLayout>
                  <AdminPayments />
                </AdminLayout>
              </AuthGate>
            } />
            <Route path="/admin/payment-manager" element={
              <AuthGate>
                <AdminLayout>
                  <PaymentManager />
                </AdminLayout>
              </AuthGate>
            } />
            <Route path="/admin/tenants" element={
              <AuthGate>
                <AdminLayout>
                  <TenantManager />
                </AdminLayout>
              </AuthGate>
            } />
            <Route path="/admin/analytics" element={
              <AuthGate>
                <AdminLayout>
                  <AdminAnalytics />
                </AdminLayout>
              </AuthGate>
            } />
            <Route path="/admin/testimonials" element={
              <AuthGate>
                <AdminLayout>
                  <AdminTestimonials />
                </AdminLayout>
              </AuthGate>
            } />

            {/* Stakeholder Portal Routes */}
            <Route path="/stakeholder" element={
              <AuthGate>
                <StakeholderLayout>
                  <Outlet />
                </StakeholderLayout>
              </AuthGate>
            }>
              <Route index element={<Navigate to="/stakeholder/dashboard" replace />} />
              <Route path="dashboard" element={<StakeholderDashboard />} />
              <Route path="projects" element={<div>Projects Page Coming Soon</div>} />
              <Route path="projects/:projectId" element={<StakeholderProjectPortal />} />
              <Route path="documents" element={<div>Documents Page Coming Soon</div>} />
              <Route path="meetings" element={<div>Meetings Page Coming Soon</div>} />
              <Route path="comments" element={<div>Discussions Page Coming Soon</div>} />
            </Route>

            {/* Stakeholder Preview Route - For contractors to view as stakeholder */}
            <Route path="/stakeholder/portal/:projectId" element={
              <AuthGate>
                <StakeholderPreview />
              </AuthGate>
            } />

            {/* Fallback - 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;