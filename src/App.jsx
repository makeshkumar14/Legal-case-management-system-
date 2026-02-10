import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/shared/Toast';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { ChatBot } from './components/shared/ChatBot';

// Public Pages
import { PublicDashboard } from './pages/public/PublicDashboard';
import { AdvancedSearchPage } from './pages/public/AdvancedSearchPage';

// Advocate Pages
import { AdvocateDashboard } from './pages/advocate/AdvocateDashboard';
import { DocumentManagement } from './pages/advocate/DocumentManagement';
import { CaseNotesPage } from './pages/advocate/CaseNotesPage';
import { TaskBoardPage } from './pages/advocate/TaskBoardPage';
import { AdvocatePerformance } from './pages/advocate/AdvocatePerformance';

// Court Pages
import { CourtDashboard } from './pages/court/CourtDashboard';
import { HearingScheduler } from './pages/court/HearingScheduler';
import { ReportsPage } from './pages/court/ReportsPage';
import { CourtRoomBoard } from './pages/court/CourtRoomBoard';

// Shared Pages
import { CaseDetailPage } from './pages/shared/CaseDetailPage';
import { ProfilePage } from './pages/shared/ProfilePage';
import { NotificationCenter } from './pages/shared/NotificationCenter';
import { MessagingPage } from './pages/shared/MessagingPage';

// Modern Cream & Lime Green Background Component
function MotionBackground() {
  const { isDark } = useTheme();
  
  return (
    <div className={`motion-bg ${!isDark ? 'motion-bg-light' : ''}`}>
      {/* Lime Green Gradient Blobs */}
      <div className="gradient-blob gradient-blob-1" />
      <div className="gradient-blob gradient-blob-2" />
      <div className="gradient-blob gradient-blob-3" />
      
      {/* Dotted Grid Pattern */}
      <div className="motion-grid" />
    </div>
  );
}

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
      
      {/* Public Routes */}
      <Route path="/public" element={<ProtectedRoute allowedRoles={['public']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<PublicDashboard />} />
        <Route path="cases" element={<PublicDashboard />} />
        <Route path="cases/:id" element={<CaseDetailPage />} />
        <Route path="search" element={<AdvancedSearchPage />} />
        <Route path="notifications" element={<NotificationCenter />} />
        <Route path="messages" element={<MessagingPage />} />
        <Route path="settings" element={<ProfilePage />} />
      </Route>
      
      {/* Advocate Routes */}
      <Route path="/advocate" element={<ProtectedRoute allowedRoles={['advocate']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<AdvocateDashboard />} />
        <Route path="cases" element={<AdvocateDashboard />} />
        <Route path="cases/:id" element={<CaseDetailPage />} />
        <Route path="evidence" element={<DocumentManagement />} />
        <Route path="calendar" element={<AdvocateDashboard />} />
        <Route path="notes" element={<CaseNotesPage />} />
        <Route path="tasks" element={<TaskBoardPage />} />
        <Route path="performance" element={<AdvocatePerformance />} />
        <Route path="messages" element={<MessagingPage />} />
        <Route path="settings" element={<ProfilePage />} />
        <Route path="notifications" element={<NotificationCenter />} />
      </Route>
      
      {/* Court Routes */}
      <Route path="/court" element={<ProtectedRoute allowedRoles={['court']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<CourtDashboard />} />
        <Route path="cases" element={<CourtDashboard />} />
        <Route path="cases/:id" element={<CaseDetailPage />} />
        <Route path="hearings" element={<HearingScheduler />} />
        <Route path="advocates" element={<CourtDashboard />} />
        <Route path="analytics" element={<ReportsPage />} />
        <Route path="qr" element={<CourtDashboard />} />
        <Route path="rooms" element={<CourtRoomBoard />} />
        <Route path="messages" element={<MessagingPage />} />
        <Route path="settings" element={<ProfilePage />} />
        <Route path="notifications" element={<NotificationCenter />} />
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
            <MotionBackground />
            <div className="min-h-screen bg-transparent text-[#1a1a2e] dark:text-white relative z-10">
              <AppRoutes />
              <ChatBot />
            </div>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
