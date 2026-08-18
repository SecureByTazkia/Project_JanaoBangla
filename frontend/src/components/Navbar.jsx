// ==========================================
// JanaoBangla — Navbar Component
// BRANCH: feature-user-authentication-and-security
// Global navigation bar with Authentication state support
// Logo left, links center, Profile/Auth + SOS right
// ==========================================

import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);

  // ==========================================
  // useEffect — Scroll position monitor kore shadow toggle korbe
  // ==========================================
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const navLinks = [
    { to: '/',               label: 'Home',           icon: '🏠' },
    { to: '/report-problem', label: 'Report Problem', icon: '📋' },
    { to: '/my-reports',     label: 'My Reports',     icon: '📂' },
    { to: '/community',      label: 'Community',      icon: '👥' },
    { to: '/map',            label: 'Map',            icon: '🗺️' },
    { to: '/search',         label: 'Search',         icon: '🔍' },
    { to: '/analytics',      label: 'Analytics',      icon: '📊' }
  ];

  return (
    <>
      <nav className={`jb-navbar ${scrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="jb-navbar-inner">

          {/* Logo — Left */}
          <Link to="/" className="jb-navbar-logo" aria-label="JanaoBangla Home">
            <div className="jb-navbar-logo-icon" aria-hidden="true">জ</div>
            <span className="jb-navbar-logo-text">
              Janao<span>Bangla</span>
            </span>
          </Link>

          {/* Nav Links — Center (Desktop) */}
          <ul className="jb-navbar-links" role="list">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `jb-navbar-link ${isActive ? 'active' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Actions — Right */}
          <div className="jb-navbar-actions">
            {/* SOS Emergency Button */}
            <Link
              to="/sos"
              className="jb-sos-button"
              aria-label="SOS Emergency Button"
              id="navbar-sos-button"
            >
              <span aria-hidden="true">🆘</span>
              <span className="sos-label">SOS</span>
            </Link>

            {/* Authentication Buttons (Desktop) */}
            <div className="d-none d-lg-flex align-items-center gap-2">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      id="navbar-admin-btn"
                      className="btn-primary-jb"
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        backgroundColor: '#004D3A',
                        borderColor: '#004D3A',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      🛡️ Admin Panel
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    id="navbar-profile-btn"
                    className="btn-outline-jb"
                    style={{ padding: '6px 14px', fontSize: '0.85rem', textDecoration: 'none' }}
                  >
                    👤 {user?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'Profile'}
                  </Link>
                  <button
                    type="button"
                    id="navbar-logout-btn"
                    onClick={logout}
                    className="btn-outline-jb"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    title="Logout"
                  >
                    🚪
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/admin/login"
                    id="navbar-admin-login-btn"
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      padding: '6px 8px'
                    }}
                    title="Admin Portal"
                  >
                    🛡️ Admin
                  </Link>
                  <Link
                    to="/login"
                    id="navbar-login-btn"
                    style={{
                      color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem',
                      textDecoration: 'none', padding: '6px 12px'
                    }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    id="navbar-register-btn"
                    className="btn-primary-jb"
                    style={{ padding: '6px 16px', fontSize: '0.85rem', textDecoration: 'none' }}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Hamburger Button (Mobile) */}
            <button
              className="jb-hamburger"
              onClick={toggleMobileMenu}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-menu"
            >
              <span className="jb-hamburger-line"></span>
              <span className="jb-hamburger-line"></span>
              <span className="jb-hamburger-line"></span>
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`jb-mobile-menu ${mobileOpen ? 'open' : ''}`}
        id="mobile-nav-menu"
        aria-hidden={!mobileOpen}
      >
        <nav className="jb-mobile-links" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `jb-mobile-link ${isActive ? 'active' : ''}`
              }
              onClick={closeMobileMenu}
            >
              <span aria-hidden="true">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}

          {/* Mobile Auth Links */}
          <div style={{ padding: '12px 0', borderTop: '1px solid #E2E8F0', marginTop: '12px' }}>
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className="jb-mobile-link"
                    onClick={closeMobileMenu}
                    style={{ color: 'var(--color-primary)', fontWeight: 700 }}
                  >
                    <span aria-hidden="true">🛡️</span>
                    Admin Panel
                  </NavLink>
                )}
                <NavLink
                  to="/profile"
                  className="jb-mobile-link"
                  onClick={closeMobileMenu}
                >
                  <span aria-hidden="true">👤</span>
                  My Profile ({user?.fullName || user?.name})
                </NavLink>
                <button
                  type="button"
                  onClick={() => { closeMobileMenu(); logout(); }}
                  className="jb-mobile-link"
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', color: '#C62828' }}
                >
                  <span aria-hidden="true">🚪</span>
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="jb-mobile-link"
                  onClick={closeMobileMenu}
                >
                  <span aria-hidden="true">🔑</span>
                  Sign In
                </NavLink>
                <NavLink
                  to="/register"
                  className="jb-mobile-link"
                  onClick={closeMobileMenu}
                  style={{ color: 'var(--color-primary)', fontWeight: 700 }}
                >
                  <span aria-hidden="true">📝</span>
                  Create Free Account
                </NavLink>
                <NavLink
                  to="/admin/login"
                  className="jb-mobile-link"
                  onClick={closeMobileMenu}
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span aria-hidden="true">🛡️</span>
                  Admin Portal Login
                </NavLink>
              </>
            )}
          </div>
        </nav>

        {/* Mobile SOS button */}
        <Link
          to="/sos"
          className="btn-sos"
          style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
          onClick={closeMobileMenu}
          aria-label="SOS Emergency"
        >
          🆘 SOS EMERGENCY
        </Link>
      </div>
    </>
  );
}

export default Navbar;
