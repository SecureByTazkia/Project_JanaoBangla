// ==========================================
// JanaoBangla — Token Service
// BRANCH: feature-user-authentication-and-security
// JWT access token ar refresh token create/verify korar jonno
// Sob token logic ekhane centralized
// ==========================================

const jwt = require('jsonwebtoken');

// ==========================================
// generateAccessToken — User login er pore access token banabe
// Payload e user er id, email, role thakbe
// Default 7 din expire hobe
// ==========================================
function generateAccessToken(payload) {
  // JWT_SECRET .env theke newa hocche, token sign kora hocche
  return jwt.sign(payload, process.env.JWT_SECRET || 'janaobangla_dev_jwt_secret_key_change_in_production_123456789', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

// ==========================================
// generateRefreshToken — Long-lived refresh token banabe
// Access token expire hoile ei diye noya token newa jabe
// 30 din expire hobe
// ==========================================
function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'janaobangla_dev_refresh_secret_key_change_in_production_987654321', {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  });
}

// ==========================================
// verifyAccessToken — Access token valid ki na check korbe
// Valid hoile decoded payload return korbe
// Invalid hoile null return korbe
// ==========================================
function verifyAccessToken(token) {
  try {
    // JWT verify kora hocche secret key diye
    return jwt.verify(token, process.env.JWT_SECRET || 'janaobangla_dev_jwt_secret_key_change_in_production_123456789');
  } catch (error) {
    // Token expired ba invalid hoile null return kora hocche
    return null;
  }
}

// ==========================================
// verifyRefreshToken — Refresh token valid ki na check korbe
// ==========================================
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'janaobangla_dev_refresh_secret_key_change_in_production_987654321');
  } catch (error) {
    return null;
  }
}

// ==========================================
// generateEmailVerificationToken — Email verify korar jonno
// Random 6-digit OTP generate korbe
// ==========================================
function generateEmailVerificationToken() {
  // 6-digit random OTP generate kora hocche
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ==========================================
// generatePasswordResetToken — Password reset er jonno 6-digit OTP
// MySQL users table-er password_reset_code VARCHAR(10) column e fit hobe
// ==========================================
function generatePasswordResetToken() {
  // 6-digit cryptographically secure random OTP generate kora hocche
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ==========================================
// buildTokenPayload — User object theke JWT payload banabe
// Password ba sensitive data payload e jabe na
// ==========================================
function buildTokenPayload(user) {
  return {
    id:    user.id,
    email: user.email,
    role:  user.role
  };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  buildTokenPayload
};
