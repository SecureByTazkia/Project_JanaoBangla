// ==========================================
// JanaoBangla — Public Civic Problem Feed Component
// BRANCH: feature-community-feed-comments-and-discussion
// Public civic problem reports-er feed dekhay, filtering, sorting, verification button ebong inline discussion expand support kore
// ==========================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import CommunityDiscussionSection from './CommunityDiscussionSection';
import CommunityInteractionService from '../services/CommunityInteractionService';
import { useAuth } from '../context/AuthContext';

function PublicCivicProblemFeed({
  reports = [],
  loading = false,
  onRefresh = null
}) {
  const { isAuthenticated } = useAuth();

  // Track which report has its discussion section expanded inline
  const [expandedDiscussionId, setExpandedDiscussionId] = useState(null);
  const [verifyingReportId, setVerifyingReportId]       = useState(null);
  const [localReportStates, setLocalReportStates]       = useState({});

  // Category visual mapping helper
  const getCategoryMeta = (cat) => {
    switch (cat) {
      case 'road_damage':
        return { label: 'Road Damage', icon: '🚧', color: '#E65100', bg: '#FFF3E0' };
      case 'garbage_waste':
        return { label: 'Garbage / Waste', icon: '🗑️', color: '#2E7D32', bg: '#E8F5E9' };
      case 'street_light':
        return { label: 'Street Light', icon: '💡', color: '#F57F17', bg: '#FFFDE7' };
      case 'water_drainage':
        return { label: 'Water / Drainage', icon: '🚰', color: '#0277BD', bg: '#E1F5FE' };
      case 'traffic_accident':
        return { label: 'Traffic / Accident', icon: '🚦', color: '#C62828', bg: '#FFEBEE' };
      case 'public_safety':
        return { label: 'Public Safety', icon: '🛡️', color: '#4A148C', bg: '#F3E5F5' };
      default:
        return { label: 'Civic Issue', icon: '📋', color: '#374151', bg: '#F3F4F6' };
    }
  };

  // Status visual mapping helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'solved':
        return <span className="badge" style={{ backgroundColor: '#2E7D32', color: '#FFF' }}>✅ Solved</span>;
      case 'processing':
        return <span className="badge" style={{ backgroundColor: '#0288D1', color: '#FFF' }}>⚙️ Processing</span>;
      case 'under_review':
        return <span className="badge" style={{ backgroundColor: '#F57F17', color: '#FFF' }}>🔍 Under Review</span>;
      case 'submitted':
      default:
        return <span className="badge" style={{ backgroundColor: '#64748B', color: '#FFF' }}>📝 Submitted</span>;
    }
  };

  // ==========================================
  // formatDate
  // Date format korar helper function
  // ==========================================
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // ==========================================
  // handleQuickVerify
  // Feed card theke direct problem confirmation toggle korar handler
  // ==========================================
  const handleQuickVerify = async (reportId) => {
    if (!isAuthenticated) {
      alert('Please sign in to confirm and verify this civic problem.');
      return;
    }

    try {
      setVerifyingReportId(reportId);
      const res = await CommunityInteractionService.toggleProblemVerification(reportId);

      if (res.success && res.data) {
        setLocalReportStates(prev => ({
          ...prev,
          [reportId]: {
            verified: res.data.verified,
            count: res.data.verification_count
          }
        }));
      }
    } catch (err) {
      console.error('Failed to quick verify report:', err);
      alert('Failed to update verification. Please try again.');
    } finally {
      setVerifyingReportId(null);
    }
  };

  // ==========================================
  // toggleDiscussion
  // Inline discussion accordion open/close korar handler
  // ==========================================
  const toggleDiscussion = (reportId) => {
    setExpandedDiscussionId(prev => (prev === reportId ? null : reportId));
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading community reports...</span>
        </div>
        <p className="mt-3 text-muted">Loading public civic reports and discussions...</p>
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="community-card text-center py-5">
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📋</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1F2937' }}>
          No Civic Reports Yet
        </h3>
        <p className="text-muted mb-4" style={{ maxWidth: '450px', margin: '0 auto 16px' }}>
          No problems have been reported yet. Be the first to report an issue in your community.
        </p>
        <Link to="/report-problem" className="btn-primary-jb" style={{ padding: '8px 20px', textDecoration: 'none', display: 'inline-block' }}>
          📋 Report Problem
        </Link>
      </div>
    );
  }

  return (
    <div className="community-feed-grid">
      {reports.map((report) => {
        const catMeta = getCategoryMeta(report.category);
        const isAnonymous = Boolean(report.is_anonymous);
        const isExpanded = expandedDiscussionId === report.id;

        // Current verification state (local override or server prop)
        const currentState = localReportStates[report.id];
        const hasVerified = currentState ? currentState.verified : Boolean(report.has_verified);
        const verificationCount = currentState ? currentState.count : (report.verification_count || 0);

        return (
          <article key={report.id} className="community-card" id={`community-report-${report.id}`}>
            {/* Card Header (Reporter info + Badges) */}
            <div className="community-card-header">
              <div className="community-reporter-info">
                <div className={`community-avatar ${isAnonymous ? 'anonymous' : ''}`}>
                  {isAnonymous ? '🎭' : (report.reporter_name?.charAt(0)?.toUpperCase() || 'U')}
                </div>
                <div className="community-reporter-meta">
                  <h4>
                    <span>{isAnonymous ? 'Anonymous Citizen' : report.reporter_name}</span>
                    {isAnonymous && (
                      <span className="community-anonymous-badge">Private Identity</span>
                    )}
                  </h4>
                  <time>{formatDate(report.created_at)}</time>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span
                  className="badge"
                  style={{
                    backgroundColor: catMeta.bg,
                    color: catMeta.color,
                    border: `1px solid ${catMeta.color}30`,
                    fontWeight: 600
                  }}
                >
                  {catMeta.icon} {catMeta.label}
                </span>
                {getStatusBadge(report.status)}
              </div>
            </div>

            {/* Title & Description */}
            <h3 className="community-card-title">
              <Link to={`/reports/${report.id}`}>
                {report.title}
              </Link>
            </h3>

            <p className="community-card-desc">
              {report.description}
            </p>

            {/* Location Tag */}
            {(report.address || report.district) && (
              <div className="community-location-tag">
                <span>📍</span>
                <span>{report.address || `${report.upazila ? report.upazila + ', ' : ''}${report.district}`}</span>
              </div>
            )}

            {/* Evidence Preview Images */}
            {report.evidence && report.evidence.length > 0 && (
              <div className="community-evidence-preview">
                {report.evidence.map((item, idx) => (
                  <img
                    key={idx}
                    src={item.file_path?.startsWith('http') ? item.file_path : `/${item.file_path}`}
                    alt={`Evidence ${idx + 1}`}
                    className="community-evidence-thumb"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ))}
              </div>
            )}

            {/* Card Action Bar */}
            <div className="community-card-actions">
              <div className="community-action-btn-group">
                {/* Confirm Problem Verification CTA */}
                <button
                  type="button"
                  className={`community-btn-verify ${hasVerified ? 'verified' : ''}`}
                  onClick={() => handleQuickVerify(report.id)}
                  disabled={verifyingReportId === report.id}
                  title={hasVerified ? 'Click to unconfirm' : 'Click to confirm this civic issue'}
                >
                  <span>{hasVerified ? '✅ Confirmed' : '🤝 Confirm Problem'}</span>
                  <span className="badge bg-white text-dark rounded-pill px-2" style={{ fontSize: '0.75rem' }}>
                    {verificationCount}
                  </span>
                </button>

                {/* Discussion Toggle Button */}
                <button
                  type="button"
                  className="community-btn-comment-toggle"
                  onClick={() => toggleDiscussion(report.id)}
                >
                  <span>💬 {isExpanded ? 'Hide Discussion' : 'Discussion'}</span>
                  <span className="badge bg-secondary rounded-pill text-white ms-1" style={{ fontSize: '0.75rem' }}>
                    {report.comment_count || 0}
                  </span>
                </button>
              </div>

              {/* View Full Report Details Link */}
              <Link
                to={`/reports/${report.id}`}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#006A4E',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                View Details & Map →
              </Link>
            </div>

            {/* Inline Expanded Discussion Section */}
            {isExpanded && (
              <CommunityDiscussionSection
                reportId={report.id}
                initialVerificationCount={verificationCount}
                initialHasVerified={hasVerified}
                onVerificationChanged={(verified, count) => {
                  setLocalReportStates(prev => ({
                    ...prev,
                    [report.id]: { verified, count }
                  }));
                }}
              />
            )}
          </article>
        );
      })}
    </div>
  );
}

export default PublicCivicProblemFeed;
