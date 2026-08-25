// ==========================================
// JanaoBangla — Community Interaction Routes
// BRANCH: feature-community-feed-comments-and-discussion
// Ei route file ta community feed, discussion, comments, problem verification ar comment flagging er API endpoints define kore
// ==========================================

const express = require('express');
const router  = express.Router();

const CommunityInteractionController = require('../controllers/CommunityInteractionController');
const { requireAuthentication, optionalAuthentication } = require('../middleware/UserAuthenticationMiddleware');

// ==========================================
// 1. GET /api/community/feed
// Public civic problem reports feed return kore (with category, status, search, sorting filters)
// Optional authentication diye user nijer verification status check korte pare
// ==========================================
router.get('/feed', optionalAuthentication, (req, res, next) => {
  // Public community feed handler call kora hocche
  CommunityInteractionController.getPublicFeed(req, res, next);
});

// ==========================================
// 2. GET /api/community/reports/:id/discussion
// Single public report er full details, evidence, comments tree ar verification status return kore
// ==========================================
router.get('/reports/:id/discussion', optionalAuthentication, (req, res, next) => {
  // Report discussion handler call kora hocche
  CommunityInteractionController.getReportDiscussion(req, res, next);
});

// ==========================================
// 3. GET /api/community/reports/:id/comments
// Shudhu report er comments tree fetch kore
// ==========================================
router.get('/reports/:id/comments', (req, res, next) => {
  // Comments fetch handler call kora hocche
  CommunityInteractionController.getComments(req, res, next);
});

// ==========================================
// 4. POST /api/community/reports/:id/comments
// Report e noya comment ba nested reply submit kore (Requires authentication)
// is_anonymous true dile author name "Anonymous Citizen" dekhabe
// ==========================================
router.post('/reports/:id/comments', requireAuthentication, (req, res, next) => {
  // Comment submit handler call kora hocche
  CommunityInteractionController.postComment(req, res, next);
});

// ==========================================
// 5. POST /api/community/reports/:id/verify
// Report verification confirm/unconfirm toggle kore ("23 people confirmed this problem")
// Requires authentication
// ==========================================
router.post('/reports/:id/verify', requireAuthentication, (req, res, next) => {
  // Problem verification toggle handler call kora hocche
  CommunityInteractionController.toggleProblemVerification(req, res, next);
});

// ==========================================
// 6. GET /api/community/reports/:id/verification-status
// Report er total verification count ar current user verified kina return kore
// ==========================================
router.get('/reports/:id/verification-status', optionalAuthentication, (req, res, next) => {
  // Verification status handler call kora hocche
  CommunityInteractionController.getVerificationStatus(req, res, next);
});

// ==========================================
// 7. POST /api/community/comments/:id/flag
// Inappropriate comment ke moderation er jonno flag/report kore
// ==========================================
router.post('/comments/:id/flag', optionalAuthentication, (req, res, next) => {
  // Comment flag handler call kora hocche
  CommunityInteractionController.flagComment(req, res, next);
});

// ==========================================
// 8. DELETE /api/community/comments/:id
// Author ba Admin er jonno comment delete/remove kore (Requires authentication)
// ==========================================
router.delete('/comments/:id', requireAuthentication, (req, res, next) => {
  // Comment delete handler call kora hocche
  CommunityInteractionController.deleteComment(req, res, next);
});

module.exports = router;
