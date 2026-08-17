// ==========================================
// JanaoBangla — Reset Password Page
// BRANCH: feature-user-authentication-and-security
// Sets new password using the URL reset token
// ==========================================

import { useSearchParams, Link } from 'react-router-dom';
import ResetPasswordForm from '../components/ResetPasswordForm';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  return (
    <main className="page-content" id="reset-password-page">
      <div className="jb-container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '56px', height: '56px', background: 'var(--color-primary-light)',
              borderRadius: '14px', display: 'inline-flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--color-primary)', fontSize: '1.75rem',
              marginBottom: '16px'
            }}>
              🔒
            </div>
            <h1 className="jb-page-title" style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
              Set New Password
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              Please enter your new strong password below.
            </p>
          </div>

          <div className="jb-card" style={{ padding: '36px 32px' }}>
            {token ? (
              <ResetPasswordForm token={token} />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#C62828', fontWeight: 600, marginBottom: '16px' }}>
                  No password reset token was provided in the URL.
                </p>
                <Link to="/forgot-password" className="btn-primary-jb">
                  Request New Reset Link
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}

export default ResetPasswordPage;
