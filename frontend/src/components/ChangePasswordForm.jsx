// ==========================================
// JanaoBangla — Change Password Form Component
// BRANCH: feature-user-authentication-and-security
// Logged in user er password update korar form
// ==========================================

import { useState } from 'react';
import { authApi } from '../services/ApiService';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import LoadingSpinner from './LoadingSpinner';

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass,        setShowPass]        = useState(false);
  const [isLoading,       setIsLoading]       = useState(false);
  const [errorMsg,        setErrorMsg]        = useState('');
  const [successMsg,      setSuccessMsg]      = useState('');

  // ==========================================
  // handleSubmit — Current and new password backend e pathabe
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      return setErrorMsg('All password fields are required.');
    }

    if (newPassword !== confirmPassword) {
      return setErrorMsg('New passwords do not match.');
    }

    if (currentPassword === newPassword) {
      return setErrorMsg('New password must be different from your current password.');
    }

    setIsLoading(true);
    try {
      const response = await authApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });

      if (response.data.success) {
        setSuccessMsg('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password. Please check your current password.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate id="change-password-form">
      <SuccessMessage message={successMsg} onDismiss={() => setSuccessMsg('')} />
      <ErrorMessage message={errorMsg} onDismiss={() => setErrorMsg('')} />

      <div style={{ marginBottom: '16px' }}>
        <label className="jb-label" htmlFor="change-current-password">
          Current Password <span style={{ color: '#FF1744' }}>*</span>
        </label>
        <input
          id="change-current-password"
          type={showPass ? 'text' : 'password'}
          className="jb-input"
          placeholder="Enter current password"
          value={currentPassword}
          onChange={(e) => { setCurrentPassword(e.target.value); setErrorMsg(''); }}
          required
          autoComplete="current-password"
          disabled={isLoading}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label className="jb-label" htmlFor="change-new-password">
          New Password <span style={{ color: '#FF1744' }}>*</span>
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="change-new-password"
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
        <label className="jb-label" htmlFor="change-confirm-password">
          Confirm New Password <span style={{ color: '#FF1744' }}>*</span>
        </label>
        <input
          id="change-confirm-password"
          type={showPass ? 'text' : 'password'}
          className="jb-input"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg(''); }}
          required
          autoComplete="new-password"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        id="change-password-submit-button"
        className="btn-primary-jb"
        style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            Updating Password...
          </>
        ) : (
          'Update Password'
        )}
      </button>
    </form>
  );
}

export default ChangePasswordForm;
