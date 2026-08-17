// ==========================================
// JanaoBangla — Email Verification Service
// BRANCH: feature-user-authentication-and-security
// Registration er pore email verify korar jonno OTP pathabe
// Gmail SMTP diye Nodemailer use kora hobe, dev mode fallback shohishnu
// ==========================================

const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// ==========================================
// createEmailTransporter — Nodemailer transporter create korbe
// .env theke SMTP credentials (host, port, secure, user, pass) load kora hocche
// Whitespace ebong spaces remove kora hoy jate Google App Password thikmoto parse hoy
// ==========================================
function createEmailTransporter() {
  const host   = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port   = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const secure = process.env.EMAIL_SECURE === 'true' || port === 465;
  const user   = (process.env.EMAIL_USER || '').trim();
  const pass   = (process.env.EMAIL_PASSWORD || '').trim().replace(/\s+/g, '');

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });
}

// ==========================================
// sendEmailVerificationOTP — Registration er pore OTP email pathabe
// Jodi SMTP auth thik thake, tobe real email Gmail inbox-e jabe
// Jodi SMTP fail kore ba configured na thake, tobe development fallback OTP console-e log hobe
// ==========================================
async function sendEmailVerificationOTP(userEmail, userName, otp) {
  // Email credentials properly set ache kina check kora hocche
  const isEmailConfigured = process.env.EMAIL_USER &&
                            process.env.EMAIL_PASSWORD &&
                            !process.env.EMAIL_USER.includes('your_gmail') &&
                            !process.env.EMAIL_USER.includes('example.com');

  if (!isEmailConfigured) {
    // Development mode simulation: email credentials set na thakle console-e print hobe
    console.log(`📧 [DEV MODE - EMAIL SIMULATION]`);
    console.log(`   To: ${userEmail} (${userName})`);
    console.log(`   Subject: JanaoBangla — Verify Your Email Address`);
    console.log(`   OTP: ${otp} (Valid for 15 minutes)`);
    return { success: true, dev: true };
  }

  try {
    const transporter = createEmailTransporter();

    // SMTP server connection ar authentication check kora hocche
    await transporter.verify();
    console.log('✅ SMTP connection verified, sending OTP email...');

    // HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background: #F4F5F9; margin: 0; padding: 20px; }
          .container { max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #006A4E, #004D3A); padding: 32px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
          .body { padding: 32px; }
          .otp-box { background: #E8F5F0; border: 2px solid #006A4E; border-radius: 12px; text-align: center; padding: 24px; margin: 24px 0; }
          .otp-code { font-size: 40px; font-weight: 800; color: #006A4E; letter-spacing: 8px; }
          .footer { background: #F4F5F9; padding: 20px 32px; text-align: center; color: #64748B; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🇧🇩 JanaoBangla</h1>
            <p style="margin: 8px 0 0; opacity: 0.85; font-size: 14px;">Email Verification</p>
          </div>
          <div class="body">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Thank you for registering with JanaoBangla. Please use the OTP below to verify your email address:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <p style="margin: 8px 0 0; color: #64748B; font-size: 13px;">This OTP expires in 15 minutes</p>
            </div>
            <p style="color: #64748B; font-size: 13px;">If you did not register, please ignore this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} JanaoBangla — Report Today. Build a Better Bangladesh.
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from:    `"${process.env.EMAIL_FROM_NAME || 'JanaoBangla'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
      to:      userEmail,
      subject: 'JanaoBangla — Verify Your Email Address',
      html:    htmlContent
    });

    // Full SMTP response log — delivery debug er jonno
    console.log(`✅ Verification OTP email sent!`);
    console.log(`   → To       : ${userEmail}`);
    console.log(`   → messageId: ${info.messageId}`);
    console.log(`   → accepted : ${JSON.stringify(info.accepted)}`);
    console.log(`   → rejected : ${JSON.stringify(info.rejected)}`);
    console.log(`   → response : ${info.response}`);

    if (info.rejected && info.rejected.length > 0) {
      console.warn(`⚠️ Recipient rejected by SMTP: ${info.rejected}`);
    }

    return { success: true, dev: false, messageId: info.messageId };
  } catch (error) {
    // Full error log — SMTP auth failure ba connection error dekhabe
    console.error('❌ Email send FAILED:');
    console.error('   Message :', error.message);
    console.error('   Code    :', error.code);
    console.error('   Response:', error.response || '(none)');
    if (error.code === 'EAUTH' || (error.response && error.response.includes('535'))) {
      console.error('📌 FIX: Gmail App Password required!');
      console.error('   Go to: https://myaccount.google.com/apppasswords');
      console.error('   Set EMAIL_PASSWORD in .env to the 16-char App Password (no spaces)');
    }
    // Console e OTP print kora hocche jate manually test kora jay
    console.log(`📧 [FALLBACK — SMTP FAILED] OTP for ${userEmail}: ${otp}`);
    return { success: false, error: error.message };
  }
}

// ==========================================
// sendPasswordResetEmail — Forgot password er jonno 6-digit OTP ar reset link pathabe
// Email-e 6-digit reset code ebong direct reset password link thakbe
// ==========================================
async function sendPasswordResetEmail(userEmail, userName, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

  const isEmailConfigured = process.env.EMAIL_USER &&
                            process.env.EMAIL_PASSWORD &&
                            !process.env.EMAIL_USER.includes('your_gmail') &&
                            !process.env.EMAIL_USER.includes('example.com');

  if (!isEmailConfigured) {
    console.log(`📧 [DEV MODE - PASSWORD RESET SIMULATION]`);
    console.log(`   To: ${userEmail} (${userName})`);
    console.log(`   Reset OTP: ${resetToken}`);
    console.log(`   Reset URL: ${resetUrl}`);
    return { success: true, dev: true };
  }

  try {
    const transporter = createEmailTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background: #F4F5F9; margin: 0; padding: 20px; }
          .container { max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #006A4E, #004D3A); padding: 32px; text-align: center; color: white; }
          .body { padding: 32px; }
          .otp-box { background: #E8F5F0; border: 2px solid #006A4E; border-radius: 12px; text-align: center; padding: 20px; margin: 20px 0; }
          .otp-code { font-size: 36px; font-weight: 800; color: #006A4E; letter-spacing: 6px; }
          .btn { display: inline-block; padding: 14px 32px; background: #006A4E; color: white; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; margin: 16px 0; }
          .footer { background: #F4F5F9; padding: 20px 32px; text-align: center; color: #64748B; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;font-size:22px;">🇧🇩 JanaoBangla</h1>
            <p style="margin:8px 0 0;opacity:0.85;font-size:14px;">Password Reset Request</p>
          </div>
          <div class="body">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>We received a request to reset your password. Use the 6-digit reset code below or click the button:</p>
            <div class="otp-box">
              <div class="otp-code">${resetToken}</div>
              <p style="margin:6px 0 0;color:#64748B;font-size:13px;">This code expires in 1 hour</p>
            </div>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="btn" style="color: white;">Reset My Password</a>
            </div>
            <p style="color:#64748B;font-size:13px;">If you did not request a password reset, please ignore this email.</p>
            <p style="color:#64748B;font-size:12px;word-break:break-all;">Direct link: ${resetUrl}</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} JanaoBangla — Report Today. Build a Better Bangladesh.
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from:    `"${process.env.EMAIL_FROM_NAME || 'JanaoBangla'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
      to:      userEmail,
      subject: 'JanaoBangla — Reset Your Password',
      html:    htmlContent
    });

    console.log(`✅ Password reset email sent to: ${userEmail} (messageId: ${info.messageId})`);
    return { success: true, dev: false, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Password reset email error:', error.message);
    console.log(`📧 [FALLBACK DEV RESET OTP] for ${userEmail}: ${resetToken}`);
    console.log(`📧 [FALLBACK DEV RESET URL] for ${userEmail}: ${resetUrl}`);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendEmailVerificationOTP,
  sendPasswordResetEmail
};
