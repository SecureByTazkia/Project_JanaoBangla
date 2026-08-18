// ==========================================
// JanaoBangla — Admin Login Page
// BRANCH: feature-admin-dashboard-and-system-monitoring
// Dedicated Admin Login screen — Role-based access verification
// User admin na hole error message dekhabe ebong access deny korbe
// ==========================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/ApiService';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

function AdminLoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Input fields change handle korar function
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  // Admin login form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please provide both admin email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(formData);
      if (response.data.success) {
        const { user, token } = response.data;

        // Strictly check if the user is an admin
        if (user.role !== 'admin') {
          setError('Access Denied: You do not have administrator permissions to access this portal.');
          setIsLoading(false);
          return;
        }

        // Login context e update kora hocche
        login(token, user);

        // Direct navigate to /admin dashboard
        navigate('/admin', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your admin credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page-content" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div className="jb-card" style={{ maxWidth: '440px', width: '100%', padding: '36px 32px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🛡️</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', margin: '0 0 6px 0' }}>
            JanaoBangla Admin Portal
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Secure login for platform administrators & moderators
          </p>
        </div>

        {error && <ErrorMessage message={error} style={{ marginBottom: '20px' }} />}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label" htmlFor="admin-email" style={{ fontWeight: 600, fontSize: '0.88rem', display: 'block', marginBottom: '6px' }}>
              Admin Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              name="email"
              className="form-control"
              placeholder="admin@janaobangla.gov.bd"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-border)' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="admin-password" style={{ fontWeight: 600, fontSize: '0.88rem', display: 'block', marginBottom: '6px' }}>
              Admin Password
            </label>
            <input
              id="admin-password"
              type="password"
              name="password"
              className="form-control"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-border)' }}
            />
          </div>

          <button
            type="submit"
            className="jb-btn jb-btn-primary"
            style={{ width: '100%', padding: '12px', fontWeight: 600, fontSize: '0.95rem' }}
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner size="small" /> : '🛡️ Access Admin Dashboard'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Citizen user? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Standard Citizen Login</Link>
        </div>
      </div>
    </main>
  );
}

export default AdminLoginPage;
