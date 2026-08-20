// ==========================================
// JanaoBangla — Emergency Contact Model
// BRANCH: feature-women-safety-sos-and-emergency-notifications
// Ei file ta emergency_contacts table er sob database operation handle korbe
// User er trusted contacts add, update, delete, fetch — sob ekhane
// ==========================================

const db = require('../config/DatabaseConnection');

// ==========================================
// getAllByUserId — Ekta user er sob emergency contacts fetch kora
// User SOS page e contact list dekhate ei function call hobe
// ==========================================
async function getAllByUserId(userId) {
  // User er sob emergency contacts fetch kora hocche, contact_name ar phone_number alias sahit
  const [rows] = await db.pool.query(
    `SELECT id, user_id, contact_name AS name, phone_number AS phone, email, relationship, is_primary, created_at, updated_at
     FROM emergency_contacts
     WHERE user_id = ?
     ORDER BY is_primary DESC, created_at ASC`,
    [userId]
  );
  return rows;
}

// ==========================================
// getByIdAndUserId — Specific contact fetch kora (ownership check sহ)
// Update ba delete er age verify korbe je contact ta user er nijer
// ==========================================
async function getByIdAndUserId(contactId, userId) {
  // Specific contact ta ei user er kina check kora hocche
  const [rows] = await db.pool.query(
    `SELECT id, user_id, contact_name AS name, phone_number AS phone, email, relationship, is_primary, created_at, updated_at
     FROM emergency_contacts
     WHERE id = ? AND user_id = ?`,
    [contactId, userId]
  );
  return rows[0] || null;
}

// ==========================================
// create — Notun emergency contact add kora
// Form submit hoile ei function call hobe
// ==========================================
async function create({ userId, name, phone, email, relationship, isPrimary }) {
  // Jodi is_primary = 1 set kora hoy, tobe age onno sober primary false kore dewa hobe
  if (isPrimary) {
    await db.pool.query(
      `UPDATE emergency_contacts SET is_primary = 0 WHERE user_id = ?`,
      [userId]
    );
  }

  // Notun contact insert kora hocche database e (contact_name, phone_number)
  const [result] = await db.pool.query(
    `INSERT INTO emergency_contacts (user_id, contact_name, phone_number, email, relationship, is_primary)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, name, phone, email || null, relationship || null, isPrimary ? 1 : 0]
  );

  // Newly created contact er full data return kora hocche
  return getByIdAndUserId(result.insertId, userId);
}

// ==========================================
// update — Existing contact er information update kora
// User edit form submit korle ei function call hobe
// ==========================================
async function update(contactId, userId, { name, phone, email, relationship, isPrimary }) {
  // Jodi is_primary = 1 set kora hoy, tobe onno contacts er primary false hobe
  if (isPrimary) {
    await db.pool.query(
      `UPDATE emergency_contacts SET is_primary = 0 WHERE user_id = ? AND id != ?`,
      [userId, contactId]
    );
  }

  // Contact er data update kora hocche
  await db.pool.query(
    `UPDATE emergency_contacts
     SET contact_name = ?, phone_number = ?, email = ?, relationship = ?, is_primary = ?, updated_at = NOW()
     WHERE id = ? AND user_id = ?`,
    [name, phone, email || null, relationship || null, isPrimary ? 1 : 0, contactId, userId]
  );

  // Updated contact data return kora hocche
  return getByIdAndUserId(contactId, userId);
}

// ==========================================
// deleteById — Emergency contact delete kora
// User ei contact ar rakhte chai na
// ==========================================
async function deleteById(contactId, userId) {
  // Contact delete kora hocche, user_id check kore ownership verify kora hocche
  const [result] = await db.pool.query(
    `DELETE FROM emergency_contacts WHERE id = ? AND user_id = ?`,
    [contactId, userId]
  );
  // Koto row affect hoyeche seta return kora hocche
  return result.affectedRows;
}

// ==========================================
// countByUserId — User er total contact count
// Max limit check er jonno use hobe (optional)
// ==========================================
async function countByUserId(userId) {
  // User er koto contact ache count kora hocche
  const [rows] = await db.pool.query(
    `SELECT COUNT(*) as total FROM emergency_contacts WHERE user_id = ?`,
    [userId]
  );
  return rows[0].total;
}

module.exports = {
  getAllByUserId,
  getByIdAndUserId,
  create,
  update,
  deleteById,
  countByUserId
};
