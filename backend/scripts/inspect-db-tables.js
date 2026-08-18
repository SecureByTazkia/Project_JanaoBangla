// Ei script ta actual MySQL table structure check korbe
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mysql = require('mysql2/promise');

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });

  // Sob tables list kora hocche
  const [tables] = await pool.execute('SHOW TABLES');
  console.log('=== EXISTING TABLES ===');
  console.log(tables.map(t => Object.values(t)[0]).join(', '));

  // reports, report_evidence, locations describe kora hocche
  for (const tableName of ['reports', 'report_evidence', 'locations']) {
    try {
      const [cols] = await pool.execute('DESCRIBE ' + tableName);
      console.log('\n=== DESCRIBE ' + tableName + ' ===');
      cols.forEach(c => {
        console.log(`  ${c.Field.padEnd(35)} ${c.Type.padEnd(25)} NULL:${c.Null.padEnd(4)} Default:${String(c.Default).padEnd(10)} Key:${c.Key}`);
      });
    } catch(e) {
      console.log('\nTable ' + tableName + ' DOES NOT EXIST:', e.message);
    }
  }

  await pool.end();
  process.exit(0);
}

run().catch(e => { console.error('DB ERROR:', e.message); process.exit(1); });
