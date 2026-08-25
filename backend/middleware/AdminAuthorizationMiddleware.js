// ==========================================
// JanaoBangla — Admin Authorization Middleware
// BRANCH: feature-admin-dashboard-and-system-monitoring
// Request kora user shotti Admin kina strictly check korbe
// Admin na hole 403 Forbidden access deny korbe
// ==========================================

function AdminAuthorizationMiddleware(req, res, next) {
  // User login kora ache kina ebong role 'admin' kina check korbo
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required to perform this action.'
    });
  }

  // Admin role verified holey next handler e pathiye dibe
  next();
}

module.exports = AdminAuthorizationMiddleware;
