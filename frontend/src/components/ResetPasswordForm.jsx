// ==========================================
// JanaoBangla — Reset Password Form Component
// BRANCH: feature-user-authentication-and-security
// 6-digit OTP code / token diye noya password set korar form
// ==========================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/ApiService';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import LoadingSpinner from './LoadingSpinner';

function ResetPasswordForm({ initialToken = '' }) {
  const navigate = useNavigate();

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ==========================================
  // handleSubmit — Reset password OTP token ar new password backend e pathabe
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedToken = token.trim();
    if (!trimmedToken) {
      return setErrorMsg('Please enter the 6-digit reset code sent to your email.');
    }

    if (!newPassword) {
      return setErrorMsg('New password is required.');
    }

    if (newPassword !== confirmPassword) {
      return setErrorMsg('Passwords do not match.');
    }

    setIsLoading(true);
    try {
      // Backend e password reset API call pathano hocche
      const response = await authApi.resetPassword({
        token: trimmedToken,
        newPassword,
        confirmPassword
      });

      if (response.data.success) {
        setSuccessMsg('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed. The code may have expired or is invalid.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate id="reset-password-form">
      <SuccessMessage message={successMsg} onDismiss={() => setSuccessMsg('')} />
      <ErrorMessage message={errorMsg} onDismiss={() => setErrorMsg('')} />

      {/* 6-digit Reset OTP Code Input */}
      <div style={{ marginBottom: '16px' }}>
        <label className="jb-label" htmlFor="reset-token-code">
          6-Digit Reset Code <span style={{ color: '#FF1744' }}>*</span>
        </label>
        <input
          id="reset-token-code"
          type="text"
          maxLength={10}
          className="jb-input"
          placeholder="e.g. 123456"
          value={token}
          onChange={(e) => { setToken(e.target.value); setErrorMsg(''); }}
          required
          autoComplete="one-time-code"
          disabled={isLoading}
          style={{ letterSpacing: '3px', fontWeight: 700, fontSize: '1.1rem' }}
        />
        <p style={{ color: '#64748B', fontSize: '0.75rem', marginTop: '4px' }}>
          Check your Gmail inbox for the 6-digit password reset code
        </p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label className="jb-label" htmlFor="reset-new-password">
          New Password <span style={{ color: '#FF1744' }}>*</span>
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="reset-new-password"
            type={showPass ? 'text' : 'password'}
            className="jb-input"
            placeholder="Min 8 chars, uppercase, number, symbol"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setErrorMsg(''); }}
            required
            autoComplete="new-password"
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

      <div style={{ marginBottom: '24px' }}>
        <label className="jb-label" htmlFor="reset-confirm-password">
          Confirm New Password <span style={{ color: '#FF1744' }}>*</span>
        </label>
        <input
          id="reset-confirm-password"
          type={showPass ? 'text' : 'password'}
          className="jb-input"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg(''); }}
          required
          autoComplete="new-password"
          disabled={isLoading}
        />
        {confirmPassword && (
          <p style={{
            fontSize: '0.75rem', marginTop: '4px',
            color: newPassword === confirmPassword ? '#2E7D32' : '#FF1744',
            fontWeight: 600
          }}>
            {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
          </p>
        )}
      </div>

      <button
        type="submit"
        id="reset-password-submit-button"
        className="btn-primary-jb"
        style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
        disabled={isLoading || !token.trim()}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            Resetting Password...
          </>
        ) : (
          'Update Password'
        )}
      </button>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: '#64748B' }}>
        <Link to="/login" id="reset-to-login-link" style={{ color: '#006A4E', fontWeight: 700 }}>
          Back to Login
        </Link>
      </p>
    </form>
  );
}

export default ResetPasswordForm;
