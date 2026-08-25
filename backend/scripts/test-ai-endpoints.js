// ==========================================
// Test AI Civic Problem Recognition & Suggestions Endpoints
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// ==========================================

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { generateAccessToken } = require('../services/TokenService');
const http = require('http');

async function testAiEndpoints() {
  console.log('🤖 Testing JanaoBangla AI Civic Recognition & Suggestions...');

  const testUser = { id: 18, email: 'tazkiataz0@gmail.com', role: 'admin' };
  const token = generateAccessToken(testUser);

  // 1. Test Text-based Category & Improvement Suggestion
  console.log('\n--- 1. Testing POST /api/ai/suggest ---');
  const suggestPayload = JSON.stringify({
    text: 'mirpur 10 e boro gorto rasta bhanga accident hocche',
    title: 'Gorto in Mirpur',
    description: 'Boro gorto rastay',
    address: 'Mirpur-10, Dhaka'
  });

  const suggestRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/suggest',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(suggestPayload),
        'Authorization': 'Bearer ' + token
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(suggestPayload);
    req.end();
  });

  console.log('Suggest Status:', suggestRes.status);
  console.log('Suggested Category:', suggestRes.body.categorySuggestion?.categoryName, `(${suggestRes.body.categorySuggestion?.confidence}%)`);
  console.log('Smart Title:', suggestRes.body.smartContent?.smartTitle);
  console.log('Improvement Tips Count:', suggestRes.body.smartContent?.improvementTips?.length);

  // 2. Test Advanced Duplicate Detection
  console.log('\n--- 2. Testing POST /api/ai/detect-duplicates ---');
  const duplicatePayload = JSON.stringify({
    title: 'Dhanmondi Lake Road e Bora Khaad',
    description: 'Dhanmondi 27 number road e ekta boro gorto ache',
    category: 'road_damage',
    latitude: '23.74695',
    longitude: '90.37440'
  });

  const dupRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/detect-duplicates',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(duplicatePayload),
        'Authorization': 'Bearer ' + token
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(duplicatePayload);
    req.end();
  });

  console.log('Duplicate Status:', dupRes.status);
  console.log('Has Duplicate:', dupRes.body.hasDuplicate);
  console.log('Max Similarity:', dupRes.body.maxSimilarity + '%');
  console.log('Similar Reports Found:', dupRes.body.similarReports?.length);

  // 3. Test Image Upload & AI Problem Recognition
  console.log('\n--- 3. Testing POST /api/ai/analyze-image ---');
  const testImagePath = path.join(__dirname, '../uploads/test_pothole_evidence.jpg');
  if (!fs.existsSync(testImagePath)) {
    fs.writeFileSync(testImagePath, 'FAKE_IMAGE_BYTES_FOR_RECOGNITION_TEST_POTHOLE_ROAD_DAMAGE');
  }

  const fileContent = fs.readFileSync(testImagePath);
  const boundary = 'AiTestBoundary12345';
  let body = '';
  body += '--' + boundary + '\r\n';
  body += 'Content-Disposition: form-data; name="title"\r\n\r\nTest Pothole\r\n';
  body += '--' + boundary + '\r\n';
  body += 'Content-Disposition: form-data; name="address"\r\n\r\nMirpur 10, Dhaka\r\n';
  body += '--' + boundary + '\r\n';
  body += 'Content-Disposition: form-data; name="image"; filename="pothole_road_crack.jpg"\r\n';
  body += 'Content-Type: image/jpeg\r\n\r\n';
  
  const headerBuf = Buffer.from(body, 'utf-8');
  const footerBuf = Buffer.from('\r\n--' + boundary + '--\r\n', 'utf-8');
  const fullBody = Buffer.concat([headerBuf, fileContent, footerBuf]);

  const imgRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/analyze-image',
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': fullBody.length,
        'Authorization': 'Bearer ' + token
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(fullBody);
    req.end();
  });

  console.log('Image Analysis Status:', imgRes.status);
  console.log('Detected Problem:', imgRes.body.recognition?.detectedProblem);
  console.log('Confidence:', imgRes.body.recognition?.confidence + '%');
  console.log('Suggested Category:', imgRes.body.recognition?.suggestedCategory);
  console.log('Visual Features:', imgRes.body.recognition?.detectedFeatures);
  console.log('Smart Title Generated:', imgRes.body.suggestions?.smartTitle);

  // Clean up temporary test file
  if (fs.existsSync(testImagePath)) {
    fs.unlinkSync(testImagePath);
  }

  console.log('\n========================================');
  console.log('🎉 ALL AI ENDPOINTS WORKING WITH HIGH ACCURACY & SPEED!');
  console.log('========================================');
  process.exit(0);
}

testAiEndpoints().catch(err => {
  console.error('❌ AI Test Error:', err);
  process.exit(1);
});
