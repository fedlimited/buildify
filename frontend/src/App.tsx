import LandingPage from './components/LandingPage';
import Login from '@/pages/Login';

import { Register } from '@/pages/Register';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { AuthGate } from '@/components/AuthGate';
// Force admin components to be included in build
import './components/modules/admin-exports';



// FORCE ADMIN COMPONENTS INTO BUILD - DO NOT REMOVE
import { AdminDashboard, AdminCompanies, AdminUsers, AdminSubscriptions, AdminPayments } from '@/components/modules/admin-exports';
import { AdminLayout } from '@/components/AdminLayout';

// Dummy reference to prevent tree-shaking
const ADMIN_COMPONENTS = { AdminDashboard, AdminCompanies, AdminUsers, AdminSubscriptions, AdminPayments, AdminLayout };
console.log('Admin components registered:', Object.keys(ADMIN_COMPONENTS));


const queryClient = new QueryClient();

const App = () => (
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




          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App; 
