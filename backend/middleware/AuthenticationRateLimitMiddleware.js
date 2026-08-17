// ==========================================
// JanaoBangla — Authentication Rate Limit Middleware
// BRANCH: feature-user-authentication-and-security
// Login ar registration route e strict rate limit lagabe
// Brute force attack theke protect korbe
// ==========================================

const rateLimit = require('express-rate-limit');

// ==========================================
// loginRateLimiter — Login route er jonno
// 15 minute e max 10 bar try kora jabe
// Brute force login attack prevent korbe
// ==========================================
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max:      10,              // Max 10 tries per window
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders:   false,
  // Key generator — IP address diye track korbe
  keyGenerator: (req) => req.ip
});

// ==========================================
// registrationRateLimiter — Registration route er jonno
// 1 ghante max 5ta account create kora jabe
// Spam account creation prevent korbe
// ==========================================
const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max:      5,               // Max 5 registrations per hour
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders:   false
});

// ==========================================
// passwordResetRateLimiter — Forgot password route er jonno
// 1 ghante max 3 bar reset request kora jabe
// ==========================================
const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max:      3,
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders:   false
});

// ==========================================
// emailVerificationRateLimiter — OTP resend er jonno
// 1 ghante max 5 bar OTP request kora jabe
// ==========================================
const emailVerificationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
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
