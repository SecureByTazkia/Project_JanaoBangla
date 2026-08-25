// ==========================================
// JanaoBangla — Community Discussion Section Component
// BRANCH: feature-community-feed-comments-and-discussion
// Report niye community discussion, comments list, comment submit form ebong problem confirmation manage kore
// ==========================================

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CivicProblemCommentForm from './CivicProblemCommentForm';
import CivicProblemCommentList from './CivicProblemCommentList';
import CommunityInteractionService from '../services/CommunityInteractionService';

function CommunityDiscussionSection({
  reportId,
  initialVerificationCount = 0,
  initialHasVerified = false,
  onVerificationChanged = null
}) {
  const { isAuthenticated } = useAuth();

  const [comments, setComments]                   = useState([]);
  const [verificationCount, setVerificationCount] = useState(initialVerificationCount);
  const [hasVerified, setHasVerified]             = useState(initialHasVerified);
  const [loadingComments, setLoadingComments]     = useState(true);
  const [verifying, setVerifying]                 = useState(false);
  const [error, setError]                         = useState('');

  // ==========================================
  // useEffect — Report er comments load kora hocche
  // ==========================================
  useEffect(() => {
    let isMounted = true;

    const loadDiscussionData = async () => {
      if (!reportId) return;

      try {
        setLoadingComments(true);
        setError('');

        // Backend theke comments list fetch kora hocche
        const response = await CommunityInteractionService.getComments(reportId);
        if (isMounted && response.success) {
          setComments(response.data?.comments || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load discussion comments:', err);
          setError('Could not load discussion comments. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoadingComments(false);
        }
      }
    };

    loadDiscussionData();

    return () => {
      isMounted = false;
    };
  }, [reportId]);

  // Sync initial props if they update
  useEffect(() => {
    setVerificationCount(initialVerificationCount);
  }, [initialVerificationCount]);

  useEffect(() => {
    setHasVerified(initialHasVerified);
  }, [initialHasVerified]);

  // ==========================================
  // handleToggleVerification
  // Citizen jokhon "Confirm this Problem" button click kore
  // Verification count 1 barabe/komabe ar UI live update korbe
  // ==========================================
  const handleToggleVerification = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to confirm and verify this civic problem.');
      return;
    }

    try {
      setVerifying(true);
      const res = await CommunityInteractionService.toggleProblemVerification(reportId);

      if (res.success && res.data) {
        setHasVerified(res.data.verified);
        setVerificationCount(res.data.verification_count);

        if (onVerificationChanged) {
          onVerificationChanged(res.data.verified, res.data.verification_count);
        }
      }
    } catch (err) {
      console.error('Verification toggle error:', err);
      alert(err.response?.data?.message || 'Failed to update problem verification.');
    } finally {
      setVerifying(false);
    }
  };

  // ==========================================
  // handleCommentAdded
  // Noya root comment ba nested reply create hole comments list update kore
  // ==========================================
  const handleCommentAdded = (newComment) => {
    if (!newComment) return;

    // Jodi child reply hoy
    if (newComment.parent_id) {
      setComments(prevComments => {
        return prevComments.map(c => {
          if (c.id === newComment.parent_id) {
            return {
              ...c,
              replies: [...(c.replies || []), newComment]
            };
          }
          return c;
        });
      });
    } else {
      // Root comment hoy
      setComments(prev => [newComment, ...prev]);
    }
  };

  // ==========================================
  // handleCommentDeleted
  // Comment delete hole UI list theke remove kore
  // ==========================================
  const handleCommentDeleted = (commentId) => {
    setComments(prevComments => {
      // Filter out root comment or inside replies
      return prevComments
        .filter(c => c.id !== commentId)
        .map(c => ({
          ...c,
          replies: (c.replies || []).filter(r => r.id !== commentId)
        }));
    });
  };

  // Calculate total comments count including replies
  const totalCommentsCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  return (
    <div className="community-discussion-box" id={`discussion-section-${reportId}`}>
      {/* Discussion Header & Problem Verification CTA */}
      <div className="community-discussion-header">
        <h5>
          <span>🗣️ Community Discussion</span>
          <span className="badge bg-light text-dark border" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            {totalCommentsCount} {totalCommentsCount === 1 ? 'Comment' : 'Comments'}
          </span>
        </h5>

        {/* Verification Button */}
        <button
          type="button"
          className={`community-btn-verify ${hasVerified ? 'verified' : ''}`}
          onClick={handleToggleVerification}
          disabled={verifying}
          title={hasVerified ? 'Click to remove your confirmation' : 'Click to confirm you also observed this civic problem'}
        >
          <span>{hasVerified ? '✅ Confirmed Problem' : '🤝 Confirm this Problem'}</span>
          <span className="badge bg-white text-dark rounded-pill px-2" style={{ fontSize: '0.75rem' }}>
            {verificationCount}
          </span>
        </button>
      </div>

      {/* Verification Counter Notice */}
      <div className="mb-3 p-2 px-3 rounded" style={{ backgroundColor: '#E8F5F0', borderLeft: '3px solid #006A4E', fontSize: '0.875rem' }}>
        <strong>Community Proof:</strong> {verificationCount > 0 ? (
          <span><strong>{verificationCount}</strong> citizens have confirmed this civic problem exists.</span>
        ) : (
          <span>Be the first citizen in your neighborhood to confirm this issue!</span>
        )}
      </div>

      {/* New Root Comment Form */}
      <CivicProblemCommentForm
        reportId={reportId}
        onCommentAdded={handleCommentAdded}
      />

      {/* Loading / Error States */}
      {loadingComments && (
        <div className="text-center py-3 text-muted">
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Loading community comments...
        </div>
      )}

      {error && (
        <div className="alert alert-warning py-2 text-center" style={{ fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {/* Comments List */}
      {!loadingComments && (
        <CivicProblemCommentList
          comments={comments}
          reportId={reportId}
          onCommentUpdated={handleCommentAdded}
          onCommentDeleted={handleCommentDeleted}
        />
      )}
    </div>
  );
}

export default CommunityDiscussionSection;
