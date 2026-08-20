// ==========================================
// JanaoBangla — Women Safety SOS Controller
// BRANCH: feature-women-safety-sos-and-emergency-notifications
// Ei controller ta SOS trigger, resolve, cancel, history handle korbe
// Emergency flow er main logic ekhane ache
// ==========================================

const EmergencyRequestModel    = require('../models/EmergencyRequestModel');
const EmergencyContactModel    = require('../models/EmergencyContactModel');
const NotificationModel        = require('../models/NotificationModel');
const EmergencyMessageGenerationService = require('../services/EmergencyMessageGenerationService');
const EmergencyEmailAlertService = require('../services/EmergencyEmailAlertService');
const EmergencySmsAlertService   = require('../services/EmergencySmsAlertService');
const LiveLocationSharingService = require('../services/LiveLocationSharingService');

// ==========================================
// triggerSOS — User SOS button press korle ei function call hobe
// POST /api/sos/trigger
// GPS location nebe, contacts ke SMS/Email pathabe, DB e record rakhbe
// ==========================================
async function triggerSOS(req, res) {
  try {
    // Logged-in user er ID ar info JWT theke newa hocche
    const userId   = req.user.id;
    const userName = req.user.name || 'JanaoBangla User';

    // Location data request theke parse kora hocche
    const locationData = LiveLocationSharingService.parseLocationFromRequest(req.body);

    // User er active SOS already ache kina check kora hocche (duplicate prevent)
    const existingActive = await EmergencyRequestModel.getActiveByUserId(userId);
    if (existingActive) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active SOS request. Please resolve it before sending a new one.',
        data: { existingRequestId: existingActive.id }
      });
    }

    // Emergency request database e create kora hocche
    const emergencyRequest = await EmergencyRequestModel.create({
      userId,
      latitude:        locationData.latitude,
      longitude:       locationData.longitude,
      locationAddress: locationData.locationString
    });

    // User er sob emergency contacts fetch kora hocche
    const contacts = await EmergencyContactModel.getAllByUserId(userId);

    // Notification status track korte variable rakha hocche
    let smsSent   = false;
    let emailSent = false;
    let smsStatus   = 'no_contacts';
    let emailStatus = 'no_contacts';

    // Jodi contact ache tahole notification pathano hobe
    if (contacts.length > 0) {
      // Alert message tৈri kora hocche
      const messageData = EmergencyMessageGenerationService.generateAlertMessage({
        userName,
        latitude:        locationData.latitude,
        longitude:       locationData.longitude,
        locationAddress: locationData.locationString,
        requestId:       emergencyRequest.id,
        frontendUrl:     process.env.FRONTEND_URL || 'http://localhost:5173'
      });

      // SMS pathano hocche sob contacts ke (parallel er bodole sequential, safe)
      const smsResult = await EmergencySmsAlertService.sendBulkEmergencySms({
        contacts,
        message:   messageData.smsMessage,
        requestId: emergencyRequest.id
      });

      // Email pathano hocche sob contacts ke
      const emailResult = await EmergencyEmailAlertService.sendBulkEmergencyEmails({
        contacts,
        subject:   messageData.emailSubject,
        htmlBody:  messageData.emailHtml,
        requestId: emergencyRequest.id
      });

      // Notification status update kora hocche
      smsSent   = smsResult.successCount   > 0;
      emailSent = emailResult.successCount > 0;
      smsStatus   = smsSent   ? 'sent'   : 'failed';
      emailStatus = emailSent ? 'sent'   : 'failed';

    } else {
      // Contact na thakle warning log kora hocche
      console.warn(`⚠️  User ${userId} triggered SOS but has no emergency contacts!`);
    }

    // Emergency request er notification status update kora hocche
    await EmergencyRequestModel.updateNotificationStatus(emergencyRequest.id, {
      smsSent,
      emailSent,
      smsStatus,
      emailStatus
    });

    // User er notification feed e SOS alert notification jog kora hocche (type: emergency_alert)
    await NotificationModel.create({
      userId,
      type:      'emergency_alert',
      title:     '🚨 SOS Alert Sent',
      message:   `Your emergency SOS alert #SOS-${emergencyRequest.id} has been sent to ${contacts.length} contact(s).`,
      relatedId: emergencyRequest.id
    });

    // Final updated request data return kora hocche
    const updatedRequest = await EmergencyRequestModel.getById(emergencyRequest.id);

    console.log(`🚨 SOS triggered by user ${userId} (${userName}). Request ID: ${emergencyRequest.id}`);

    res.status(201).json({
      success: true,
      message: 'SOS alert sent successfully',
      data: {
        request:          updatedRequest,
        contactsNotified: contacts.length,
        smsSent,
        emailSent,
        smsStatus,
        emailStatus,
        location:         locationData
      }
    });

  } catch (error) {
    // SOS trigger fail hoile critical error log kora hocche
    console.error('triggerSOS CRITICAL ERROR:', error);
    res.status(500).json({ success: false, message: 'Failed to trigger SOS alert. Please try again.' });
  }
}

// ==========================================
// resolveSOS — SOS request resolve kora (user safe ache)
// PUT /api/sos/:id/resolve
// ==========================================
async function resolveSOS(req, res) {
  try {
    // Request ID URL theke ar user ID JWT theke newa hocche
    const requestId = parseInt(req.params.id);
    const userId    = req.user.id;
    const userName  = req.user.name || 'JanaoBangla User';

    // SOS request exist kore kina check kora hocche
    const existing = await EmergencyRequestModel.getById(requestId);
    if (!existing || existing.user_id !== userId) {
      return res.status(404).json({ success: false, message: 'SOS request not found' });
    }

    // Already resolved/cancelled kina check kora hocche
    if (existing.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `SOS request is already ${existing.status}`
      });
    }

    // Status 'resolved' e update kora hocche
    await EmergencyRequestModel.updateStatus(requestId, userId, 'resolved');

    // User notification e resolved message jog kora hocche (type: emergency_alert)
    await NotificationModel.create({
      userId,
      type:      'emergency_alert',
      title:     '✅ SOS Alert Resolved',
      message:   `Your SOS alert #SOS-${requestId} has been marked as resolved. Stay safe!`,
      relatedId: requestId
    });

    console.log(`✅ SOS #${requestId} resolved by user ${userId} (${userName})`);

    res.json({
      success: true,
      message: 'SOS alert resolved successfully',
      data: { requestId, status: 'resolved' }
    });

  } catch (error) {
    // Resolve fail hoile error pathano hocche
    console.error('resolveSOS error:', error);
    res.status(500).json({ success: false, message: 'Failed to resolve SOS alert' });
  }
}

// ==========================================
// cancelSOS — SOS request cancel kora (false alarm)
// PUT /api/sos/:id/cancel
// ==========================================
async function cancelSOS(req, res) {
  try {
    // Request ID URL theke ar user ID JWT theke newa hocche
    const requestId = parseInt(req.params.id);
    const userId    = req.user.id;

    // SOS request exist kore kina check kora hocche
    const existing = await EmergencyRequestModel.getById(requestId);
    if (!existing || existing.user_id !== userId) {
      return res.status(404).json({ success: false, message: 'SOS request not found' });
    }

    // Already resolved/cancelled kina check kora hocche
    if (existing.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `SOS request is already ${existing.status}`
      });
    }

    // Status 'cancelled' e update kora hocche
    await EmergencyRequestModel.updateStatus(requestId, userId, 'cancelled');

    // User notification e cancel message jog kora hocche (type: emergency_alert)
    await NotificationModel.create({
      userId,
      type:      'emergency_alert',
      title:     '❌ SOS Alert Cancelled',
      message:   `Your SOS alert #SOS-${requestId} has been cancelled.`,
      relatedId: requestId
    });

    console.log(`❌ SOS #${requestId} cancelled by user ${userId}`);

    res.json({
      success: true,
      message: 'SOS alert cancelled successfully',
      data: { requestId, status: 'cancelled' }
    });

  } catch (error) {
    // Cancel fail hoile error pathano hocche
    console.error('cancelSOS error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel SOS alert' });
  }
}

// ==========================================
// getSOSHistory — User er sob SOS history fetch kora
// GET /api/sos/history
// ==========================================
async function getSOSHistory(req, res) {
  try {
    // Logged-in user er ID JWT theke newa hocche
    const userId = req.user.id;
    const limit  = Math.min(parseInt(req.query.limit)  || 10, 50);
    const offset = parseInt(req.query.offset) || 0;

    // User er SOS history fetch kora hocche
    const [history, total] = await Promise.all([
      EmergencyRequestModel.getByUserId(userId, limit, offset),
      EmergencyRequestModel.countByUserId(userId)
    ]);

    res.json({
      success: true,
      message: 'SOS history fetched successfully',
      data: {
        requests: history,
        total,
        limit,
        offset
      }
    });

  } catch (error) {
    // History fetch fail hoile error pathano hocche
    console.error('getSOSHistory error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch SOS history' });
  }
}

// ==========================================
// getSOSById — Single SOS request er detail fetch kora
// GET /api/sos/:id
// ==========================================
async function getSOSById(req, res) {
  try {
    // Request ID URL theke ar user ID JWT theke newa hocche
    const requestId = parseInt(req.params.id);
    const userId    = req.user.id;

    // SOS request fetch kora hocche
    const request = await EmergencyRequestModel.getById(requestId);

    // Request na paile ba onner request hole 404
    if (!request || request.user_id !== userId) {
      return res.status(404).json({ success: false, message: 'SOS request not found' });
    }

    res.json({
      success: true,
      data: { request }
    });

  } catch (error) {
    // Fetch fail hoile error pathano hocche
    console.error('getSOSById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch SOS request' });
  }
}

// ==========================================
// getActiveSOSStatus — User er current active SOS status
// GET /api/sos/active
// Frontend SOS button state manage korar jonno
// ==========================================
async function getActiveSOSStatus(req, res) {
  try {
    // Logged-in user er ID JWT theke newa hocche
    const userId = req.user.id;

    // User er active SOS ache kina check kora hocche
    const activeRequest = await EmergencyRequestModel.getActiveByUserId(userId);

    res.json({
      success: true,
      data: {
        hasActiveSOS: Boolean(activeRequest),
        activeRequest: activeRequest || null
      }
    });

  } catch (error) {
    // Status check fail hoile error pathano hocche
    console.error('getActiveSOSStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to check SOS status' });
  }
}

module.exports = {
  triggerSOS,
  resolveSOS,
  cancelSOS,
  getSOSHistory,
  getSOSById,
  getActiveSOSStatus
};
