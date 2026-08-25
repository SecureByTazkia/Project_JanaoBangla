// ==========================================
// JanaoBangla — Admin Comment Monitoring Component
// BRANCH: feature-admin-dashboard-and-system-monitoring
// User comments monitor kore, inappropriate comments hide/unhide ba delete korte dey
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import AdminDashboardService from '../services/AdminDashboardService';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function AdminCommentMonitoring({ showToast }) {
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('flagged'); // 'flagged' or 'all'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const limit = 10;

  // Comments fetch kora hocche
  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await AdminDashboardService.getComments(page, limit, filter);
      setComments(data.comments || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load comments.');
    } finally {
      setIsLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Comment remove / restore toggle action
  const handleModerate = async (commentId, currentRemoved) => {
    const newRemoved = !currentRemoved;
    setActionLoading(`mod-${commentId}`);
    try {
      await AdminDashboardService.moderateComment(commentId, newRemoved);
      if (showToast) showToast(`Comment ${newRemoved ? 'removed' : 'restored'} ✅`, 'success');
      fetchComments();
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || 'Failed to moderate comment.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Comment permanent delete action
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to permanently delete this comment?')) return;
    setActionLoading(`del-${commentId}`);
    try {
      await AdminDashboardService.deleteComment(commentId);
      if (showToast) showToast('Comment permanently deleted ✅', 'success');
      fetchComments();
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || 'Failed to delete comment.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h3 className="admin-section-title">💬 User Comments Moderation & Monitoring</h3>
        <div className="admin-filter-row">
          <select
            className="admin-filter-select"
            value={filter}
            onChange={e => { setFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All Comments</option>
            <option value="removed">Removed Comments Only</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="admin-section-body">
          <LoadingSpinner message="Loading comments..." />
        </div>
      ) : error ? (
        <div className="admin-section-body">
          <ErrorMessage message={error} />
        </div>
      ) : comments.length === 0 ? (
        <div className="admin-empty-state">
          <div className="admin-empty-icon">💬</div>
          <div className="admin-empty-text">No comments found for this filter.</div>
        </div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Report Title</th>
                  <th>Comment Content</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.map(comment => (
                  <tr key={comment.id}>
                    <td>{comment.id}</td>
                    <td style={{ fontWeight: 500 }}>
                      <div>{comment.user_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{comment.user_email}</div>
                    </td>
                    <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {comment.report_title}
                    </td>
                    <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {comment.content}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {comment.is_removed ? (
                          <span className="admin-badge badge-hidden">🚫 Removed</span>
                        ) : (
                          <span className="admin-badge badge-active">🟢 Active</span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{formatDate(comment.created_at)}</td>
                    <td>
                      <div className="admin-actions-cell">
                        <button
                          className={`admin-action-btn btn-sm ${comment.is_removed ? 'btn-success' : 'btn-warning'}`}
                          onClick={() => handleModerate(comment.id, comment.is_removed)}
                          disabled={actionLoading === `mod-${comment.id}`}
                        >
                          {actionLoading === `mod-${comment.id}` ? '...' : comment.is_removed ? '👁️ Restore' : '🚫 Remove'}
                        </button>
                        <button
                          className="admin-action-btn btn-danger btn-sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={actionLoading === `del-${comment.id}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="admin-pagination">
              <div className="admin-pagination-info">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} comments
              </div>
              <div className="admin-pagination-controls">
                <button className="admin-pagination-btn" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
                  ← Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let startPage = Math.max(1, page - 2);
                  if (startPage + 4 > totalPages) startPage = Math.max(1, totalPages - 4);
                  const pageNum = startPage + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      className={`admin-pagination-btn ${pageNum === page ? 'active' : ''}`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button className="admin-pagination-btn" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminCommentMonitoring;
