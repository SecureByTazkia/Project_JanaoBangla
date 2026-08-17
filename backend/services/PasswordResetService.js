// ==========================================
// JanaoBangla — Password Reset Service
// BRANCH: feature-user-authentication-and-security
// Password reset token database e store ar verify korar jonno
// TokenService theke token newa hobe, DB te save hobe
// ==========================================

const db = require('./DatabaseService');
const { generatePasswordResetToken } = require('./TokenService');
const { sendPasswordResetEmail }     = require('./EmailVerificationService');

// ==========================================
// createPasswordResetRequest — Forgot password request create korbe
// Ei function password reset token generate kore users table-e save kore ar reset email pathay.
// ==========================================
async function createPasswordResetRequest(user) {
  // Noya reset token generate kora hocche
  const resetToken = generatePasswordResetToken();

  // Token er expiry time set kora hocche — 1 ghanta
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Token database e users table-e save kora hocche
  await db.update(
    'UPDATE users SET password_reset_code = ?, password_reset_expires_at = ?, updated_at = NOW() WHERE id = ?',
    [resetToken, expiresAt, user.id]
  );

  // Password reset email pathano hocche
  const emailResult = await sendPasswordResetEmail(user.email, user.name, resetToken);

  return { resetToken, emailResult };
}

// ==========================================
// validatePasswordResetToken — Reset token valid ki na check korbe
// Ei function reset token database-e valid ar unexpired ki na check kore user record return kore.
// ==========================================
async function validatePasswordResetToken(token) {
  // Database theke token fetch kora hocche
  const resetRecord = await db.queryOne(
    `SELECT id as user_id, email, name, password_reset_code, password_reset_expires_at
     FROM users
     WHERE password_reset_code = ?`,
    [token]
  );

  // Token database e na thakle invalid
  if (!resetRecord) {
    return { valid: false, message: 'Invalid or already used reset token.' };
  }

  // Token expire hoyeche ki check kora hocche
  if (new Date() > new Date(resetRecord.password_reset_expires_at)) {
    return { valid: false, message: 'Reset token has expired. Please request a new one.' };
  }

  return { valid: true, record: resetRecord };
}

// ==========================================
// markPasswordResetTokenUsed — Password reset hoye gele token mark korbe
// Ei function password reset hoye jawar por reset code clear kore dei jate abar use na kora jay.
// ==========================================
async function markPasswordResetTokenUsed(userId) {
  await db.update(
    'UPDATE users SET password_reset_code = NULL, password_reset_expires_at = NULL, updated_at = NOW() WHERE id = ?',
    [userId]
  );
}

module.exports = {
  createPasswordResetRequest,
  validatePasswordResetToken,
  markPasswordResetTokenUsed
};
