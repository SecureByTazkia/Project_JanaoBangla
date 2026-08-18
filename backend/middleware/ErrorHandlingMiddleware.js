// ==========================================
// JanaoBangla — Error Handling Middleware
// BRANCH: main
// Express er sob unhandled error ekhane ashe
// Consistent JSON error response pathabe client ke
// ==========================================

// ==========================================
// errorHandlingMiddleware — Central error handler
// Express e 4 parameter thakle seta error handler bujhte pare
// err, req, res, next — charta e thakte hobe
// ==========================================
function errorHandlingMiddleware(err, req, res, next) {
  // Console e full error log kora hocche (server side debugging er jonno)
  console.error('❌ Server Error:', {
    message: err.message,
    stack:   process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url:     req.originalUrl,
    method:  req.method
  });

  // HTTP status code determine kora hocche
  // Jodi err.status set kora na thake tahole 500 Internal Server Error dewa hobe
  const statusCode = err.status || err.statusCode || 500;

  // Client ke consistent JSON format e error pathano hocche
  const errorResponse = {
    success: false,
    message: err.message || 'Internal server error. Please try again later.',
    // Development mode e stack trace dekhabe, production e dekhabe na
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(statusCode).json(errorResponse);
}

module.exports = errorHandlingMiddleware;
