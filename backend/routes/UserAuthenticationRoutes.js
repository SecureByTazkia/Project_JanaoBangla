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

const { requireAuthentication } = require('../middleware/UserAuthenticationMiddleware');
const {
  loginRateLimiter,
  registrationRateLimiter,
  passwordResetRateLimiter,
  emailVerificationRateLimiter
} = require('../middleware/AuthenticationRateLimitMiddleware');

// ==========================================
// Public routes — Registration, login, password recovery
// ==========================================
router.post('/register',        registrationRateLimiter, registerUser);
router.post('/login',           loginRateLimiter,        loginUser);
router.post('/forgot-password', passwordResetRateLimiter, forgotPassword);
router.post('/reset-password',  resetPassword);

// ==========================================
// Protected routes — Authenticated user only
// ==========================================
router.get('/profile',            requireAuthentication, getMyProfile);
router.put('/profile',            requireAuthentication, updateMyProfile);
router.post('/verify-email',       requireAuthentication, emailVerificationRateLimiter, verifyEmail);
router.post('/resend-verification',requireAuthentication, emailVerificationRateLimiter, resendVerificationOTP);
router.put('/change-password',     requireAuthentication, changePassword);

module.exports = router;
