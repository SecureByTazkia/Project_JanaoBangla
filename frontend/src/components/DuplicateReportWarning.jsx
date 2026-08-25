// ==========================================
// JanaoBangla — Duplicate Report Warning Component
// BRANCH: feature-duplicate-civic-problem-report-detection
// Ei component ek i dhoron-er civic report paowa gele user-ke warning dekhay
// ebong existing report view kora, duplicate hisebe link kora ba submit anyway korar option dey
// ==========================================

import React, { useState } from 'react';
import SimilarReportList from './SimilarReportList';

const DuplicateReportWarning = ({
  duplicateData = null,
  selectedDuplicate = null,
  onSelectDuplicateForLink = null,
  onSubmitAnyway = null,
  onSubmitWithLink = null,
  onViewExistingReport = null,
  onDismiss = null
}) => {
  const [showList, setShowList] = useState(true);

  if (!duplicateData || !duplicateData.similarReports || duplicateData.similarReports.length === 0) {
    return null;
  }

  const maxSim = duplicateData.maxSimilarity || 0;
  const isHighRisk = maxSim >= 70;

  // ==========================================
  // handleToggleList — Similar reports-er list expand ba collapse toggle kore
  // ==========================================
  const handleToggleList = () => {
    // Ei function user-ke similar reports list dekhano ba lukanor switch dey
    setShowList(prev => !prev);
  };

  return (
    <div
      className={`alert ${isHighRisk ? 'alert-warning border-warning' : 'alert-info border-info'} shadow-sm p-3 mb-4`}
      style={{
        borderRadius: '10px',
        backgroundColor: isHighRisk ? '#FFFBEB' : '#F0F9FF',
        borderLeft: isHighRisk ? '5px solid #FFB300' : '5px solid #0284C7'
      }}
    >
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div className="d-flex align-items-start gap-2">
          <span style={{ fontSize: '1.4rem', lineHeight: '1' }}>
            {isHighRisk ? '⚠️' : 'ℹ️'}
          </span>
          <div>
            <h5 className="alert-heading fw-bold mb-1" style={{ color: isHighRisk ? '#92400E' : '#0369A1', fontSize: '1.05rem' }}>
              Similar Report Found ({maxSim}% Match)
            </h5>
            <p className="mb-0 text-dark small" style={{ lineHeight: '1.4' }}>
              A similar civic problem has already been reported in this area. You can view the existing issue, link your report to avoid duplicates, or proceed with a new submission.
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onDismiss}
            style={{ fontSize: '0.8rem' }}
          ></button>
        )}
      </div>

      {/* Selected Duplicate Notification */}
      {selectedDuplicate && (
        <div className="mt-2 p-2 bg-white rounded border border-primary d-flex justify-content-between align-items-center">
          <small className="text-primary fw-bold">
            🔗 Selected to Link: #{selectedDuplicate.reportId} — {selectedDuplicate.title}
          </small>
          <span className="badge bg-primary text-white">Ready to Link</span>
        </div>
      )}

      {/* Expand/Collapse List Toggle */}
      <div className="mt-3 d-flex justify-content-between align-items-center">
        <button
          type="button"
          className="btn btn-sm btn-link text-decoration-none p-0 fw-semibold"
          onClick={handleToggleList}
          style={{ color: isHighRisk ? '#B45309' : '#0284C7', fontSize: '0.85rem' }}
        >
          {showList ? '▼ Hide Similar Reports' : `▶ View Similar Reports (${duplicateData.similarReports.length})`}
        </button>

        <span className="badge bg-white text-dark border px-2 py-1" style={{ fontSize: '0.78rem' }}>
          {duplicateData.similarReports.length} candidate(s) found
        </span>
      </div>

      {/* Similar Reports List Component */}
      {showList && (
        <div className="mt-2 pt-2 border-top">
          <SimilarReportList
            reports={duplicateData.similarReports}
            selectedReportId={selectedDuplicate?.reportId}
            onSelectForLink={onSelectDuplicateForLink}
            onViewReport={onViewExistingReport}
          />
        </div>
      )}

      {/* Decision Action Buttons */}
      <div className="mt-3 pt-2 border-top d-flex flex-wrap gap-2 justify-content-end">
        {selectedDuplicate && onSubmitWithLink && (
          <button
            type="button"
            className="btn btn-sm btn-primary fw-bold px-3"
            onClick={onSubmitWithLink}
          >
            🔗 Link as Duplicate & Submit
          </button>
        )}

        {onSubmitAnyway && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary fw-semibold px-3"
            onClick={onSubmitAnyway}
          >
            Submit Anyway (New Report)
          </button>
        )}
      </div>
    </div>
  );
};

export default DuplicateReportWarning;
