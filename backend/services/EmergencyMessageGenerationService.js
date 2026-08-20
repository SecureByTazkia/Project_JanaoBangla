// ==========================================
// JanaoBangla — Emergency Message Generation Service
// BRANCH: feature-women-safety-sos-and-emergency-notifications
// Ei service ta emergency alert message body tৈri korbe
// SMS ar email duyei ei template use hobe
// ==========================================

// ==========================================
// generateAlertMessage — Emergency alert message body banano
// User name, location, time diye full message tৈri hobe
// ==========================================
function generateAlertMessage({ userName, latitude, longitude, locationAddress, requestId, frontendUrl }) {
  // Current time Bangladesh timezone e format kora hocche
  const now = new Date();
  const bdTime = new Intl.DateTimeFormat('en-BD', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(now);

  // Google Maps link toiri kora hocche location theke
  let locationText = locationAddress || 'Location not available';
  let googleMapsLink = '';

  if (latitude && longitude) {
    // maps.google.com/?q= format Gmail ar mobile e click korle correctly khule
    googleMapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
  }

  // Plain text message (SMS er jonno)
  const smsMessage = [
    `🚨 EMERGENCY ALERT - JanaoBangla`,
    ``,
    `${userName} needs IMMEDIATE emergency assistance!`,
    ``,
    `Time: ${bdTime}`,
    locationAddress ? `Location: ${locationAddress}` : '',
    googleMapsLink ? `Map: ${googleMapsLink}` : '',
    ``,
    `Please respond immediately or contact emergency services (999).`,
    ``,
    `- JanaoBangla Safety System`
  ].filter(line => line !== null).join('\n');

  // HTML message (Email er jonno) — Gmail compatibility jonno sob inline CSS use kora hocche
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Emergency Alert - JanaoBangla</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f5f9; color: #1F2937;">
  <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #E2E8F0;">
    
    <!-- Header -->
    <div style="background-color: #FF1744; padding: 24px; text-align: center; color: #ffffff;">
      <div style="font-size: 40px; line-height: 1; margin-bottom: 8px;">🚨</div>
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 0.5px;">EMERGENCY ALERT</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0; font-size: 14px;">JanaoBangla Women Safety System</p>
    </div>

    <!-- Body Content -->
    <div style="padding: 24px;">
      
      <!-- Alert Box -->
      <div style="background-color: #FFF3F3; border: 2px solid #FF1744; border-radius: 8px; padding: 16px; margin-bottom: 20px; text-align: center;">
        <h2 style="color: #D50032; margin: 0 0 6px; font-size: 18px; font-weight: bold;">${userName} needs immediate assistance!</h2>
        <p style="color: #1F2937; margin: 0; font-size: 14px;">This person has activated the emergency SOS button. Please contact them or emergency services.</p>
      </div>

      <!-- Info Details -->
      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="margin-bottom: 12px;">
          <strong style="color: #64748B; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">Time of Alert</strong>
          <span style="color: #0F172A; font-size: 15px; font-weight: 600;">${bdTime}</span>
        </div>

        ${locationAddress ? `
        <div style="margin-bottom: 12px;">
          <strong style="color: #64748B; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">Captured Location</strong>
          <span style="color: #0F172A; font-size: 15px; font-weight: 500;">${locationAddress}</span>
        </div>
        ` : ''}

        <div>
          <strong style="color: #64748B; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">Emergency Alert ID</strong>
          <span style="color: #0F172A; font-size: 14px; font-weight: 600;">#SOS-${requestId}</span>
        </div>
      </div>

      <!-- Google Maps Button (Inline styled for Gmail) -->
      ${googleMapsLink ? `
      <div style="text-align: center; margin: 24px 0;">
        <a href="${googleMapsLink}" target="_blank" rel="noopener noreferrer"
           style="display: inline-block; background-color: #16A34A; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; letter-spacing: 0.3px;">
          &#128205; Open Location in Google Maps
        </a>
        <p style="margin: 12px 0 0; font-size: 12px; color: #64748B;">
          GPS: <strong style="color: #0F172A;">${latitude}, ${longitude}</strong><br>
          Direct link: <a href="${googleMapsLink}" style="color: #2563EB; word-break: break-all; font-size: 11px;">${googleMapsLink}</a>
        </p>
      </div>
      ` : ''}

      <!-- Emergency Helpline Notice -->
      <div style="background-color: #FFFBEB; border-left: 4px solid #F59E0B; padding: 12px 16px; border-radius: 0 6px 6px 0; margin-top: 20px;">
        <p style="color: #92400E; margin: 0; font-size: 13px; line-height: 1.4;">
          <strong>⚠️ Emergency Notice:</strong> If you are unable to reach ${userName}, call Bangladesh National Emergency Services at <strong>999</strong> or Women &amp; Child Helpline at <strong>109</strong> immediately.
        </p>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #0F172A; padding: 16px 24px; text-align: center; color: #94A3B8; font-size: 12px;">
      <p style="margin: 0 0 4px; color: #FFFFFF; font-weight: bold;">JanaoBangla — Civic &amp; Women Safety Network</p>
      <p style="margin: 0;">Automated emergency alert sent to designated emergency contacts.</p>
    </div>

  </div>
</body>
</html>
  `.trim();

  // Email subject banano hocche
  const emailSubject = `🚨 EMERGENCY: ${userName} needs help immediately!`;

  return {
    smsMessage,
    emailHtml,
    emailSubject,
    googleMapsLink,
    bdTime
  };
}

// ==========================================
// generateResolvedMessage — SOS resolve hoile notification message
// User nija e resolve korle contacts ke janlabe
// ==========================================
function generateResolvedMessage({ userName, requestId }) {
  // SOS resolved message tৈri kora hocche
  const now = new Date();
  const bdTime = new Intl.DateTimeFormat('en-BD', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(now);

  const smsMessage = `✅ UPDATE: ${userName}'s SOS alert #SOS-${requestId} has been RESOLVED at ${bdTime}. They are safe. - JanaoBangla`;

  return { smsMessage };
}

module.exports = {
  generateAlertMessage,
  generateResolvedMessage
};
