// ==========================================
// JanaoBangla — User Registration Page
// BRANCH: feature-user-authentication-and-security
// Citizen registration page wrapper
// ==========================================

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserRegistrationForm from '../components/UserRegistrationForm';

function UserRegistrationPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Already logged in thakle home e pathabe
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <main className="page-content" id="registration-page">
      <div className="jb-container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>

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
              Create Your Account
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              Join citizens across Bangladesh to report and resolve civic problems.
            </p>
          </div>

          <div className="jb-card" style={{ padding: '36px 32px' }}>
            <UserRegistrationForm />
          </div>

        </div>
      </div>
    </main>
  );
}

export default UserRegistrationPage;
