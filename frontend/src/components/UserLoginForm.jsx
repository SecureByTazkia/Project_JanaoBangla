// ==========================================
// JanaoBangla — User Login Form
// BRANCH: feature-user-authentication-and-security
// Email ar password diye login korar form
// Submit hoile JWT token niye context e save korbe
// ==========================================

import { useState }          from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi }           from '../services/ApiService';
import { useAuth }           from '../context/AuthContext';
import ErrorMessage          from './ErrorMessage';
import LoadingSpinner        from './LoadingSpinner';

// ==========================================
// UserLoginForm — Login form component
// Success hoile previous page ba home e redirect korbe
// ==========================================
function UserLoginForm() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  // Login er pore kothay jabe — ProtectedRoute theke state e from save kore
  const redirectTo = location.state?.from?.pathname || '/';

  // Form states
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg,  setErrorMsg]  = useState('');

  // ==========================================
  // handleSubmit — Form submit hoile backend login API call korbe
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Basic validation
    if (!email.trim() || !password) {
      return setErrorMsg('Please enter your email and password.');
    }

    setIsLoading(true);
    try {
      // Backend login API call kora hocche
      const response = await authApi.login({ email: email.trim(), password });

      if (response.data.success) {
        // Token ar user data AuthContext e save kora hocche
        login(response.data.accessToken, response.data.user);
        // Previous page ba home e redirect kora hocche
        navigate(redirectTo, { replace: true });
      }
    } catch (error) {
      // Backend error message dekhano hocche
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate id="login-form">

      {/* Error display */}
      <ErrorMessage message={errorMsg} onDismiss={() => setErrorMsg('')} />

      {/* Email field */}
      <div style={{ marginBottom: '16px' }}>
        <label className="jb-label" htmlFor="login-email">
          Email Address
        </label>
        <input
          id="login-email"
          type="email"
          className="jb-input"
          placeholder="yourname@email.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
          required
          autoComplete="email"
          disabled={isLoading}
          autoFocus
        />
      </div>

      {/* Password field with show/hide */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label className="jb-label" htmlFor="login-password" style={{ margin: 0 }}>
            Password
          </label>
          {/* Forgot password link */}
          <Link
            to="/forgot-password"
            style={{ fontSize: '0.8rem', color: '#006A4E', fontWeight: 500 }}
          >
            Forgot password?
          </Link>
        </div>

        <div style={{ position: 'relative' }}>
          <input
            id="login-password"
            type={showPass ? 'text' : 'password'}
            className="jb-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
            required
            autoComplete="current-password"
            disabled={isLoading}
            style={{ paddingRight: '48px' }}
          />
          <button
            type="button"
            onClick={() => setShowPass((p) => !p)}
            style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '0'
            }}
            aria-label={showPass ? 'Hide password' : 'Show password'}
          >
            {showPass ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        id="login-submit-btn"
        className="btn-primary-jb"
        style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '20px' }}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            Signing In...
          </>
        ) : (
          'Sign In'
        )}
      </button>

      {/* Register link */}
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: '#64748B' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: '#006A4E', fontWeight: 600 }}>
          Create Account
        </Link>
      </p>
    </form>
  );
}

export default UserLoginForm;
