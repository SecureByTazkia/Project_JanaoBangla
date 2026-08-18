// ==========================================
// JanaoBangla — Linked Duplicate Reports Component
// BRANCH: feature-duplicate-civic-problem-report-detection
// Ei component related duplicate reports eksathe render kore
// Primary original report ebong tar shob child duplicates dekhay
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DuplicateReportDetectionService from '../services/DuplicateReportDetectionService';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';

const LinkedDuplicateReports = ({ reportId, isOwnerOrAdmin = false }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [unlinkingId, setUnlinkingId] = useState(null);

  // ==========================================
  // fetchLinkedData — Backend theke linked duplicate reports fetch kore
  // ==========================================
  const fetchLinkedData = async () => {
    // Ei function report ID diye tar primary ebong child duplicates load kore
    if (!reportId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await DuplicateReportDetectionService.getLinkedReports(reportId);
      setData(res);
    } catch (err) {
      console.error('Failed to load linked reports:', err);
      // Fail silently if no duplicates
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinkedData();
  }, [reportId]);

  // ==========================================
  // handleUnlink — Duplicate report relationship remove korar action
  // ==========================================
  const handleUnlink = async (duplicateReportId) => {
    // Ei function duplicate link delete kore ebong list refresh kore
    if (!window.confirm('Are you sure you want to unlink this report from the duplicate group?')) {
      return;
    }

    setUnlinkingId(duplicateReportId);
    setError(null);
    setActionSuccess(null);
    try {
      const res = await DuplicateReportDetectionService.unlinkDuplicateReport(duplicateReportId);
      setActionSuccess(res.message || 'Report successfully unlinked.');
      await fetchLinkedData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to unlink duplicate report.');
    } finally {
      setUnlinkingId(null);
    }
  };

  if (loading) {
    return (
      <div className="card shadow-sm border-0 mb-4 p-3 bg-light text-center">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (!data || !data.isLinked) {
    return null; // Jodi kono duplicate link na thake, kisu dekhabe na
  }

  const { isPrimary, primaryReport, linkedDuplicates, currentReportId } = data;

  return (
    <div className="card shadow-sm border-0 mb-4 overflow-hidden" style={{ borderRadius: '10px' }}>
      {/* Header Banner */}
      <div
        className="card-header py-3 px-4 d-flex justify-content-between align-items-center"
        style={{
          backgroundColor: isPrimary ? '#E8F5F0' : '#FEF3C7',
          borderBottom: isPrimary ? '1px solid #A7F3D0' : '1px solid #FDE68A'
        }}
      >
        <div className="d-flex align-items-center gap-2">
          <span style={{ fontSize: '1.2rem' }}>{isPrimary ? '📌' : '🔗'}</span>
          <div>
            <h6 className="mb-0 fw-bold" style={{ color: isPrimary ? '#065F46' : '#92400E' }}>
              {isPrimary ? 'Primary Civic Issue (Has Linked Reports)' : 'Linked Duplicate Report'}
            </h6>
            <small className="text-muted">
              {isPrimary
                ? `${linkedDuplicates.length} citizen(s) reported similar problem in this area.`
                : `This report is connected to Primary Report #${primaryReport?.id}`}
            </small>
          </div>
        </div>

        <span className={`badge ${isPrimary ? 'bg-success' : 'bg-warning text-dark'} px-2 py-1`}>
          {isPrimary ? 'Original Issue' : 'Duplicate'}
        </span>
      </div>

      <div className="card-body p-4">
        {error && <ErrorMessage message={error} />}
        {actionSuccess && <SuccessMessage message={actionSuccess} />}

        {/* If Current Report is a Duplicate -> Show Link back to Primary Report */}
        {!isPrimary && primaryReport && (
          <div className="p-3 mb-3 bg-light rounded border">
            <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.72rem' }}>
              Original Master Problem
            </small>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold mb-1 text-dark">
                  #{primaryReport.id}: {primaryReport.title}
                </h6>
                <div className="small text-muted">
                  Reported by <strong>{primaryReport.reporter_name}</strong> • Status: <span className="badge bg-secondary">{primaryReport.status}</span>
                </div>
              </div>
              <Link to={`/reports/${primaryReport.id}`} className="btn btn-sm btn-primary">
                View Original ↗
              </Link>
            </div>
          </div>
        )}

        {/* List of Connected Duplicate Reports */}
        {linkedDuplicates && linkedDuplicates.length > 0 && (
          <div>
            <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.9rem' }}>
              🔗 Connected Duplicate Submissions ({linkedDuplicates.length})
            </h6>

            <div className="d-flex flex-column gap-2">
              {linkedDuplicates.map((dup) => {
                const isCurrent = dup.id === currentReportId;

                return (
                  <div
                    key={dup.id}
                    className={`p-3 rounded border d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 ${
                      isCurrent ? 'bg-light border-primary' : 'bg-white'
                    }`}
                  >
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-secondary" style={{ fontSize: '0.72rem' }}>
                          Report #{dup.id}
                        </span>
                        {dup.similarity_score && (
                          <span className="badge bg-warning text-dark" style={{ fontSize: '0.72rem' }}>
                            ⚡ {dup.similarity_score}% Match
                          </span>
                        )}
                        {isCurrent && (
                          <span className="badge bg-primary text-white" style={{ fontSize: '0.72rem' }}>
                            Viewing Now
                          </span>
                        )}
                      </div>

                      <h6 className="mb-1 fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                        {dup.title}
                      </h6>

                      <div className="small text-muted">
                        Reported by <strong>{dup.reporter_name}</strong>
                        {dup.address && ` • 📍 ${dup.address}`}
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      {!isCurrent && (
                        <Link
                          to={`/reports/${dup.id}`}
                          className="btn btn-sm btn-outline-secondary"
                          style={{ fontSize: '0.78rem' }}
                        >
                          View ↗
                        </Link>
                      )}

                      {isOwnerOrAdmin && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          style={{ fontSize: '0.78rem' }}
                          disabled={unlinkingId === dup.id}
                          onClick={() => handleUnlink(dup.id)}
                          title="Unlink and make independent"
                        >
                          {unlinkingId === dup.id ? 'Unlinking...' : '✕ Unlink'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkedDuplicateReports;
