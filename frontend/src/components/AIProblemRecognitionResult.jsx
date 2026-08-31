// ==========================================
// JanaoBangla — AI Problem Recognition Result Component
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// Evidence-based AI inspection result displaying observable details and realistic metrics
// ==========================================

import React from 'react';
import '../styles/ai.css';

const CATEGORY_NAMES = {
  road_damage: { label: 'Road Damage', icon: '' },
  garbage_waste: { label: 'Garbage / Waste', icon: '' },
  street_light: { label: 'Street Light', icon: '' },
  water_drainage: { label: 'Water / Drainage', icon: '' },
  traffic_accident: { label: 'Traffic / Accident', icon: '' },
  public_safety: { label: 'Public Safety', icon: '' }
};

function formatSeverity(sev) {
  if (!sev) return 'Medium';
  const clean = sev.toLowerCase().trim();
  if (clean === 'unable_to_determine') return 'Unable to determine';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function AIProblemRecognitionResult({ recognition, isAnalyzing }) {
  if (isAnalyzing) {
    return (
      <div className="ai-analyzing-box">
        <div className="spinner-border text-success mb-2" role="status" style={{ width: '2.2rem', height: '2.2rem' }}>
          <span className="visually-hidden">Analyzing image...</span>
        </div>
        <div className="fw-bold" style={{ color: '#004D3A', fontSize: '1.05rem' }}>
          AI is analyzing evidence photo...
        </div>
        <small className="text-muted">
          Identifying observable civic problem characteristics and evidence-based suggestions.
        </small>
      </div>
    );
  }

  if (!recognition) return null;

  const {
    detectedProblem,
    detectedProblemBn,
    suggestedCategory,
    confidence = 91,
    severity = 'medium',
    detectedFeatures = []
  } = recognition;

  const catMeta = CATEGORY_NAMES[suggestedCategory] || { label: suggestedCategory || 'Road Damage', icon: '' };
  const formattedSeverity = formatSeverity(severity);

  const severityBadgeClass =
    severity === 'critical' ? 'bg-danger text-white' :
    severity === 'high' ? 'bg-warning text-dark' :
    severity === 'low' ? 'bg-success text-white' :
    severity === 'unable_to_determine' ? 'bg-secondary text-white' :
    'bg-primary text-white';

  return (
    <div className="ai-widget-card mb-3" style={{ borderLeftColor: '#004D3A' }}>
      <div className="ai-widget-header pb-2 border-bottom">
        <div className="ai-badge" style={{ backgroundColor: '#E6F4EA', color: '#004D3A', fontWeight: 700 }}>
          AI Evidence Analysis
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>Confidence:</span>
          <span className="badge bg-light text-dark border fw-bold" style={{ fontSize: '0.82rem' }}>
            {confidence}%
          </span>
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-md-6">
          <div className="p-2 rounded bg-light border" style={{ borderColor: '#E2E8F0', height: '100%' }}>
            <span className="text-muted d-block" style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Detected Issue
            </span>
            <div className="fw-bold text-dark mt-1" style={{ fontSize: '0.95rem' }}>
              {detectedProblem}
            </div>
            {detectedProblemBn && (
              <small className="text-success d-block mt-1 fw-semibold">
                {detectedProblemBn}
              </small>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="p-2 rounded bg-light border" style={{ borderColor: '#E2E8F0', height: '100%' }}>
            <span className="text-muted d-block" style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Suggested Category & Estimated Severity
            </span>
            <div className="d-flex align-items-center justify-content-between mt-1">
              <span className="fw-bold text-dark" style={{ fontSize: '0.92rem' }}>
                {catMeta.label}
              </span>
              <span className={`badge ${severityBadgeClass}`} style={{ fontSize: '0.78rem', padding: '4px 8px' }}>
                {formattedSeverity}
              </span>
            </div>
          </div>
        </div>
      </div>

      {detectedFeatures && detectedFeatures.length > 0 && (
        <div className="mt-2 pt-2">
          <span className="text-muted d-block mb-1" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Observable Conditions:
          </span>
          <div className="d-flex flex-wrap gap-1">
            {detectedFeatures.map((feat, idx) => (
              <span key={idx} className="badge bg-white text-dark border px-2 py-1" style={{ fontSize: '0.78rem', fontWeight: 500 }}>
                ✓ {feat}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AIProblemRecognitionResult;
