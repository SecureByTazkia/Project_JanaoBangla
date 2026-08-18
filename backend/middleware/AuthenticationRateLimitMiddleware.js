// ==========================================
// JanaoBangla — Authentication Rate Limit Middleware
// BRANCH: feature-user-authentication-and-security
// Login ar registration route e strict rate limit lagabe
// Brute force attack theke protect korbe
// ==========================================

const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV === 'development';

// ==========================================
// loginRateLimiter — Login route er jonno (10 attempts / 15 mins in prod, 100 in dev)
// Ei middleware brute force attack theke protect korar jonno login request rate limit kore.
// ==========================================
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      isDev ? 100 : 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders:   false
});

// ==========================================
// registrationRateLimiter — Registration route er jonno (5 accounts / 1 hr in prod, 100 in dev)
// Ei middleware registration spamming block korar jonno rate limit apply kore.
// ==========================================
const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      isDev ? 100 : 5,
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders:   false
});

// ==========================================
// passwordResetRateLimiter — Forgot password er jonno (3 attempts / 1 hr in prod, 50 in dev)
// Ei middleware password reset link spamming theke protect kore.
// ==========================================
const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      isDev ? 50 : 3,
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders:   false
});

// ==========================================
// emailVerificationRateLimiter — OTP resend er jonno (5 attempts / 1 hr in prod, 100 in dev)
// Ei middleware OTP flood / abuse theke protect kore.
// ==========================================
const emailVerificationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      isDev ? 100 : 5,
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
