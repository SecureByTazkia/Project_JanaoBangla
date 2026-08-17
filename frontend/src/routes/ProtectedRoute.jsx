// ==========================================
// JanaoBangla — Protected Route Component
// BRANCH: feature-user-authentication-and-security
// Login na hoile protected page e jete dibe na
// Login page e redirect korbe
// ==========================================

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// ==========================================
// ProtectedRoute — Authenticated user only access korte parbe
// requireAdmin = true dile admin o lagbe
// ==========================================
function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  // Current location save kora hocche — login er pore same page e ফিরে আসার জন্য
  const location = useLocation();

  // Auth initialize howar shomoy loading dekhabe
  if (isLoading) {
    return <LoadingSpinner fullPage message="Checking authentication..." />;
  }

  // Login na hoile login page e redirect kora hocche
  // state e from location save kora hocche — login er pore same page e firte
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin required kintu user admin na hoile home e redirect
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Sob check pass korle actual page render kora hocche
  return children;
}

export default ProtectedRoute;
