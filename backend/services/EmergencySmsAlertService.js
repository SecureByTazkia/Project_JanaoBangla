// ==========================================
// JanaoBangla — Emergency SMS Alert Service
// BRANCH: feature-women-safety-sos-and-emergency-notifications
// Ei service ta emergency contacts ke SMS pathabe
// ABSTRACTION LAYER — Provider swap korte shudhu ei file change korte hobe
// Dev mode e console e log kore, real provider plug in korte parbe
// ==========================================

// ==========================================
// SMS_PROVIDER configuration
// .env e SMS_PROVIDER set kore provider change korte parbe:
//   console  → Just log to terminal (default dev mode)
//   twilio   → Twilio SMS API use korbe
//   sslcommerz → SSL Commerz BD SMS (future)
// ==========================================

// ==========================================
// sendConsoleSms — Development mode SMS simulation
// Real SMS pathabe na, console e message dekhabe
// ==========================================
async function sendConsoleSms({ toPhone, message, requestId }) {
  // Console e SMS content print kora hocche (dev simulation)
  console.log('\n📱 [SMS SIMULATION - Console Provider]');
  console.log(`   To: ${toPhone}`);
  console.log(`   Emergency ID: #SOS-${requestId}`);
  console.log(`   Message:\n${message.split('\n').map(l => `   ${l}`).join('\n')}`);
  console.log('   💡 Set SMS_PROVIDER=twilio and credentials in .env for real SMS\n');

  return {
    success: true,
    simulated: true,
    provider: 'console',
    messageId: `console-${Date.now()}`
  };
}

// ==========================================
// sendTwilioSms — Twilio diye real SMS pathanor logic
// Twilio credentials .env e set thakle activate hobe
// ==========================================
async function sendTwilioSms({ toPhone, message, requestId }) {
  // Twilio credentials check kora hocche
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone  = process.env.TWILIO_PHONE_NUMBER;

  // Credentials na thakle console fallback
  if (!accountSid || !authToken || !fromPhone) {
    console.warn('⚠️  Twilio credentials missing. Falling back to console simulation.');
    return sendConsoleSms({ toPhone, message, requestId });
  }

  try {
    // Twilio dynamically import kora hocche (optional dependency)
    // eslint-disable-next-line import/no-extraneous-dependencies
    const twilio = require('twilio');
    const client = twilio(accountSid, authToken);

    // Phone number Bangladesh format check ar fix kora hocche
    let formattedPhone = toPhone.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+88' + formattedPhone; // 01XXXXXXXXX → +8801XXXXXXXXX
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    // Twilio diye SMS pathano hocche
    const smsResult = await client.messages.create({
      body: message,
      from: fromPhone,
      to: formattedPhone
    });

    console.log(`✅ Twilio SMS sent to ${formattedPhone}. SID: ${smsResult.sid}`);

    return {
      success: true,
      simulated: false,
      provider: 'twilio',
      messageId: smsResult.sid
    };

  } catch (error) {
    // Twilio error hole graceful fallback
    console.error(`❌ Twilio SMS failed to ${toPhone}:`, error.message);
    return {
      success: false,
      provider: 'twilio',
      error: error.message
    };
  }
}

// ==========================================
// sendEmergencySms — Main SMS dispatch function
// Provider config dekhe appropriate sender choose korbe
// ==========================================
async function sendEmergencySms({ toPhone, message, requestId }) {
  // Provider .env theke determine kora hocche
  const provider = (process.env.SMS_PROVIDER || 'console').toLowerCase();

  // Provider anujayee SMS function call kora hocche
  switch (provider) {
    case 'twilio':
      return sendTwilioSms({ toPhone, message, requestId });

    case 'console':
    default:
      // Default: console simulation
      return sendConsoleSms({ toPhone, message, requestId });
  }
}

// ==========================================
// sendBulkEmergencySms — Multiple contacts ke SMS pathano
// SOS trigger hoile sob contacts ke loop kore SMS jabe
// ==========================================
async function sendBulkEmergencySms({ contacts, message, requestId }) {
  // Sob contacts ke SMS pathano hocche
  const results = [];

  for (const contact of contacts) {
    // Phone number na thakle skip kora hocche
    if (!contact.phone) {
      results.push({
        contact: contact.name,
        skipped: true,
        reason: 'No phone number'
      });
      continue;
    }

    // SMS pathano hocche ar result collect kora hocche
    const result = await sendEmergencySms({
      toPhone: contact.phone,
      message,
      requestId
    });

    results.push({
      contact: contact.name,
      phone: contact.phone,
      ...result
    });
  }

  // SMS summary log kora hocche
  const successCount = results.filter(r => r.success).length;
  const failCount    = results.filter(r => !r.success && !r.skipped).length;

  console.log(`📱 SMS summary: ${successCount} sent, ${failCount} failed, ${results.filter(r => r.skipped).length} skipped`);

  return {
    results,
    successCount,
    failCount
  };
}

module.exports = {
  sendEmergencySms,
  sendBulkEmergencySms
};
