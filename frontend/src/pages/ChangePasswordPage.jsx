// ==========================================
// JanaoBangla — Change Password Page
// BRANCH: feature-user-authentication-and-security
// Authenticated user password update screen
// ==========================================

import { Link } from 'react-router-dom';
import ChangePasswordForm from '../components/ChangePasswordForm';

function ChangePasswordPage() {
  return (
    <main className="page-content" id="change-password-page">
      <div className="jb-container" style={{ paddingTop: '48px', paddingBottom: '64px' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>

          <div style={{ marginBottom: '24px' }}>
            <Link
              to="/profile"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none'
              }}
            >
              ← Back to Profile
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '56px', height: '56px', background: 'var(--color-primary-light)',
              borderRadius: '14px', display: 'inline-flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--color-primary)', fontSize: '1.75rem',
              marginBottom: '16px'
            }}>
              🔐
            </div>
            <h1 className="jb-page-title" style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
              Change Password
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              Update your account password for enhanced security.
            </p>
          </div>

          <div className="jb-card" style={{ padding: '36px 32px' }}>
            <ChangePasswordForm />
          </div>

        </div>
      </div>
    </main>
  );
}

export default ChangePasswordPage;
