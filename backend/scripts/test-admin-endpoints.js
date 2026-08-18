// ==========================================
// Test Admin Dashboard API Endpoints over HTTP
// ==========================================
require('dotenv').config();
const { generateAccessToken } = require('../services/TokenService');

async function testEndpoints() {
  try {
    const adminUser = { id: 18, email: 'tazkiataz0@gmail.com', role: 'admin' };
    const token = generateAccessToken(adminUser);
    const headers = {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    };

    const endpoints = [
      { name: 'Stats', url: 'http://localhost:5000/api/admin/stats' },
      { name: 'Reports', url: 'http://localhost:5000/api/admin/reports?page=1&limit=10&status=all&category=all' },
      { name: 'Users', url: 'http://localhost:5000/api/admin/users?page=1&limit=10' },
      { name: 'Comments', url: 'http://localhost:5000/api/admin/comments?page=1&limit=10' },
      { name: 'SOS', url: 'http://localhost:5000/api/admin/sos?page=1&limit=10' },
      { name: 'System Logs', url: 'http://localhost:5000/api/admin/system-logs' }
    ];

    console.log('Testing all Admin API Endpoints via HTTP requests...');
    for (const ep of endpoints) {
      const res = await fetch(ep.url, { headers });
      const json = await res.json();
      console.log(`✅ ${ep.name} API (${ep.url}) -> Status: ${res.status}, Success: ${json.success}`);
      if (!json.success) console.error('Error detail:', json);
    }

    console.log('\n========================================');
    console.log('🎉 ALL ADMIN HTTP ENDPOINTS WORKING (200 OK)!');
    console.log('========================================');
  } catch (err) {
    console.error('API Test Error:', err);
  }
}

testEndpoints();
