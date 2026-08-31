// ==========================================
// JanaoBangla — Smart Report Suggestion Component
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// Evidence-based title, enhanced description, recommended action, and AI disclaimer
// ==========================================

import React, { useState } from 'react';
import '../styles/ai.css';

function SmartReportSuggestion({
  suggestions,
  onApplyTitle,
  onApplyDescription,
  onApplyAll
}) {
  const [appliedBadge, setAppliedBadge] = useState(null);

  if (!suggestions) return null;

  const {
    smartTitle,
    smartDescription,
    recommendedAction,
    disclaimer = 'AI-generated suggestions are based on the provided evidence and information. Please review and verify the suggestions before submitting your report.'
  } = suggestions || {};

  const handleApplyAllClick = () => {
    if (onApplyAll) onApplyAll({ smartTitle, smartDescription });
    setAppliedBadge('All AI suggestions applied!');
    setTimeout(() => setAppliedBadge(null), 3000);
  };

  const handleApplyTitleClick = () => {
    if (onApplyTitle) onApplyTitle(smartTitle);
    setAppliedBadge('Title applied!');
    setTimeout(() => setAppliedBadge(null), 3000);
  };

  const handleApplyDescClick = () => {
    if (onApplyDescription) onApplyDescription(smartDescription);
    setAppliedBadge('Description applied!');
    setTimeout(() => setAppliedBadge(null), 3000);
  };

  return (
    <div className="mt-3 mb-3">
      {/* Evidence-Based Smart Report Enhancements */}
      {suggestions && (
        <div className="ai-widget-card" style={{ borderLeftColor: '#2563EB', background: '#FFFFFF' }}>
          <div className="ai-widget-header pb-2 border-bottom d-flex justify-content-between align-items-center">
            <div className="ai-badge" style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', fontWeight: 700 }}>
              AI Report Quality Assistant
            </div>
            <div className="d-flex align-items-center gap-2">
              {appliedBadge && (
                <span className="badge bg-success text-white" style={{ fontSize: '0.8rem' }}>
                  {appliedBadge}
                </span>
              )}
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleApplyAllClick}
                style={{ fontSize: '0.8rem', padding: '4px 10px' }}
              >
                Apply All Suggestions
              </button>
            </div>
          </div>

          <div className="p-3 bg-light rounded border my-2" style={{ borderColor: '#E2E8F0' }}>
            {/* Suggested Title */}
            {smartTitle && (
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                    Suggested Title
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={handleApplyTitleClick}
                    style={{ fontSize: '0.74rem', padding: '1px 8px' }}
                  >
                    Use Title
                  </button>
                </div>
                <div className="p-2 rounded bg-white fw-bold text-dark border" style={{ fontSize: '0.9rem', borderColor: '#CBD5E1' }}>
                  {smartTitle}
                </div>
              </div>
            )}

            {/* Suggested Description */}
            {smartDescription && (
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                    Suggested Description
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={handleApplyDescClick}
                    style={{ fontSize: '0.74rem', padding: '1px 8px' }}
                  >
                    Use Description
                  </button>
                </div>
                <div
                  className="p-2 rounded bg-white text-dark border"
                  style={{
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-line',
                    borderColor: '#CBD5E1'
                  }}
                >
                  {smartDescription}
                </div>
              </div>
            )}

            {/* Recommended Action */}
            {recommendedAction && (
              <div className="p-2 rounded bg-white border" style={{ borderColor: '#CBD5E1', borderLeft: '4px solid #10B981' }}>
                <span className="text-muted d-block" style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Recommended Action
                </span>
                <p className="mb-0 text-dark mt-1" style={{ fontSize: '0.84rem' }}>
                  {recommendedAction}
                </p>
              </div>
            )}
          </div>

          {/* AI Disclaimer */}
          <div className="px-2 pt-1">
            <small className="text-muted d-block" style={{ fontSize: '0.76rem', lineHeight: '1.4' }}>
              <strong>AI Disclaimer:</strong> {disclaimer}
            </small>
          </div>
        </div>
      )}
    </div>
  );
}

export default SmartReportSuggestion;
