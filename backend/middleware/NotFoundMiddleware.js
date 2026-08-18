// ==========================================
// JanaoBangla — Not Found Middleware
// BRANCH: main
// Jodi kono route match na kore, ei middleware run hobe
// 404 error response pathabe client ke
// ==========================================

// ==========================================
// notFoundMiddleware — 404 handler
// Sob route er sheshe ei middleware add kora hobe
// Kono route match na hoile ei function execute hobe
// ==========================================
function notFoundMiddleware(req, res, next) {
  // 404 error create kora hocche path ar method diye
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;

  // Error ke next middleware te pathano hocche (ErrorHandlingMiddleware e jabe)
  next(error);
}

module.exports = notFoundMiddleware;
