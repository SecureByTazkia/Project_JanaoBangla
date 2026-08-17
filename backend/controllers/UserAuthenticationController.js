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
// registerUser — Noya user register korar jonno
// POST /api/auth/register
// ==========================================
async function registerUser(req, res, next) {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    const errors = [];
    if (!fullName || fullName.trim().length < 2) errors.push('Full name must be at least 2 characters');
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('Valid email address is required');
    if (!password) errors.push('Password is required');
    if (password !== confirmPassword) errors.push('Passwords do not match');

    if (password) {
      const strengthCheck = validatePasswordStrength(password);
      if (!strengthCheck.isValid) {
        errors.push(...strengthCheck.errors);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    // Check duplicate email
    const existingUser = await UserAccountModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please login or use a different email.'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Save to database
    const userId = await UserAccountModel.createUser({
      fullName: fullName.trim(),
      email,
      phone,
      passwordHash
    });

    // Generate OTP & save
    const otp = generateEmailVerificationToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await UserAccountModel.saveEmailVerificationToken(userId, otp, expiresAt);

    // Send OTP email
    await sendEmailVerificationOTP(email, fullName.trim(), otp);

    // Generate login token
    const newUser = await UserAccountModel.findById(userId);
    const accessToken = generateAccessToken(buildTokenPayload(newUser));

    res.status(201).json({
      success: true,
      message: 'Account created! Please check your email for the verification OTP.',
      accessToken,
      user: {
        id:         newUser.id,
        fullName:   newUser.full_name,
        email:      newUser.email,
        phone:      newUser.phone,
        role:       newUser.role,
        isVerified: newUser.is_verified
      }
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// loginUser — User login korar jonno
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
    const isPasswordCorrect = await comparePassword(password, user.password_hash);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please try again.'
      });
    }

    // JWT token generation
    const accessToken = generateAccessToken(buildTokenPayload(user));

    res.status(200).json({
      success: true,
      message: 'Login successful. Welcome back!',
      accessToken,
      user: {
        id:         user.id,
        fullName:   user.full_name,
        email:      user.email,
        phone:      user.phone,
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
// GET /api/auth/profile
// ==========================================
async function getMyProfile(req, res, next) {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      user: {
        id:         user.id,
        fullName:   user.full_name,
        email:      user.email,
        phone:      user.phone,
        role:       user.role,
        isVerified: user.is_verified,
        avatarUrl:  user.avatar_url,
        createdAt:  user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// updateMyProfile — Profile data update (name, phone)
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
        fullName:   updatedUser.full_name,
        email:      updatedUser.email,
        phone:      updatedUser.phone,
        role:       updatedUser.role,
        isVerified: updatedUser.is_verified
      }
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// verifyEmail — 6-digit OTP diye email verify korbe
// POST /api/auth/verify-email
// ==========================================
async function verifyEmail(req, res, next) {
  try {
    const { otp } = req.body;
    const userId  = req.user.id;

    if (!otp || otp.toString().trim().length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the 6-digit OTP sent to your email.'
      });
    }

    const tokenRecord = await UserAccountModel.findEmailVerificationToken(userId, otp.toString().trim());

    if (!tokenRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.'
      });
    }

    await UserAccountModel.updateUserVerifiedStatus(userId);
    await UserAccountModel.markEmailVerificationTokenUsed(tokenRecord.id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Your account is now fully active.'
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// resendVerificationOTP — Noya OTP pathabe
// POST /api/auth/resend-verification
// ==========================================
async function resendVerificationOTP(req, res, next) {
  try {
    const user = req.user;

    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Your email is already verified.'
      });
    }

    const otp = generateEmailVerificationToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await UserAccountModel.saveEmailVerificationToken(user.id, otp, expiresAt);
    await sendEmailVerificationOTP(user.email, user.full_name, otp);

    res.status(200).json({
      success: true,
      message: 'Verification OTP sent to your email. Please check your inbox.'
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// forgotPassword — Password reset link pathabe
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
    await markPasswordResetTokenUsed(tokenValidation.record.id);

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
    const isCurrentCorrect = await comparePassword(currentPassword, userWithPassword.password_hash);
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
