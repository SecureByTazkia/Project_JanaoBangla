// ==========================================
// JanaoBangla — Express Server Entry Point
// BRANCH: main
// Ei file ta backend server er shuru howa jaiga
// Sob middleware, route, ar configuration ekhane connect hobe
// ==========================================

// .env file theke environment variables load kora hocche
require('dotenv').config();

const express        = require('express');
const cors           = require('cors');
const rateLimit      = require('express-rate-limit');
const path           = require('path');

// Project er nija middleware ar route files import kora hocche
const { testDatabaseConnection }   = require('./config/DatabaseConnection');
const healthCheckRoutes            = require('./routes/HealthCheckRoutes');
const userAuthenticationRoutes     = require('./routes/UserAuthenticationRoutes'); // Phase 2
const notFoundMiddleware           = require('./middleware/NotFoundMiddleware');
const errorHandlingMiddleware      = require('./middleware/ErrorHandlingMiddleware');

// ==========================================
// Express app create kora hocche
// ==========================================
const app  = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// CORS CONFIGURATION
// Frontend (React Vite) ke backend access dewa hocche
// Origin mane frontend er URL, .env theke newa hocche
// ==========================================
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods:            ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders:     ['Content-Type', 'Authorization'],
  credentials:        true
};
app.use(cors(corsOptions));

// ==========================================
// GLOBAL RATE LIMITER
// Ekta IP theke beshi beshi request asle block korbe
// Ei configuration .env theke newa hocche
// ==========================================
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minute
  max:      parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders:   false
});
app.use('/api', globalLimiter);

// ==========================================
// REQUEST BODY PARSERS
// Client theke JSON ar URL-encoded data parse kora hocche
// ==========================================
app.use(express.json({ limit: '10mb' }));           // JSON body parse korbe
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Form data parse korbe

// ==========================================
// STATIC FILE SERVING
// Uploaded files (images/videos) serve kora hocche
// /uploads route diye file access kora jabe
// ==========================================
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
app.use('/uploads', express.static(uploadDir));

// ==========================================
// API ROUTES — Sob route ekhane register hocche
// Phase 1 e shudhu health check route ache
// Porer phase e authentication, reports etc jog hobe
// ==========================================
app.use('/api/health', healthCheckRoutes);

// ==========================================
// PLACEHOLDER ROUTES — Future phases er jonno
// Ekhane comment hisebe ache, pore uncomment hobe
// ==========================================
app.use('/api/auth', userAuthenticationRoutes);         // Phase 2 — User authentication routes
// app.use('/api/reports',       reportRoutes);         // Phase 3
// app.use('/api/location',      locationRoutes);       // Phase 4
// app.use('/api/community',     communityRoutes);      // Phase 5
// app.use('/api/duplicates',    duplicateRoutes);      // Phase 6
// app.use('/api/sos',           sosRoutes);            // Phase 7
// app.use('/api/admin',         adminRoutes);          // Phase 8
// app.use('/api/search',        searchRoutes);         // Phase 9
// app.use('/api/analytics',     analyticsRoutes);      // Phase 9
// app.use('/api/ai',            aiRoutes);             // Phase 10
// app.use('/api/notifications', notificationRoutes);   // Phase 7/8

// ==========================================
// 404 MIDDLEWARE — Kono route match na korle
// Sob route er pore add kora hocche
// ==========================================
app.use(notFoundMiddleware);

// ==========================================
// CENTRAL ERROR HANDLER — Sob error ekhane ashe
// ErrorHandlingMiddleware er 4 parameter dorkar (err, req, res, next)
// ==========================================
app.use(errorHandlingMiddleware);

// ==========================================
// SERVER START FUNCTION
// Database test korbe, tahole server chalabe
// ==========================================
async function startServer() {
  console.log('');
  console.log('🚀 JanaoBangla Backend Starting...');
  console.log('   Environment:', process.env.NODE_ENV || 'development');

  // Database connection test kora hocche server start er age
  const isDbConnected = await testDatabaseConnection();

  if (!isDbConnected) {
    // Database connect na hoile warning dekhabe kintu server chalabe
    // Eta dev mode te useful, production e exit kora uchit
    console.warn('⚠️  Server starting without database. Some features will not work.');
  }

  // Server ke port e listen korte bola hocche
  app.listen(PORT, () => {
    console.log('');
    console.log(`✅ JanaoBangla API Server is running!`);
    console.log(`   URL:         http://localhost:${PORT}`);
    console.log(`   Health:      http://localhost:${PORT}/api/health`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('');
  });
}

// Server start kora hocche
startServer().catch((error) => {
  console.error('💥 Fatal error starting server:', error);
  process.exit(1);
});

module.exports = app;
