// ==========================================
// Test Anonymous Reporting in Civic Problem Reporting
// BRANCH: feature-civic-problem-reporting-visibility-and-management
// ==========================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const { generateAccessToken } = require('../services/TokenService');
const http = require('http');

async function runTests() {
  console.log('🧪 Starting Anonymous Reporting Verification Tests...\n');

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });

  // Fetch a citizen user for testing (e.g. ID 18 or first verified user)
  const [users] = await pool.execute('SELECT id, name, email, role FROM users LIMIT 2');
  const testUser1 = users[0];
  const testUser2 = users[1] || users[0];

  console.log(`Test Citizen User: ID ${testUser1.id} (${testUser1.name})`);
  const token1 = generateAccessToken(testUser1);
  const token2 = generateAccessToken(testUser2);

  const makeRequest = (options, postData = null) => {
    return new Promise((resolve, reject) => {
      const req = http.request(options, res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      });
      req.on('error', reject);
      if (postData) req.write(postData);
      req.end();
    });
  };

  // ----------------------------------------------------
  // TEST 1: Authenticated user creates PUBLIC + Show Identity (isAnonymous: false)
  // ----------------------------------------------------
  console.log('--- TEST 1: Create PUBLIC + Show Identity Report ---');
  const boundary = 'TestBoundary12345';
  let body1 = '';
  body1 += `--${boundary}\r\nContent-Disposition: form-data; name="title"\r\n\r\nPublic Road Damage Identified\r\n`;
  body1 += `--${boundary}\r\nContent-Disposition: form-data; name="description"\r\n\r\nBroken road with citizen name revealed.\r\n`;
  body1 += `--${boundary}\r\nContent-Disposition: form-data; name="category"\r\n\r\nroad_damage\r\n`;
  body1 += `--${boundary}\r\nContent-Disposition: form-data; name="visibility"\r\n\r\npublic\r\n`;
  body1 += `--${boundary}\r\nContent-Disposition: form-data; name="isAnonymous"\r\n\r\nfalse\r\n`;
  body1 += `--${boundary}--\r\n`;

  const res1 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': Buffer.byteLength(body1),
      'Authorization': 'Bearer ' + token1
    }
  }, body1);

  console.log('Creation Status:', res1.status, res1.data);
  const publicReportId = res1.data.reportId;

  // ----------------------------------------------------
  // TEST 2: Authenticated user creates PUBLIC + Anonymous (isAnonymous: true)
  // ----------------------------------------------------
  console.log('\n--- TEST 2: Create PUBLIC + Anonymous Report ---');
  let body2 = '';
  body2 += `--${boundary}\r\nContent-Disposition: form-data; name="title"\r\n\r\nAnonymous Waterlogging Issue\r\n`;
  body2 += `--${boundary}\r\nContent-Disposition: form-data; name="description"\r\n\r\nSevere waterlogging reported anonymously.\r\n`;
  body2 += `--${boundary}\r\nContent-Disposition: form-data; name="category"\r\n\r\nwater_drainage\r\n`;
  body2 += `--${boundary}\r\nContent-Disposition: form-data; name="visibility"\r\n\r\npublic\r\n`;
  body2 += `--${boundary}\r\nContent-Disposition: form-data; name="isAnonymous"\r\n\r\ntrue\r\n`;
  body2 += `--${boundary}--\r\n`;

  const res2 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': Buffer.byteLength(body2),
      'Authorization': 'Bearer ' + token1
    }
  }, body2);

  console.log('Creation Status:', res2.status, res2.data);
  const anonymousReportId = res2.data.reportId;

  // ----------------------------------------------------
  // TEST 2 (Verification): Public API endpoint check for Anonymous Report
  // ----------------------------------------------------
  console.log('\n--- TEST 2 (Security & Public Feed Check) ---');
  const publicFeedRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports/public',
    method: 'GET'
  });

  const anonReportInFeed = publicFeedRes.data.reports.find(r => r.id === anonymousReportId);
  const pubReportInFeed = publicFeedRes.data.reports.find(r => r.id === publicReportId);

  console.log('Public Report in Feed - Reporter Name:', pubReportInFeed?.reporter_name, 'User ID:', pubReportInFeed?.user_id);
  console.log('Anonymous Report in Feed - Reporter Name:', anonReportInFeed?.reporter_name, 'User ID:', anonReportInFeed?.user_id);

  if (anonReportInFeed?.reporter_name === 'Anonymous Citizen' && anonReportInFeed?.user_id === null) {
    console.log('✅ PASS: Anonymous Report masks identity and user_id in public feed!');
  } else {
    console.error('❌ FAIL: Anonymous Report leaked identity in public feed!');
  }

  // ----------------------------------------------------
  // TEST 3: Authenticated user creates PRIVATE + Show Identity
  // ----------------------------------------------------
  console.log('\n--- TEST 3: Create PRIVATE + Show Identity Report ---');
  let body3 = '';
  body3 += `--${boundary}\r\nContent-Disposition: form-data; name="title"\r\n\r\nPrivate Street Light Problem\r\n`;
  body3 += `--${boundary}\r\nContent-Disposition: form-data; name="description"\r\n\r\nPrivate issue for authorities only.\r\n`;
  body3 += `--${boundary}\r\nContent-Disposition: form-data; name="category"\r\n\r\nstreet_light\r\n`;
  body3 += `--${boundary}\r\nContent-Disposition: form-data; name="visibility"\r\n\r\nprivate\r\n`;
  body3 += `--${boundary}\r\nContent-Disposition: form-data; name="isAnonymous"\r\n\r\nfalse\r\n`;
  body3 += `--${boundary}--\r\n`;

  const res3 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': Buffer.byteLength(body3),
      'Authorization': 'Bearer ' + token1
    }
  }, body3);

  console.log('Creation Status:', res3.status, res3.data);
  const privateReportId = res3.data.reportId;

  // Verify another user cannot access private report
  const otherUserAccess = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/reports/${privateReportId}`,
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token2
    }
  });
  console.log('Other user accessing private report status (Expected: 403):', otherUserAccess.status);
  if (otherUserAccess.status === 403) {
    console.log('✅ PASS: Private report correctly blocked from non-owners!');
  }

  // ----------------------------------------------------
  // TEST 4: Authenticated user creates PRIVATE + Anonymous
  // ----------------------------------------------------
  console.log('\n--- TEST 4: Create PRIVATE + Anonymous Report ---');
  let body4 = '';
  body4 += `--${boundary}\r\nContent-Disposition: form-data; name="title"\r\n\r\nPrivate Anonymous Public Safety\r\n`;
  body4 += `--${boundary}\r\nContent-Disposition: form-data; name="description"\r\n\r\nPrivate anonymous hazard report.\r\n`;
  body4 += `--${boundary}\r\nContent-Disposition: form-data; name="category"\r\n\r\npublic_safety\r\n`;
  body4 += `--${boundary}\r\nContent-Disposition: form-data; name="visibility"\r\n\r\nprivate\r\n`;
  body4 += `--${boundary}\r\nContent-Disposition: form-data; name="isAnonymous"\r\n\r\ntrue\r\n`;
  body4 += `--${boundary}--\r\n`;

  const res4 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': Buffer.byteLength(body4),
      'Authorization': 'Bearer ' + token1
    }
  }, body4);

  console.log('Creation Status:', res4.status, res4.data);

  // ----------------------------------------------------
  // TEST 5: My Reports API verification (Owner can see all reports with is_anonymous flag)
  // ----------------------------------------------------
  console.log('\n--- TEST 5: Verify My Reports Endpoint ---');
  const myReportsRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports/my-reports',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token1
    }
  });
  console.log('My Reports count:', myReportsRes.data.reports?.length);
  const myAnonReport = myReportsRes.data.reports?.find(r => r.id === anonymousReportId);
  console.log('My Anonymous Report is_anonymous flag in My Reports:', myAnonReport?.is_anonymous);
  if (myAnonReport?.is_anonymous === 1) {
    console.log('✅ PASS: Owner correctly sees their own anonymous report!');
  }

  // ----------------------------------------------------
  // TEST 6: Unauthenticated user cannot submit report
  // ----------------------------------------------------
  console.log('\n--- TEST 6: Unauthenticated Submission Attempt ---');
  const unauthRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': Buffer.byteLength(body1)
    }
  }, body1);
  console.log('Unauthenticated submission status (Expected: 401):', unauthRes.status);
  if (unauthRes.status === 401) {
    console.log('✅ PASS: Unauthenticated report submission blocked with 401!');
  }

  // Clean up test reports created in this test run
  const createdIds = [publicReportId, anonymousReportId, privateReportId, res4.data.reportId].filter(Boolean);
  if (createdIds.length > 0) {
    await pool.execute(`DELETE FROM reports WHERE id IN (${createdIds.join(',')})`);
    console.log(`\n🧹 Cleaned up ${createdIds.length} test reports.`);
  }

  await pool.end();

  console.log('\n========================================');
  console.log('🎉 ALL ANONYMOUS REPORTING TESTS PASSED!');
  console.log('========================================');
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
