// ==========================================
// JanaoBangla — Emergency Request Model
// BRANCH: feature-women-safety-sos-and-emergency-notifications
// Ei file ta emergency_requests table er sob database operation handle korbe
// SOS trigger, resolve, cancel, history — sob ekhane
// ==========================================

const db = require('../config/DatabaseConnection');

// ==========================================
// create — Notun SOS emergency request create kora
// User SOS button press korle ei function call hobe
// ==========================================
async function create({ userId, latitude, longitude, locationAddress }) {
  // Emergency request database e insert kora hocche, status default 'active'
  const [result] = await db.pool.query(
    `INSERT INTO emergency_requests (user_id, latitude, longitude, address, status)
     VALUES (?, ?, ?, ?, 'active')`,
    [userId, latitude || null, longitude || null, locationAddress || null]
  );
  // Newly created request er data return kora hocche
  return getById(result.insertId);
}

// ==========================================
// getById — Single SOS request fetch kora by ID
// Status check ba details dekhate use hobe
// ==========================================
async function getById(requestId) {
  // Specific SOS request ta fetch kora hocche
  const [rows] = await db.pool.query(
    `SELECT er.id, er.user_id, er.latitude, er.longitude, er.address, er.address AS location_address,
            er.status, er.created_at, er.updated_at,
            u.name as user_name, u.phone_number as user_phone, u.email as user_email
     FROM emergency_requests er
     JOIN users u ON er.user_id = u.id
     WHERE er.id = ?`,
    [requestId]
  );
  return rows[0] || null;
}

// ==========================================
// getByUserId — User er sob SOS history fetch kora
// User er previous SOS requests dekhate use hobe
// ==========================================
async function getByUserId(userId, limit = 10, offset = 0) {
  // User er SOS history fetch kora hocche, latest age ashbe
  const [rows] = await db.pool.query(
    `SELECT id, user_id, latitude, longitude, address, address AS location_address,
            status, created_at, updated_at
     FROM emergency_requests
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  return rows;
}

// ==========================================
// getActiveByUserId — User er current active SOS request
// Duplicate SOS prevent korar jonno check kora hobe
// ==========================================
async function getActiveByUserId(userId) {
  // User er active SOS ache kina check kora hocche
  const [rows] = await db.pool.query(
    `SELECT id, status, created_at FROM emergency_requests
     WHERE user_id = ? AND status = 'active'
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

// ==========================================
// updateStatus — SOS request er status update kora
// Resolve ba cancel korar jonno use hobe
// ==========================================
async function updateStatus(requestId, userId, status) {
  // Status update kora hocche
  const [result] = await db.pool.query(
    `UPDATE emergency_requests
     SET status = ?, updated_at = NOW()
     WHERE id = ? AND user_id = ?`,
    [status, requestId, userId]
  );
  return result.affectedRows;
}

// ==========================================
// updateNotificationStatus — SMS/Email sent status update kora
// Notification pathano hoile ei function call hobe
// ==========================================
async function updateNotificationStatus(requestId, { smsSent, emailSent, smsStatus, emailStatus }) {
  // SOS request er updated_at timestamp update kora hocche
  try {
    await db.pool.query(
      `UPDATE emergency_requests SET updated_at = NOW() WHERE id = ?`,
      [requestId]
    );
  } catch (err) {
    console.warn('updateNotificationStatus warning:', err.message);
  }
}

// ==========================================
// getAllForAdmin — Admin er jonno sob SOS requests fetch kora
// Admin dashboard e monitoring section e dekhabe
// ==========================================
async function getAllForAdmin(limit = 50, offset = 0, status = null) {
  // Admin er jonno sob SOS requests fetch kora hocche, optional status filter
  let query = `
    SELECT er.id, er.user_id, er.latitude, er.longitude, er.address, er.address AS location_address,
           er.status, er.created_at, er.updated_at,
           u.name as user_name, u.phone_number as user_phone, u.email as user_email
    FROM emergency_requests er
    JOIN users u ON er.user_id = u.id
  `;
  const params = [];

  if (status) {
    query += ' WHERE er.status = ?';
    params.push(status);
  }

  query += ' ORDER BY er.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [rows] = await db.pool.query(query, params);
  return rows;
}

// ==========================================
// countByUserId — User er total SOS count
// History pagination er jonno use hobe
// ==========================================
async function countByUserId(userId) {
  // User er koto SOS request ache count kora hocche
  const [rows] = await db.pool.query(
    `SELECT COUNT(*) as total FROM emergency_requests WHERE user_id = ?`,
    [userId]
  );
  return rows[0].total;
}

module.exports = {
  create,
  getById,
  getByUserId,
  getActiveByUserId,
  updateStatus,
  updateNotificationStatus,
  getAllForAdmin,
  countByUserId
};
