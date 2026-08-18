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

  // Google Maps link tৈri kora hocche location theke
  let locationText = locationAddress || 'Location not available';
  let googleMapsLink = '';

  if (latitude && longitude) {
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

  // HTML message (Email er jonno)
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Emergency Alert - JanaoBangla</title>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f5f9; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #FF1744; padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px; }
    .pulse-icon { font-size: 48px; display: block; margin-bottom: 12px; }
    .body { padding: 32px 24px; }
    .alert-box { background: #FFF3F3; border: 2px solid #FF1744; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .alert-box h2 { color: #D50032; margin: 0 0 8px; font-size: 20px; }
    .alert-box p { color: #1F2937; margin: 0; font-size: 16px; }
    .info-row { display: flex; align-items: flex-start; margin-bottom: 16px; padding: 16px; background: #F4F5F9; border-radius: 8px; }
    .info-icon { font-size: 24px; margin-right: 12px; flex-shrink: 0; }
    .info-label { font-size: 12px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px; }
    .info-value { font-size: 16px; color: #1F2937; font-weight: 500; margin: 0; }
    .map-btn { display: block; background: #2962FF; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 8px; text-align: center; font-size: 16px; font-weight: 600; margin: 24px 0; }
    .emergency-note { background: #FFF8E1; border-left: 4px solid #FFB300; padding: 16px; border-radius: 0 8px 8px 0; margin-top: 24px; }
    .emergency-note p { color: #1F2937; margin: 0; font-size: 14px; }
    .footer { background: #1F2937; padding: 20px 24px; text-align: center; }
    .footer p { color: #64748B; margin: 0; font-size: 12px; }
    .footer strong { color: #ffffff; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="pulse-icon">🚨</span>
      <h1>EMERGENCY ALERT</h1>
      <p>JanaoBangla Women Safety System</p>
    </div>

    <div class="body">
      <div class="alert-box">
        <h2>${userName} needs immediate help!</h2>
        <p>This person has activated the SOS emergency button on JanaoBangla. Please respond immediately.</p>
      </div>

      <div class="info-row">
        <span class="info-icon">🕐</span>
        <div>
          <p class="info-label">Time of Alert</p>
          <p class="info-value">${bdTime}</p>
        </div>
      </div>

      ${locationAddress ? `
      <div class="info-row">
        <span class="info-icon">📍</span>
        <div>
          <p class="info-label">Last Known Location</p>
          <p class="info-value">${locationAddress}</p>
        </div>
      </div>
      ` : ''}

      ${googleMapsLink ? `
      <a href="${googleMapsLink}" class="map-btn">
        📌 View Live Location on Google Maps
      </a>
      ` : ''}

      <div class="info-row">
        <span class="info-icon">🆔</span>
        <div>
          <p class="info-label">Emergency Reference ID</p>
          <p class="info-value">#SOS-${requestId}</p>
        </div>
      </div>

      <div class="emergency-note">
        <p><strong>⚠️ This is an automated emergency alert.</strong> If you cannot reach this person, please contact Bangladesh Emergency Services at <strong>999</strong> immediately.</p>
      </div>
    </div>

    <div class="footer">
      <p><strong>JanaoBangla</strong> — Women Safety Emergency System</p>
      <p>This email was automatically sent because you are listed as an emergency contact.</p>
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
