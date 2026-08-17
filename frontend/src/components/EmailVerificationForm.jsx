// ==========================================
// JanaoBangla — Email Verification Form Component
// BRANCH: feature-user-authentication-and-security
// 6-digit OTP entry form for account verification
// Step 2 registration: user unverified, token nei, email sessionStorage e thake
// ==========================================

import { useState } from 'react';
import { authApi } from '../services/ApiService';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import LoadingSpinner from './LoadingSpinner';

function EmailVerificationForm({ onSuccess }) {
  const { user, updateUser, login } = useAuth();

  // Step 2 registration flow e user logged in thake na (kono token nai)
  // Tai sessionStorage theke pending email nite hobe
  const pendingEmail = sessionStorage.getItem('jb_pending_email');
  const displayEmail = user?.email || pendingEmail || '';

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
  // Unverified registration flow: email + otp pathate hobe (kono Bearer token nei)
  // Verified response-e login() call kore session establish kora hocche
  // ==========================================
  const handleVerify = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');

    if (otp.length !== 6) {
      return setErrorMsg('Please enter the complete 6-digit OTP code.');
    }

    if (!displayEmail) {
      return setErrorMsg('Email address not found. Please go back and register again.');
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // Backend e verification API call — email + otp diye (token chhara)
      const response = await authApi.verifyEmail({ otp, email: displayEmail });

      if (response.data.success) {
        // Verification complete — backend access token return korece
        // Session establish kora hocche
        if (response.data.accessToken && response.data.user) {
          login(response.data.accessToken, response.data.user);
        } else {
          // Already logged-in user er case (jemon profile page theke verify)
          updateUser({ isVerified: 1 });
        }

        // Pending email clear kora hocche sessionStorage theke
        sessionStorage.removeItem('jb_pending_email');

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
  // Unverified user er email sessionStorage theke pathano hocche
  // ==========================================
  const handleResendOTP = async () => {
    setResending(true);
    setErrorMsg('');
    try {
      // Email pathate hobe — registered user kintu token nei
      const response = await authApi.resendVerification(displayEmail || undefined);
      const isSent = response.data?.emailSent;
      const msg = response.data?.message || (isSent ? 'New OTP code sent to your email. Please check your inbox.' : 'New OTP generated! (Check backend terminal for dev fallback OTP)');
      
      setSuccessMsg(msg);
      sessionStorage.setItem('jb_pending_email_sent', isSent ? 'true' : 'false');
      setOtpDigits(['', '', '', '', '', '']);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setErrorMsg(message);
    } finally {
      setResending(false);
    }
  };

  const isEmailSent = sessionStorage.getItem('jb_pending_email_sent') === 'true';

  return (
    <div>
      {displayEmail && (
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
            {isEmailSent ? 'Verification OTP code sent to:' : 'Verification OTP generated for:'}
          </p>
          <strong style={{ color: '#1F2937', fontSize: '1rem', display: 'block', marginTop: '4px' }}>
            {displayEmail}
          </strong>
          {!isEmailSent && (
            <p style={{ color: '#006A4E', fontSize: '0.78rem', marginTop: '6px', background: '#E8F5F0', padding: '6px 12px', borderRadius: '6px', display: 'inline-block' }}>
              ℹ️ Dev Fallback Active — Check backend terminal console for 6-digit OTP
            </p>
          )}
        </div>
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
