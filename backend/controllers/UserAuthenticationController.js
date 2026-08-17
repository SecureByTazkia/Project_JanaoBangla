// ==========================================
// JanaoBangla — User Authentication Controller
// BRANCH: feature-user-authentication-and-security
// Registration, Login, Logout, Email Verify,
// Forgot Password, Reset Password, Change Password
// Profile management — sob auth logic ekhane
// ==========================================

const UserAccountModel        = require('../models/UserAccountModel');
const { hashPassword, comparePassword, validatePasswordStrength } = require('../services/PasswordEncryptionService');
const { generateAccessToken, generateEmailVerificationToken, buildTokenPayload } = require('../services/TokenService');
const { sendEmailVerificationOTP } = require('../services/EmailVerificationService');
const { createPasswordResetRequest, validatePasswordResetToken, markPasswordResetTokenUsed } = require('../services/PasswordResetService');

// ==========================================
// registerUser — Noya user register korar jonno
// POST /api/auth/register
// Validation, duplicate check, hash, create, OTP send
// ==========================================
async function registerUser(req, res, next) {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    // ---- Input validation ----
    const errors = [];
    if (!fullName || fullName.trim().length < 2)  errors.push('Full name must be at least 2 characters');
    if (!email    || !/^\S+@\S+\.\S+$/.test(email)) errors.push('Valid email address is required');
    if (!password)                                 errors.push('Password is required');
    if (password !== confirmPassword)              errors.push('Passwords do not match');

    // Password strength check kora hocche
    if (password) {
      const strengthCheck = validatePasswordStrength(password);
      if (!strengthCheck.isValid) {
        errors.push(...strengthCheck.errors);
      }
    }

    // Validation error thakle 400 response
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    // Email already registered ki check kora hocche
    const existingUser = await UserAccountModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please login or use a different email.'
      });
    }

    // Password hash kora hocche — plain text never stored
    const passwordHash = await hashPassword(password);

    // Database e user create kora hocche
    const userId = await UserAccountModel.createUser({
      fullName: fullName.trim(),
      email,
      phone,
      passwordHash
    });

    // Email verification OTP generate kora hocche
    const otp       = generateEmailVerificationToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // OTP database e save kora hocche
    await UserAccountModel.saveEmailVerificationToken(userId, otp, expiresAt);

    // OTP email pathano hocche
    await sendEmailVerificationOTP(email, fullName.trim(), otp);

    // Access token generate kora hocche — user directly login thakbe
    const newUser      = await UserAccountModel.findById(userId);
    const accessToken  = generateAccessToken(buildTokenPayload(newUser));

    // Success response pathano hocche
    res.status(201).json({
      success:     true,
      message:     'Account created! Please check your email for the verification OTP.',
      accessToken,
      user: {
        id:          newUser.id,
        fullName:    newUser.full_name,
        email:       newUser.email,
        role:        newUser.role,
        isVerified:  newUser.is_verified
      }
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// loginUser — User login korar jonno
// POST /api/auth/login
// Email/password check, JWT generate, return
// ==========================================
async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;

    // Basic input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // Database theke user khujbe email diye
    // findByEmail password hash o return kore
    const user = await UserAccountModel.findByEmail(email);

    // User na thakle ba password match na hoile same error dekhabe
    // Security reason: attacker jate jan na kon email registered
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please try again.'
      });
    }

    // Password compare kora hocche bcrypt diye
    const isPasswordCorrect = await comparePassword(password, user.password_hash);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please try again.'
      });
    }

    // JWT access token generate kora hocche
    const accessToken = generateAccessToken(buildTokenPayload(user));

    // Login success response
    res.status(200).json({
      success:     true,
      message:     'Login successful. Welcome back!',
      accessToken,
      user: {
        id:         user.id,
        fullName:   user.full_name,
        email:      user.email,
        role:       user.role,
        isVerified: user.is_verified
      }
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// getMyProfile — Logged-in user er profile data return korbe
// GET /api/auth/profile
// requireAuthentication middleware use korbe
// ==========================================
async function getMyProfile(req, res, next) {
  try {
    // req.user requireAuthentication middleware e set hoyeche
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
// updateMyProfile — Profile update korar jonno
// PUT /api/auth/profile
// ==========================================
async function updateMyProfile(req, res, next) {
  try {
    const { fullName, phone } = req.body;

    // Validation
    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 2 characters.'
      });
    }

    // Database e profile update kora hocche
    await UserAccountModel.updateProfile(req.user.id, {
      fullName: fullName.trim(),
      phone
    });

    // Updated user data return kora hocche
    const updatedUser = await UserAccountModel.findById(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id:       updatedUser.id,
        fullName: updatedUser.full_name,
        email:    updatedUser.email,
        phone:    updatedUser.phone
      }
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// verifyEmail — OTP diye email verify korar jonno
// POST /api/auth/verify-email
// ==========================================
async function verifyEmail(req, res, next) {
  try {
    const { otp } = req.body;
    const userId  = req.user.id;

    // OTP validation
    if (!otp || otp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the 6-digit OTP sent to your email.'
      });
    }

    // Database e OTP check kora hocche
    const tokenRecord = await UserAccountModel.findEmailVerificationToken(userId, otp);

    if (!tokenRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.'
      });
    }

    // User ke verified mark kora hocche
    await UserAccountModel.updateUserVerifiedStatus(userId);

    // Token used mark kora hocche
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
// resendVerificationOTP — Noya OTP pathaber jonno
// POST /api/auth/resend-verification
// ==========================================
async function resendVerificationOTP(req, res, next) {
  try {
    const user = req.user;

    // Already verified thakle na pathano
    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Your email is already verified.'
      });
    }

    // Noya OTP generate kora hocche
    const otp       = generateEmailVerificationToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Database e save kora hocche (puranogulo delete hobe)
    await UserAccountModel.saveEmailVerificationToken(user.id, otp, expiresAt);

    // Email pathano hocche
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
// forgotPassword — Password reset request korar jonno
// POST /api/auth/forgot-password
// Email exist korle reset link pathabe
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

    // User khujbe — na thakleo same response dekhabe (security)
    const user = await UserAccountModel.findByEmail(email);

    // Email na thakleo attacker ke janabo na — same response
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with this email exists, a reset link has been sent.'
      });
    }

    // Password reset request create kora hocche
    await createPasswordResetRequest(user);

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email. Please check your inbox.'
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// resetPassword — Noya password set korar jonno
// POST /api/auth/reset-password
// Token validate kore noya password save korbe
// ==========================================
async function resetPassword(req, res, next) {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    // Validation
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

    // Password strength check
    const strengthCheck = validatePasswordStrength(newPassword);
    if (!strengthCheck.isValid) {
      return res.status(400).json({
        success:  false,
        message:  strengthCheck.errors[0],
        errors:   strengthCheck.errors
      });
    }

    // Token validate kora hocche
    const tokenValidation = await validatePasswordResetToken(token);
    if (!tokenValidation.valid) {
      return res.status(400).json({
        success: false,
        message: tokenValidation.message
      });
    }

    // Noya password hash kora hocche
    const newPasswordHash = await hashPassword(newPassword);

    // Database e password update kora hocche
    await UserAccountModel.updatePassword(tokenValidation.record.user_id, newPasswordHash);

    // Token used mark kora hocche
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
// changePassword — Logged-in user er password change korar jonno
// PUT /api/auth/change-password
// Current password verify kore noya password save korbe
// ==========================================
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
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

    // Password strength check
    const strengthCheck = validatePasswordStrength(newPassword);
    if (!strengthCheck.isValid) {
      return res.status(400).json({
        success: false,
        message: strengthCheck.errors[0],
        errors:  strengthCheck.errors
      });
    }

    // Database theke full user data (with password hash) newa hocche
    const userWithPassword = await UserAccountModel.findByIdWithPassword(req.user.id);

    // Current password verify kora hocche
    const isCurrentCorrect = await comparePassword(currentPassword, userWithPassword.password_hash);
    if (!isCurrentCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    // Noya password hash kore save kora hocche
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
