// ==========================================
// JanaoBangla — Error Message Component
// BRANCH: main
// API error ba validation error dekhano jonno
// Consistent red error card
// ==========================================

// ==========================================
// ErrorMessage — Error display component
// message: error text (string ba array)
// onDismiss: optional callback error close korte
// title: optional custom title
// ==========================================
function ErrorMessage({ message, onDismiss, title = 'Something went wrong' }) {

  // Message na thakle kichhui render korbo na
  if (!message) return null;

  // Message array hoite pare (validation errors), string o hoite pare
  const messages = Array.isArray(message) ? message : [message];

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display:      'flex',
        gap:          '12px',
        padding:      '14px 16px',
        background:   '#FFEBEE',
        border:       '1px solid #FFCDD2',
        borderLeft:   '4px solid #C62828',
        borderRadius: '10px',
        marginBottom: '16px'
      }}
    >
      {/* Error icon */}
      <span
        aria-hidden="true"
        style={{ fontSize: '1.25rem', flexShrink: 0, lineHeight: 1.4 }}
      >
        ❌
      </span>

      {/* Error content */}
      <div style={{ flex: 1 }}>
        {/* Error title */}
        <p style={{
          fontWeight:   600,
          color:        '#C62828',
          fontSize:     '0.875rem',
          marginBottom: messages.length > 1 ? '6px' : 0
        }}>
          {title}
        </p>

        {/* Ekta ba multiple error messages list */}
        {messages.length === 1 ? (
          <p style={{ color: '#B71C1C', fontSize: '0.875rem', margin: 0 }}>
            {messages[0]}
          </p>
        ) : (
          <ul style={{
            color:    '#B71C1C',
            fontSize: '0.875rem',
            margin:   0,
            paddingLeft: '16px'
          }}>
            {messages.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Close button — onDismiss prop dewa thakle dekhabe */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss error"
          style={{
            background:  'transparent',
            border:      'none',
            cursor:      'pointer',
            color:       '#C62828',
            fontSize:    '1.1rem',
            flexShrink:  0,
            padding:     '0 2px',
            lineHeight:  1
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
