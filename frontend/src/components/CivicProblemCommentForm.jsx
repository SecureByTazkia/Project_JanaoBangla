// ==========================================
// JanaoBangla — Civic Problem Comment Form
// BRANCH: feature-community-feed-comments-and-discussion
// User report-er upor comment ba nested reply likhe submit korte pare
// Anonymous citizen option thakay user identity gopon rekhe comment kora jay
// ==========================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommunityInteractionService from '../services/CommunityInteractionService';

function CivicProblemCommentForm({ reportId, parentComment = null, onCommentAdded, onCancelReply }) {
  const { isAuthenticated } = useAuth();

  const [content, setContent]         = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ==========================================
  // handleSubmit
  // Ei function ta comment form submit handle kore
  // Backend e comment/reply data pathay ebong success hole form reset kore
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setErrorMessage('Please write a comment before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      // Backend API call kora hocche comment post korar jonno
      const result = await CommunityInteractionService.postComment(reportId, {
        content: content.trim(),
        parent_id: parentComment ? parentComment.id : null,
        is_anonymous: isAnonymous
      });

      if (result.success && result.data?.comment) {
        // Form field reset kora hocche
        setContent('');
        setIsAnonymous(false);

        // Parent component ke inform kora hocche jate comment list update hoy
        if (onCommentAdded) {
          onCommentAdded(result.data.comment);
        }

        // Reply mode thakle cancel/close kore dewa hocche
        if (onCancelReply) {
          onCancelReply();
        }
      }
    } catch (err) {
      console.error('Comment submission error:', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to submit comment. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // User logged in na thakle sign in korar alert dekhabe
  if (!isAuthenticated) {
    return (
      <div className="comment-form-container text-center py-3">
        <p className="mb-2 text-muted" style={{ fontSize: '0.9rem' }}>
          💬 Want to join the community discussion or post feedback?
        </p>
        <Link to="/login" className="btn-primary-jb" style={{ padding: '6px 16px', fontSize: '0.85rem', textDecoration: 'none' }}>
          Sign In to Comment
        </Link>
      </div>
    );
  }

  return (
    <div className="comment-form-container">
      {/* Reply mode indication banner */}
      {parentComment && (
        <div className="comment-form-replying-to">
          <span>
            Replying to <strong>{parentComment.author_name}</strong>: "{parentComment.content.slice(0, 45)}..."
          </span>
          {onCancelReply && (
            <button
              type="button"
              className="comment-form-cancel-reply"
              onClick={onCancelReply}
            >
              ✕ Cancel Reply
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <textarea
          className="comment-textarea"
          placeholder={
            parentComment
              ? `Write your reply to ${parentComment.author_name}...`
              : "Share your thoughts, local updates, or verification notes on this civic problem..."
          }
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (errorMessage) setErrorMessage('');
          }}
          maxLength={1000}
          rows={parentComment ? 2 : 3}
          disabled={submitting}
          required
        />

        {errorMessage && (
          <div className="text-danger mt-1 mb-2" style={{ fontSize: '0.825rem' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        <div className="comment-form-footer">
          {/* Anonymous Comment Option */}
          <label className="comment-anonymous-checkbox" title="Your name will be displayed as 'Anonymous Citizen'">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              disabled={submitting}
            />
            <span>🎭 Post as Anonymous Citizen</span>
          </label>

          <div className="d-flex align-items-center gap-2">
            <span className="text-muted" style={{ fontSize: '0.78rem' }}>
              {content.length}/1000
            </span>
            <button
              type="submit"
              className="comment-submit-btn"
              disabled={submitting || !content.trim()}
            >
              {submitting ? (
                <span>Posting...</span>
              ) : (
                <span>{parentComment ? 'Reply' : 'Post Comment'} 💬</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CivicProblemCommentForm;
