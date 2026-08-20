// ==========================================
// JanaoBangla — Authentication Context
// BRANCH: feature-user-authentication-and-security
// Global auth state manage korar jonno React Context
// User session, login/logout, ar token localStorage e manage korbe
// ==========================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/ApiService';

const AuthContext = createContext(null);

const TOKEN_KEY = 'jb_access_token';
const USER_KEY  = 'jb_user';

// ==========================================
// AuthProvider — Root context provider component
// ==========================================
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // ==========================================
  // initializeAuth — LocalStorage theke token check kore user state populate korbe
  // ==========================================
  const initializeAuth = useCallback(async () => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser  = localStorage.getItem(USER_KEY);

      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        // Backend theke latest profile refresh kora hocche
        try {
          const response = await authApi.getProfile();
          if (response.data.success) {
            const freshUser = response.data.user;
            setUser(freshUser);
            localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
          }
        } catch (profileErr) {
          // IMPORTANT: Shudhu 401 (token expired/invalid) hole logout korbo
          // Network error, 500 ba backend restart e logout KORBO NA
          // Cached session ke valid rekhe user ke logged-in rakhbo
          const statusCode = profileErr?.response?.status;
          if (statusCode === 401) {
            console.warn('Token expired (401). Clearing auth session.');
            clearAuthData();
          } else {
            console.warn('Profile refresh failed (non-auth error). Keeping cached session.', profileErr?.message);
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // ==========================================
  // clearAuthData — Token ar user info muche felbe
  // ==========================================
  const clearAuthData = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  // ==========================================
  // login — Login/register success er pore context e token ar user set korbe
  // ==========================================
  const login = useCallback((accessToken, userData) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    setAuthError(null);
  }, []);

  // ==========================================
  // logout — User logout korbe ar home e redirect korbe
  // ==========================================
  const logout = useCallback(() => {
    clearAuthData();
    window.location.href = '/login';
  }, []);

  // ==========================================
  // updateUser — Profile update hoile local state sync korbe
  // ==========================================
  const updateUser = useCallback((updatedUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUserData };
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
      return merged;
    });
  }, []);

  const isAuthenticated = !!user;
  const isAdmin         = user?.role === 'admin';
  const isVerified      = user?.isVerified === 1 || user?.isVerified === true;

  const contextValue = {
    user,
    isAuthenticated,
    isAdmin,
    isVerified,
    isLoading,
    authError,
    login,
    logout,
    updateUser,
    setAuthError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// useAuth — AuthContext access korar custom hook
// ==========================================
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
