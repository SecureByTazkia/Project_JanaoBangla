// ==========================================
// JanaoBangla — Protected Route Component
// BRANCH: feature-user-authentication-and-security
// Login na thakle login page e redirect korbe
// ==========================================

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// ==========================================
// ProtectedRoute — Guarded route wrapper
// ==========================================
function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // Auth checking er shomoy spinner dekhabe
  if (isLoading) {
    return <LoadingSpinner fullPage message="Authenticating session..." />;
  }

  // Login na thakle /login e redirect hobe
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin access required hole check korbe
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
