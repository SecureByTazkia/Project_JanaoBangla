// ==========================================
// JanaoBangla — User Authentication Routes
// BRANCH: feature-user-authentication-and-security
// /api/auth/* routes definition
// ==========================================

const express = require('express');
const router  = express.Router();

const {
  registerUser,
  loginUser,
  getMyProfile,
  updateMyProfile,
  verifyEmail,
  resendVerificationOTP,
  forgotPassword,
  resetPassword,
  changePassword
} = require('../controllers/UserAuthenticationController');

const {
  requireAuthentication,
  optionalAuthentication
} = require('../middleware/UserAuthenticationMiddleware');
const {
  loginRateLimiter,
  registrationRateLimiter,
  passwordResetRateLimiter,
  emailVerificationRateLimiter
} = require('../middleware/AuthenticationRateLimitMiddleware');

// ==========================================
// Public routes — Registration, login, password recovery, verification
// ==========================================
router.post('/register',            registrationRateLimiter, registerUser);
router.post('/login',               loginRateLimiter,        loginUser);
router.post('/forgot-password',     passwordResetRateLimiter, forgotPassword);
router.post('/reset-password',      resetPassword);
router.post('/verify-email',        optionalAuthentication, emailVerificationRateLimiter, verifyEmail);
router.post('/resend-verification', optionalAuthentication, emailVerificationRateLimiter, resendVerificationOTP);

// ==========================================
// Protected routes — Authenticated user only
// ==========================================
router.get('/profile',              requireAuthentication, getMyProfile);
router.put('/profile',              requireAuthentication, updateMyProfile);
router.put('/change-password',       requireAuthentication, changePassword);

module.exports = router;
