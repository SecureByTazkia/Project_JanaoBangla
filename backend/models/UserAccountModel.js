// ==========================================
// JanaoBangla — User Account Model
// BRANCH: feature-user-authentication-and-security
// Database e user related sob query ekhane thakbe
// Controller direct SQL likhbe na, model use korbe
// ==========================================

const db = require('../services/DatabaseService');

// ==========================================
// findByEmail — Email diye user khujbe
// Ei function email diye users table theke active user khuje ber kore.
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
// Ei function user ID diye users table theke safe user profile data fetch kore.
// ==========================================
async function findById(userId) {
  return db.queryOne(
    `SELECT id, name, email, phone_number, role, is_verified, is_active, profile_picture, created_at, updated_at
     FROM users WHERE id = ? AND is_active = 1`,
    [userId]
  );
}

// ==========================================
// findByIdWithPassword — Password shoho user fetch korbe
// Ei function user ID diye password soho user-er shob data fetch kore password check korar jonno.
// ==========================================
async function findByIdWithPassword(userId) {
  return db.queryOne(
    'SELECT * FROM users WHERE id = ? AND is_active = 1',
    [userId]
  );
}

// ==========================================
// createUser — Noya user register korar jonno
// Ei function noya user-er data (name, email, phone_number, password, role citizen) database-e save kore.
// ==========================================
async function createUser({ fullName, email, phone, passwordHash }) {
  const userId = await db.insert(
    `INSERT INTO users (name, email, phone_number, password, role, is_verified, is_active)
     VALUES (?, ?, ?, ?, 'citizen', 0, 1)`,
    [fullName, email.toLowerCase().trim(), phone || null, passwordHash]
  );
  return userId;
}

// ==========================================
// updateUserVerifiedStatus — Email verify hoile is_verified = 1 set korbe
// Ei function email verify hole users table-e is_verified = 1 kore verification code clear kore dei.
// ==========================================
async function updateUserVerifiedStatus(userId) {
  return db.update(
    'UPDATE users SET is_verified = 1, verification_code = NULL, verification_expires_at = NULL, updated_at = NOW() WHERE id = ?',
    [userId]
  );
}

// ==========================================
// updatePassword — Password change ar reset er jonno
// Ei function user-er notun hashed password database-e update kore.
// ==========================================
async function updatePassword(userId, newPasswordHash) {
  return db.update(
    'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
    [newPasswordHash, userId]
  );
}

// ==========================================
// updateProfile — Profile update korar jonno (name, phone_number)
// Ei function user-er name ar phone_number database-e update kore.
// ==========================================
async function updateProfile(userId, { fullName, phone }) {
  return db.update(
    'UPDATE users SET name = ?, phone_number = ?, updated_at = NOW() WHERE id = ?',
    [fullName, phone || null, userId]
  );
}

// ==========================================
// saveEmailVerificationToken — OTP save korbe database e
// Ei function verification OTP ar tar expiry time users table-e save kore.
// ==========================================
async function saveEmailVerificationToken(userId, token, expiresAt) {
  return db.update(
    'UPDATE users SET verification_code = ?, verification_expires_at = ?, updated_at = NOW() WHERE id = ?',
    [token, expiresAt, userId]
  );
}

// ==========================================
// findEmailVerificationToken — OTP valid ki na check korar jonno
// Ei function user ID ar verification OTP diye valid code check kore.
// ==========================================
async function findEmailVerificationToken(userId, token) {
  return db.queryOne(
    `SELECT id, name, email, verification_code, verification_expires_at
     FROM users
     WHERE id = ? AND verification_code = ? AND verification_expires_at > NOW()`,
    [userId, token]
  );
}

// ==========================================
// markEmailVerificationTokenUsed — OTP used mark korbe
// Ei function verification code clear kore user-ke verified hisebe mark kore.
// ==========================================
async function markEmailVerificationTokenUsed(userId) {
  return db.update(
    'UPDATE users SET is_verified = 1, verification_code = NULL, verification_expires_at = NULL, updated_at = NOW() WHERE id = ?',
    [userId]
  );
}

// ==========================================
// getAllUsers — Admin user list er jonno
// Ei function admin panel-er jonno pagination soho shob user-er list niye ashe.
// ==========================================
async function getAllUsers(page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const users = await db.query(
    `SELECT id, name, email, phone_number, role, is_verified, is_active, profile_picture, created_at
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
