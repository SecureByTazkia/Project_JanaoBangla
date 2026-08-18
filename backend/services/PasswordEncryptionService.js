// ==========================================
// JanaoBangla — Password Encryption Service
// BRANCH: feature-user-authentication-and-security
// bcrypt diye password hash ar verify kora hobe
// Plain text password database e kokhono jabe na
// ==========================================

const bcrypt = require('bcrypt');

// bcrypt cost factor — 12 rounds for strong security
const SALT_ROUNDS = 12;

// ==========================================
// hashPassword — Plain text password ke bcrypt hash e convert korbe
// Registration ar password change er shomoy call hobe
// ==========================================
async function hashPassword(plainTextPassword) {
  try {
    // bcrypt diye password hash kora hocche
    const hashedPassword = await bcrypt.hash(plainTextPassword, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    console.error('Password hashing error:', error.message);
    throw new Error('Password encryption failed');
  }
}

// ==========================================
// comparePassword — Login er shomoy password check korbe
// Plain text password ke hash er sathe compare korbe
// Match korle true, na korle false return korbe
// ==========================================
async function comparePassword(plainTextPassword, hashedPassword) {
  try {
    // bcrypt.compare diye password verify kora hocche
    const isMatch = await bcrypt.compare(plainTextPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', error.message);
    throw new Error('Password verification failed');
  }
}

// ==========================================
// validatePasswordStrength — Password strong ki na check korbe
// Min 8 chars, uppercase, lowercase, number, special char dorkar
// ==========================================
function validatePasswordStrength(password) {
  const errors = [];

  // Minimum length check
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Uppercase letter check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Lowercase letter check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Special character check
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Sob check pass korle isValid = true hobe
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength
};
