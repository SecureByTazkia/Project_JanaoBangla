// ==========================================
// JanaoBangla — User Login Page
// BRANCH: feature-user-authentication-and-security
// Citizen login page wrapper with brand card design
// ==========================================

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserLoginForm from '../components/UserLoginForm';

function UserLoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Already logged in thakle home e redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <main className="page-content" id="login-page">
      <div className="jb-container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          
          {/* Card Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '56px', height: '56px', background: 'var(--color-primary)',
              borderRadius: '14px', display: 'inline-flex', alignItems: 'center',
              justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.75rem',
              marginBottom: '16px'
            }}>
              জ
            </div>
            <h1 className="jb-page-title" style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
              Sign in to JanaoBangla
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              Access your civic dashboard and track community reports.
            </p>
          </div>

          {/* Form Card */}
          <div className="jb-card" style={{ padding: '36px 32px' }}>
            <UserLoginForm />
          </div>

        </div>
      </div>
    </main>
  );
}

export default UserLoginPage;
