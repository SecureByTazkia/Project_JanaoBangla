// ==========================================
// JanaoBangla — Loading Spinner Component
// BRANCH: main
// Data load howar shomoy dekhano hobe
// Reusable loading indicator
// ==========================================

// ==========================================
// LoadingSpinner — Page ba section loading indicator
// size prop: 'sm' | 'md' (default) | 'lg'
// message prop: optional text niche dekhabe
// fullPage prop: pura page cover korbe ki na
// ==========================================
function LoadingSpinner({ size = 'md', message = '', fullPage = false }) {

  // Size er upor depend kore spinner er dimension
  const sizeMap = {
    sm: { width: '24px', height: '24px', border: '2px' },
    md: { width: '40px', height: '40px', border: '3px' },
    lg: { width: '56px', height: '56px', border: '4px' }
  };

  // Default size 'md' use kora hobe jodi invalid size dewa hoy
  const dimensions = sizeMap[size] || sizeMap.md;

  // Spinner er style object — CSS variable theke color newa hocche
  const spinnerStyle = {
    display:      'inline-block',
    width:        dimensions.width,
    height:       dimensions.height,
    border:       `${dimensions.border} solid #E2E8F0`,
    borderTop:    `${dimensions.border} solid #006A4E`,
    borderRadius: '50%',
    animation:    'jb-spin 0.8s linear infinite'
  };

  // FullPage wrapper style — pura viewport cover korbe
  const fullPageStyle = {
    position:       'fixed',
    top:            0,
    left:           0,
    right:          0,
    bottom:         0,
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    background:     'rgba(255, 255, 255, 0.9)',
    zIndex:         9999,
    gap:            '16px'
  };

  // Inline spinner wrapper style
  const inlineStyle = {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '24px',
    gap:            '12px'
  };

  return (
    <>
      {/* CSS animation keyframes inline define kora hocche */}
      <style>{`
        @keyframes jb-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {/* fullPage true hoile pura screen cover korbe, na hoile inline dekhabe */}
      <div
        style={fullPage ? fullPageStyle : inlineStyle}
        role="status"
        aria-live="polite"
        aria-label={message || 'Loading...'}
      >
        {/* Spinner circle */}
        <div style={spinnerStyle} aria-hidden="true"></div>

        {/* Optional message text */}
        {message && (
          <p style={{
            color:      '#64748B',
            fontSize:   '0.875rem',
            fontWeight: 500,
            margin:     0
          }}>
            {message}
          </p>
        )}
      </div>
    </>
  );
}

export default LoadingSpinner;
