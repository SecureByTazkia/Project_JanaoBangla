// ==========================================
// JanaoBangla — Database Connection Config
// BRANCH: main
// MySQL connection pool create kora hocche ekhane
// Pool use korle multiple request ek sathe handle korte pare
// ==========================================

const mysql = require('mysql2/promise');

// .env theke database configuration newa hocche
const dbConfig = {
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'janao_bangla_db',
  waitForConnections: true,
  connectionLimit:    10,       // Ek sathe maximum 10ta connection thakbe pool e
  queueLimit:         0,        // Unlimited queue
  charset:            'utf8mb4' // Bangla text support korar jonno utf8mb4
};

// MySQL connection pool create kora hocche
// Pool mane ek group of connections ready thakbe
const pool = mysql.createPool(dbConfig);

// ==========================================
// testDatabaseConnection — Database live ki na check korbe
// Server start hole ei function call hobe
// ==========================================
async function testDatabaseConnection() {
  try {
    // Pool theke ekta connection newa hocche test korar jonno
    const connection = await pool.getConnection();

    console.log('✅ MySQL database connection successful');
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);

    // Test shesh, connection release kora hocche pool e firiye dite
    connection.release();

    return true;
  } catch (error) {
    // Database connect na hoile error show korbe, server ki band hobe bolbe
    console.error('❌ MySQL database connection failed:', error.message);
    console.error('   Please check your .env DB_* settings and ensure MySQL is running');
    return false;
  }
}

module.exports = { pool, testDatabaseConnection };
