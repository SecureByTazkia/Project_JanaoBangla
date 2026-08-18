// ==========================================
// JanaoBangla — Similar Report List Component
// BRANCH: feature-duplicate-civic-problem-report-detection
// Ei component detected similar/possible duplicate reports-er list cards hisebe render kore
// ebong user-ke view, select for linking ba verify korar sujog dey
// ==========================================

import React from 'react';
import { Link } from 'react-router-dom';

const categoryLabels = {
  road_damage: '🛣️ Road Damage',
  garbage_waste: '🗑️ Garbage / Waste',
  street_light: '💡 Street Light',
  water_drainage: '🌊 Water / Drainage',
  traffic_accident: '🚦 Traffic / Accident',
  public_safety: '🛡️ Public Safety'
};

const SimilarReportList = ({
  reports = [],
  selectedReportId = null,
  onSelectForLink = null,
  onViewReport = null
}) => {

  // ==========================================
  // getSimilarityBadgeClass — Similarity percentage er upor base kore badge color thik kore
  // ==========================================
  const getSimilarityBadgeClass = (score) => {
    // Ei function high similarity (>75%) hole red-warning, medium hole orange, baki hole info color dey
    if (score >= 75) return 'bg-danger text-white';
    if (score >= 60) return 'bg-warning text-dark';
    return 'bg-info text-dark';
  };

  // ==========================================
  // formatDate — Date string ke readable format e convert kore
  // ==========================================
  const formatDate = (dateStr) => {
    // Ei function ISO date ke user-friendly date format banay
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-3 text-muted">
        <small>No similar reports to display.</small>
      </div>
    );
  }

  return (
    <div className="similar-reports-list d-flex flex-column gap-2 mt-2">
      {reports.map((report) => {
        const isSelected = selectedReportId === report.reportId;
        const similarity = report.similarityPercentage || 0;

        return (
          <div
            key={report.reportId}
            className={`card border p-3 transition-all ${
              isSelected ? 'border-primary bg-primary-light shadow-sm' : 'border-light-subtle bg-white'
            }`}
            style={{
              borderRadius: '8px',
              borderWidth: isSelected ? '2px' : '1px',
              transition: 'all 0.2s ease'
            }}
          >
            <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
              <div>
                <span className="badge bg-light text-secondary border me-2" style={{ fontSize: '0.75rem' }}>
                  {categoryLabels[report.category] || report.category}
                </span>
                <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.75rem' }}>
                  Status: {report.status}
                </span>
              </div>

              {/* Similarity Score Badge */}
              <span className={`badge ${getSimilarityBadgeClass(similarity)} px-2 py-1 fw-bold`} style={{ fontSize: '0.8rem' }}>
                ⚡ {similarity}% Match
              </span>
            </div>

            {/* Report Title */}
            <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '0.95rem' }}>
              #{report.reportId}: {report.title}
            </h6>

            {/* Distance & Address Info */}
            <div className="d-flex align-items-center gap-3 text-muted mb-2" style={{ fontSize: '0.82rem' }}>
              <span>
                📍 <strong>{report.distanceText || (report.distanceMeters ? `${report.distanceMeters} m away` : 'Nearby area')}</strong>
              </span>
              {report.address && (
                <span className="text-truncate" style={{ maxWidth: '200px' }} title={report.address}>
                  • {report.address}
                </span>
              )}
              {report.createdAt && (
                <span>• {formatDate(report.createdAt)}</span>
              )}
            </div>

            {/* Description Snippet */}
            {report.description && (
              <p className="text-secondary small mb-2 text-truncate" style={{ maxHeight: '40px', overflow: 'hidden' }}>
                {report.description}
              </p>
            )}

            {/* Similarity Visual Bar */}
            <div className="progress mb-2" style={{ height: '5px' }}>
              <div
                className={`progress-bar ${similarity >= 75 ? 'bg-danger' : similarity >= 60 ? 'bg-warning' : 'bg-info'}`}
                role="progressbar"
                style={{ width: `${similarity}%` }}
                aria-valuenow={similarity}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-between align-items-center mt-1 pt-1 border-top">
              <a
                href={`/reports/${report.reportId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                style={{ fontSize: '0.78rem' }}
                onClick={(e) => {
                  if (onViewReport) {
                    e.preventDefault();
                    onViewReport(report.reportId);
                  }
                }}
              >
                👁️ View Report <span className="small text-muted">↗</span>
              </a>

              {onSelectForLink && (
                <button
                  type="button"
                  className={`btn btn-sm ${
                    isSelected ? 'btn-primary' : 'btn-outline-primary'
                  } fw-semibold`}
                  style={{ fontSize: '0.78rem' }}
                  onClick={() => onSelectForLink(report)}
                >
                  {isSelected ? '✓ Linked for Submission' : '🔗 Link to this Report'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SimilarReportList;
