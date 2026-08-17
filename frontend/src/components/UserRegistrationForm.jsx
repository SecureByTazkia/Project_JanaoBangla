// ==========================================
// JanaoBangla — User Registration Form
// BRANCH: feature-user-authentication-and-security
// Noya account create korar form
// Full Name, Email, Phone, Password, Confirm Password
// ==========================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi }     from '../services/ApiService';
import { useAuth }     from '../context/AuthContext';
import ErrorMessage    from './ErrorMessage';
import LoadingSpinner  from './LoadingSpinner';

// ==========================================
// UserRegistrationForm — Registration form component
// Submit hoile backend e POST /api/auth/register call hobe
// Success hoile login page ba email verify page e jabe
// ==========================================
function UserRegistrationForm() {
  const navigate        = useNavigate();
  const { login }       = useAuth();

  // Form field states — each input er jonno alag state
  const [formData, setFormData] = useState({
    fullName:        '',
    email:           '',
    phone:           '',
    password:        '',
    confirmPassword: ''
  });

  // UI states
  const [isLoading,  setIsLoading]  = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [showPass,   setShowPass]   = useState(false); // Password show/hide toggle

  // ==========================================
  // handleChange — Jebhabe input change hobe state update korbe
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Spread operator diye previous state rakhe, shudhu changed field update korche
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Typing shuru korle error clear kora hocche
    if (errorMsg) setErrorMsg('');
  };

  // ==========================================
  // handleSubmit — Form submit hoile API call korbe
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault(); // Default form submit prevent kora hocche
    setErrorMsg('');

    // Frontend validation — basic check
    if (!formData.fullName.trim()) {
      return setErrorMsg('Full name is required.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setErrorMsg('Passwords do not match. Please re-enter.');
    }

    setIsLoading(true);
    try {
      // API call kora hocche — backend e registration request pathano hocche
      const response = await authApi.register({
        fullName:        formData.fullName.trim(),
        email:           formData.email.trim(),
        phone:           formData.phone.trim(),
        password:        formData.password,
        confirmPassword: formData.confirmPassword
      });

      if (response.data.success) {
        // Registration success — token ar user data save kora hocche
        login(response.data.accessToken, response.data.user);
        // Email verification page e navigate kora hocche
        navigate('/verify-email', { replace: true });
      }
    } catch (error) {
      // Backend theke error message newa hocche
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      setErrorMsg(message);
    } finally {
      // Loading band kora hocche
      setIsLoading(false);
    }
  };

  // ==========================================
  // Password strength indicator — visual feedback
  // ==========================================
  const getPasswordStrength = (pass) => {
    if (!pass)          return { label: '',        color: '#E2E8F0', width: '0%'   };
    if (pass.length < 6) return { label: 'Weak',    color: '#FF1744', width: '25%'  };
    if (pass.length < 8) return { label: 'Fair',    color: '#FFB300', width: '50%'  };
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[!@#$%^&*]/.test(pass))
                         return { label: 'Strong',  color: '#006A4E', width: '100%' };
    return               { label: 'Good',           color: '#2E7D32', width: '75%'  };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <form onSubmit={handleSubmit} noValidate id="registration-form">

      {/* Error message area */}
      <ErrorMessage message={errorMsg} onDismiss={() => setErrorMsg('')} />

      {/* Full Name field */}
      <div style={{ marginBottom: '16px' }}>
        <label className="jb-label" htmlFor="reg-fullname">
          Full Name <span style={{ color: '#FF1744' }}>*</span>
        </label>
        <input
          id="reg-fullname"
          name="fullName"
          type="text"
          className="jb-input"
          placeholder="e.g. Rahim Uddin"
          value={formData.fullName}
          onChange={handleChange}
          required
          autoComplete="name"
          disabled={isLoading}
        />
      </div>

      {/* Email field */}
      <div style={{ marginBottom: '16px' }}>
        <label className="jb-label" htmlFor="reg-email">
          Email Address <span style={{ color: '#FF1744' }}>*</span>
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          className="jb-input"
          placeholder="yourname@email.com"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
          disabled={isLoading}
        />
      </div>

      {/* Phone field */}
      <div style={{ marginBottom: '16px' }}>
        <label className="jb-label" htmlFor="reg-phone">
          Phone Number <span style={{ color: '#94A3B8', fontWeight: 400 }}>(optional)</span>
        </label>
        <input
          id="reg-phone"
          name="phone"
          type="tel"
          className="jb-input"
          placeholder="+8801XXXXXXXXX"
          value={formData.phone}
          onChange={handleChange}
          autoComplete="tel"
          disabled={isLoading}
        />
      </div>

      {/* Password field with show/hide toggle */}
      <div style={{ marginBottom: '8px' }}>
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
          {/* Password show/hide button */}
          <button
            type="button"
            onClick={() => setShowPass((p) => !p)}
            style={{
              position:   'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'none',     border: 'none',            cursor: 'pointer',
              color:      '#64748B',  fontSize: '1rem',          padding: '0'
            }}
            aria-label={showPass ? 'Hide password' : 'Show password'}
          >
            {showPass ? '🙈' : '👁️'}
          </button>
        </div>

        {/* Password strength indicator */}
        {formData.password && (
          <div style={{ marginTop: '6px' }}>
            <div style={{ height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: passwordStrength.width,
                background: passwordStrength.color, borderRadius: '2px',
                transition: 'all 0.3s ease'
              }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: passwordStrength.color, fontWeight: 600 }}>
              {passwordStrength.label}
            </span>
          </div>
        )}
      </div>

      {/* Confirm Password field */}
      <div style={{ marginBottom: '24px' }}>
        <label className="jb-label" htmlFor="reg-confirm-password">
          Confirm Password <span style={{ color: '#FF1744' }}>*</span>
        </label>
        <input
          id="reg-confirm-password"
          name="confirmPassword"
          type={showPass ? 'text' : 'password'}
          className="jb-input"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          autoComplete="new-password"
          disabled={isLoading}
        />
        {/* Passwords match indicator */}
        {formData.confirmPassword && (
          <p style={{
            fontSize: '0.75rem', marginTop: '4px',
            color: formData.password === formData.confirmPassword ? '#2E7D32' : '#FF1744'
          }}>
            {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
          </p>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        id="register-submit-btn"
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
          '🇧🇩 Create My Account'
        )}
      </button>

      {/* Login link */}
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: '#64748B' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#006A4E', fontWeight: 600 }}>
          Sign In
        </Link>
      </p>
    </form>
  );
}

export default UserRegistrationForm;
