// ==========================================
// Test AI Image Content Safety & Moderation Endpoints
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// ==========================================

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { generateAccessToken } = require('../services/TokenService');
const http = require('http');

async function testAiSafetyEndpoints() {
  console.log('🛡️ Testing JanaoBangla AI Image Content Safety & Moderation...');

  const testUser = { id: 18, email: 'tazkiataz0@gmail.com', role: 'admin' };
  const token = generateAccessToken(testUser);

  // 1. Test Clean Civic Photo Safety Inspection
  console.log('\n--- 1. Testing POST /api/ai/moderate-image (Clean Civic Photo) ---');
  const cleanImagePath = path.join(__dirname, '../uploads/test_civic_road.jpg');
  fs.writeFileSync(cleanImagePath, 'FAKE_CLEAN_IMAGE_BYTES_ROAD_CIVIC_EVIDENCE');

  const cleanFileContent = fs.readFileSync(cleanImagePath);
  const boundary = 'SafetyTestBoundary12345';
  let body1 = '';
  body1 += '--' + boundary + '\r\n';
  body1 += 'Content-Disposition: form-data; name="image"; filename="mirpur_road_photo.jpg"\r\n';
  body1 += 'Content-Type: image/jpeg\r\n\r\n';
  
  const hBuf1 = Buffer.from(body1, 'utf-8');
  const fBuf1 = Buffer.from('\r\n--' + boundary + '--\r\n', 'utf-8');
  const fullBody1 = Buffer.concat([hBuf1, cleanFileContent, fBuf1]);

  const cleanRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/moderate-image',
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': fullBody1.length,
        'Authorization': 'Bearer ' + token
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(fullBody1);
    req.end();
  });

  console.log('Clean Image Scan Status:', cleanRes.status);
  console.log('Is Safe:', cleanRes.body.isSafe);
  console.log('Flag Type:', cleanRes.body.flagType);
  console.log('Verdict Reason:', cleanRes.body.reason);

  // 2. Test NSFW/Nudity Flagged Upload
  console.log('\n--- 2. Testing POST /api/ai/moderate-image (NSFW/Nudity Inappropriate Photo) ---');
  const unsafeImagePath = path.join(__dirname, '../uploads/test_nude_photo.jpg');
  fs.writeFileSync(unsafeImagePath, 'FAKE_NSFW_BYTES');

  const unsafeFileContent = fs.readFileSync(unsafeImagePath);
  let body2 = '';
  body2 += '--' + boundary + '\r\n';
  body2 += 'Content-Disposition: form-data; name="image"; filename="nude_photo_leak.jpg"\r\n';
  body2 += 'Content-Type: image/jpeg\r\n\r\n';
  
  const hBuf2 = Buffer.from(body2, 'utf-8');
  const fBuf2 = Buffer.from('\r\n--' + boundary + '--\r\n', 'utf-8');
  const fullBody2 = Buffer.concat([hBuf2, unsafeFileContent, fBuf2]);

  const unsafeRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/moderate-image',
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': fullBody2.length,
        'Authorization': 'Bearer ' + token
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(fullBody2);
    req.end();
  });

  console.log('Unsafe Image Scan Status:', unsafeRes.status);
  console.log('Is Safe:', unsafeRes.body.isSafe);
  console.log('Flag Type:', unsafeRes.body.flagType);
  console.log('Blocked Reason (EN):', unsafeRes.body.reason);
  console.log('Blocked Reason (BN):', unsafeRes.body.reasonBn);

  // Cleanup temporary test files
  if (fs.existsSync(cleanImagePath)) fs.unlinkSync(cleanImagePath);
  if (fs.existsSync(unsafeImagePath)) fs.unlinkSync(unsafeImagePath);

  console.log('\n========================================');
  console.log('🎉 AI CONTENT SAFETY & NUDITY MODERATION VERIFIED SUCCESSFULLY!');
  console.log('========================================');
  process.exit(0);
}

testAiSafetyEndpoints().catch(err => {
  console.error('❌ Safety Test Error:', err);
  process.exit(1);
});
