import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/shared/Toast';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { PublicDashboard } from './pages/public/PublicDashboard';
import { AdvancedSearchPage } from './pages/public/AdvancedSearchPage';
import { AdvocateDashboard } from './pages/advocate/AdvocateDashboard';
import { DocumentManagement } from './pages/advocate/DocumentManagement';
import { TaskBoardPage } from './pages/advocate/TaskBoardPage';
import { CaseNotesPage } from './pages/advocate/CaseNotesPage';
import { AdvocatePerformance } from './pages/advocate/AdvocatePerformance';
import { AdvocateCalendarPage } from './pages/advocate/AdvocateCalendarPage';
import { CourtDashboard } from './pages/court/CourtDashboard';
import { HearingScheduler } from './pages/court/HearingScheduler';
import { CourtRoomBoard } from './pages/court/CourtRoomBoard';
import { ReportsPage } from './pages/court/ReportsPage';
import { AdvocateDirectoryPage } from './pages/court/AdvocateDirectoryPage';
import { QRCodeCenter } from './pages/court/QRCodeCenter';
import { NotificationCenter } from './pages/shared/NotificationCenter';
import { MessagingPage } from './pages/shared/MessagingPage';
import { ProfilePage } from './pages/shared/ProfilePage';
import { CaseDetailPage } from './pages/shared/CaseDetailPage';
import { CaseWorkspacePage } from './pages/shared/CaseWorkspacePage';

function MotionBackground() {
  const { isDark } = useTheme();

  return (
    <div className={`motion-bg ${!isDark ? 'motion-bg-light' : ''}`}>
      <div className="gradient-blob gradient-blob-1" />
      <div className="gradient-blob gradient-blob-2" />
      <div className="gradient-blob gradient-blob-3" />
      <div className="motion-grid" />
    </div>
  );
}

const validRoles = ['public', 'advocate', 'court'];

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const rolePath = validRoles.includes(user?.role) ? `/${user?.role}` : '/login';
    return <Navigate to={rolePath} replace />;
  }
  return children;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();
  const rolePath = validRoles.includes(user?.role) ? `/${user?.role}` : '/login';

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated && validRoles.includes(user?.role) ? <Navigate to={rolePath} replace /> : <LoginPage />} />
      <Route path="/signup" element={isAuthenticated && validRoles.includes(user?.role) ? <Navigate to={rolePath} replace /> : <SignupPage />} />

      <Route path="/public" element={<ProtectedRoute allowedRoles={['public']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<PublicDashboard />} />
        <Route path="cases" element={<CaseWorkspacePage role="public" title="My Cases" description="Track your filed matters, upcoming hearings, and current status in one place." />} />
        <Route path="cases/:id" element={<CaseDetailPage />} />
        <Route path="search" element={<AdvancedSearchPage />} />
        <Route path="notifications" element={<NotificationCenter />} />
        <Route path="messages" element={<MessagingPage />} />
        <Route path="settings" element={<ProfilePage />} />
      </Route>

      <Route path="/advocate" element={<ProtectedRoute allowedRoles={['advocate']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<AdvocateDashboard />} />
        <Route path="cases" element={<CaseWorkspacePage role="advocate" title="Case List" description="Review assigned matters, filter by status, and drill into case details quickly." />} />
        <Route path="cases/:id" element={<CaseDetailPage />} />
        <Route path="evidence" element={<DocumentManagement />} />
        <Route path="calendar" element={<AdvocateCalendarPage />} />
        <Route path="notes" element={<CaseNotesPage />} />
        <Route path="tasks" element={<TaskBoardPage />} />
        <Route path="performance" element={<AdvocatePerformance />} />
        <Route path="messages" element={<MessagingPage />} />
        <Route path="notifications" element={<NotificationCenter />} />
        <Route path="settings" element={<ProfilePage />} />
      </Route>

      <Route path="/court" element={<ProtectedRoute allowedRoles={['court']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<CourtDashboard />} />
        <Route path="cases" element={<CaseWorkspacePage role="court" title="Case Management" description="Browse all registered matters, filter the docket, and open detailed records for action." />} />
        <Route path="cases/:id" element={<CaseDetailPage />} />
        <Route path="hearings" element={<HearingScheduler />} />
        <Route path="rooms" element={<CourtRoomBoard />} />
        <Route path="advocates" element={<AdvocateDirectoryPage />} />
        <Route path="analytics" element={<ReportsPage />} />
        <Route path="qr" element={<QRCodeCenter />} />
        <Route path="messages" element={<MessagingPage />} />
        <Route path="notifications" element={<NotificationCenter />} />
        <Route path="settings" element={<ProfilePage />} />
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
            </div>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
