// ==========================================
// JanaoBangla — User Login Form Component
// BRANCH: feature-user-authentication-and-security
// User er email ar password niye login korar UI form
// ==========================================

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../services/ApiService';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

function UserLoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const redirectTo = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ==========================================
  // handleSubmit — Form submit hoile backend login API call korbe
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      return setErrorMsg('Please enter both email and password.');
    }

    setIsLoading(true);
    try {
      // Backend e login request pathano hocche
      const response = await authApi.login({ email: email.trim(), password });

      if (response.data.success) {
        // Context e user data ar token save kora hocche
        login(response.data.accessToken, response.data.user);
        if (response.data.user?.role === 'admin' && redirectTo === '/') {
          navigate('/admin', { replace: true });
        } else {
          navigate(redirectTo, { replace: true });
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check credentials.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate id="login-form">
      <ErrorMessage message={errorMsg} onDismiss={() => setErrorMsg('')} />

      <div style={{ marginBottom: '16px' }}>
        <label className="jb-label" htmlFor="login-email">
          Email Address <span style={{ color: '#FF1744' }}>*</span>
        </label>
        <input
          id="login-email"
          type="email"
          className="jb-input"
          placeholder="yourname@domain.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
          required
          autoComplete="email"
          disabled={isLoading}
          autoFocus
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label className="jb-label" htmlFor="login-password" style={{ margin: 0 }}>
            Password <span style={{ color: '#FF1744' }}>*</span>
          </label>
          <Link
            to="/forgot-password"
            id="forgot-password-link"
            style={{ fontSize: '0.85rem', color: '#006A4E', fontWeight: 600, textDecoration: 'none' }}
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
              background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: '1rem', padding: '0'
            }}
            aria-label={showPass ? 'Hide password' : 'Show password'}
          >
            {showPass ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      <button
        type="submit"
        id="login-submit-button"
        className="btn-primary-jb"
        style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '16px' }}
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

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: '#64748B' }}>
        Don't have an account?{' '}
        <Link to="/register" id="login-to-register-link" style={{ color: '#006A4E', fontWeight: 700 }}>
          Create Free Account
        </Link>
      </p>
    </form>
  );
}

export default UserLoginForm;
