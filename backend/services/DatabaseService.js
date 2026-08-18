// ==========================================
// JanaoBangla — Database Service
// BRANCH: main
// Database query korar jonno central service layer
// Ei service use korle sob jagay pool import korte hobe na
// ==========================================

const { pool } = require('../config/DatabaseConnection');

// ==========================================
// query — Generic database query function
// SQL statement ar params niye database e query pathabe
// Result gulo return korbe array hisebe
// ==========================================
async function query(sql, params = []) {
  try {
    // Pool theke connection newa hocche ar query chalano hocche
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    // Query fail hoile error log ar throw kora hocche
    console.error('Database query error:', error.message);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

// ==========================================
// queryOne — Single row return korar jonno
// Result array er prothom element return korbe
// Jodi kono result na thake, null return korbe
// ==========================================
async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  // Array er prothom element return kora hocche, na thakle null
  return rows[0] || null;
}

// ==========================================
// insert — New record insert korar jonno
// insertId return korbe — noya record er ID
// ==========================================
async function insert(sql, params = []) {
  try {
    const [result] = await pool.execute(sql, params);
    // Noya row er auto-generated ID return kora hocche
    return result.insertId;
  } catch (error) {
    console.error('Database insert error:', error.message);
    throw error;
  }
}

// ==========================================
// update — Existing record update korar jonno
// Kototgulo row affected hoyeche ta return korbe
// ==========================================
async function update(sql, params = []) {
  try {
    const [result] = await pool.execute(sql, params);
    // Kototgulo row change hoyeche ta return kora hocche
    return result.affectedRows;
  } catch (error) {
    console.error('Database update error:', error.message);
    throw error;
  }
}

// ==========================================
// remove — Record delete korar jonno
// Kototgulo row delete hoyeche ta return korbe
// ==========================================
async function remove(sql, params = []) {
  try {
    const [result] = await pool.execute(sql, params);
    return result.affectedRows;
  } catch (error) {
    console.error('Database delete error:', error.message);
    throw error;
  }
}

// ==========================================
// transaction — Multiple query ek sathe run korar jonno
// Jodi kono ekta fail kore, sob rollback hobe
// callback function e queries run korte hobe
// ==========================================
async function transaction(callback) {
  // Pool theke connection newa hocche
  const connection = await pool.getConnection();
  try {
    // Transaction shuru kora hocche
    await connection.beginTransaction();

    // Caller er callback function run kora hocche connection diye
    const result = await callback(connection);

    // Sob kicu thik thakle commit kora hocche
    await connection.commit();
    return result;
  } catch (error) {
    // Kono problem hole sob rollback kora hocche
    await connection.rollback();
    console.error('Transaction error, rolling back:', error.message);
    throw error;
  } finally {
    // Jodi kicu hok, connection pool e return kora hocche
    connection.release();
  }
}

module.exports = { query, queryOne, insert, update, remove, transaction };
