// ==========================================
// JanaoBangla — App Root Component
// BRANCH: feature-user-authentication-and-security
// React Router setup, AuthProvider wrapper, and authenticated routes
// ==========================================

import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Layout components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import UserLoginPage from './pages/UserLoginPage';
import UserRegistrationPage from './pages/UserRegistrationPage';
import UserProfilePage from './pages/UserProfilePage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

import CreateCivicProblemReportPage from './pages/CreateCivicProblemReportPage';
import MySubmittedReportsPage from './pages/MySubmittedReportsPage';
import CivicProblemReportDetailsPage from './pages/CivicProblemReportDetailsPage';
import CivicProblemMapPage from './pages/CivicProblemMapPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminReportManagementPage from './pages/AdminReportManagementPage';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import CommunityFeedPage from './pages/CommunityFeedPage';
import WomenSafetyEmergencyPage from './pages/WomenSafetyEmergencyPage';

// ==========================================
// ComingSoonPage — Future phase placeholders
// ==========================================
function ComingSoonPage({ title }) {
  return (
    <main className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '40px 20px', textAlign: 'center' }}>
      <div className="jb-card" style={{ maxWidth: '480px', padding: '40px 32px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚧</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          {title} — Coming Soon
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', margin: 0 }}>
          This feature will be built in an upcoming development phase.
        </p>
      </div>
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="page-wrapper">
        <Navbar />

        <Routes>
          {/* Phase 1 — Homepage */}
          <Route path="/" element={<HomePage />} />

          {/* Phase 2 — Authentication & User Security */}
          <Route path="/login" element={<UserLoginPage />} />
          <Route path="/register" element={<UserRegistrationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Phase 2 — Protected Authenticated Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verify-email"
            element={<EmailVerificationPage />}
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />

          {/* Phase 3 — Reports */}
          <Route path="/report-problem" element={
            <ProtectedRoute>
              <CreateCivicProblemReportPage />
            </ProtectedRoute>
          } />
          <Route path="/my-reports" element={
            <ProtectedRoute>
              <MySubmittedReportsPage />
            </ProtectedRoute>
          } />
          <Route path="/reports/:id" element={
            <ProtectedRoute>
              <CivicProblemReportDetailsPage />
            </ProtectedRoute>
          } />

          {/* Phase 4 — Location & Civic Problem Map */}
          <Route path="/map" element={<CivicProblemMapPage />} />

          {/* Phase 5 — Community Feed & Discussion */}
          <Route path="/community" element={<CommunityFeedPage />} />

          {/* Phase 7 — Women Safety & SOS Emergency */}
          <Route
            path="/sos"
            element={
              <ProtectedRoute>
                <WomenSafetyEmergencyPage />
              </ProtectedRoute>
            }
          />

          {/* Phase 8 — Admin Login (Unprotected / Specialized Entry) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Phase 8 — Protected Admin Routes (Requires role === 'admin') */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminReportManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminUserManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Phase 9 — Search & Analytics (Future) */}
          <Route path="/search" element={<ComingSoonPage title="Search" />} />
          <Route path="/analytics" element={<ComingSoonPage title="Analytics" />} />

          {/* Static Pages */}
          <Route path="/about" element={<ComingSoonPage title="About" />} />
          <Route path="/privacy" element={<ComingSoonPage title="Privacy Policy" />} />
          <Route path="/terms" element={<ComingSoonPage title="Terms of Service" />} />
          <Route path="/contact" element={<ComingSoonPage title="Contact" />} />

          {/* 404 Catch-All */}
          <Route path="*" element={<ComingSoonPage title="404 — Page Not Found" />} />
        </Routes>

        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
