// ==========================================
// JanaoBangla — Forgot Password Page
// BRANCH: feature-user-authentication-and-security
// Password recovery initiation page
// ==========================================

import ForgotPasswordForm from '../components/ForgotPasswordForm';

function ForgotPasswordPage() {
  return (
    <main className="page-content" id="forgot-password-page">
      <div className="jb-container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '56px', height: '56px', background: '#FFF3E0',
              borderRadius: '14px', display: 'inline-flex', alignItems: 'center',
              justifyContent: 'center', color: '#E65100', fontSize: '1.75rem',
              marginBottom: '16px'
            }}>
              🔑
            </div>
            <h1 className="jb-page-title" style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
              Reset Your Password
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              Recover access to your JanaoBangla account.
            </p>
          </div>

          <div className="jb-card" style={{ padding: '36px 32px' }}>
            <ForgotPasswordForm />
          </div>

        </div>
      </div>
    </main>
  );
}

export default ForgotPasswordPage;
