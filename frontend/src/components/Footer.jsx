// ==========================================
// JanaoBangla — Footer Component
// BRANCH: main
// Site er niche global footer
// Links, copyright, SOS emergency link
// ==========================================

import { Link } from 'react-router-dom';
import '../styles/footer.css';

// ==========================================
// Footer — Global footer component
// Sob page er niche same footer thakbe
// ==========================================
function Footer() {
  // Ekhon er year dynamically newa hocche copyright er jonno
  const currentYear = new Date().getFullYear();

  return (
    <footer className="jb-footer" role="contentinfo">
      <div className="jb-footer-inner">

        {/* ==========================================
            FOOTER GRID — 4 columns
            Brand | Platform | Company | Emergency
        ========================================== */}
        <div className="jb-footer-grid">

          {/* Brand Column */}
          <div className="jb-footer-brand">
            <div className="jb-footer-logo">
              <div className="jb-footer-logo-icon" aria-hidden="true">জ</div>
              <span className="jb-footer-logo-name">JanaoBangla</span>
            </div>
            <p className="jb-footer-tagline">
              Empowering citizens to report, verify, and track civic problems across Bangladesh.
              Building a better nation — one report at a time.
            </p>
            <div className="jb-footer-badge">
              <span>🇧🇩</span>
              Made for Bangladesh
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="jb-footer-col-title">Platform</h3>
            <nav aria-label="Platform links">
              <ul className="jb-footer-links" role="list">
                <li><Link to="/"          className="jb-footer-link">Home</Link></li>
                <li><Link to="/report"    className="jb-footer-link">Report Problem</Link></li>
                <li><Link to="/community" className="jb-footer-link">Community</Link></li>
                <li><Link to="/map"       className="jb-footer-link">Civic Map</Link></li>
                <li><Link to="/search"    className="jb-footer-link">Search</Link></li>
                <li><Link to="/analytics" className="jb-footer-link">Analytics</Link></li>
              </ul>
            </nav>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="jb-footer-col-title">Company</h3>
            <nav aria-label="Company links">
              <ul className="jb-footer-links" role="list">
                <li><Link to="/about"   className="jb-footer-link">About</Link></li>
                <li><Link to="/privacy" className="jb-footer-link">Privacy Policy</Link></li>
                <li><Link to="/terms"   className="jb-footer-link">Terms of Service</Link></li>
                <li><Link to="/contact" className="jb-footer-link">Contact</Link></li>
              </ul>
            </nav>
          </div>

          {/* Emergency Section */}
          <div>
            <h3 className="jb-footer-col-title">Emergency Help</h3>
            <ul className="jb-footer-links" role="list">
              <li>
                <Link to="/sos" className="jb-footer-link">
                  🆘 SOS Emergency
                </Link>
              </li>
              <li>
                <a href="tel:999" className="jb-footer-link">
                  📞 National Emergency: 999
                </a>
              </li>
              <li>
                <a href="tel:16516" className="jb-footer-link">
                  👮 Police: 999
                </a>
              </li>
              <li>
                <a href="tel:16430" className="jb-footer-link">
                  🔥 Fire Service: 16430
                </a>
              </li>
            </ul>
            {/* SOS button in footer — always red, always accessible */}
            <Link
              to="/sos"
              className="jb-footer-sos"
              aria-label="Activate SOS Emergency"
            >
              🆘 SOS EMERGENCY
            </Link>
          </div>

        </div>

        {/* ==========================================
            FOOTER BOTTOM — Copyright bar
        ========================================== */}
        <div className="jb-footer-bottom">
          <p className="jb-footer-copyright">
            © {currentYear} JanaoBangla. All rights reserved.
            "Report Today. Build a Better Bangladesh."
          </p>
          <nav aria-label="Legal links">
            <ul className="jb-footer-bottom-links" role="list">
              <li><Link to="/privacy" className="jb-footer-bottom-link">Privacy</Link></li>
              <li><Link to="/terms"   className="jb-footer-bottom-link">Terms</Link></li>
              <li><Link to="/contact" className="jb-footer-bottom-link">Contact</Link></li>
            </ul>
          </nav>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
