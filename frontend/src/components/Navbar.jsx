// ==========================================
// JanaoBangla — Navbar Component
// BRANCH: main
// Global navigation bar — sob page e same navbar thakbe
// Logo left, links center, SOS button right
// ==========================================

import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import '../styles/navbar.css';

// ==========================================
// Navbar — Main navigation component
// scrolled state diye shadow add kora hobe
// mobileOpen state diye mobile menu toggle hobe
// ==========================================
function Navbar() {
  // Mobile menu open/close track kora hocche
  const [mobileOpen, setMobileOpen]  = useState(false);
  // Scroll position track kore shadow add korar jonno
  const [scrolled,   setScrolled]    = useState(false);

  // ==========================================
  // useEffect — Scroll position monitor korbe
  // Window scroll hoile scrolled state update hobe
  // ==========================================
  useEffect(() => {
    // Scroll event handler define kora hocche
    const handleScroll = () => {
      // 20px er beshi scroll hoile scrolled = true
      setScrolled(window.scrollY > 20);
    };

    // Event listener add kora hocche
    window.addEventListener('scroll', handleScroll);

    // Component unmount hoile event listener remove kora hocche
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ==========================================
  // toggleMobileMenu — Hamburger button click e
  // Mobile menu open/close toggle hobe
  // ==========================================
  const toggleMobileMenu = () => {
    // Previous state er opposite value set kora hocche
    setMobileOpen((prev) => !prev);
  };

  // ==========================================
  // closeMobileMenu — Mobile link click e
  // Menu automatically close hobe
  // ==========================================
  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  // Sob navigation links er definition — ek jaigay rakhchi
  const navLinks = [
    { to: '/',          label: 'Home',          icon: '🏠' },
    { to: '/report',    label: 'Report Problem', icon: '📋' },
    { to: '/community', label: 'Community',      icon: '👥' },
    { to: '/map',       label: 'Map',            icon: '🗺️' },
    { to: '/search',    label: 'Search',         icon: '🔍' },
    { to: '/analytics', label: 'Analytics',      icon: '📊' }
  ];

  return (
    <>
      {/* ==========================================
          MAIN NAVBAR
          scrolled class diye shadow add hobe
      ========================================== */}
      <nav className={`jb-navbar ${scrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="jb-navbar-inner">

          {/* ==========================================
              LOGO — Left side
              JanaoBangla brand
          ========================================== */}
          <Link to="/" className="jb-navbar-logo" aria-label="JanaoBangla Home">
            <div className="jb-navbar-logo-icon" aria-hidden="true">জ</div>
            <span className="jb-navbar-logo-text">
              Janao<span>Bangla</span>
            </span>
          </Link>

          {/* ==========================================
              DESKTOP NAV LINKS — Center
              Mobile e hidden thakbe
          ========================================== */}
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

          {/* ==========================================
              NAVBAR ACTIONS — Right side
              SOS button + future profile/notifications
          ========================================== */}
          <div className="jb-navbar-actions">
            {/* SOS Emergency Button — Har phone e visible thakbe */}
            <Link
              to="/sos"
              className="jb-sos-button"
              aria-label="SOS Emergency Button"
              id="navbar-sos-button"
            >
              <span aria-hidden="true">🆘</span>
              <span className="sos-label">SOS</span>
            </Link>

            {/* ==========================================
                HAMBURGER BUTTON — Mobile only
                jb-hamburger class er display none thakbe desktop e
            ========================================== */}
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

      {/* ==========================================
          MOBILE MENU OVERLAY
          mobileOpen true hoile slide in hobe
      ========================================== */}
      <div
        className={`jb-mobile-menu ${mobileOpen ? 'open' : ''}`}
        id="mobile-nav-menu"
        aria-hidden={!mobileOpen}
      >
        {/* Mobile navigation links */}
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
