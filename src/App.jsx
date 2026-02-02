import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/shared/Toast';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { PublicDashboard } from './pages/public/PublicDashboard';
import { AdvocateDashboard } from './pages/advocate/AdvocateDashboard';
import { CourtDashboard } from './pages/court/CourtDashboard';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to={`/${user?.role}`} replace />;
  return children;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={`/${user?.role}`} replace /> : <LoginPage />} />
      
      <Route path="/public" element={<ProtectedRoute allowedRoles={['public']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<PublicDashboard />} />
        <Route path="cases" element={<PublicDashboard />} />
        <Route path="search" element={<PublicDashboard />} />
        <Route path="notifications" element={<PublicDashboard />} />
      </Route>
      
      <Route path="/advocate" element={<ProtectedRoute allowedRoles={['advocate']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<AdvocateDashboard />} />
        <Route path="cases" element={<AdvocateDashboard />} />
        <Route path="evidence" element={<AdvocateDashboard />} />
        <Route path="calendar" element={<AdvocateDashboard />} />
        <Route path="notes" element={<AdvocateDashboard />} />
      </Route>
      
      <Route path="/court" element={<ProtectedRoute allowedRoles={['court']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<CourtDashboard />} />
        <Route path="cases" element={<CourtDashboard />} />
        <Route path="hearings" element={<CourtDashboard />} />
        <Route path="advocates" element={<CourtDashboard />} />
        <Route path="analytics" element={<CourtDashboard />} />
        <Route path="qr" element={<CourtDashboard />} />
      </Route>
      
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <div className="min-h-screen bg-[#030712] text-white">
              <AppRoutes />
            </div>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
