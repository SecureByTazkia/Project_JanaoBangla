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
// Token generate kore database e save korbe, email pathabe
// ==========================================
async function createPasswordResetRequest(user) {
  // Purano unused reset token gulo delete kora hocche (cleanup)
  await db.query(
    'DELETE FROM password_resets WHERE user_id = ? AND used_at IS NULL',
    [user.id]
  );

  // Noya reset token generate kora hocche
  const resetToken = generatePasswordResetToken();

  // Token er expiry time set kora hocche — 1 ghanta
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Token database e save kora hocche
  await db.insert(
    'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
    [user.id, resetToken, expiresAt]
  );

  // Password reset email pathano hocche
  const emailResult = await sendPasswordResetEmail(user.email, user.full_name, resetToken);

  return { resetToken, emailResult };
}

// ==========================================
// validatePasswordResetToken — Reset token valid ki na check korbe
// Token database e ache ki, expire hoyeche ki, use hoyeche ki check korbe
// ==========================================
async function validatePasswordResetToken(token) {
  // Database theke token fetch kora hocche
  const resetRecord = await db.queryOne(
    `SELECT pr.*, u.email, u.full_name, u.id as user_id
     FROM password_resets pr
     JOIN users u ON u.id = pr.user_id
     WHERE pr.token = ? AND pr.used_at IS NULL`,
    [token]
  );

  // Token database e na thakle invalid
  if (!resetRecord) {
    return { valid: false, message: 'Invalid or already used reset token' };
  }

  // Token expire hoyeche ki check kora hocche
  if (new Date() > new Date(resetRecord.expires_at)) {
    return { valid: false, message: 'Reset token has expired. Please request a new one.' };
  }

  return { valid: true, record: resetRecord };
}

// ==========================================
// markPasswordResetTokenUsed — Password reset hoye gele token mark korbe
// Used token diye abar reset kora jabe na
// ==========================================
async function markPasswordResetTokenUsed(tokenId) {
  await db.update(
    'UPDATE password_resets SET used_at = NOW() WHERE id = ?',
    [tokenId]
  );
}

module.exports = {
  createPasswordResetRequest,
  validatePasswordResetToken,
  markPasswordResetTokenUsed
};
