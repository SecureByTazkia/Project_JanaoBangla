// ==========================================
// JanaoBangla — Emergency Email Alert Service
// BRANCH: feature-women-safety-sos-and-emergency-notifications
// Ei service ta Nodemailer diye emergency contacts ke email pathabe
// SMTP configure na thakle gracefully fallback korbe (crash korbe na)
// ==========================================

const nodemailer = require('nodemailer');

// ==========================================
// createTransporter — Nodemailer transporter tৈri kora
// .env theke SMTP config newa hocche
// ==========================================
function createTransporter() {
  // SMTP config .env theke newa hocche
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT) || 587;

  // SMTP credentials na thakle null return korbe
  if (!smtpUser || !smtpPass) {
    return null;
  }

  // Nodemailer transporter create kora hocche
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // 465 port e SSL, baki sব TLS
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    tls: {
      rejectUnauthorized: false // Development e self-signed cert allow
    }
  });
}

// ==========================================
// sendEmergencyEmail — Emergency contact ke email pathanor main function
// Transporter na thakle console e log kore, crash korbe na
// ==========================================
async function sendEmergencyEmail({ toEmail, toName, subject, htmlBody, requestId }) {
  // Result object tৈri kora hocche
  const result = {
    success: false,
    provider: 'nodemailer',
    recipient: toEmail,
    requestId,
    error: null,
    simulated: false
  };

  try {
    // Transporter create korar cheshtha korchi
    const transporter = createTransporter();

    // Transporter na thakle simulate mode e log kore return
    if (!transporter) {
      console.log('\n📧 [EMAIL SIMULATION - SMTP not configured]');
      console.log(`   To: ${toName} <${toEmail}>`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Emergency ID: #SOS-${requestId}`);
      console.log('   💡 Add SMTP_USER and SMTP_PASS to .env to send real emails\n');

      result.success = true;
      result.simulated = true;
      result.messageId = `simulated-${Date.now()}`;
      return result;
    }

    // Email pathano hocche
    const fromEmail = process.env.EMAIL_FROM || `JanaoBangla Emergency <${process.env.SMTP_USER}>`;

    const info = await transporter.sendMail({
      from: fromEmail,
      to: `${toName} <${toEmail}>`,
      subject: subject,
      html: htmlBody,
      // Plain text fallback o set kora hocche
      text: `EMERGENCY ALERT: Someone in your contact list needs help. Check your email for details. Emergency ID: #SOS-${requestId}`
    });

    console.log(`✅ Emergency email sent to ${toEmail}. Message ID: ${info.messageId}`);

    result.success = true;
    result.messageId = info.messageId;
    return result;

  } catch (error) {
    // Email pathate problem hole error log kora hocche, crash korbe na
    console.error(`❌ Failed to send emergency email to ${toEmail}:`, error.message);
    result.error = error.message;
    return result;
  }
}

// ==========================================
// sendBulkEmergencyEmails — Multiple contacts ke email pathanor jonno
// SOS trigger hoile sob contacts ke loop kore email jabe
// ==========================================
async function sendBulkEmergencyEmails({ contacts, subject, htmlBody, requestId }) {
  // Sob contacts ke email pathanor jonno loop kora hocche
  const results = [];

  for (const contact of contacts) {
    // Contact er email na thakle skip kora hocche
    if (!contact.email) {
      results.push({
        contact: contact.name,
        skipped: true,
        reason: 'No email address'
      });
      continue;
    }

    // Individual email pathanor result collect kora hocche
    const result = await sendEmergencyEmail({
      toEmail: contact.email,
      toName: contact.name,
      subject,
      htmlBody,
      requestId
    });

    results.push({
      contact: contact.name,
      email: contact.email,
      ...result
    });
  }

  // Koto email success ar koto fail seta summary korche
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success && !r.skipped).length;

  console.log(`📧 Email summary: ${successCount} sent, ${failCount} failed, ${results.filter(r => r.skipped).length} skipped`);

  return {
    results,
    successCount,
    failCount
  };
}

module.exports = {
  sendEmergencyEmail,
  sendBulkEmergencyEmails
};
