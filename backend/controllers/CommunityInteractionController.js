// ==========================================
// JanaoBangla — Community Interaction Controller
// BRANCH: feature-community-feed-comments-and-discussion
// Ei controller ta public community feed, comments, replies, verification ar moderation API requests handle kore
// ==========================================

const CivicProblemCommentModel = require('../models/CivicProblemCommentModel');
const CivicProblemReportModel  = require('../models/CivicProblemReportModel');

class CommunityInteractionController {

  // ==========================================
  // getPublicFeed
  // Ei handler ta public community feed er reports list return kore
  // Category, status, search, ar sorting filters support kore
  // Optional auth token thakle user er nijer confirmation status-o return kore
  // ==========================================
  static async getPublicFeed(req, res, next) {
    try {
      const {
        category = 'all',
        status = 'all',
        search = '',
        sortBy = 'newest',
        page = 1,
        limit = 10
      } = req.query;

      // Logged-in user thakle tar user ID extract kora hocche
      const currentUserId = req.user ? req.user.id : null;

      const feedData = await CivicProblemCommentModel.getPublicCommunityFeed({
        category,
        status,
        search,
        sortBy,
        page,
        limit,
        currentUserId
      });

      return res.status(200).json({
        success: true,
        message: 'Community feed retrieved successfully',
        data: feedData
      });
    } catch (error) {
      // Error handling middleware e pass kora hocche
      next(error);
    }
  }

  // ==========================================
  // getReportDiscussion
  // Ei handler ta ekta specific report er full details, evidence, shob comments ar verifications return kore
  // ==========================================
  static async getReportDiscussion(req, res, next) {
    try {
      const reportId = parseInt(req.params.id);
      if (!reportId || isNaN(reportId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid Report ID is required'
        });
      }

      const currentUserId = req.user ? req.user.id : null;
      const discussionData = await CivicProblemCommentModel.getReportDiscussionSummary(reportId, currentUserId);

      if (!discussionData) {
        return res.status(404).json({
          success: false,
          message: 'Public civic report not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Report discussion loaded successfully',
        data: discussionData
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // getComments
  // Ei handler ta shudhu report er comments tree fetch kore
  // ==========================================
  static async getComments(req, res, next) {
    try {
      const reportId = parseInt(req.params.id);
      if (!reportId || isNaN(reportId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid Report ID is required'
        });
      }

      const comments = await CivicProblemCommentModel.getCommentsByReportId(reportId);

      return res.status(200).json({
        success: true,
        message: 'Comments fetched successfully',
        data: { comments }
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // postComment
  // Ei handler ta user er comment ba reply submit korar request handle kore
  // User login kora thakte hobe (req.user theke user_id pabe)
  // is_anonymous true dile author name "Anonymous Citizen" dekhabe
  // ==========================================
  static async postComment(req, res, next) {
    try {
      const reportId = parseInt(req.params.id);
      const userId = req.user ? req.user.id : null;
      const { content, parent_id, is_anonymous } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required. Please sign in to comment.'
        });
      }

      if (!content || content.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Comment content cannot be empty'
        });
      }

      // Check kora hocche report ta exist kore kina
      const report = await CivicProblemReportModel.getReportById(reportId);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Civic report not found'
        });
      }

      // Jodi reply hoy (parent_id thake), parent comment ache kina check kora hocche
      if (parent_id) {
        const parentComment = await CivicProblemCommentModel.getCommentById(parent_id);
        if (!parentComment || parentComment.report_id !== reportId) {
          return res.status(400).json({
            success: false,
            message: 'Parent comment not found or belongs to a different report'
          });
        }
      }

      const createdComment = await CivicProblemCommentModel.createComment({
        report_id: reportId,
        user_id: userId,
        parent_id: parent_id || null,
        content: content.trim(),
        is_anonymous: Boolean(is_anonymous)
      });

      return res.status(201).json({
        success: true,
        message: 'Comment submitted successfully',
        data: { comment: createdComment }
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // flagComment
  // Ei handler ta user kono inappropriate comment report/flag korle handle kore
  // Jar fole admin dashboard e moderation list e show korbe
  // ==========================================
  static async flagComment(req, res, next) {
    try {
      const commentId = parseInt(req.params.id);
      if (!commentId || isNaN(commentId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid Comment ID is required'
        });
      }

      const comment = await CivicProblemCommentModel.getCommentById(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      await CivicProblemCommentModel.flagComment(commentId);

      return res.status(200).json({
        success: true,
        message: 'Comment flagged for moderation. Our admin team will review it.'
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // deleteComment
  // Ei handler ta user ke tar nijer comment delete korte dey ba Admin ke remove korte dey
  // ==========================================
  static async deleteComment(req, res, next) {
    try {
      const commentId = parseInt(req.params.id);
      const userId = req.user ? req.user.id : null;
      const isAdmin = req.user && req.user.role === 'admin';

      if (!commentId || isNaN(commentId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid Comment ID is required'
        });
      }

      const comment = await CivicProblemCommentModel.getCommentById(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      // Shudhu comment author ba admin delete korte parbe
      if (comment.user_id !== userId && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this comment'
        });
      }

      await CivicProblemCommentModel.deleteComment(commentId, userId, isAdmin);

      return res.status(200).json({
        success: true,
        message: 'Comment removed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // toggleProblemVerification
  // Ei handler ta citizen ke ekta public problem confirm ba unconfirm korte dey
  // Live verification count update kore return kore
  // ==========================================
  static async toggleProblemVerification(req, res, next) {
    try {
      const reportId = parseInt(req.params.id);
      const userId = req.user ? req.user.id : null;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required. Please sign in to verify civic problems.'
        });
      }

      if (!reportId || isNaN(reportId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid Report ID is required'
        });
      }

      const report = await CivicProblemReportModel.getReportById(reportId);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Civic report not found'
        });
      }

      const result = await CivicProblemCommentModel.toggleVerification(reportId, userId);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          verified: result.verified,
          verification_count: result.verification_count
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // getVerificationStatus
  // Ei handler ta check kore current user report ta verify koreche kina ar total count koto
  // ==========================================
  static async getVerificationStatus(req, res, next) {
    try {
      const reportId = parseInt(req.params.id);
      const userId = req.user ? req.user.id : null;

      if (!reportId || isNaN(reportId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid Report ID is required'
        });
      }

      const count = await CivicProblemCommentModel.getVerificationCount(reportId);
      const hasVerified = await CivicProblemCommentModel.hasUserVerified(reportId, userId);

      return res.status(200).json({
        success: true,
        data: {
          reportId,
          verificationCount: count,
          hasVerified
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CommunityInteractionController;
