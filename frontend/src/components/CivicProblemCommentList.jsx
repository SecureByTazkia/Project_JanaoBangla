// ==========================================
// JanaoBangla — Civic Problem Comment List Component
// BRANCH: feature-community-feed-comments-and-discussion
// Report-er shob comments ebong nested replies hierarchy akare dekhay
// Anonymous commenter, reply form trigger, flag/report ebong delete support kore
// ==========================================

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CivicProblemCommentForm from './CivicProblemCommentForm';
import CommunityInteractionService from '../services/CommunityInteractionService';

function CivicProblemCommentList({ comments = [], reportId, onCommentUpdated, onCommentDeleted }) {
  const { user, isAdmin } = useAuth();

  // State to track which comment is currently being replied to
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [flaggedCommentIds, setFlaggedCommentIds]     = useState({});
  const [actionInProgress, setActionInProgress]       = useState({});

  // ==========================================
  // formatDate
  // Date format kore readable string e convert kore
  // ==========================================
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ==========================================
  // handleFlagComment
  // Inappropriate comment ke moderation er jonno report/flag kore
  // ==========================================
  const handleFlagComment = async (commentId) => {
    if (flaggedCommentIds[commentId]) return;

    if (!window.confirm('Are you sure you want to flag/report this comment for moderation?')) {
      return;
    }

    try {
      setActionInProgress(prev => ({ ...prev, [commentId]: true }));
      await CommunityInteractionService.flagComment(commentId);
      setFlaggedCommentIds(prev => ({ ...prev, [commentId]: true }));
      alert('Thank you. This comment has been reported to administrators for review.');
    } catch (err) {
      console.error('Flag comment error:', err);
      alert('Failed to flag comment. Please try again.');
    } finally {
      setActionInProgress(prev => ({ ...prev, [commentId]: false }));
    }
  };

  // ==========================================
  // handleDeleteComment
  // Comment author ba admin comment delete korte pare
  // ==========================================
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to remove this comment?')) {
      return;
    }

    try {
      setActionInProgress(prev => ({ ...prev, [commentId]: true }));
      await CommunityInteractionService.deleteComment(commentId);
      if (onCommentDeleted) {
        onCommentDeleted(commentId);
      }
    } catch (err) {
      console.error('Delete comment error:', err);
      alert('Failed to delete comment. Please try again.');
    } finally {
      setActionInProgress(prev => ({ ...prev, [commentId]: false }));
    }
  };

  // ==========================================
  // renderCommentItem
  // Single comment ba reply node render korar recursive/item helper function
  // ==========================================
  const renderCommentItem = (comment, isReply = false) => {
    const isAnonymous = Boolean(comment.is_anonymous);
    const isAuthor = user && user.id === comment.author_id;
    const canDelete = isAuthor || isAdmin;
    const isFlagged = Boolean(comment.is_flagged) || Boolean(flaggedCommentIds[comment.id]);
    const isReplying = replyingToCommentId === comment.id;

    return (
      <div key={comment.id} className="comment-item" id={`comment-${comment.id}`}>
        {/* Author Avatar */}
        <div className="comment-avatar-wrap">
          <div className={`comment-avatar ${isAnonymous ? 'anonymous' : ''}`} aria-hidden="true">
            {isAnonymous ? '🎭' : (comment.author_name?.charAt(0)?.toUpperCase() || 'U')}
          </div>
        </div>

        {/* Comment Content Box */}
        <div className="comment-content-wrap">
          <div className="comment-header">
            <div className="comment-author-info">
              <span className="comment-author-name">
                {isAnonymous ? 'Anonymous Citizen' : comment.author_name}
              </span>
              {isAnonymous ? (
                <span className="community-anonymous-badge">Private Identity</span>
              ) : comment.author_role === 'admin' ? (
                <span className="comment-author-badge">🛡️ Admin</span>
              ) : null}
            </div>
            <time className="comment-time">
              {formatDate(comment.created_at)}
            </time>
          </div>

          <div className="comment-body">
            {comment.content}
          </div>

          {/* Action Links (Reply, Flag, Delete) */}
          <div className="comment-actions">
            {!isReply && (
              <button
                type="button"
                className="comment-action-link"
                onClick={() => setReplyingToCommentId(isReplying ? null : comment.id)}
              >
                💬 {isReplying ? 'Cancel Reply' : 'Reply'}
              </button>
            )}

            <button
              type="button"
              className="comment-action-link"
              onClick={() => handleFlagComment(comment.id)}
              disabled={isFlagged || actionInProgress[comment.id]}
              title="Report inappropriate comment"
            >
              🚩 {isFlagged ? 'Reported' : 'Report'}
            </button>

            {canDelete && (
              <button
                type="button"
                className="comment-action-link danger"
                onClick={() => handleDeleteComment(comment.id)}
                disabled={actionInProgress[comment.id]}
                title="Delete comment"
              >
                🗑️ Delete
              </button>
            )}
          </div>

          {/* Inline Reply Box for this comment */}
          {isReplying && (
            <div className="mt-3">
              <CivicProblemCommentForm
                reportId={reportId}
                parentComment={comment}
                onCommentAdded={(newReply) => {
                  setReplyingToCommentId(null);
                  if (onCommentUpdated) {
                    onCommentUpdated(newReply);
                  }
                }}
                onCancelReply={() => setReplyingToCommentId(null)}
              />
            </div>
          )}

          {/* Nested Replies List */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="comment-replies-list">
              {comment.replies.map(reply => renderCommentItem(reply, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-4 text-muted" style={{ fontSize: '0.9rem' }}>
        <p className="mb-1">💬 No comments yet on this report.</p>
        <p className="small">Be the first citizen to leave a comment or share helpful information!</p>
      </div>
    );
  }

  return (
    <div className="comment-thread-list">
      {comments.map(comment => renderCommentItem(comment, false))}
    </div>
  );
}

export default CivicProblemCommentList;
