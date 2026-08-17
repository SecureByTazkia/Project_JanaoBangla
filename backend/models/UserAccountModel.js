// ==========================================
// JanaoBangla — User Account Model
// BRANCH: feature-user-authentication-and-security
// Database e user related sob query ekhane thakbe
// Controller direct SQL likhbe na, model use korbe
// ==========================================

const db = require('../services/DatabaseService');

// ==========================================
// findByEmail — Email diye user khujbe
// Login ar registration duplicate check er jonno
// ==========================================
async function findByEmail(email) {
  // Email case-insensitive search kora hocche
  return db.queryOne(
    'SELECT * FROM users WHERE email = ? AND is_active = 1',
    [email.toLowerCase().trim()]
  );
}

// ==========================================
// findById — ID diye user khujbe
// JWT token er payload e user id thake, sei diye user data newa jonno
// ==========================================
async function findById(userId) {
  // Password hash return hobe na — security er jonno alada query
  return db.queryOne(
    `SELECT id, full_name, email, phone, role, is_verified, is_active, avatar_url, created_at, updated_at
     FROM users WHERE id = ? AND is_active = 1`,
    [userId]
  );
}

// ==========================================
// findByIdWithPassword — Login verification er jonno password hash o nebe
// Shudhu authentication er somoy use korte hobe
// ==========================================
async function findByIdWithPassword(userId) {
  return db.queryOne(
    'SELECT * FROM users WHERE id = ? AND is_active = 1',
    [userId]
  );
}

// ==========================================
// createUser — Noya user register korar jonno
// Password hash insert er age kore nite hobe
// ==========================================
async function createUser({ fullName, email, phone, passwordHash }) {
  // User insert kora hocche, role default 'user' thakbe
  const userId = await db.insert(
    `INSERT INTO users (full_name, email, phone, password_hash, role, is_verified, is_active)
     VALUES (?, ?, ?, ?, 'user', 0, 1)`,
    [fullName, email.toLowerCase().trim(), phone || null, passwordHash]
  );
  return userId;
}

// ==========================================
// updateUserVerifiedStatus — Email verify hoile is_verified = 1 set korbe
// ==========================================
async function updateUserVerifiedStatus(userId) {
  return db.update(
    'UPDATE users SET is_verified = 1, updated_at = NOW() WHERE id = ?',
    [userId]
  );
}

// ==========================================
// updatePassword — Password change ar reset er jonno
// ==========================================
async function updatePassword(userId, newPasswordHash) {
  return db.update(
    'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
    [newPasswordHash, userId]
  );
}

// ==========================================
// updateProfile — Profile update korar jonno
// Full name, phone update kora jabe
// ==========================================
async function updateProfile(userId, { fullName, phone }) {
  return db.update(
    'UPDATE users SET full_name = ?, phone = ?, updated_at = NOW() WHERE id = ?',
    [fullName, phone || null, userId]
  );
}

// ==========================================
// saveEmailVerificationToken — OTP save korbe database e
// Purano token delete kore noya token insert korbe
// ==========================================
async function saveEmailVerificationToken(userId, token, expiresAt) {
  // Purano unused token gulo delete kora hocche
  await db.query(
    'DELETE FROM email_verifications WHERE user_id = ? AND used_at IS NULL',
    [userId]
  );

  // Noya token insert kora hocche
  return db.insert(
    'INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, ?)',
    [userId, token, expiresAt]
  );
}

// ==========================================
// findEmailVerificationToken — OTP valid ki na check korar jonno
// ==========================================
async function findEmailVerificationToken(userId, token) {
  return db.queryOne(
    `SELECT * FROM email_verifications
     WHERE user_id = ? AND token = ? AND used_at IS NULL AND expires_at > NOW()`,
    [userId, token]
  );
}

// ==========================================
// markEmailVerificationTokenUsed — OTP use hoyeche mark korbe
// ==========================================
async function markEmailVerificationTokenUsed(tokenId) {
  return db.update(
    'UPDATE email_verifications SET used_at = NOW() WHERE id = ?',
    [tokenId]
  );
}

// ==========================================
// getAllUsers — Admin dashboard er jonno sob user list
// ==========================================
async function getAllUsers(page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const users = await db.query(
    `SELECT id, full_name, email, phone, role, is_verified, is_active, created_at
     FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const [{ total }] = await db.query('SELECT COUNT(*) as total FROM users');
  return { users, total, page, limit };
}

module.exports = {
  findByEmail,
  findById,
  findByIdWithPassword,
  createUser,
  updateUserVerifiedStatus,
  updatePassword,
  updateProfile,
  saveEmailVerificationToken,
  findEmailVerificationToken,
  markEmailVerificationTokenUsed,
  getAllUsers
};
