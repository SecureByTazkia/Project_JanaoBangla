// ==========================================
// JanaoBangla — Email Verification Form
// BRANCH: feature-user-authentication-and-security
// 6-digit OTP input form
// Registration er pore email verification korar jonno
// ==========================================

import { useState } from 'react';
import { authApi }       from '../services/ApiService';
import { useAuth }       from '../context/AuthContext';
import ErrorMessage      from './ErrorMessage';
import SuccessMessage    from './SuccessMessage';
import LoadingSpinner    from './LoadingSpinner';

// ==========================================
// EmailVerificationForm — OTP verification form
// onSuccess prop: verify hoile parent component ke notify korbe
// ==========================================
function EmailVerificationForm({ onSuccess }) {
  const { user, updateUser } = useAuth();

  // 6 digit OTP er jonno alag alag input field
  // Array of 6 empty strings
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  const [isLoading,   setIsLoading]   = useState(false);
  const [errorMsg,    setErrorMsg]    = useState('');
  const [successMsg,  setSuccessMsg]  = useState('');
  const [resending,   setResending]   = useState(false);

  // ==========================================
  // handleDigitChange — OTP input field change handler
  // Ek digit enter hoile next field e focus move korbe
  // ==========================================
  const handleDigitChange = (index, value) => {
    // Shudhu number accept korbe
    if (!/^\d?$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    setErrorMsg('');

    // Next field e automatically focus move kora hocche
    if (value && index < 5) {
      document.getElementById(`otp-digit-${index + 1}`)?.focus();
    }
  };

  // ==========================================
  // handleKeyDown — Backspace e previous field e jabe
  // ==========================================
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      // Current field khali thakle previous field e cursor niye jabe
      document.getElementById(`otp-digit-${index - 1}`)?.focus();
    }
  };

  // ==========================================
  // handlePaste — OTP paste support
  // Copy kora OTP paste korle automatically digits fill hobe
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
  // handleVerify — OTP submit kore backend e verify korbe
  // ==========================================
  const handleVerify = async (e) => {
    e.preventDefault();

    // 6 digits combine kora hocche
    const otp = otpDigits.join('');

    if (otp.length !== 6) {
      return setErrorMsg('Please enter the complete 6-digit OTP.');
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // Backend e OTP verify request pathano hocche
      const response = await authApi.verifyEmail(otp);

      if (response.data.success) {
        // User state e isVerified update kora hocche
        updateUser({ isVerified: true });
        setSuccessMsg('Email verified successfully! Your account is now active.');

        // Parent component ke notify kora hocche
        if (onSuccess) {
          setTimeout(() => onSuccess(), 1500);
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid OTP. Please try again.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // handleResendOTP — Noya OTP pathano jonno
  // ==========================================
  const handleResendOTP = async () => {
    setResending(true);
    setErrorMsg('');
    try {
      // OTP resend request pathano hocche
      await authApi.resendVerification();
      setSuccessMsg('New OTP sent to your email. Please check your inbox.');
      // OTP fields reset kora hocche
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
      {/* User email dekhano hocche */}
      {user?.email && (
        <p style={{ textAlign: 'center', color: '#64748B', fontSize: '0.9rem', marginBottom: '24px' }}>
          OTP sent to: <strong style={{ color: '#1F2937' }}>{user.email}</strong>
        </p>
      )}

      {/* Success/Error messages */}
      <SuccessMessage message={successMsg} onDismiss={() => setSuccessMsg('')} />
      <ErrorMessage   message={errorMsg}   onDismiss={() => setErrorMsg('')}   />

      <form onSubmit={handleVerify} id="otp-verification-form">
        {/* 6-digit OTP input boxes */}
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

        {/* Verify button */}
        <button
          type="submit"
          id="otp-verify-btn"
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

      {/* Resend OTP */}
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: '#64748B' }}>
        Didn't receive the OTP?{' '}
        <button
          type="button"
          onClick={handleResendOTP}
          disabled={resending}
          style={{
            background: 'none', border: 'none', color: '#006A4E',
            fontWeight: 600, cursor: 'pointer', padding: '0'
          }}
        >
          {resending ? 'Sending...' : 'Resend OTP'}
        </button>
      </p>
    </div>
  );
}

export default EmailVerificationForm;
