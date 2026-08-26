# 🇧🇩 JanaoBangla — Civic Problem Reporting & Women Safety Platform

> **"Report Today. Build a Better Bangladesh."**  
> *নাগরিক সমস্যা নিরসন ও নারী সুরক্ষায় ডিজিটাল বাংলাদেশ বিনির্মাণের একটি আধুনিক প্ল্যাটফর্ম।*

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208.x-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%20Flash-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 Table of Contents
- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [System Architecture & Tech Stack](#-system-architecture--tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Prerequisites](#-prerequisites)
- [Step-by-Step Installation & Setup](#-step-by-step-installation--setup)
- [Environment Variables Guide](#-environment-variables-guide)
- [Default Demo Credentials](#-default-demo-credentials)
- [API Endpoints Overview](#-api-endpoints-overview)
- [Security & Moderation](#-security--moderation)
- [Emergency Hotlines (Bangladesh)](#-emergency-hotlines-bangladesh)

---

## 🌟 About the Project

**JanaoBangla** is a full-stack, evidence-based civic issue reporting, community verification, AI-assisted content moderation, interactive GIS map visualization, and women safety emergency response platform tailored for Bangladesh.

It bridges the gap between citizens and authorities by allowing people to report civic infrastructure issues (road damage, waterlogging, broken streetlights, illegal extortion/চাঁদাবাজি, public safety concerns) with accurate GPS coordinates, multimedia evidence, anonymous protection, and instant SOS emergency broadcasting.

---

## 🚀 Key Features

### 1. 🛡️ User Authentication & Profile Security
- **JWT & Bcrypt Security:** Secure authentication with encrypted passwords (bcrypt cost factor 12) and 7-day JWT tokens.
- **Email Verification:** Automated OTP/token verification workflow via Nodemailer.
- **Password Management:** Secure password reset via time-limited email tokens and in-app password update.
- **Role-Based Access Control (RBAC):** Strict separation between `citizen` and `admin` privileges.
- **Rate Limiting:** IP-level throttling on login, registration, and OTP endpoints to prevent brute-force attacks.

### 2. 📋 Evidence-Based Civic Problem Reporting
- **Multi-Category Reporting:**
  - 🛣️ Road Damage & Potholes
  - 🗑️ Garbage & Waste Accumulation
  - 💡 Broken / Non-functional Street Lights
  - 🌊 Waterlogging & Drainage Blockages
  - 🚦 Traffic Congestion & Accident Zones
  - 🛡️ Public Safety & Hazards
  - 🚨 Women Harassment (Categorized into *Online* vs *Offline/Physical*)
  - 💰 Illegal Extortion / চাঁদাবাজির অভিযোগ
- **Anonymous Reporting (🎭):** Option to conceal user identity as "Anonymous Citizen" on public feeds and map.
- **Visibility Control:** Toggle between `public` (community-visible) and `private` (direct to admin only).
- **Multimedia Evidence:** Upload multiple photo/video files with automated server-side file type and size validation.
- **Lifecycle Tracking:** Real-time status tracker (`Submitted` ➔ `Under Review` ➔ `In Progress` ➔ `Solved` / `Rejected`).

### 3. 🤖 AI-Powered Problem Recognition & Content Safety
- **Powered by Google Gemini AI:**
  - **Automated NSFW & Adult Content Detection:** Scans evidence images upon upload and automatically rejects inappropriate or NSFW imagery before submission.
  - **Visual Problem Category Recognition:** Analyzes photos to suggest the most appropriate civic category with confidence scoring.
  - **Smart Title & Quality Description Generator:** Enhances user descriptions into structured, actionable problem reports.
  - **Action Recommendations:** Suggests immediate safety or municipal remediation steps for the reported issue.

### 4. 🗺️ Interactive Civic Map & GPS Visualization
- **Leaflet.js + OpenStreetMap:** Real-time map displaying all active public civic issues across Bangladesh.
- **One-Click GPS Location:** "My GPS Location" feature for instant device-level geolocation pinpointing.
- **Custom Visual Markers:** Color-coded and iconized category markers with detailed popups and direct navigation.
- **Geocoding & Reverse Geocoding:** Auto-populates street addresses based on latitude and longitude coordinates.

### 5. 🚨 Women Safety SOS & Emergency Response System
- **One-Click Emergency Trigger:** Instant SOS activation with real-time GPS coordinates.
- **Trusted Guardians Network:** Add, edit, and manage emergency contacts with custom relationship tags.
- **Multi-Channel Emergency Broadcasting:**
  - 📱 **Instant SMS Broadcast:** Sends emergency SMS with live Google Maps link via Bangladesh SMS gateway (**MiMSMS**).
  - 📧 **Emergency Email Alert:** Dispatches urgent distress emails with exact GPS coordinates.
  - 🔔 **In-App Notifications:** Real-time alert records stored in database.
- **Loud Siren & Visual Strobe:** Built-in acoustic distress siren and flashing alarm for immediate deterrence.
- **Direct Emergency Calling:** Integrated quick-dial access to National Emergency Services (999, 109, 10921, 16430).

### 6. 💬 Community Feed, Upvoting & Discussion
- **Citizen Feed:** Explore civic issues reported in your neighborhood or across the country.
- **Community Confirmation / Upvotes:** Citizens can verify and upvote issues ("I also face this issue") to increase municipal urgency.
- **Discussion Threads:** Community comments and suggestions on individual problem reports.

### 7. 📊 Admin Dashboard & System Monitoring
- **Platform Analytics:** Real-time overview of total citizens, active reports, resolution metrics, and emergency SOS history.
- **Report Moderation:** Update report status, assign administrative response notes, and filter by status/category.
- **User Management:** View citizen directories, promote users to admin, or deactivate suspicious accounts.
- **Content Moderation:** Remove inappropriate comments or flagged reports.

### 8. 🔍 Advanced Search, Filter & Analytics
- **Full-Text Search:** Instant search across titles, descriptions, and street locations.
- **Multi-Parametric Filters:** Filter by category, status, date range, and division.
- **Visual Analytics:** Interactive charts powered by Recharts (Category distribution, Resolution trends, Status breakdowns).

---

## 🛠️ System Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                 REACT 18 SPA (VITE)                     │
│   Bootstrap 5 • Leaflet.js • Recharts • Axios • Context │
└────────────────────────────┬────────────────────────────┘
                             │ REST API (JSON / Multipart)
┌────────────────────────────▼────────────────────────────┐
│               NODE.JS + EXPRESS.JS BACKEND              │
│  JWT Auth • Multer • RateLimiter • Nodemailer • Gemini │
└────────────────────────────┬────────────────────────────┘
                             │ SQL Queries (Connection Pool)
┌────────────────────────────▼────────────────────────────┐
│                     MYSQL 8.x DATABASE                  │
│       Users • Reports • Locations • SOS • Comments      │
└─────────────────────────────────────────────────────────┘
```

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React.js 18, Vite, React Router DOM v6, Bootstrap 5, Bootstrap Icons, Leaflet.js, React-Leaflet, Recharts, Axios |
| **Backend** | Node.js, Express.js, MySQL2 (Connection Pool), JSON Web Tokens (JWT), Bcrypt.js, Multer, Nodemailer, Express-Rate-Limit |
| **Database** | MySQL 8.x (Relational Schema with Foreign Key Constraints & Cascading) |
| **AI Engine** | Google Gemini 1.5 Flash API (`@google/generative-ai`) |
| **SMS Gateway** | MiMSMS (Bangladesh National SMS API) |

---

## 📁 Project Directory Structure

```
Project_JanaoBangla/
├── backend/
│   ├── config/
│   │   └── DatabaseConnection.js          # MySQL connection pool configuration
│   ├── controllers/
│   │   ├── AdminDashboardController.js    # Admin statistics & management logic
│   │   ├── AICivicProblemController.js    # AI image safety & smart suggestions
│   │   ├── CivicProblemReportController.js# Report submission & CRUD
│   │   ├── CivicReportAnalyticsController.js # Analytics & trends data
│   │   ├── CivicReportSearchController.js # Search & multi-filter logic
│   │   ├── CommunityInteractionController.js # Upvotes, comments & discussions
│   │   ├── EmergencyContactController.js  # Emergency guardians CRUD
│   │   ├── LocationController.js          # Map points & GIS queries
│   │   ├── NotificationController.js      # User notifications
│   │   ├── UserAuthenticationController.js# Register, login, OTP & passwords
│   │   └── WomenSafetySOSController.js    # SOS trigger, SMS/Email dispatch
│   ├── middleware/
│   │   ├── AuthenticationRateLimitMiddleware.js # Throttling for auth
│   │   ├── ErrorHandlingMiddleware.js     # Centralized error handler
│   │   ├── FileUploadMiddleware.js        # Multer image/video upload handler
│   │   ├── NotFoundMiddleware.js          # 404 handler
│   │   └── UserAuthenticationMiddleware.js# JWT verification & RBAC check
│   ├── models/                            # Database interaction layer (SQL queries)
│   ├── routes/                            # Express REST API route definitions
│   ├── services/                          # Business logic & 3rd-party integrations
│   │   ├── AIProblemCategorySuggestionService.js
│   │   ├── ImageContentSafetyModerationService.js
│   │   ├── SMSService.js
│   │   └── EmailService.js
│   ├── uploads/                           # Uploaded evidence images & videos
│   ├── server.js                          # Express server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/                    # Reusable UI components (Navbar, Map, Modals, Forms)
│   │   ├── context/                       # React AuthContext (JWT state management)
│   │   ├── pages/                         # Route pages (Home, Reports, Map, SOS, Admin, Profile)
│   │   ├── services/                      # Axios API service integrations
│   │   ├── styles/                        # Custom CSS stylesheets
│   │   ├── App.jsx                        # Application routes & layout
│   │   └── main.jsx                       # Vite React root
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── database/
│   ├── schema.sql                         # Complete MySQL database table definitions
│   └── seed.sql                           # Initial test data & default Admin account
│
├── .env.example                           # Sample environment configuration template
├── .gitignore
└── README.md
```

---

## ⚙️ Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) (v8.x) or [XAMPP](https://www.apachefriends.org/)
- [Git](https://git-scm.com/)

---

## 📥 Step-by-Step Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/SecureByTazkia/Project_JanaoBangla.git
cd Project_JanaoBangla
```

---

### 2. Database Configuration
1. Start your **MySQL server** (e.g., open XAMPP and start MySQL).
2. Create the database and import the tables using your terminal or MySQL Workbench/phpMyAdmin:
```bash
# Log into MySQL and run schema
mysql -u root -p < database/schema.sql

# Optional: Seed sample test data & admin account
mysql -u root -p < database/seed.sql
```

---

### 3. Backend Setup
```bash
cd backend

# Create .env file from template
copy ..\.env.example .env     # On Windows (PowerShell/CMD)
# OR: cp ../.env.example .env # On Linux/macOS

# Install dependencies
npm install

# Start backend in development mode (with nodemon)
npm run dev
```
*Backend server will start at:* **`http://localhost:5000`**  
*Health Check:* **`http://localhost:5000/api/health`**

---

### 4. Frontend Setup
Open a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite React development server
npm run dev
```
*Frontend application will run at:* **`http://localhost:5173`**

---

## 🔐 Environment Variables Guide

Create a `.env` file in the `backend/` directory with the following variables:

```env
# ==========================================
# SERVER CONFIGURATION
# ==========================================
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# ==========================================
# MYSQL DATABASE CONFIGURATION
# ==========================================
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=janao_bangla_db

# ==========================================
# JWT AUTHENTICATION SECRET
# ==========================================
JWT_SECRET=your_super_secret_jwt_key_at_least_64_characters_long
JWT_EXPIRES_IN=7d

# ==========================================
# EMAIL SERVICE (Nodemailer / Gmail SMTP)
# ==========================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM="JanaoBangla Civic Portal <no-reply@janaobangla.com>"

# ==========================================
# GOOGLE GEMINI AI (Content Safety & Recognition)
# ==========================================
GEMINI_API_KEY=your_google_gemini_api_key

# ==========================================
# BANGLADESH SMS GATEWAY (MiMSMS)
# ==========================================
SMS_PROVIDER=mimsms
MIMSMS_API_KEY=your_mimsms_api_key
MIMSMS_USERNAME=your_mimsms_account_email
MIMSMS_SENDER_NAME=JanaoBangla

# ==========================================
# FILE UPLOAD DIRECTORY
# ==========================================
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10
```

---

## 👤 Default Demo Credentials

If you loaded `database/seed.sql`, you can log in with:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **🛡️ System Admin** | `admin@janaobangla.com` | `Admin@1234` | Full Dashboard & Moderation Controls |
| **👤 Citizen** | `citizen@janaobangla.com` | `Citizen@1234` | Problem Reporting, SOS, Community Feed |

---

## 🌐 API Endpoints Overview

| Category | Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- | :---: |
| **Health** | `GET` | `/api/health` | Server & DB health status | ❌ |
| **Auth** | `POST` | `/api/auth/register` | Citizen account registration | ❌ |
| | `POST` | `/api/auth/login` | User login & JWT issuance | ❌ |
| | `GET` | `/api/auth/profile` | Fetch logged-in user profile | ✅ |
| | `POST` | `/api/auth/forgot-password` | Request password reset email | ❌ |
| | `POST` | `/api/auth/reset-password` | Reset password using token | ❌ |
| **Reports** | `GET` | `/api/reports` | Get public civic reports (paginated) | ❌ |
| | `POST` | `/api/reports` | Submit civic problem with evidence | ✅ |
| | `GET` | `/api/reports/my-reports` | List reports submitted by current user | ✅ |
| | `GET` | `/api/reports/:id` | Get detailed report information | ❌ |
| **Location / Map** | `GET` | `/api/location/reports` | Get all active map marker points | ❌ |
| **Community** | `POST` | `/api/community/:id/verify` | Upvote / verify a civic report | ✅ |
| | `GET` | `/api/community/:id/comments`| Get comments for a report | ❌ |
| | `POST` | `/api/community/:id/comments`| Post a new comment | ✅ |
| **Women Safety SOS**| `POST` | `/api/sos/trigger` | Trigger emergency SOS (SMS/Email) | ✅ |
| | `GET` | `/api/sos/history` | Get SOS activation logs | ✅ |
| | `GET` | `/api/emergency-contacts` | List user's emergency contacts | ✅ |
| | `POST` | `/api/emergency-contacts` | Add new emergency contact | ✅ |
| **AI Assistant** | `POST` | `/api/ai/moderate-image` | Scan image for NSFW/adult content | ✅ |
| | `POST` | `/api/ai/analyze-image` | AI category recognition & suggestions | ✅ |
| | `POST` | `/api/ai/suggest-content` | Text-based title & description boost | ✅ |
| **Search & Analytics**| `GET` | `/api/search` | Search reports with filters | ❌ |
| | `GET` | `/api/analytics/overview`| Civic problem distribution & charts | ❌ |
| **Admin** | `GET` | `/api/admin/stats` | System overview dashboard counts | 🛡️ Admin |
| | `PATCH`| `/api/admin/reports/:id/status` | Update report status & resolution note | 🛡️ Admin |
| | `GET` | `/api/admin/users` | List platform users & roles | 🛡️ Admin |

---

## 🔒 Security & Moderation

1. **AI Content Shield:** Automated screening prevents adult, violent, or inappropriate media from polluting public civic feeds.
2. **Anonymous Protection:** Encrypts user identity from public view whenever the citizen selects anonymous mode.
3. **Database Safeguards:** Prepared statements across all models prevent SQL injection.
4. **JWT Expiration & Invalidation:** Tokens expire after 7 days and passwords are encrypted with one-way salted hashes.

---

## 📞 Emergency Hotlines (Bangladesh)

Quick reference hotlines integrated directly into the **JanaoBangla SOS Module**:

- 🚨 **National Emergency Service:** `999` (Police, Fire, Ambulance)
- 👩‍🦰 **Women & Child Helpline:** `109` (Toll-Free, Ministry of Women and Children Affairs)
- 🛡️ **National Legal Aid Helpline:** `16430`
- 🚑 **Health Service Helpline:** `16263`

---

## 📄 License & Contribution

This project is developed as an open civic-tech initiative for community improvement.  
Distributed under the **MIT License**.

Made with ❤️ for a safer, smarter, and cleaner **Bangladesh 🇧🇩**.