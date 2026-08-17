// ==========================================
// JanaoBangla — Email Verification Form Component
// BRANCH: feature-user-authentication-and-security
// 6-digit OTP entry form for account verification
// ==========================================

import { useState } from 'react';
import { authApi } from '../services/ApiService';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import LoadingSpinner from './LoadingSpinner';

function EmailVerificationForm({ onSuccess }) {
  const { user, updateUser } = useAuth();

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resending, setResending] = useState(false);

  // ==========================================
  // handleDigitChange — Ekta digit likhle next input e focus transfer korbe
  // ==========================================
  const handleDigitChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    setErrorMsg('');

    if (value && index < 5) {
      document.getElementById(`otp-digit-${index + 1}`)?.focus();
    }
  };

  // ==========================================
  // handleKeyDown — Backspace chaple previous input e cursor jabe
  // ==========================================
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-digit-${index - 1}`)?.focus();
    }
  };

  // ==========================================
  // handlePaste — Pure 6 digit OTP paste support
  // ==========================================
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newDigits = [...otpDigits];
      pasted.split('').forEach((digit, i) => {
        if (i < 6) newDigits[i] = digit;
      });
      setOtpDigits(newDigits);
    }
  };

  // ==========================================
  // handleVerify — OTP verification request backend e pathabe
  // ==========================================
  const handleVerify = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');

    if (otp.length !== 6) {
      return setErrorMsg('Please enter the complete 6-digit OTP code.');
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // Backend e verification API call
      const response = await authApi.verifyEmail(otp);

      if (response.data.success) {
        updateUser({ isVerified: 1 });
        setSuccessMsg('Email verified successfully! Your account is now fully active.');

        if (onSuccess) {
          setTimeout(() => onSuccess(), 1500);
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // handleResendOTP — Noya OTP pathanor request backend e pathabe
  // ==========================================
  const handleResendOTP = async () => {
    setResending(true);
    setErrorMsg('');
    try {
      await authApi.resendVerification();
      setSuccessMsg('New OTP code sent to your email. Please check your inbox.');
      setOtpDigits(['', '', '', '', '', '']);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setErrorMsg(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      {user?.email && (
        <p style={{ textAlign: 'center', color: '#64748B', fontSize: '0.9rem', marginBottom: '24px' }}>
          Verification OTP code sent to: <strong style={{ color: '#1F2937' }}>{user.email}</strong>
        </p>
      )}

      <SuccessMessage message={successMsg} onDismiss={() => setSuccessMsg('')} />
      <ErrorMessage message={errorMsg} onDismiss={() => setErrorMsg('')} />

      <form onSubmit={handleVerify} id="otp-verification-form">
        <div style={{
          display: 'flex', gap: '10px', justifyContent: 'center',
          marginBottom: '28px'
        }}>
          {otpDigits.map((digit, index) => (
            <input
              key={index}
              id={`otp-digit-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={isLoading}
              style={{
                width:       '48px',
                height:      '56px',
                textAlign:   'center',
                fontSize:    '1.5rem',
                fontWeight:  700,
                border:      `2px solid ${digit ? '#006A4E' : '#E2E8F0'}`,
                borderRadius: '10px',
                outline:     'none',
                background:  digit ? '#E8F5F0' : 'white',
                transition:  'all 0.2s ease',
                color:       '#1F2937'
              }}
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}
        </div>

        <button
          type="submit"
          id="otp-verify-button"
          className="btn-primary-jb"
          style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          disabled={isLoading || otpDigits.join('').length !== 6}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              Verifying...
            </>
          ) : (
            '✅ Verify Email'
          )}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: '#64748B' }}>
        Didn't receive the OTP?{' '}
        <button
          type="button"
          id="resend-otp-button"
          onClick={handleResendOTP}
          disabled={resending}
          style={{
            background: 'none', border: 'none', color: '#006A4E',
            fontWeight: 700, cursor: 'pointer', padding: '0'
          }}
        >
          {resending ? 'Sending...' : 'Resend OTP'}
        </button>
      </p>
    </div>
  );
}

export default EmailVerificationForm;
