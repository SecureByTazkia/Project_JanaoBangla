# JanaoBangla - Civic Problem Reporting and Women Safety Platform

> **"Report Today. Build a Better Bangladesh."**  
> *A civic engagement and women safety platform designed for Bangladesh.*

[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-blue)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MySQL%20(XAMPP)-orange)](https://www.apachefriends.org/)
[![AI Engine](https://img.shields.io/badge/AI-Google%20Gemini%20Flash-purple)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

---

## Table of Contents
- [About the Project](#about-the-project)
- [Current Scope and Future Roadmap](#current-scope-and-future-roadmap)
- [Key Features](#key-features)
- [System Architecture and Tech Stack](#system-architecture-and-tech-stack)
- [Project Directory Structure](#project-directory-structure)
- [Prerequisites](#prerequisites)
- [Step-by-Step Installation and Setup](#step-by-step-installation-and-setup)
- [Environment Variables Guide](#environment-variables-guide)
- [Default Demo Credentials](#default-demo-credentials)
- [API Endpoints Overview](#api-endpoints-overview)
- [Security and Moderation](#security-and-moderation)
- [Emergency Hotlines (Bangladesh)](#emergency-hotlines-bangladesh)

---

## About the Project

JanaoBangla is a full-stack, evidence-based civic issue reporting, community verification, AI-assisted content moderation, interactive map visualization, and women safety emergency response platform tailored for Bangladesh.

It allows citizens to report civic infrastructure issues (such as road damage, waterlogging, non-functional streetlights, illegal extortion, and public safety concerns) with accurate GPS coordinates, multimedia evidence, and optional anonymous reporting.

---

## Current Scope and Future Roadmap

### Current Scope (Awareness and Admin Management)
Currently, the platform is operated and managed by system administrators. Its primary objectives in the current phase are:
- Raising public awareness regarding local civic issues.
- Gathering verified reports and evidence directly from citizens.
- Community verification and discussion among citizens.
- Administrative moderation and status tracking.

### Future Roadmap (Government and Municipal Authority Integration)
In upcoming phases, direct integration with relevant government bodies, law enforcement agencies, and municipal corporations (e.g., City Corporations, Pourashavas, and emergency response teams) will be established so that authorities can directly take on-ground action and update resolution statuses.

---

## Key Features

### 1. User Authentication and Account Security
- Secure registration and login using JSON Web Tokens (JWT) and bcrypt password hashing (cost factor 12).
- Email verification workflow via Nodemailer.
- Secure password reset via time-limited email tokens and in-app password update.
- Role-Based Access Control (RBAC) separating citizen and admin roles.
- Rate limiting on authentication routes to mitigate brute-force attempts.

### 2. Civic Problem Reporting and Lifecycle Management
- Multi-Category Reporting:
  - Road Damage and Potholes
  - Garbage and Waste Accumulation
  - Street Light Issues
  - Waterlogging and Drainage Blockages
  - Traffic Congestion and Accident Hazards
  - Public Safety and Hazards
  - Women Harassment (Categorized into Online vs Offline/Physical)
  - Illegal Money Collection / Extortion Reports
- Anonymous Reporting: Citizen names and profiles can be hidden on public feeds and maps.
- Visibility Control: Option to submit reports as public (visible on feed/map) or private (visible only to admins).
- Multimedia Evidence: Upload images and videos supporting the report.
- Status Tracking: Real-time progress monitoring (Submitted -> Under Review -> Processing -> Solved / Rejected).

### 3. AI-Powered Content Safety and Moderation
- Integrated with Google Gemini AI for automated evidence moderation:
  - Automated NSFW and Adult Content Detection: Scans uploaded evidence files and automatically blocks inappropriate or explicit imagery before submission.

### 4. Interactive Civic Map and GPS Visualization
- Leaflet.js and OpenStreetMap integration displaying active civic issues across Bangladesh.
- One-click GPS location detection for instant coordinates.
- Categorized map markers with detailed information popups.
- Geocoding and reverse geocoding for automated address filling.

### 5. Women Safety SOS and Emergency Response System
- One-Click Emergency Trigger: Instant SOS activation with real-time GPS coordinates.
- Trusted Guardians Network: Add, edit, and manage emergency contacts.
- Emergency Alert Dispatch: Sends distress alerts via email and in-app notifications.
  - *Note on SMS Gateway:* Direct SMS delivery via MiMSMS is currently in progress and will be activated once provider gateway onboarding is complete.
- Acoustic Distress Siren and visual alert for immediate danger.
- Quick-dial access to national emergency contact numbers.

### 6. Community Feed and Civic Discussion
- Public community feed showcasing citizen-submitted issues.
- Community Verification: Citizens can confirm and upvote issues in their area to increase visibility.
- Comment threads for public discussion on individual reports.

### 7. Admin Dashboard and System Monitoring
- Overview analytics: total users, verified citizens, active reports by category, and emergency logs.
- Report moderation: review submissions, update status, and attach admin resolution remarks.
- User management: manage citizen accounts and role assignments.
- Content moderation: remove flagged comments or inappropriate reports.

### 8. Advanced Search, Filtering, and Analytics
- Full-text search across titles, descriptions, and addresses.
- Multi-parametric filtering by category, status, and date range.
- Visual charts for category breakdowns and reporting trends using Recharts.

---

## System Architecture and Tech Stack

```
+---------------------------------------------------------+
|                  REACT 18 SPA (VITE)                    |
|   Bootstrap 5 | Leaflet.js | Recharts | Axios | Context |
+----------------------------+----------------------------+
                             | REST API (JSON / Multipart)
+----------------------------v----------------------------+
|               NODE.JS + EXPRESS.JS BACKEND              |
|   JWT Auth | Multer | Rate Limiter | Nodemailer | AI    |
+----------------------------+----------------------------+
                             | SQL Queries (Pool)
+----------------------------v----------------------------+
|                  MYSQL (XAMPP) DATABASE                 |
|       Users | Reports | Locations | SOS | Comments      |
+---------------------------------------------------------+
```

| Component | Technologies Used |
| :--- | :--- |
| Frontend | React.js 18, Vite, React Router DOM v6, Bootstrap 5, Leaflet.js, React-Leaflet, Recharts, Axios |
| Backend | Node.js, Express.js, MySQL2 (Connection Pool), JWT, Bcrypt.js, Multer, Nodemailer, Express-Rate-Limit |
| Database | MySQL 8.x via XAMPP |
| AI Integration | Google Gemini 1.5 Flash API |
| SMS Gateway (Roadmap) | MiMSMS (Integration in progress) |

---

## Project Directory Structure

```
Project_JanaoBangla/
├── backend/
│   ├── config/
│   │   └── DatabaseConnection.js          # MySQL connection pool configuration
│   ├── controllers/                       # Express controllers
│   ├── middleware/                        # Auth, rate limit, upload, error middleware
│   ├── models/                            # Database models (SQL queries)
│   ├── routes/                            # REST API route definitions
│   ├── services/                          # Business logic services
│   ├── uploads/                           # Uploaded evidence files
│   ├── server.js                          # Express entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/                    # Reusable UI components
│   │   ├── context/                       # AuthContext
│   │   ├── pages/                         # Application route pages
│   │   ├── services/                      # Axios API services
│   │   ├── styles/                        # Custom stylesheets
│   │   ├── App.jsx                        # Routing and layout
│   │   └── main.jsx                       # Entry root
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── database/
│   ├── schema.sql                         # MySQL database schema
│   └── seed.sql                           # Initial test data and seed admin
│
├── .env.example
├── .gitignore
└── README.md
```

---

## Prerequisites

Ensure you have the following installed on your machine:
- Node.js (v18.x or v20.x recommended)
- XAMPP (with MySQL and Apache) or standalone MySQL Server 8.x
- Git

---

## Step-by-Step Installation and Setup

### 1. Clone the Repository
```bash
git clone https://github.com/SecureByTazkia/Project_JanaoBangla.git
cd Project_JanaoBangla
```

---

### 2. Database Setup (MySQL via XAMPP)
1. Open the **XAMPP Control Panel** and click **Start** next to MySQL.
2. Open phpMyAdmin (`http://localhost/phpmyadmin`) or use the MySQL terminal.
3. Import the database schema:
```bash
mysql -u root -p < database/schema.sql

# Optional: Seed test accounts and sample data
mysql -u root -p < database/seed.sql
```

---

### 3. Backend Setup
```bash
cd backend

# Create .env configuration file
copy ..\.env.example .env     # Windows
# cp ../.env.example .env     # Linux / macOS

# Install dependencies
npm install

# Run backend in development mode
npm run dev
```
Backend will be available at: `http://localhost:5000`  
Health check: `http://localhost:5000/api/health`

---

### 4. Frontend Setup
Open a separate terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Run Vite React development server
npm run dev
```
Frontend will be accessible at: `http://localhost:5173`

---

## Environment Variables Guide

Configure your `backend/.env` file with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# MySQL Database (XAMPP default settings)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=janao_bangla_db

# JWT Authentication
JWT_SECRET=your_secure_random_jwt_secret_key_minimum_64_characters
JWT_EXPIRES_IN=7d

# Email Service (Nodemailer / Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM="JanaoBangla Civic Portal <no-reply@janaobangla.com>"

# Google Gemini AI (Content Moderation)
GEMINI_API_KEY=your_google_gemini_api_key

# SMS Gateway (MiMSMS - in progress)
SMS_PROVIDER=mimsms
MIMSMS_API_KEY=your_mimsms_api_key
MIMSMS_USERNAME=your_mimsms_account_email
MIMSMS_SENDER_NAME=JanaoBangla

# File Upload Settings
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10
```

---

## Default Demo Credentials

When `database/seed.sql` is imported, you can test with:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| System Admin | `admin@janaobangla.com` | `Admin@1234` | Administrative controls and moderation |
| Citizen | `citizen@janaobangla.com` | `Citizen@1234` | Civic problem reporting, SOS, community feed |

---

## API Endpoints Overview

| Category | Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- | :---: |
| Health | GET | `/api/health` | Server and database health status | No |
| Auth | POST | `/api/auth/register` | Citizen account registration | No |
| | POST | `/api/auth/login` | User authentication and JWT issuance | No |
| | GET | `/api/auth/profile` | Current user profile | Yes |
| | POST | `/api/auth/forgot-password` | Initiate password reset email | No |
| | POST | `/api/auth/reset-password` | Complete password reset using token | No |
| Reports | GET | `/api/reports` | Get public civic reports (paginated) | No |
| | POST | `/api/reports` | Create new report with evidence | Yes |
| | GET | `/api/reports/my-reports` | List reports submitted by current user | Yes |
| | GET | `/api/reports/:id` | Get details of a single report | No |
| Location | GET | `/api/location/reports` | Fetch all report coordinates for map | No |
| Community | POST | `/api/community/:id/verify` | Upvote and verify a report | Yes |
| | GET | `/api/community/:id/comments`| Get comments for a report | No |
| | POST | `/api/community/:id/comments`| Submit a comment on a report | Yes |
| SOS | POST | `/api/sos/trigger` | Trigger emergency alert | Yes |
| | GET | `/api/sos/history` | View SOS activation history | Yes |
| | GET | `/api/emergency-contacts` | List emergency contacts | Yes |
| | POST | `/api/emergency-contacts` | Add new emergency contact | Yes |
| AI | POST | `/api/ai/moderate-image` | NSFW and adult content detection scan | Yes |
| Search & Analytics | GET | `/api/search` | Filter and search reports | No |
| | GET | `/api/analytics/overview`| Civic problem statistical metrics | No |
| Admin | GET | `/api/admin/stats` | Dashboard aggregate statistics | Admin |
| | PATCH | `/api/admin/reports/:id/status` | Update problem resolution status | Admin |
| | GET | `/api/admin/users` | List platform users | Admin |

---

## Security and Moderation

1. AI Content Safety: Automatic screening prevents explicit or adult media from being submitted to the platform.
2. User Privacy: Encrypts citizen identity whenever anonymous mode is enabled.
3. Database Security: Prepared SQL statements prevent SQL injection across all queries.
4. Token Management: JWT tokens expire after 7 days, and passwords are salted and hashed with bcrypt.

---

## Emergency Hotlines (Bangladesh)

National hotlines accessible via the JanaoBangla platform:

- National Emergency Service: `999` (Police, Fire, Ambulance)
- Women and Child Helpline: `109` (Ministry of Women and Children Affairs)
- National Legal Aid Helpline: `16430`
- Health Service Helpline: `16263`

---

## License

This project is open-source and distributed under the **MIT License**.