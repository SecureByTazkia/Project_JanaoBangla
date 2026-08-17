// ==========================================
// JanaoBangla — Email Verification Page
// BRANCH: feature-user-authentication-and-security
// Citizen email OTP verification screen
// Public route — 2-step registration flow e unverified user o ashte parbe
// ==========================================

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EmailVerificationForm from '../components/EmailVerificationForm';

function EmailVerificationPage() {
  const { isAuthenticated, isVerified, isLoading } = useAuth();
  const navigate = useNavigate();

  // Pending email sessionStorage e ache kina check kora hocche
  const pendingEmail = sessionStorage.getItem('jb_pending_email');

  useEffect(() => {
    if (isLoading) return; // Auth init hoa porjonto wait korbo

    // Already verified user hole profile e redirect
    if (isVerified) {
      navigate('/profile', { replace: true });
      return;
    }

    // Valid access: either (a) pending registration email in sessionStorage,
    // OR (b) logged-in user who hasn't verified yet (e.g., came from profile/login)
    const hasValidAccess = pendingEmail || (isAuthenticated && !isVerified);

    if (!hasValidAccess) {
      // Kono valid path nei — register e pathano hocche
      navigate('/register', { replace: true });
    }
  }, [isVerified, isAuthenticated, isLoading, pendingEmail, navigate]);

  const handleSuccess = () => {
    navigate('/profile', { replace: true });
  };

  return (
    <main className="page-content" id="email-verification-page">
      <div className="jb-container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '56px', height: '56px', background: 'var(--color-primary-light)',
              borderRadius: '14px', display: 'inline-flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--color-primary)', fontSize: '1.75rem',
              marginBottom: '16px'
            }}>
              ✉️
            </div>
            <h1 className="jb-page-title" style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
              Verify Your Email
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              We sent a 6-digit verification code to your email inbox.
            </p>
          </div>

          <div className="jb-card" style={{ padding: '36px 32px' }}>
            <EmailVerificationForm onSuccess={handleSuccess} />
          </div>

        </div>
      </div>
    </main>
  );
}

export default EmailVerificationPage;
