// ==========================================
// JanaoBangla — Emergency SMS Alert Service (MiMSMS V2)
// BRANCH: feature-women-safety-sos-and-emergency-notifications
// Ei service ta Bangladesh er MiMSMS SMS Gateway API V2 use kore emergency contacts ke SOS SMS pathabe
// Uses native Node.js fetch (Node 18+) with zero external dependencies
// ==========================================

/**
 * normalizeBdPhoneNumber — Phone number normalise kora Bangladesh format e
 * @param {string} phone
 * @returns {string}
 */
function normalizeBdPhoneNumber(phone) {
  if (!phone) return '';
  let cleaned = phone.trim().replace(/[^0-9]/g, '');
  if (cleaned.startsWith('880')) {
    return cleaned;
  } else if (cleaned.startsWith('0')) {
    return '88' + cleaned;
  } else if (cleaned.length === 10 && cleaned.startsWith('1')) {
    return '880' + cleaned;
  }
  return cleaned;
}

/**
 * sendMimSms — MiMSMS Official API V2 দিয়ে real SMS পাঠানো
 * Endpoint: POST https://api.mimsms.com/api/V2/SMS
 *
 * @param {Object} params
 * @param {string} params.toPhone
 * @param {string} params.message
 * @param {number|string} params.requestId
 * @returns {Promise<Object>}
 */
async function sendMimSms({ toPhone, message, requestId }) {
  const apiKey     = process.env.MIMSMS_API_KEY || process.env.MIM_SMS_API_KEY;
  const userName   = process.env.MIMSMS_USERNAME || process.env.MIMSMS_USER || process.env.EMAIL_USER;
  const senderName = process.env.MIMSMS_SENDER_NAME || process.env.MIMSMS_SENDER_ID || process.env.MIM_SMS_SENDER_ID || 'JanaoBangla';
  const smsType    = process.env.MIMSMS_SMS_TYPE || 'T'; // 'T' = Transactional (for emergency alerts, bypasses DND)

  // API Key check — missing hole clear error return korbe
  if (!apiKey || apiKey === 'your_mimsms_api_key' || apiKey === 'your_mim_sms_api_key') {
    const errorMsg = 'MIMSMS_API_KEY is not configured in backend/.env. Please configure your MiMSMS API key.';
    console.error(`❌ MiMSMS Error: ${errorMsg}`);
    return {
      success: false,
      provider: 'mimsms',
      error: errorMsg
    };
  }

  const phone = normalizeBdPhoneNumber(toPhone);
  if (!phone || phone.length < 11) {
    const errorMsg = `Invalid recipient phone number: ${toPhone}`;
    console.error(`❌ MiMSMS Error: ${errorMsg}`);
    return {
      success: false,
      provider: 'mimsms',
      error: errorMsg
    };
  }

  try {
    const payload = {
      userName: userName || '',
      apiKey: apiKey,
      senderName: senderName,
      message: message,
      to: phone,
      type: smsType
    };

    console.log(`📱 [MiMSMS V2] Dispatching SOS SMS to ${phone} (Req #SOS-${requestId})...`);

    // Primary: POST to MiMSMS V2 API
    let response;
    let resData;

    try {
      response = await fetch('https://api.mimsms.com/api/V2/SMS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000)
      });

      const text = await response.text();
      try {
        resData = JSON.parse(text);
      } catch {
        resData = text;
      }
    } catch (v2PostErr) {
      // Fallback: If V2 JSON POST fails, try standard query-params endpoint
      console.warn(`⚠️ MiMSMS V2 JSON endpoint error (${v2PostErr.message}), attempting query-params endpoint...`);
      
      const queryParams = new URLSearchParams({
        api_key: apiKey,
        type: 'text',
        contacts: phone,
        senderid: senderName,
        msg: message
      });

      response = await fetch(`https://api.mimsms.com/smsapi?${queryParams.toString()}`, {
        method: 'POST',
        signal: AbortSignal.timeout(15000)
      });

      const text = await response.text();
      try {
        resData = JSON.parse(text);
      } catch {
        resData = text;
      }
    }

    console.log(`📱 [MiMSMS] Response for ${phone}:`, resData);

    // Validate response from MiMSMS
    const isSuccess = 
      response && response.ok && (
        resData?.statusCode === 200 ||
        resData?.status === 'success' ||
        resData?.status === 'Success' ||
        resData?.code === '200' ||
        resData?.response_code === 200 ||
        (typeof resData === 'string' && (resData.toLowerCase().includes('success') || resData.toLowerCase().includes('submitted') || resData.includes('1001') || resData.includes('1000')))
      );

    if (isSuccess) {
      const messageId = resData?.messageId || resData?.id || resData?.trxid || `mim-${Date.now()}`;
      console.log(`✅ [MiMSMS] SOS SMS successfully sent to ${phone}. Message ID: ${messageId}`);
      return {
        success: true,
        provider: 'mimsms',
        messageId: messageId,
        data: resData
      };
    } else {
      const errorDetail = resData?.message || resData?.error || resData?.description || (typeof resData === 'object' ? JSON.stringify(resData) : String(resData));
      console.error(`❌ [MiMSMS] SMS rejected for ${phone}: ${errorDetail}`);
      return {
        success: false,
        provider: 'mimsms',
        error: `MiMSMS provider rejected SMS: ${errorDetail}`
      };
    }

  } catch (error) {
    const errorDetail = error.message || 'Unknown network error';
    console.error(`❌ [MiMSMS] SMS request failed for ${phone}: ${errorDetail}`);
    return {
      success: false,
      provider: 'mimsms',
      error: `MiMSMS API error: ${errorDetail}`
    };
  }
}

/**
 * sendEmergencySms — Single emergency SMS dispatch
 */
async function sendEmergencySms({ toPhone, message, requestId }) {
  return sendMimSms({ toPhone, message, requestId });
}

/**
 * sendBulkEmergencySms — Multiple contacts ke SMS pathano
 * @param {Object} params
 * @param {Array} params.contacts
 * @param {string} params.message
 * @param {number|string} params.requestId
 * @returns {Promise<Object>}
 */
async function sendBulkEmergencySms({ contacts, message, requestId }) {
  const results = [];

  for (const contact of contacts) {
    if (!contact.phone) {
      results.push({
        contact: contact.name,
        skipped: true,
        reason: 'No phone number provided'
      });
      continue;
    }

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

  const successCount = results.filter(r => r.success).length;
  const failCount    = results.filter(r => !r.success && !r.skipped).length;

  console.log(`📱 SMS Dispatch Summary: ${successCount} succeeded, ${failCount} failed, ${results.filter(r => r.skipped).length} skipped`);

  return {
    results,
    successCount,
    failCount
  };
}

module.exports = {
  sendEmergencySms,
  sendBulkEmergencySms,
  normalizeBdPhoneNumber
};
