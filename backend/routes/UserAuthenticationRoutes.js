// ==========================================
// JanaoBangla — User Authentication Routes
// BRANCH: feature-user-authentication-and-security
// /api/auth/* route gulo ekhane define hobe
// Middleware chain: rate limit → auth check → controller
// ==========================================

const express = require('express');
const router  = express.Router();

// Controller import kora hocche
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

// Middleware import kora hocche
const { requireAuthentication } = require('../middleware/UserAuthenticationMiddleware');
const {
  loginRateLimiter,
  registrationRateLimiter,
  passwordResetRateLimiter,
  emailVerificationRateLimiter
} = require('../middleware/AuthenticationRateLimitMiddleware');

// ==========================================
// PUBLIC ROUTES — Login na holeo access kora jabe
// ==========================================

// POST /api/auth/register — Noya account create korbe
// registrationRateLimiter diye spam prevent kora hocche
router.post('/register', registrationRateLimiter, registerUser);

// POST /api/auth/login — User login korbe
// loginRateLimiter diye brute force prevent kora hocche
router.post('/login', loginRateLimiter, loginUser);

// POST /api/auth/forgot-password — Password reset link pathabe
router.post('/forgot-password', passwordResetRateLimiter, forgotPassword);

// POST /api/auth/reset-password — Noya password set korbe token diye
router.post('/reset-password', resetPassword);

// ==========================================
// PROTECTED ROUTES — Login lagbe (JWT token required)
// requireAuthentication middleware sob protected route e lagbe
// ==========================================

// GET /api/auth/profile — Logged-in user er profile
router.get('/profile', requireAuthentication, getMyProfile);

// PUT /api/auth/profile — Profile update korbe
router.put('/profile', requireAuthentication, updateMyProfile);

// POST /api/auth/verify-email — OTP diye email verify korbe
router.post('/verify-email', requireAuthentication, emailVerificationRateLimiter, verifyEmail);

// POST /api/auth/resend-verification — Noya OTP pathabe
router.post('/resend-verification', requireAuthentication, emailVerificationRateLimiter, resendVerificationOTP);

// PUT /api/auth/change-password — Password change korbe
router.put('/change-password', requireAuthentication, changePassword);

module.exports = router;
