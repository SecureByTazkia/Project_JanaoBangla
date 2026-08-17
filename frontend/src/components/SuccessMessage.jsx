// ==========================================
// JanaoBangla — Success Message Component
// BRANCH: main
// Successful action er pore green success card dekhabe
// Form submit, save, delete etc er pore use hobe
// ==========================================

// ==========================================
// SuccessMessage — Success display component
// message: success text
// onDismiss: optional callback close korte
// title: optional custom title
// ==========================================
function SuccessMessage({ message, onDismiss, title = 'Success!' }) {

  // Message na thakle render korbo na
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display:      'flex',
        gap:          '12px',
        padding:      '14px 16px',
        background:   '#E8F5E9',
        border:       '1px solid #C8E6C9',
        borderLeft:   '4px solid #2E7D32',
        borderRadius: '10px',
        marginBottom: '16px'
      }}
    >
      {/* Success icon */}
      <span
        aria-hidden="true"
        style={{ fontSize: '1.25rem', flexShrink: 0, lineHeight: 1.4 }}
      >
        ✅
      </span>

      {/* Success content */}
      <div style={{ flex: 1 }}>
        <p style={{
          fontWeight:   600,
          color:        '#2E7D32',
          fontSize:     '0.875rem',
          marginBottom: '2px'
        }}>
          {title}
        </p>
        <p style={{ color: '#1B5E20', fontSize: '0.875rem', margin: 0 }}>
          {message}
        </p>
      </div>

      {/* Dismiss button — optional */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss success message"
          style={{
            background: 'transparent',
            border:     'none',
            cursor:     'pointer',
            color:      '#2E7D32',
            fontSize:   '1.1rem',
            flexShrink: 0,
            padding:    '0 2px',
            lineHeight: 1
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default SuccessMessage;
