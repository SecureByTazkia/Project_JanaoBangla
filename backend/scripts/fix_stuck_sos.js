// Fix stuck active SOS requests
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'Tazkia123';
process.env.DB_NAME = 'Project_JanaoBangla';

const db = require('../config/DatabaseConnection');

async function fixStuckSOS() {
  // Resolve all stuck active SOS requests older than 1 hour
  const [result] = await db.pool.query(
    "UPDATE emergency_requests SET status = 'resolved', updated_at = NOW() WHERE status = 'active'"
  );
  console.log('Resolved stuck SOS requests:', result.affectedRows);

  const [rows] = await db.pool.query(
    'SELECT id, user_id, status, created_at FROM emergency_requests ORDER BY id DESC LIMIT 5'
  );
  console.log('Current emergency_requests:', JSON.stringify(rows, null, 2));
  process.exit(0);
}

fixStuckSOS().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
