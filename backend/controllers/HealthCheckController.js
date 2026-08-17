// ==========================================
// JanaoBangla — Health Check Controller
// BRANCH: main
// Server ar database er health status check korar jonno
// Frontend ba monitoring tool theke call kora jabe
// ==========================================

const { pool } = require('../config/DatabaseConnection');

// ==========================================
// getHealthStatus — Server ar Database status return korbe
// GET /api/health te call hoile ei function run hobe
// Database connected ki na check korbe
// ==========================================
async function getHealthStatus(req, res) {
  try {
    // Database connection check kora hocche
    // Simple SELECT 1 query diye database live ki na bojha jacche
    const [dbResult] = await pool.execute('SELECT 1 AS alive');
    const isDatabaseAlive = dbResult && dbResult[0] && dbResult[0].alive === 1;

    // Server ar database er current status response e pathano hocche
    res.status(200).json({
      success:   true,
      message:   'JanaoBangla API is running',
      timestamp: new Date().toISOString(),
      server: {
        status:    'online',
        version:   '1.0.0',
        node:      process.version,
        env:       process.env.NODE_ENV || 'development',
        uptime:    `${Math.floor(process.uptime())}s`
      },
      database: {
        status:   isDatabaseAlive ? 'connected' : 'disconnected',
        host:     process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'janao_bangla_db'
      }
    });
  } catch (error) {
    // Database connect na hoile error response pathano hocche
    res.status(503).json({
      success:   false,
      message:   'JanaoBangla API is running but database is not available',
      timestamp: new Date().toISOString(),
      server: {
        status: 'online',
        uptime: `${Math.floor(process.uptime())}s`
      },
      database: {
        status: 'disconnected',
        error:  error.message
      }
    });
  }
}

module.exports = { getHealthStatus };
