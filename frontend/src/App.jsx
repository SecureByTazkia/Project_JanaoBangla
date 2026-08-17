// ==========================================
// JanaoBangla — App Root Component
// BRANCH: main
// React Router setup ar global layout define kora hocche
// Navbar + content + Footer — sob page e same structure
// ==========================================

import { Routes, Route } from 'react-router-dom';

// Layout components import kora hocche
import Navbar  from './components/Navbar';
import Footer  from './components/Footer';

// Pages import kora hocche
import HomePage from './pages/HomePage';

// ==========================================
// PLACEHOLDER PAGE COMPONENT
// Phase 2+ e real page gulo replace korbe ei placeholder ke
// ==========================================
function ComingSoonPage({ title }) {
  return (
    <div style={{
      display:         'flex',
      flexDirection:   'column',
      alignItems:      'center',
      justifyContent:  'center',
      minHeight:       '60vh',
      padding:         '40px 20px',
      textAlign:       'center'
    }}>
      {/* Ekhane future feature er placeholder */}
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚧</div>
      <h1 style={{
        fontSize:     '1.5rem',
        fontWeight:   700,
        color:        '#1F2937',
        marginBottom: '8px'
      }}>
        {title} — Coming Soon
      </h1>
      <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
        This feature is being built in the next development phase.
      </p>
    </div>
  );
}

// ==========================================
// App — Root component
// BrowserRouter er moddhe thakbe (main.jsx e define)
// Sob route ekhane define kora hocche
// ==========================================
function App() {
  return (
    // Page wrapper — navbar + content + footer flex column layout
    <div className="page-wrapper">

      {/* Global Navbar — sob page e dekhabe */}
      <Navbar />

      {/* ==========================================
          ROUTES — Kono URL e ki page dekhabe
          Phase onujayi phase e route jog hobe
      ========================================== */}
      <Routes>
        {/* Phase 1 — Main branch routes */}
        <Route path="/"          element={<HomePage />} />

        {/* Phase 2 — Authentication (coming) */}
        <Route path="/login"     element={<ComingSoonPage title="Login" />} />
        <Route path="/register"  element={<ComingSoonPage title="Register" />} />
        <Route path="/profile"   element={<ComingSoonPage title="Profile" />} />

        {/* Phase 3 — Reports (coming) */}
        <Route path="/report"    element={<ComingSoonPage title="Report a Problem" />} />
        <Route path="/reports"   element={<ComingSoonPage title="My Reports" />} />

        {/* Phase 4 — Map (coming) */}
        <Route path="/map"       element={<ComingSoonPage title="Civic Map" />} />

        {/* Phase 5 — Community (coming) */}
        <Route path="/community" element={<ComingSoonPage title="Community Feed" />} />

        {/* Phase 7 — SOS (coming) */}
        <Route path="/sos"       element={<ComingSoonPage title="SOS Emergency" />} />

        {/* Phase 8 — Admin (coming) */}
        <Route path="/admin"     element={<ComingSoonPage title="Admin Dashboard" />} />

        {/* Phase 9 — Search & Analytics (coming) */}
        <Route path="/search"    element={<ComingSoonPage title="Search" />} />
        <Route path="/analytics" element={<ComingSoonPage title="Analytics" />} />

        {/* Static pages */}
        <Route path="/about"     element={<ComingSoonPage title="About" />} />
        <Route path="/privacy"   element={<ComingSoonPage title="Privacy Policy" />} />
        <Route path="/terms"     element={<ComingSoonPage title="Terms of Service" />} />
        <Route path="/contact"   element={<ComingSoonPage title="Contact" />} />

        {/* 404 — Kono route match na korle */}
        <Route path="*"          element={
          <ComingSoonPage title="404 — Page Not Found" />
        } />
      </Routes>

      {/* Global Footer — sob page e dekhabe */}
      <Footer />

    </div>
  );
}

export default App;
