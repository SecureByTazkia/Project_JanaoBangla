// ==========================================
// JanaoBangla — User Logout Button Component
// BRANCH: feature-user-authentication-and-security
// Reusable logout button jeta session clean kore
// ==========================================

import { useAuth } from '../context/AuthContext';

function UserLogoutButton({ className = '', style = {}, children }) {
  const { logout } = useAuth();

  // ==========================================
  // handleLogout — Click korle auth session clear kore redirect korbe
  // ==========================================
  const handleLogout = () => {
    logout();
  };

  return (
    <button
      type="button"
      id="user-logout-button"
      onClick={handleLogout}
      className={className || 'btn-outline-jb'}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:            '8px',
        cursor:         'pointer',
        ...style
      }}
      aria-label="Log out of JanaoBangla"
    >
      {children || (
        <>
          <span>🚪</span>
          <span>Logout</span>
        </>
      )}
    </button>
  );
}

export default UserLogoutButton;
