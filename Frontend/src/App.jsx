import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Route guards
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// App pages
import OnboardingPage from './pages/OnboardingPage';
import MainLayout from './components/layout/MainLayout';
import FeedPage from './pages/feed/FeedPage';
import ResourcesPage from './pages/resources/ResourcesPage';
import EventsPage from './pages/events/EventsPage';
import StudyGroupsPage from './pages/studyGroups/StudyGroupsPage';
import MarketplacePage from './pages/marketplace/MarketplacePage';
import OpportunitiesPage from './pages/opportunities/OpportunitiesPage';
import TeammatesPage from './pages/teammates/TeammatesPage';
import AiChatbotPage from './pages/aiChatbot/AiChatbotPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import PortfolioPage from './pages/portfolio/PortfolioPage';
import SettingsPage from './pages/settings/SettingsPage';
import { SocketProvider } from './contexts/SocketContext';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e1e24', color: '#fff' } }} />
        <Routes>
          {/* ── Public auth routes (redirect if already logged in) ── */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

          {/* ── Verify email (static instructions — user is signed out) ── */}
          <Route path="/verify-email" element={<PublicRoute><VerifyEmailPage /></PublicRoute>} />

          {/* ── Onboarding (protected but not subject to onboarding redirect) ── */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* ── Protected app routes (wrapped in layout) ── */}
          <Route element={<ProtectedRoute><SocketProvider><MainLayout /></SocketProvider></ProtectedRoute>}>
            <Route path="/dashboard" element={<FeedPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/study-groups" element={<StudyGroupsPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/opportunities" element={<OpportunitiesPage />} />
            <Route path="/teammates" element={<TeammatesPage />} />
            <Route path="/chatbot" element={<AiChatbotPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/u/:username" element={<PortfolioPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* ── Default redirect ── */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
