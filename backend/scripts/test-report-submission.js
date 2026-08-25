// Ei script ta backend ke directly test korbe — JWT generate kore report submit korbe
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const http = require('http');

const run = async () => {
  const { pool } = require('../config/DatabaseConnection');

  // Verified user fetch kora hocche test er jonno
  const [users] = await pool.execute('SELECT id, email, name, role FROM users WHERE is_verified = 1 LIMIT 1');
  if (!users.length) { console.log('No verified users in DB. Register one first.'); process.exit(1); }
  console.log('Found verified user:', users[0].email, '(id:', users[0].id + ')');

  // Valid JWT token generate kora hocche — login bypass kore direct test
  const { generateAccessToken } = require('../services/TokenService');
  const token = generateAccessToken({ id: users[0].id, email: users[0].email, role: users[0].role });
  console.log('Token generated OK');

  // multipart/form-data body manually banano hocche
  const boundary = 'FormBoundaryTest1234';
  const fields = {
    title: '[TEST] Road Damage near Mirpur',
    description: 'Deep pothole causing traffic problems near Mirpur 10 circle',
    category: 'road_damage',
    visibility: 'public',
    latitude: '22.3714',
    longitude: '91.8335',
    address: 'Mirpur 10, Dhaka'
  };

  const parts = [];
  for (const [k, v] of Object.entries(fields)) {
    parts.push(
      '--' + boundary + '\r\n' +
      'Content-Disposition: form-data; name="' + k + '"\r\n\r\n' +
      v + '\r\n'
    );
  }
  parts.push('--' + boundary + '--\r\n');
  const body = parts.join('');
  const bodyBuffer = Buffer.from(body);

  // HTTP request pathano hocche backend e
  const opts = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': bodyBuffer.length,
      'Authorization': 'Bearer ' + token
    }
  };

  const result = await new Promise((resolve, reject) => {
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(bodyBuffer);
    req.end();
  });

  console.log('\nAPI Response Status:', result.status);
  console.log('API Response Body:', JSON.stringify(result.body, null, 2));

  // Report successfully inserted hole DB e verify kora hocche
  if (result.body && result.body.reportId) {
    const [rows] = await pool.execute(
      'SELECT id, title, status, category, visibility, user_id FROM reports WHERE id = ?',
      [result.body.reportId]
    );
    console.log('\n✅ DB RECORD VERIFIED:');
    console.log(JSON.stringify(rows[0], null, 2));
    console.log('\n🎉 REPORT SUBMISSION WORKS CORRECTLY!');
  } else {
    console.log('\n❌ SUBMISSION FAILED — see response above');
  }
};

run().catch(e => {
  console.error('SCRIPT ERROR:', e.message);
  process.exit(1);
});
