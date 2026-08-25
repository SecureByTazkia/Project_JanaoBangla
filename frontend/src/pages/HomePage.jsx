// ==========================================
// JanaoBangla — Homepage
// BRANCH: main
// Ei page ta site er main landing page
// Hero, features, workflow, stats section thakbe
// ==========================================

import { Link }     from 'react-router-dom';
import { useState, useEffect } from 'react';
import { healthApi }           from '../services/ApiService';

// ==========================================
// Feature card data — Homepage e feature cards dekhabe
// Sob feature card er content ekhane define kora hocche
// ==========================================
const FEATURES = [
  {
    icon:  '📋',
    title: 'Civic Problem Reporting',
    desc:  'Report road damage, garbage, street lights, drainage, and public safety issues with full details.',
    color: '#E8F5F0'
  },
  {
    icon:  '📸',
    title: 'Evidence-Based Reporting',
    desc:  'Upload photos and videos as proof. Make your civic reports credible and undeniable.',
    color: '#E3F2FD'
  },
  {
    icon:  '✅',
    title: 'Community Verification',
    desc:  'Fellow citizens confirm real problems. Reports gain trust through community consensus.',
    color: '#F3E5F5'
  },
  {
    icon:  '🗺️',
    title: 'Location Mapping',
    desc:  'Pin-point civic problems on an interactive map. See what is happening in your area.',
    color: '#E8EAF6'
  },
  {
    icon:  '🔍',
    title: 'Duplicate Detection',
    desc:  'Smart similarity detection prevents duplicate reports and keeps the system clean.',
    color: '#FFF8E1'
  },
  {
    icon:  '🤖',
    title: 'AI Assistance',
    desc:  'AI recognizes problems from photos and suggests the right category, title, and description.',
    color: '#E0F7FA'
  },
  {
    icon:  '🆘',
    title: 'Women Safety SOS',
    desc:  'One-tap emergency alert. Instantly notifies your contacts with your GPS location.',
    color: '#FFEBEE',
    isEmergency: true
  },
  {
    icon:  '📊',
    title: 'Civic Analytics',
    desc:  'Data-driven insights on civic problems across Bangladesh. Track trends and progress.',
    color: '#E8F5E9'
  }
];

// ==========================================
// Main workflow steps — Report theke Resolve paryanto
// ========================================
const WORKFLOW = [
  { step: '01', icon: '📋', label: 'Report',  desc: 'Submit civic problem with evidence' },
  { step: '02', icon: '✅', label: 'Verify',  desc: 'Community confirms the problem' },
  { step: '03', icon: '📡', label: 'Track',   desc: 'Monitor status in real time'       },
  { step: '04', icon: '🏆', label: 'Resolve', desc: 'Problem gets fixed and marked solved' }
];

// ==========================================
// Homepage — Main landing page component
// API health check kore server status dekhabe hero e
// ==========================================
function HomePage() {
  // Server connection status track kora hocche
  const [serverStatus, setServerStatus] = useState('checking');

  // ==========================================
  // useEffect — Component load hoile health check korbe
  // Backend server chalu ache ki na bojha jabe
  // ==========================================
  useEffect(() => {
    // Health API call kora hocche
    const checkServerHealth = async () => {
      try {
        await healthApi.checkHealth();
        // Server respond korle 'online' set kora hocche
        setServerStatus('online');
      } catch {
        // Error hoile 'offline' set kora hocche
        setServerStatus('offline');
      }
    };

    checkServerHealth();
  }, []);

  return (
    <main className="page-content" id="main-content">

      {/* ==========================================
          HERO SECTION
          Main headline, buttons, server status
      ========================================== */}
      <section
        className="hero-section"
        aria-label="Hero section"
        style={{
          background:   'linear-gradient(135deg, #006A4E 0%, #004D3A 100%)',
          color:        'white',
          padding:      '80px 16px',
          textAlign:    'center',
          position:     'relative',
          overflow:     'hidden'
        }}
      >
        {/* Background decorative circles */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.04)',
          pointerEvents: 'none'
        }}/>
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: '-80px', left: '-80px',
          width: '300px', height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.04)',
          pointerEvents: 'none'
        }}/>

        <div className="jb-container" style={{ position: 'relative', zIndex: 1 }}>

          {/* Server status badge */}
          <div style={{ marginBottom: '24px' }}>
            <span style={{
              display:       'inline-flex',
              alignItems:    'center',
              gap:           '8px',
              padding:       '6px 16px',
              background:    serverStatus === 'online'
                               ? 'rgba(76, 175, 80, 0.2)'
                               : serverStatus === 'offline'
                                 ? 'rgba(255, 23, 68, 0.2)'
                                 : 'rgba(255, 255, 255, 0.15)',
              border:        '1px solid rgba(255,255,255,0.2)',
              borderRadius:  '9999px',
              fontSize:      '0.8rem',
              fontWeight:    500,
              color:         'rgba(255,255,255,0.9)'
            }}>
              <span style={{
                width: '7px', height: '7px',
                borderRadius: '50%',
                background: serverStatus === 'online' ? '#4CAF50'
                          : serverStatus === 'offline' ? '#FF1744'
                          : '#FFB300',
                display: 'inline-block'
              }}/>
              {serverStatus === 'online'   ? '🟢 System Online — Bangladesh Civic Platform'  :
               serverStatus === 'offline'  ? '🔴 Server Offline — Check backend is running'  :
                                             '🟡 Checking system status...'}
            </span>
          </div>

          {/* Main Headline */}
          <h1
            className="hero-title"
            style={{
              fontSize:     '3.5rem',
              fontWeight:   800,
              lineHeight:   1.15,
              marginBottom: '20px',
              letterSpacing: '-0.5px'
            }}
          >
            Report Today.
            <br />
            <span style={{ color: '#81C784' }}>Build a Better Bangladesh.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="hero-subtitle"
            style={{
              fontSize:    '1.2rem',
              lineHeight:  1.7,
              opacity:     0.85,
              maxWidth:    '680px',
              margin:      '0 auto 36px',
              fontWeight:  400
            }}
          >
            JanaoBangla empowers citizens to report civic problems, verify with evidence,
            track resolutions, and hold authorities accountable — all in one platform.
          </p>

          {/* CTA Buttons */}
          <div
            className="hero-buttons"
            style={{
              display:    'flex',
              gap:        '16px',
              justifyContent: 'center',
              flexWrap:   'wrap',
              marginBottom: '40px'
            }}
          >
            <Link
              to="/report-problem"
              id="hero-report-btn"
              style={{
                display:       'inline-flex',
                alignItems:    'center',
                gap:           '8px',
                padding:       '14px 32px',
                background:    'white',
                color:         '#006A4E',
                borderRadius:  '10px',
                fontWeight:    700,
                fontSize:      '1rem',
                textDecoration:'none',
                transition:    'all 0.2s ease',
                boxShadow:     '0 4px 20px rgba(0,0,0,0.15)'
              }}
            >
              📋 Report an Issue
            </Link>
            <Link
              to="/map"
              id="hero-map-btn"
              style={{
                display:       'inline-flex',
                alignItems:    'center',
                gap:           '8px',
                padding:       '14px 32px',
                background:    'transparent',
                color:         'white',
                border:        '2px solid rgba(255,255,255,0.6)',
                borderRadius:  '10px',
                fontWeight:    600,
                fontSize:      '1rem',
                textDecoration: 'none',
                transition:    'all 0.2s ease'
              }}
            >
              🗺️ Explore Civic Map
            </Link>
          </div>

          {/* SOS Emergency CTA */}
          <Link
            to="/sos"
            id="hero-sos-btn"
            style={{
              display:       'inline-flex',
              alignItems:    'center',
              gap:           '8px',
              padding:       '12px 28px',
              background:    '#FF1744',
              color:         'white',
              borderRadius:  '10px',
              fontWeight:    700,
              fontSize:      '0.95rem',
              textDecoration: 'none',
              boxShadow:     '0 4px 20px rgba(255, 23, 68, 0.4)',
              letterSpacing: '0.3px'
            }}
          >
            🆘 SOS EMERGENCY — Women Safety
          </Link>

        </div>
      </section>

      {/* ==========================================
          STATISTICS STRIP
          Platform er key numbers
      ========================================== */}
      <section aria-label="Platform statistics" style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div className="jb-container">
          <div
            className="stats-grid"
            style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap:                 '0',
              padding:             '0'
            }}
          >
            {[
              { value: '10+',  label: 'Civic Categories',   icon: '📂' },
              { value: '6',    label: 'Problem Types',       icon: '🔖' },
              { value: '64',   label: 'Districts Covered',   icon: '🗺️' },
              { value: '100%', label: 'Open Source',         icon: '💚' }
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  textAlign:   'center',
                  padding:     '28px 16px',
                  borderRight: i < 3 ? '1px solid #E2E8F0' : 'none'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{stat.icon}</div>
                <div style={{
                  fontSize:    '2rem',
                  fontWeight:  800,
                  color:       '#006A4E',
                  lineHeight:  1
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize:  '0.8rem',
                  color:     '#64748B',
                  marginTop: '4px',
                  fontWeight: 500
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          FEATURES SECTION
          8 feature cards grid
      ========================================== */}
      <section
        className="jb-section"
        aria-label="Platform features"
        style={{ background: '#F4F5F9' }}
      >
        <div className="jb-container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className="jb-section-title">
              Everything You Need to Make Change Happen
            </h2>
            <p className="jb-section-subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
              JanaoBangla provides all the tools citizens need to report, verify, and resolve
              civic problems across Bangladesh.
            </p>
          </div>

          {/* Features grid — 4 columns desktop, 2 tablet, 1 mobile */}
          <div
            className="features-grid"
            style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap:                 '20px'
            }}
          >
            {FEATURES.map((feature, index) => (
              <article
                key={index}
                className="jb-card"
                style={{
                  background:   feature.isEmergency ? '#FFF5F5' : 'white',
                  border:       feature.isEmergency ? '1px solid #FFCDD2' : '1px solid #E2E8F0',
                  textAlign:    'center',
                  padding:      '28px 20px'
                }}
              >
                {/* Feature icon circle */}
                <div style={{
                  width:           '56px',
                  height:          '56px',
                  background:      feature.color,
                  borderRadius:    '14px',
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  fontSize:        '1.5rem',
                  margin:          '0 auto 16px'
                }}>
                  {feature.icon}
                </div>

                {/* Feature title */}
                <h3 style={{
                  fontSize:     '0.9rem',
                  fontWeight:   700,
                  color:        feature.isEmergency ? '#C62828' : '#1F2937',
                  marginBottom: '8px'
                }}>
                  {feature.title}
                </h3>

                {/* Feature description */}
                <p style={{
                  fontSize:   '0.8rem',
                  color:      '#64748B',
                  lineHeight: 1.6,
                  margin:     0
                }}>
                  {feature.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          WORKFLOW SECTION
          Report → Verify → Track → Resolve
      ========================================== */}
      <section
        className="jb-section"
        aria-label="How it works"
        style={{ background: 'white' }}
      >
        <div className="jb-container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className="jb-section-title">How JanaoBangla Works</h2>
            <p className="jb-section-subtitle" style={{ maxWidth: '500px', margin: '0 auto' }}>
              From a single citizen's report to a resolved civic problem — four simple steps.
            </p>
          </div>

          {/* Workflow steps */}
          <div
            className="workflow-steps"
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        '0',
              justifyContent: 'center',
              flexWrap:   'wrap'
            }}
          >
            {WORKFLOW.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                {/* Step card */}
                <div style={{ textAlign: 'center', padding: '0 24px' }}>
                  {/* Step number */}
                  <div style={{
                    fontSize:     '0.7rem',
                    fontWeight:   700,
                    color:        '#006A4E',
                    letterSpacing: '1px',
                    marginBottom: '8px',
                    textTransform: 'uppercase'
                  }}>
                    Step {item.step}
                  </div>

                  {/* Icon circle */}
                  <div style={{
                    width:           '72px',
                    height:          '72px',
                    background:      'linear-gradient(135deg, #006A4E, #004D3A)',
                    borderRadius:    '50%',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    fontSize:        '1.75rem',
                    margin:          '0 auto 14px',
                    boxShadow:       '0 4px 15px rgba(0, 106, 78, 0.25)'
                  }}>
                    {item.icon}
                  </div>

                  {/* Label */}
                  <div style={{
                    fontSize:     '1rem',
                    fontWeight:   700,
                    color:        '#1F2937',
                    marginBottom: '6px'
                  }}>
                    {item.label}
                  </div>

                  {/* Description */}
                  <div style={{
                    fontSize:  '0.8rem',
                    color:     '#64748B',
                    maxWidth:  '140px',
                    lineHeight: 1.5
                  }}>
                    {item.desc}
                  </div>
                </div>

                {/* Arrow connector — shes step e dekhabe na */}
                {i < WORKFLOW.length - 1 && (
                  <div
                    className="workflow-arrow"
                    aria-hidden="true"
                    style={{
                      fontSize:  '1.5rem',
                      color:     '#CBD5E0',
                      flexShrink: 0
                    }}
                  >
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          SOS EMERGENCY CTA SECTION
          Women safety feature highlight
      ========================================== */}
      <section
        aria-label="SOS Emergency feature"
        style={{
          background:   'linear-gradient(135deg, #B71C1C 0%, #D50032 100%)',
          color:        'white',
          padding:      '60px 16px',
          textAlign:    'center'
        }}
      >
        <div className="jb-container">
          <div style={{ fontSize: '3rem', marginBottom: '16px' }} aria-hidden="true">🆘</div>
          <h2 style={{
            fontSize:     '2rem',
            fontWeight:   800,
            marginBottom: '12px'
          }}>
            Women Safety SOS
          </h2>
          <p style={{
            fontSize:    '1.1rem',
            opacity:     0.9,
            maxWidth:    '500px',
            margin:      '0 auto 32px',
            lineHeight:  1.7
          }}>
            One tap. Instant alert. Your emergency contacts are notified with your
            GPS location via SMS and email — simultaneously.
          </p>
          <Link
            to="/sos"
            id="home-sos-cta-btn"
            style={{
              display:       'inline-flex',
              alignItems:    'center',
              gap:           '10px',
              padding:       '16px 40px',
              background:    'white',
              color:         '#B71C1C',
              borderRadius:  '10px',
              fontWeight:    800,
              fontSize:      '1.1rem',
              textDecoration: 'none',
              boxShadow:     '0 4px 20px rgba(0,0,0,0.2)',
              letterSpacing: '0.5px'
            }}
          >
            🆘 ACTIVATE SOS EMERGENCY
          </Link>
        </div>
      </section>

      {/* ==========================================
          PROBLEM CATEGORIES SECTION
          6 civic problem categories preview
      ========================================== */}
      <section
        className="jb-section"
        aria-label="Civic problem categories"
        style={{ background: '#F4F5F9' }}
      >
        <div className="jb-container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 className="jb-section-title">Report These Civic Problems</h2>
            <p className="jb-section-subtitle" style={{ maxWidth: '500px', margin: '0 auto' }}>
              Six major civic categories — covering the most common infrastructure and safety issues.
            </p>
          </div>

          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap:                 '16px'
          }}>
            {[
              { icon: '🛣️',  label: 'Road Damage',        color: '#E3F2FD', dot: '#1565C0' },
              { icon: '🗑️',  label: 'Garbage / Waste',    color: '#FFF3E0', dot: '#E65100' },
              { icon: '💡',  label: 'Street Light',       color: '#FFFDE7', dot: '#F57F17' },
              { icon: '💧',  label: 'Water / Drainage',   color: '#E0F7FA', dot: '#006064' },
              { icon: '🚦',  label: 'Traffic / Accident', color: '#FCE4EC', dot: '#880E4F' },
              { icon: '🛡️',  label: 'Public Safety',      color: '#E8EAF6', dot: '#283593' }
            ].map((cat, i) => (
              <Link
                key={i}
                to="/report"
                style={{
                  display:         'flex',
                  alignItems:      'center',
                  gap:             '14px',
                  padding:         '20px',
                  background:      'white',
                  border:          '1px solid #E2E8F0',
                  borderRadius:    '12px',
                  textDecoration:  'none',
                  transition:      'all 0.2s ease',
                  boxShadow:       '0 1px 3px rgba(0,0,0,0.06)'
                }}
              >
                <div style={{
                  width:          '48px',
                  height:         '48px',
                  background:     cat.color,
                  borderRadius:   '12px',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontSize:       '1.5rem',
                  flexShrink:     0
                }}>
                  {cat.icon}
                </div>
                <div>
                  <div style={{
                    fontWeight: 600,
                    color:      '#1F2937',
                    fontSize:   '0.9rem'
                  }}>
                    {cat.label}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color:    '#64748B',
                    marginTop: '2px'
                  }}>
                    Tap to report →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          FINAL CTA SECTION
          Get started call to action
      ========================================== */}
      <section
        aria-label="Get started"
        style={{
          background: 'white',
          padding:    '80px 16px',
          textAlign:  'center'
        }}
      >
        <div className="jb-container">
          <h2 style={{
            fontSize:     '2.25rem',
            fontWeight:   800,
            color:        '#1F2937',
            marginBottom: '16px'
          }}>
            Ready to Make Bangladesh Better?
          </h2>
          <p style={{
            fontSize:    '1.1rem',
            color:       '#64748B',
            maxWidth:    '520px',
            margin:      '0 auto 36px',
            lineHeight:  1.7
          }}>
            Join thousands of citizens already reporting civic problems.
            Your voice matters. Your report creates change.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/register"
              id="home-register-btn"
              className="btn-primary-jb"
              style={{ padding: '14px 36px', fontSize: '1rem' }}
            >
              Create Free Account
            </Link>
            <Link
              to="/community"
              id="home-community-btn"
              className="btn-outline-jb"
              style={{ padding: '14px 36px', fontSize: '1rem' }}
            >
              Explore Community
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}

export default HomePage;
