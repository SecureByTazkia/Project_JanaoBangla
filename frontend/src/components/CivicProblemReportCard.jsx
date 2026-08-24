// ==========================================
// JanaoBangla — Civic Problem Report Card Component
// BRANCH: feature-civic-problem-reporting-visibility-and-management
// Report summary card with category, status, visibility, and anonymous badge
// ==========================================

import React from 'react';
import CivicProblemReportStatus from './CivicProblemReportStatus';
import { Link } from 'react-router-dom';

const CivicProblemReportCard = ({ report }) => {
  // Ei component ekta specific report er summary card hishabe dekhabe
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCategory = (cat) => {
    if (!cat) return '';
    if (cat === 'extortion_chanda') return 'Extortion / Chanda Collection Report';
    if (cat === 'women_harassment') return 'Women Harassment';
    return cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="card shadow-sm h-100 border-0" style={{ borderRadius: '12px' }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="badge bg-primary-light text-primary-dark mb-2">
            {formatCategory(report.category)}
          </span>
          <CivicProblemReportStatus status={report.status} />
        </div>
        
        <h5 className="card-title fw-bold text-dark">{report.title}</h5>
        
        <p className="card-text text-muted small mb-3 text-truncate-2" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {report.description}
        </p>

        <div className="d-flex justify-content-between align-items-center mt-auto flex-wrap gap-1">
          <small className="text-muted">
            <i className="bi bi-clock me-1"></i> {formatDate(report.created_at)}
          </small>
          <div className="d-flex gap-1">
            {Boolean(report.is_anonymous) && (
              <span className="badge bg-secondary" title="Reported Anonymously">🕵️ Anonymous</span>
            )}
            {report.visibility === 'private' && (
              <span className="badge bg-dark" title="This report is private">Private</span>
            )}
          </div>
        </div>
      </div>
      <div className="card-footer bg-white border-0 pb-3 pt-0">
        <Link to={`/reports/${report.id}`} className="btn btn-outline-primary w-100">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default CivicProblemReportCard;
