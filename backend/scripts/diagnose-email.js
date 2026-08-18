// ==========================================
// JanaoBangla — SMTP Email Delivery Diagnostic
// Run: node scripts/diagnose-email.js
// This script ONLY reads .env and tests SMTP — does NOT touch auth/DB
// ==========================================

require('dotenv').config();
const nodemailer = require('nodemailer');

const TO_ADDRESS = process.argv[2] || process.env.EMAIL_USER; // test email target

console.log('\n========== JanaoBangla SMTP Diagnostic ==========');
console.log(`HOST     : ${process.env.EMAIL_HOST}`);
console.log(`PORT     : ${process.env.EMAIL_PORT}`);
console.log(`SECURE   : ${process.env.EMAIL_SECURE}`);
console.log(`USER     : ${process.env.EMAIL_USER}`);
console.log(`PASSWORD : ${process.env.EMAIL_PASSWORD ? '[SET — length ' + process.env.EMAIL_PASSWORD.length + ']' : '[NOT SET]'}`);
console.log(`FROM     : ${process.env.EMAIL_FROM_ADDRESS}`);
console.log(`SENDING TEST TO: ${TO_ADDRESS}`);
console.log('=================================================\n');

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST   || 'smtp.gmail.com',
  port:   parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  logger: true,   // Full SMTP protocol log to console
  debug:  true    // Show SMTP command/response
});

async function runDiagnostic() {
  // Step 1: Verify SMTP connection + auth
  console.log('--- Step 1: Verifying SMTP connection & credentials ---');
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully! Credentials are correct.\n');
  } catch (err) {
    console.error('❌ SMTP VERIFY FAILED:', err.message);
    console.error('   Code    :', err.code);
    console.error('   Response:', err.response || '(none)');
    console.error('\n📌 COMMON FIXES:');
    if (err.message.includes('535') || err.message.includes('Username and Password not accepted')) {
      console.error('   → Gmail rejected credentials.');
      console.error('   → You MUST use a Gmail App Password, NOT your account password.');
      console.error('   → Go to: https://myaccount.google.com/apppasswords');
      console.error('   → Generate an App Password for "Mail" and paste it into EMAIL_PASSWORD in .env');
      console.error('   → Also ensure 2-Step Verification is ENABLED on your Google account.');
    } else if (err.message.includes('ECONNREFUSED') || err.message.includes('connect ETIMEDOUT')) {
      console.error('   → Cannot reach SMTP server. Check EMAIL_HOST and EMAIL_PORT.');
      console.error('   → Try port 465 with EMAIL_SECURE=true, or port 587 with EMAIL_SECURE=false');
    } else if (err.message.includes('534') || err.message.includes('less secure')) {
      console.error('   → Gmail blocked "less secure app" login.');
      console.error('   → Use an App Password instead: https://myaccount.google.com/apppasswords');
    }
    process.exit(1);
  }

  // Step 2: Send actual test email and log full SMTP response
  console.log('--- Step 2: Sending test OTP email ---');
  try {
    const info = await transporter.sendMail({
      from:    `"JanaoBangla Test" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
      to:      TO_ADDRESS,
      subject: `[TEST] JanaoBangla SMTP Diagnostic — ${new Date().toISOString()}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;border:2px solid #006A4E;border-radius:8px;max-width:400px">
          <h2 style="color:#006A4E">🇧🇩 JanaoBangla SMTP Test</h2>
          <p>This is a diagnostic email to confirm Nodemailer delivery is working.</p>
          <div style="background:#E8F5F0;border:2px solid #006A4E;border-radius:8px;padding:16px;text-align:center;margin:16px 0">
            <div style="font-size:36px;font-weight:800;color:#006A4E;letter-spacing:8px">123456</div>
            <p style="color:#64748B;font-size:13px;margin:8px 0 0">Sample OTP (this is just a test)</p>
          </div>
          <p style="color:#64748B;font-size:12px">Sent at: ${new Date().toISOString()}</p>
        </div>
      `,
      text: 'JanaoBangla SMTP Test. Sample OTP: 123456'
    });

    console.log('\n✅ EMAIL SENT SUCCESSFULLY!');
    console.log('   messageId  :', info.messageId);
    console.log('   accepted   :', JSON.stringify(info.accepted));
    console.log('   rejected   :', JSON.stringify(info.rejected));
    console.log('   response   :', info.response);
    console.log('   envelope   :', JSON.stringify(info.envelope));

    if (info.rejected && info.rejected.length > 0) {
      console.error('\n⚠️  SMTP accepted the connection but REJECTED the recipient address:', info.rejected);
      console.error('   Check that the TO address is valid and not blocked.');
    } else {
      console.log('\n📬 Email was accepted by SMTP server. If not in inbox, check:');
      console.log('   1. Spam / Junk folder');
      console.log('   2. Promotions tab in Gmail');
      console.log('   3. Updates tab in Gmail');
      console.log('   4. Gmail may delay or throttle bulk sends');
    }
  } catch (err) {
    console.error('\n❌ SEND FAILED:', err.message);
    console.error('   Code    :', err.code);
    console.error('   Response:', err.response || '(none)');
  }
}

runDiagnostic();
