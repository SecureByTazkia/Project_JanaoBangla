// ==========================================
// JanaoBangla — User Authentication Middleware
// BRANCH: feature-user-authentication-and-security
// Protected routes e JWT token verify korbe
// Admin-only routes e role check korbe
// ==========================================

const { verifyAccessToken } = require('../services/TokenService');
const UserAccountModel       = require('../models/UserAccountModel');

// ==========================================
// requireAuthentication — JWT token verify korar middleware
// Request e Authorization header theke token newa hocche
// Valid hoile req.user set kore next() call korbe
// Invalid hoile 401 response pathabe
// ==========================================
async function requireAuthentication(req, res, next) {
  try {
    // Authorization header theke Bearer token newa hocche
    const authHeader = req.headers['authorization'];

    // Header na thakle unauthorized response pathano hocche
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login to continue.'
      });
    }

    // "Bearer " prefix sore token newa hocche
    const token = authHeader.substring(7);

    // Token verify kora hocche TokenService diye
    const decoded = verifyAccessToken(token);

    // Token invalid ba expired hoile 401 pathano hocche
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid. Please login again.'
      });
    }

    // Database theke fresh user data newa hocche
    // Reason: user ban/deactivate hoye thakte pare token issue er pore
    const user = await UserAccountModel.findById(decoded.id);

    // User database e na thakle ba inactive hoile 401 pathano hocche
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or deactivated.'
      });
    }

    // req.user set kora hocche — porer middleware ba controller use korte parbe
    req.user = user;
    next();
  } catch (error) {
    // Unexpected error hoile 500 pathano hocche
    next(error);
  }
}

// ==========================================
// requireAdmin — Admin role check er middleware
// requireAuthentication er pore use korte hobe
// User admin na hoile 403 Forbidden pathabe
// ==========================================
function requireAdmin(req, res, next) {
  // req.user requireAuthentication e set hoyeche
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  // Admin confirmed, next middleware te jawa hocche
  next();
}

// ==========================================
// optionalAuthentication — Public routes e user check korbe
// Token thakle req.user set korbe, na thakle skip korbe
// Map page ba community feed er jonno — login na holeo dekhano jabe
// ==========================================
async function optionalAuthentication(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];

    // Token na thakle skip kora hocche — public route
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token   = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (decoded) {
      // Valid token thakle user data set kora hocche
      req.user = await UserAccountModel.findById(decoded.id);
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // Optional auth e error hoile skip kore continue korbe
    req.user = null;
    next();
  }
}

module.exports = { requireAuthentication, requireAdmin, optionalAuthentication };
