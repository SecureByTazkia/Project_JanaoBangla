// ==========================================
// JanaoBangla — Authentication Context
// BRANCH: feature-user-authentication-and-security
// Global auth state manage korar jonno React Context
// Sob component ke user data, login/logout function access dibe
// ==========================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/ApiService';

// Auth Context create kora hocche
const AuthContext = createContext(null);

// ==========================================
// LOCAL STORAGE KEYS — Consistent key names
// Ekhane define rakhle key change korte shudhu ekjaygay lagbe
// ==========================================
const TOKEN_KEY = 'jb_access_token';
const USER_KEY  = 'jb_user';

// ==========================================
// AuthProvider — Root App component ke wrap korbe
// Sob child component useAuth() hook diye state access korte parbe
// ==========================================
export function AuthProvider({ children }) {
  // User state — null = logged out, object = logged in
  const [user,         setUser]         = useState(null);
  // Loading state — app start e token check er shomoy
  const [isLoading,    setIsLoading]    = useState(true);
  // Error state
  const [authError,    setAuthError]    = useState(null);

  // ==========================================
  // initializeAuth — App start e localStorage check korbe
  // Saved token thakle user data fetch korbe
  // ==========================================
  const initializeAuth = useCallback(async () => {
    try {
      // LocalStorage theke saved token newa hocche
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser  = localStorage.getItem(USER_KEY);

      if (savedToken && savedUser) {
        // Saved user data parse kora hocche
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        // Backend theke fresh profile fetch kora hocche
        try {
          const response = await authApi.getProfile();
          if (response.data.success) {
            // Updated user data set kora hocche
            const freshUser = response.data.user;
            setUser(freshUser);
            localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
          }
        } catch {
          // Profile fetch fail hoile (401 etc) logout kora hocche
          clearAuthData();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAuthData();
    } finally {
      // Loading complete
      setIsLoading(false);
    }
  }, []);

  // ==========================================
  // App prothom load e auth initialize kora hocche
  // ==========================================
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // ==========================================
  // clearAuthData — LocalStorage clean kore user null set korbe
  // ==========================================
  const clearAuthData = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  // ==========================================
  // login — Login success er pore call hobe
  // Token ar user data save kore state update korbe
  // ==========================================
  const login = useCallback((accessToken, userData) => {
    // Token LocalStorage e save kora hocche
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    // React state update kora hocche
    setUser(userData);
    setAuthError(null);
  }, []);

  // ==========================================
  // logout — User logout korar jonno
  // LocalStorage clear kore home page e niye jabe
  // ==========================================
  const logout = useCallback(() => {
    // Auth data clear kora hocche
    clearAuthData();
    // Home page e redirect kora hocche
    window.location.href = '/';
  }, []);

  // ==========================================
  // updateUser — Profile update er pore user state refresh korbe
  // ==========================================
  const updateUser = useCallback((updatedUserData) => {
    const merged = { ...user, ...updatedUserData };
    setUser(merged);
    localStorage.setItem(USER_KEY, JSON.stringify(merged));
  }, [user]);

  // Computed properties — derived state
  const isAuthenticated = !!user;
  const isAdmin         = user?.role === 'admin';
  const isVerified      = user?.isVerified === 1 || user?.isVerified === true;

  // Context value — sob component access korte parbe
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
// useAuth — Custom hook for accessing auth context
// Jebhabe component e auth lagbe: const { user, login } = useAuth()
// ==========================================
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider. Wrap your app with <AuthProvider>.');
  }
  return context;
}

export default AuthContext;
