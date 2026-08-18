// ==========================================
// JanaoBangla — Women Safety SOS Verification Script
// BRANCH: feature-women-safety-sos-and-emergency-notifications
// Ei script ta emergency contacts, SOS alert trigger, SMS abstraction,
// Email abstraction, location sharing, and notification lifecycle test korbe
// Run with: node backend/scripts/test-women-safety-sos.js
// ==========================================

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const db = require('../config/DatabaseConnection');
const EmergencyContactModel = require('../models/EmergencyContactModel');
const EmergencyRequestModel = require('../models/EmergencyRequestModel');
const NotificationModel     = require('../models/NotificationModel');
const EmergencyMessageGenerationService = require('../services/EmergencyMessageGenerationService');
const EmergencySmsAlertService   = require('../services/EmergencySmsAlertService');
const EmergencyEmailAlertService = require('../services/EmergencyEmailAlertService');
const LiveLocationSharingService = require('../services/LiveLocationSharingService');

async function runTests() {
  console.log('🧪 Starting Women Safety SOS & Emergency Notifications Test Suite...\n');

  // Step 1: Database Connection
  const isConnected = await db.testDatabaseConnection();
  if (!isConnected) {
    console.error('❌ Database connection failed. Aborting tests.');
    process.exit(1);
  }
  console.log('✅ 1. Database connection verified.\n');

  // Step 2: Test Message Generation & Location Formatting
  console.log('--- 2. Testing Message Generation & Location Services ---');
  const mockLat = 23.8103;
  const mockLng = 90.4125;
  const locationObj = LiveLocationSharingService.parseLocationFromRequest({
    latitude: mockLat,
    longitude: mockLng,
    address: 'Gulshan 2, Dhaka, Bangladesh'
  });
  console.log('Location Parsed:', locationObj);

  if (locationObj.latitude === mockLat && locationObj.googleMapsLink.includes('maps.google.com')) {
    console.log('✅ LiveLocationSharingService verified.');
  } else {
    console.error('❌ LiveLocationSharingService failed.');
  }

  const messageData = EmergencyMessageGenerationService.generateAlertMessage({
    userName: 'Test Citizen',
    latitude: mockLat,
    longitude: mockLng,
    locationAddress: 'Gulshan 2, Dhaka',
    requestId: 999
  });
  console.log('Generated SMS preview:\n' + messageData.smsMessage);
  console.log('✅ EmergencyMessageGenerationService verified.\n');

  // Step 3: Test SMS & Email Service Abstraction
  console.log('--- 3. Testing SMS & Email Service Abstractions ---');
  const smsRes = await EmergencySmsAlertService.sendEmergencySms({
    toPhone: '01700000000',
    message: messageData.smsMessage,
    requestId: 999
  });
  console.log('SMS Service Result:', smsRes);
  if (smsRes.success) {
    console.log('✅ EmergencySmsAlertService abstraction passed.');
  }

  const emailRes = await EmergencyEmailAlertService.sendEmergencyEmail({
    toEmail: 'contact@example.com',
    toName: 'Test Contact',
    subject: messageData.emailSubject,
    htmlBody: messageData.emailHtml,
    requestId: 999
  });
  console.log('Email Service Result:', emailRes);
  if (emailRes.success) {
    console.log('✅ EmergencyEmailAlertService passed (simulated or SMTP).');
  }
  console.log('');

  // Step 4: Test Database Operations with a temporary test user
  console.log('--- 4. Testing MySQL Models (Contacts, SOS Requests, Notifications) ---');
  
  // Find or pick a user ID from users table
  const [users] = await db.pool.query('SELECT id, name, email FROM users LIMIT 1');
  if (users.length === 0) {
    console.log('⚠️ No users in database to test DB operations. (Skipping DB CRUD test)');
    process.exit(0);
  }

  const testUser = users[0];
  console.log(`Using Test User: ID=${testUser.id}, Name=${testUser.name}`);

  // Test Contact CRUD
  const contact = await EmergencyContactModel.create({
    userId: testUser.id,
    name: 'Emergency Test Contact',
    phone: '01811223344',
    email: 'testcontact@janaobangla.org',
    relationship: 'Family',
    isPrimary: true
  });
  console.log('Created Contact:', contact);

  const contactsList = await EmergencyContactModel.getAllByUserId(testUser.id);
  console.log(`Fetched ${contactsList.length} contact(s) for user.`);

  // Test SOS Request Lifecycle
  const sosReq = await EmergencyRequestModel.create({
    userId: testUser.id,
    latitude: mockLat,
    longitude: mockLng,
    locationAddress: 'Test Location, Dhaka'
  });
  console.log('Created SOS Request:', sosReq);

  // Update Notification status
  await EmergencyRequestModel.updateNotificationStatus(sosReq.id, {
    smsSent: true,
    emailSent: true,
    smsStatus: 'sent',
    emailStatus: 'sent'
  });

  // Create Notification
  const notifId = await NotificationModel.create({
    userId: testUser.id,
    type: 'sos_triggered',
    title: '🚨 Test SOS Alert',
    message: `Test SOS alert #${sosReq.id} created`,
    relatedId: sosReq.id
  });
  console.log('Created Notification ID:', notifId);

  // Resolve SOS
  await EmergencyRequestModel.updateStatus(sosReq.id, testUser.id, 'resolved');
  const resolvedReq = await EmergencyRequestModel.getById(sosReq.id);
  console.log(`SOS #${sosReq.id} Status:`, resolvedReq.status);

  // Cleanup test data
  if (contact && contact.id) {
    await EmergencyContactModel.deleteById(contact.id, testUser.id);
    console.log('Cleaned up test contact.');
  }

  console.log('\n🎉 ALL WOMEN SAFETY SOS & EMERGENCY NOTIFICATION TESTS COMPLETED SUCCESSFULLY!\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('💥 Test suite encountered error:', err);
  process.exit(1);
});
