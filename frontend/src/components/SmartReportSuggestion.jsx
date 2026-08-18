// ==========================================
// JanaoBangla — Smart Report Suggestion Component
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// Report aro shundor, structured ebong actionable korar jonno
// AI suggested title, description ebong duplicate warning dekhay
// ==========================================

import React, { useState } from 'react';
import '../styles/ai.css';

function SmartReportSuggestion({
  suggestions,
  duplicates,
  onApplyTitle,
  onApplyDescription,
  onApplyAll,
  onViewExistingReport
}) {
  // Ei component AI improvement suggestions ar duplicate detection alert show korbe
  const [appliedBadge, setAppliedBadge] = useState(null);

  if (!suggestions && !duplicates) return null;

  const {
    smartTitle,
    smartDescription,
    improvementTips = []
  } = suggestions || {};

  const {
    hasDuplicate,
    maxSimilarity = 0,
    similarReports = []
  } = duplicates || {};

  const handleApplyAllClick = () => {
    if (onApplyAll) onApplyAll({ smartTitle, smartDescription });
    setAppliedBadge('All AI recommendations applied to your report! ✨');
    setTimeout(() => setAppliedBadge(null), 3500);
  };

  const handleApplyTitleClick = () => {
    if (onApplyTitle) onApplyTitle(smartTitle);
    setAppliedBadge('Smart Title applied! 🎯');
    setTimeout(() => setAppliedBadge(null), 3500);
  };

  const handleApplyDescClick = () => {
    if (onApplyDescription) onApplyDescription(smartDescription);
    setAppliedBadge('Structured Description applied! 📝');
    setTimeout(() => setAppliedBadge(null), 3500);
  };

  return (
    <div className="mt-3">
      {/* 1. Duplicate Warning Banner if high similarity detected */}
      {hasDuplicate && similarReports.length > 0 && (
        <div className="ai-duplicate-warning">
          <div className="ai-duplicate-header">
            <span>⚠️ Similar Civic Problem Found in this Area ({maxSimilarity}% Match)</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#92400E', marginBottom: '8px' }}>
            A similar issue has already been reported near this location. You can view the existing report to support/confirm it, or proceed if this is a separate incident.
          </p>

          <ul className="ai-duplicate-list">
            {similarReports.map((report) => (
              <li key={report.reportId} className="ai-duplicate-item">
                <div>
                  <strong>{report.title}</strong>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    📍 {report.address} {report.distanceKm ? `(~${report.distanceKm} km away)` : ''} • Status: <span className="badge bg-secondary">{report.status}</span>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="ai-duplicate-match-badge">
                    {report.similarityPercentage}% Match
                  </span>
                  {onViewExistingReport && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-dark"
                      onClick={() => onViewExistingReport(report.reportId)}
                    >
                      View Report
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 2. Smart Report Enhancements & Tips */}
      {suggestions && (
        <div className="ai-widget-card" style={{ borderLeftColor: '#2563EB', background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)' }}>
          <div className="ai-widget-header">
            <div className="ai-badge" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>
              ✨ AI Report Quality Assistant
            </div>
            {appliedBadge && (
              <span className="badge bg-success text-white animate__animated animate__fadeIn" style={{ fontSize: '0.82rem' }}>
                {appliedBadge}
              </span>
            )}
          </div>

          {/* Actionable Tips Box */}
          {improvementTips.length > 0 && (
            <div className="ai-suggestion-box" style={{ borderLeftColor: '#2563EB', backgroundColor: '#FFFFFF', border: '1px solid #BFDBFE' }}>
              <div className="ai-suggestion-title" style={{ color: '#1E40AF' }}>
                💡 Actionable Recommendations for Faster Action:
              </div>
              <ul style={{ paddingLeft: '1.2rem', margin: '4px 0 0 0', fontSize: '0.82rem', color: '#334155' }}>
                {improvementTips.map((tip, idx) => (
                  <li key={idx} className="mb-1">{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Structured Preview */}
          <div className="p-3 bg-white rounded border mb-3" style={{ borderColor: '#E2E8F0' }}>
            {smartTitle && (
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                    Suggested Professional Title:
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={handleApplyTitleClick}
                    style={{ fontSize: '0.76rem', padding: '2px 8px' }}
                  >
                    🎯 Use Title
                  </button>
                </div>
                <div className="p-2 rounded bg-light fw-bold text-dark" style={{ fontSize: '0.9rem', border: '1px solid #E2E8F0' }}>
                  {smartTitle}
                </div>
              </div>
            )}

            {smartDescription && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                    Structured 4-Part Description:
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={handleApplyDescClick}
                    style={{ fontSize: '0.76rem', padding: '2px 8px' }}
                  >
                    📝 Use Description
                  </button>
                </div>
                <div
                  className="p-2 rounded bg-light"
                  style={{
                    fontSize: '0.82rem',
                    color: '#334155',
                    whiteSpace: 'pre-line',
                    maxHeight: '110px',
                    overflowY: 'auto',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  {smartDescription}
                </div>
              </div>
            )}
          </div>

          <div className="ai-actions-row">
            <button
              type="button"
              className="btn-ai-apply"
              onClick={handleApplyAllClick}
            >
              ✨ Apply All AI Suggestions (Title & Structured Description)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SmartReportSuggestion;
