// ==========================================
// JanaoBangla — User Profile Page
// BRANCH: feature-user-authentication-and-security
// Citizen profile information display and update page
// ==========================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/ApiService';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import UserLogoutButton from '../components/UserLogoutButton';

function UserProfilePage() {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone,    setPhone]    = useState(user?.phone || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg,  setErrorMsg]  = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ==========================================
  // handleUpdateProfile — Profile details backend e update korbe
  // ==========================================
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      return setErrorMsg('Full name cannot be empty.');
    }

    setIsLoading(true);
    try {
      const response = await authApi.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim()
      });

      if (response.data.success) {
        updateUser({
          fullName: response.data.user.fullName,
          phone:    response.data.user.phone
        });
        setSuccessMsg('Profile details updated successfully!');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile. Please try again.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const isVerified = user?.isVerified === 1 || user?.isVerified === true;

  return (
    <main className="page-content" id="profile-page">
      <div className="jb-container" style={{ paddingTop: '48px', paddingBottom: '64px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 className="jb-page-title" style={{ fontSize: '2rem', marginBottom: '4px' }}>
                Account Profile
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                Manage your personal information and account security.
              </p>
            </div>
            <UserLogoutButton />
          </div>

          <SuccessMessage message={successMsg} onDismiss={() => setSuccessMsg('')} />
          <ErrorMessage message={errorMsg} onDismiss={() => setErrorMsg('')} />

          {/* Verification Status Banner */}
          {!isVerified && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', background: '#FFF3E0', border: '1px solid #FFE0B2',
              borderRadius: '12px', marginBottom: '24px', flexWrap: 'wrap', gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#E65100', margin: '0 0 2px' }}>
                    Email Not Verified
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#BF360C', margin: 0 }}>
                    Please verify your email to unlock all citizen features.
                  </p>
                </div>
              </div>
              <Link
                to="/verify-email"
                id="verify-email-banner-btn"
                className="btn-primary-jb"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Verify Now
              </Link>
            </div>
          )}

          {/* Profile Details Card */}
          <div className="jb-card" style={{ padding: '32px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', color: 'var(--color-text-primary)' }}>
              Personal Information
            </h3>

            <form onSubmit={handleUpdateProfile} id="profile-update-form">
              <div style={{ marginBottom: '16px' }}>
                <label className="jb-label" htmlFor="profile-fullname">
                  Full Name
                </label>
                <input
                  id="profile-fullname"
                  type="text"
                  className="jb-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="jb-label" htmlFor="profile-email">
                  Email Address
                </label>
                <input
                  id="profile-email"
                  type="email"
                  className="jb-input"
                  value={user?.email || ''}
                  disabled
                  style={{ background: '#F8FAFC', cursor: 'not-allowed', color: '#64748B' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  Email address cannot be changed.
                </span>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="jb-label" htmlFor="profile-phone">
                  Phone Number
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  className="jb-input"
                  placeholder="+8801700000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  id="save-profile-btn"
                  className="btn-primary-jb"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Links Card */}
          <div className="jb-card" style={{ padding: '24px 32px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--color-text-primary)' }}>
              Security & Preferences
            </h3>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link
                to="/change-password"
                id="profile-change-password-link"
                className="btn-outline-jb"
                style={{ fontSize: '0.9rem' }}
              >
                🔒 Change Password
              </Link>
              <Link
                to="/reports"
                id="profile-my-reports-link"
                className="btn-outline-jb"
                style={{ fontSize: '0.9rem' }}
              >
                📋 My Civic Reports
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

export default UserProfilePage;
