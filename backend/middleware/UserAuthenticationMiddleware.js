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
// Valid hoile req.user set kore next() call korbe
// Invalid hoile 401 response pathabe
// ==========================================
async function requireAuthentication(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login to continue.'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid. Please login again.'
      });
    }

    // Database theke fresh user info verify kora hocche
    const user = await UserAccountModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or has been deactivated.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

// ==========================================
// requireAdmin — Admin role check middleware
// requireAuthentication er por use korte hobe
// ==========================================
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.'
    });
  }
  next();
}

// ==========================================
// optionalAuthentication — Token thakle req.user set korbe, na thakle pass korbe
// ==========================================
async function optionalAuthentication(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (decoded) {
      req.user = await UserAccountModel.findById(decoded.id);
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
}

module.exports = {
  requireAuthentication,
  authenticateToken: requireAuthentication, // Alias for requireAuthentication
  requireAdmin,
  optionalAuthentication
};
