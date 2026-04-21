import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import Index from './pages/Index';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { BillingModule } from '@/components/modules/BillingModule';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authUser } = useAppStore();
  
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/billing" 
          element={
            <ProtectedRoute>
              <BillingModule />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}