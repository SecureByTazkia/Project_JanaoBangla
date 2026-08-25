// ==========================================
// JanaoBangla — AI Problem Recognition Result Component
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// Upload kora evidence image theke AI ja recognize korche
// tar result, confidence score ebong tags dekhay
// ==========================================

import React from 'react';
import '../styles/ai.css';

function AIProblemRecognitionResult({ recognition, isAnalyzing }) {
  // Ei component AI image recognition er result card render korbe
  
  if (isAnalyzing) {
    return (
      <div className="ai-analyzing-box">
        <div className="spinner-border text-success mb-2" role="status" style={{ width: '2.2rem', height: '2.2rem' }}>
          <span className="visually-hidden">Analyzing image...</span>
        </div>
        <div className="fw-bold" style={{ color: '#004D3A', fontSize: '1.05rem' }}>
          🤖 AI is scanning & recognizing problem from your evidence photo...
        </div>
        <small className="text-muted">
          Detecting civic hazard type, severity level, and visual characteristics.
        </small>
      </div>
    );
  }

  if (!recognition) return null;

  const {
    detectedProblem,
    detectedProblemBn,
    confidence = 92,
    severity = 'medium',
    detectedFeatures = [],
    aiProvider = 'JanaoBangla AI Vision'
  } = recognition;

  // Severity color mapping
  const severityBadgeClass =
    severity === 'critical' ? 'bg-danger text-white' :
    severity === 'high' ? 'bg-warning text-dark' : 'bg-info text-dark';

  return (
    <div className="ai-widget-card">
      <div className="ai-widget-header">
        <div className="ai-badge">
          <span className="ai-pulse-dot"></span>
          🤖 AI Civic Problem Recognition
        </div>
        <div className="ai-confidence-container">
          <span className="text-muted" style={{ fontSize: '0.78rem' }}>AI Confidence:</span>
          <div className="ai-confidence-bar">
            <div
              className="ai-confidence-fill"
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
          <span className="ai-confidence-text">{confidence}%</span>
        </div>
      </div>

      <div className="ai-recognition-grid">
        <div className="ai-info-box">
          <div className="ai-info-label">Identified Problem</div>
          <div className="ai-info-value">
            <span>🔍 {detectedProblem}</span>
          </div>
          {detectedProblemBn && (
            <div className="text-success fw-bold mt-1" style={{ fontSize: '0.88rem' }}>
              🇧🇩 {detectedProblemBn}
            </div>
          )}
          <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '6px' }}>
            Engine: {aiProvider}
          </div>
        </div>

        <div className="ai-info-box">
          <div className="ai-info-label">Hazard Level & Characteristics</div>
          <div className="d-flex align-items-center gap-2 mt-1">
            <span className={`badge ${severityBadgeClass}`} style={{ fontSize: '0.82rem', padding: '5px 10px' }}>
              ⚠️ {severity.toUpperCase()} SEVERITY
            </span>
          </div>
          <div className="ai-tags-list mt-2">
            {detectedFeatures.map((tag, idx) => (
              <span key={idx} className="ai-tag">✓ {tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIProblemRecognitionResult;
