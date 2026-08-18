// ==========================================
// JanaoBangla — Forgot Password Form Component
// BRANCH: feature-user-authentication-and-security
// Password bhule gele reset link pathanor form
// ==========================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/ApiService';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import LoadingSpinner from './LoadingSpinner';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ==========================================
  // handleSubmit — Forgot password request backend e pathabe
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      return setErrorMsg('Please enter a valid email address.');
    }

    setIsLoading(true);
    try {
      const response = await authApi.forgotPassword(email.trim());
      if (response.data.success) {
        setSuccessMsg('If an account exists with this email, password reset instructions have been sent.');
        setEmail('');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email. Please try again.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate id="forgot-password-form">
      <SuccessMessage message={successMsg} onDismiss={() => setSuccessMsg('')} />
      <ErrorMessage message={errorMsg} onDismiss={() => setErrorMsg('')} />

      <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.6 }}>
        Enter your registered email address below, and we will send you a secure link to reset your password.
      </p>

      <div style={{ marginBottom: '20px' }}>
        <label className="jb-label" htmlFor="forgot-email">
          Email Address <span style={{ color: '#FF1744' }}>*</span>
        </label>
        <input
          id="forgot-email"
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

      <button
        type="submit"
        id="forgot-password-submit-button"
        className="btn-primary-jb"
        style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            Sending Instructions...
          </>
        ) : (
          'Send Password Reset Link'
        )}
      </button>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: '#64748B' }}>
        Remember your password?{' '}
        <Link to="/login" id="forgot-to-login-link" style={{ color: '#006A4E', fontWeight: 700 }}>
          Back to Login
        </Link>
      </p>
    </form>
  );
}

export default ForgotPasswordForm;
