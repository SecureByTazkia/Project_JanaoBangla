// ==========================================
// JanaoBangla — User Registration Form Component
// BRANCH: feature-user-authentication-and-security
// Noya citizen registration form
// Full Name, Email, Phone, Password, Confirm Password
// ==========================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/ApiService';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

function UserRegistrationForm() {
  const navigate = useNavigate();
  useAuth(); // AuthContext mount check — login ekhane dorkar nei (Step 1 e token nai)

  const [formData, setFormData] = useState({
    fullName:        '',
    email:           '',
    phone:           '',
    password:        '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg,  setErrorMsg]  = useState('');
  const [showPass,  setShowPass]  = useState(false);

  // ==========================================
  // handleChange — Input change track kore state e save korbe
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  // ==========================================
  // handleSubmit — Registration form backend e pathabe
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName.trim()) {
      return setErrorMsg('Full name is required.');
    }
    if (!formData.email.trim()) {
      return setErrorMsg('Valid email is required.');
    }
    if (!formData.password) {
      return setErrorMsg('Password is required.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setErrorMsg('Passwords do not match. Please re-enter.');
    }

    setIsLoading(true);
    try {
      // Backend e registration API call pathano hocche
      const response = await authApi.register({
        fullName:        formData.fullName.trim(),
        email:           formData.email.trim(),
        phone:           formData.phone.trim(),
        password:        formData.password,
        confirmPassword: formData.confirmPassword
      });

      // Step 1 registration shofol hole — user unverified thakbe ebong OTP send/fallback hobe
      if (response.data.success && response.data.requiresVerification) {
        // Pending email ebong status sessionStorage e save kora hocche
        sessionStorage.setItem('jb_pending_email', response.data.email);
        sessionStorage.setItem('jb_pending_msg', response.data.message || '');
        sessionStorage.setItem('jb_pending_email_sent', response.data.emailSent ? 'true' : 'false');
        navigate('/verify-email', { replace: true });
      }
    } catch (error) {
      // Backend response error ba network error handle kora hocche
      const message = error.response?.data?.message || (error.response ? 'Registration failed. Please check your details.' : 'Unable to connect to server. Please ensure the backend is running.');
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength visual indicator
  const getPasswordStrength = (pass) => {
    if (!pass) return { label: '', color: '#E2E8F0', width: '0%' };
    if (pass.length < 6) return { label: 'Weak', color: '#FF1744', width: '25%' };
    if (pass.length < 8) return { label: 'Fair', color: '#FFB300', width: '50%' };
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[!@#$%^&*]/.test(pass))
      return { label: 'Strong', color: '#006A4E', width: '100%' };
    return { label: 'Good', color: '#2E7D32', width: '75%' };
  };

  const strength = getPasswordStrength(formData.password);

  return (
    <form onSubmit={handleSubmit} noValidate id="registration-form">
      <ErrorMessage message={errorMsg} onDismiss={() => setErrorMsg('')} />

      <div style={{ marginBottom: '16px' }}>
        <label className="jb-label" htmlFor="reg-fullname">
          Full Name <span style={{ color: '#FF1744' }}>*</span>
        </label>
        <input
          id="reg-fullname"
          name="fullName"
          type="text"
          className="jb-input"
          placeholder="e.g. Tanvir Hossain"
          value={formData.fullName}
          onChange={handleChange}
          required
          autoComplete="name"
          disabled={isLoading}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label className="jb-label" htmlFor="reg-email">
          Email Address <span style={{ color: '#FF1744' }}>*</span>
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          className="jb-input"
          placeholder="yourname@domain.com"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
          disabled={isLoading}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label className="jb-label" htmlFor="reg-phone">
          Phone Number <span style={{ color: '#64748B', fontWeight: 400 }}>(optional)</span>
        </label>
        <input
          id="reg-phone"
          name="phone"
          type="tel"
          className="jb-input"
          placeholder="+8801700000000"
          value={formData.phone}
          onChange={handleChange}
          autoComplete="tel"
          disabled={isLoading}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label className="jb-label" htmlFor="reg-password">
          Password <span style={{ color: '#FF1744' }}>*</span>
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="reg-password"
            name="password"
            type={showPass ? 'text' : 'password'}
            className="jb-input"
            placeholder="Min 8 chars, uppercase, number, symbol"
            value={formData.password}
            onChange={handleChange}
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

        {formData.password && (
          <div style={{ marginTop: '6px' }}>
            <div style={{ height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: strength.width, background: strength.color,
                transition: 'all 0.3s ease'
              }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: strength.color, fontWeight: 700 }}>
              {strength.label}
            </span>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label className="jb-label" htmlFor="reg-confirm-password">
          Confirm Password <span style={{ color: '#FF1744' }}>*</span>
        </label>
        <input
          id="reg-confirm-password"
          name="confirmPassword"
          type={showPass ? 'text' : 'password'}
          className="jb-input"
          placeholder="Re-enter password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          autoComplete="new-password"
          disabled={isLoading}
        />
        {formData.confirmPassword && (
          <p style={{
            fontSize: '0.75rem', marginTop: '4px',
            color: formData.password === formData.confirmPassword ? '#2E7D32' : '#FF1744',
            fontWeight: 600
          }}>
            {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
          </p>
        )}
      </div>

      <button
        type="submit"
        id="register-submit-button"
        className="btn-primary-jb"
        style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            Creating Account...
          </>
        ) : (
          '🇧🇩 Create Free Account'
        )}
      </button>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: '#64748B' }}>
        Already have an account?{' '}
        <Link to="/login" id="reg-to-login-link" style={{ color: '#006A4E', fontWeight: 700 }}>
          Sign In
        </Link>
      </p>
    </form>
  );
}

export default UserRegistrationForm;
