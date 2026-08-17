// ==========================================
// JanaoBangla — Authentication Rate Limit Middleware
// BRANCH: feature-user-authentication-and-security
// Login ar registration route e strict rate limit lagabe
// Brute force attack theke protect korbe
// ==========================================

const rateLimit = require('express-rate-limit');

// ==========================================
// loginRateLimiter — Login route er jonno (10 attempts / 15 mins)
// ==========================================
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders:   false
});

// ==========================================
// registrationRateLimiter — Registration route er jonno (5 accounts / 1 hr)
// ==========================================
const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      5,
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders:   false
});

// ==========================================
// passwordResetRateLimiter — Forgot password er jonno (3 attempts / 1 hr)
// ==========================================
const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      3,
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders:   false
});

// ==========================================
// emailVerificationRateLimiter — OTP resend er jonno (5 attempts / 1 hr)
// ==========================================
const emailVerificationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      5,
  message: {
    success: false,
    message: 'Too many verification requests. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders:   false
});

module.exports = {
  loginRateLimiter,
  registrationRateLimiter,
  passwordResetRateLimiter,
  emailVerificationRateLimiter
};
