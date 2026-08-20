// ==========================================
// JanaoBangla — User Authentication Controller
// BRANCH: feature-user-authentication-and-security
// Registration, Login, Logout, Email Verify,
// Forgot Password, Reset Password, Change Password, Profile management
// ==========================================

const UserAccountModel = require('../models/UserAccountModel');
const {
  hashPassword,
  comparePassword,
  validatePasswordStrength
} = require('../services/PasswordEncryptionService');
const {
  generateAccessToken,
  generateEmailVerificationToken,
  buildTokenPayload
} = require('../services/TokenService');
const {
  sendEmailVerificationOTP
} = require('../services/EmailVerificationService');
const {
  createPasswordResetRequest,
  validatePasswordResetToken,
  markPasswordResetTokenUsed
} = require('../services/PasswordResetService');

// ==========================================
// registerUser — Noya user register korar jonno (Step 1)
// Ei function user input validation kore, password hash kore, unverified user (is_verified = 0) database-e save kore,
// 6-digit OTP generate kore database-e store kore ebong email/fallback OTP trigger kore.
// POST /api/auth/register
// ==========================================
async function registerUser(req, res, next) {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    // Step 1: Input validation kora hocche (Name, Email, Password presence & matching)
    const errors = [];
    if (!fullName || fullName.trim().length < 2) errors.push('Full name must be at least 2 characters');
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('Valid email address is required');
    if (!password) errors.push('Password is required');
    if (password !== confirmPassword) errors.push('Passwords do not match');

    // Password strength check kora hocche (min 8 chars, uppercase, number, symbol)
    if (password) {
      const strengthCheck = validatePasswordStrength(password);
      if (!strengthCheck.isValid) {
        errors.push(...strengthCheck.errors);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Step 2: Duplicate email check kora hocche database e
    const existingUser = await UserAccountModel.findByEmail(normalizedEmail);
    if (existingUser) {
      if (existingUser.is_verified) {
        // Already verified thakle notun kore register kora jabe na
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists. Please login or use a different email.'
        });
      } else {
        // Jodi purono registration unverified thake, tobe update kore notun OTP pathano hocche
        const passwordHash = await hashPassword(password);
        await UserAccountModel.updateProfile(existingUser.id, {
          fullName: fullName.trim(),
          phone: phone ? phone.trim() : null
        });
        await UserAccountModel.updatePassword(existingUser.id, passwordHash);

        // Notun 6-digit OTP generate kora hocche (15 minutes validity)
        const otp = generateEmailVerificationToken();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await UserAccountModel.saveEmailVerificationToken(existingUser.id, otp, expiresAt);
        const emailResult = await sendEmailVerificationOTP(normalizedEmail, fullName.trim(), otp);

        const message = emailResult.success && !emailResult.dev
          ? 'Verification code sent to your email! Please verify to complete registration.'
          : 'Verification code generated! (Dev fallback OTP logged to server console).';

        return res.status(200).json({
          success: true,
          requiresVerification: true,
          email: normalizedEmail,
          message,
          emailSent: emailResult.success && !emailResult.dev
        });
      }
    }

    // Step 3: Bcrypt diye password hash kora hocche
    const passwordHash = await hashPassword(password);

    // Step 4: Database e unverified citizen hisebe user record save kora hocche (is_verified = 0)
    const userId = await UserAccountModel.createUser({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : null,
      passwordHash
    });

    // Step 5: 6-digit email verification OTP generate kore expiry shoho MySQL table e save kora hocche
    const otp = generateEmailVerificationToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await UserAccountModel.saveEmailVerificationToken(userId, otp, expiresAt);

    // Step 6: Nodemailer diye OTP email pathano hocche (SMTP fail hole console fallback OTP log kora hobe)
    const emailResult = await sendEmailVerificationOTP(normalizedEmail, fullName.trim(), otp);

    const message = emailResult.success && !emailResult.dev
      ? 'Account details submitted! Please enter the 6-digit OTP sent to your email to complete registration.'
      : 'Account details submitted! Verification code generated (Dev fallback OTP logged to server console).';

    // Step 7: Frontend ke 201 Created response pathano hocche (requiresVerification = true)
    res.status(201).json({
      success: true,
      requiresVerification: true,
      email: normalizedEmail,
      message,
      emailSent: emailResult.success && !emailResult.dev
    });
  } catch (error) {
    // Error handling middleware e pass kora hocche
    next(error);
  }
}

// ==========================================
// loginUser — User login korar jonno
// Ei function credentials check kore ebong user verified thaklei kebol access token return kore.
// POST /api/auth/login
// ==========================================
async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // User lookup
    const user = await UserAccountModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please try again.'
      });
    }

    // Password comparison
    const isPasswordCorrect = await comparePassword(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please try again.'
      });
    }

    // Check if user is verified
    if (!user.is_verified) {
      // Unverified user-er jonno notun OTP generate kore pathano hocche
      const otp = generateEmailVerificationToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await UserAccountModel.saveEmailVerificationToken(user.id, otp, expiresAt);
      const emailResult = await sendEmailVerificationOTP(user.email, user.name, otp);

      const message = emailResult.success && !emailResult.dev
        ? 'Your email is not verified yet. A verification OTP has been sent to your email.'
        : 'Your email is not verified yet. Verification code generated (Dev fallback OTP logged to server console).';

      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: user.email,
        message,
        emailSent: emailResult.success && !emailResult.dev
      });
    }

    // JWT token generation
    // Token create kore response e accessToken ebong token duto property hisebe return kora hocche
    const accessToken = generateAccessToken(buildTokenPayload(user));

    res.status(200).json({
      success: true,
      message: 'Login successful. Welcome back!',
      accessToken,
      token: accessToken, // Frontend backward compatibility er jonno token alias
      user: {
        id:         user.id,
        fullName:   user.name,
        email:      user.email,
        phone:      user.phone_number,
        role:       user.role,
        isVerified: user.is_verified
      }
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// getMyProfile — Logged-in user er profile data
// Ei function authenticated user-er profile info fetch kore return kore.
// GET /api/auth/profile
// ==========================================
async function getMyProfile(req, res, next) {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      user: {
        id:         user.id,
        fullName:   user.name,
        email:      user.email,
        phone:      user.phone_number,
        role:       user.role,
        isVerified: user.is_verified,
        avatarUrl:  user.profile_picture,
        createdAt:  user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// updateMyProfile — Profile data update (name, phone)
// Ei function logged-in user-er name ar phone number update kore database-e save kore.
// PUT /api/auth/profile
// ==========================================
async function updateMyProfile(req, res, next) {
  try {
    const { fullName, phone } = req.body;

    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 2 characters.'
      });
    }

    await UserAccountModel.updateProfile(req.user.id, {
      fullName: fullName.trim(),
      phone: phone ? phone.trim() : null
    });

    const updatedUser = await UserAccountModel.findById(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id:         updatedUser.id,
        fullName:   updatedUser.name,
        email:      updatedUser.email,
        phone:      updatedUser.phone_number,
        role:       updatedUser.role,
        isVerified: updatedUser.is_verified
      }
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// verifyEmail — 6-digit OTP diye email verify korbe (Step 2)
// Ei function OTP verify kore registration complete kore ebong JWT token issue kore.
// POST /api/auth/verify-email
// ==========================================
async function verifyEmail(req, res, next) {
  try {
    const { otp, email } = req.body;
    let userId = req.user?.id;

    if (!userId && email) {
      const userByEmail = await UserAccountModel.findByEmail(email);
      if (userByEmail) {
        userId = userByEmail.id;
      }
    }

    if (!otp || otp.toString().trim().length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the 6-digit OTP sent to your email.'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User email or authorization token is required.'
      });
    }

    const tokenRecord = await UserAccountModel.findEmailVerificationToken(userId, otp.toString().trim());

    if (!tokenRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please enter the correct code or request a new one.'
      });
    }

    await UserAccountModel.markEmailVerificationTokenUsed(userId);

    const verifiedUser = await UserAccountModel.findById(userId);
    const accessToken = generateAccessToken(buildTokenPayload(verifiedUser));

    res.status(200).json({
      success: true,
      message: 'Registration verified and complete! Welcome to JanaoBangla.',
      accessToken,
      user: {
        id:         verifiedUser.id,
        fullName:   verifiedUser.name,
        email:      verifiedUser.email,
        phone:      verifiedUser.phone_number,
        role:       verifiedUser.role,
        isVerified: verifiedUser.is_verified
      }
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// resendVerificationOTP — Noya OTP pathabe
// Ei function unverified user-er jonno notun OTP create kore email-e send kore.
// POST /api/auth/resend-verification
// ==========================================
async function resendVerificationOTP(req, res, next) {
  try {
    let user = req.user;
    const { email } = req.body;

    if (!user && email) {
      user = await UserAccountModel.findByEmail(email);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found with this email.'
      });
    }

    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Your email is already verified. Please login.'
      });
    }

    const otp = generateEmailVerificationToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Database e notun OTP save kora hocche
    await UserAccountModel.saveEmailVerificationToken(user.id, otp, expiresAt);

    // Email pathano hocche (Gmail SMTP or Dev fallback)
    const emailResult = await sendEmailVerificationOTP(user.email, user.name, otp);

    const message = emailResult.success && !emailResult.dev
      ? 'Verification OTP has been resent to your email. Please check your inbox.'
      : 'New verification OTP generated! (Dev fallback OTP logged to server console).';

    res.status(200).json({
      success: true,
      message,
      emailSent: emailResult.success && !emailResult.dev
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// forgotPassword — Password reset link pathabe
// Ei function email address check kore password reset request create kore link pathay.
// POST /api/auth/forgot-password
// ==========================================
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.'
      });
    }

    const user = await UserAccountModel.findByEmail(email);

    // Generic response to avoid email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }

    await createPasswordResetRequest(user);

    res.status(200).json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.'
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// resetPassword — Token diye noya password set korbe
// Ei function password reset token verify kore notun hashed password save kore.
// POST /api/auth/reset-password
// ==========================================
async function resetPassword(req, res, next) {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token, new password, and confirm password are required.'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    const strengthCheck = validatePasswordStrength(newPassword);
    if (!strengthCheck.isValid) {
      return res.status(400).json({
        success: false,
        message: strengthCheck.errors[0],
        errors:  strengthCheck.errors
      });
    }

    const tokenValidation = await validatePasswordResetToken(token);
    if (!tokenValidation.valid) {
      return res.status(400).json({
        success: false,
        message: tokenValidation.message
      });
    }

    const newPasswordHash = await hashPassword(newPassword);
    await UserAccountModel.updatePassword(tokenValidation.record.user_id, newPasswordHash);
    await markPasswordResetTokenUsed(tokenValidation.record.user_id);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! Please login with your new password.'
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// changePassword — Logged-in user er password change
// Ei function logged-in user-er purano password verify kore notun password set kore.
// PUT /api/auth/change-password
// ==========================================
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password, new password, and confirm password are required.'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match.'
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from the current password.'
      });
    }

    const strengthCheck = validatePasswordStrength(newPassword);
    if (!strengthCheck.isValid) {
      return res.status(400).json({
        success: false,
        message: strengthCheck.errors[0],
        errors:  strengthCheck.errors
      });
    }

    const userWithPassword = await UserAccountModel.findByIdWithPassword(req.user.id);
    const isCurrentCorrect = await comparePassword(currentPassword, userWithPassword.password);
    if (!isCurrentCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    const newPasswordHash = await hashPassword(newPassword);
    await UserAccountModel.updatePassword(req.user.id, newPasswordHash);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully!'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerUser,
  loginUser,
  getMyProfile,
  updateMyProfile,
  verifyEmail,
  resendVerificationOTP,
  forgotPassword,
  resetPassword,
  changePassword
};
