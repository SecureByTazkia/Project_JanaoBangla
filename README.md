# JanaoBangla 🇧🇩

> **"Report Today. Build a Better Bangladesh."**

JanaoBangla is an evidence-based civic problem reporting, community verification, location mapping, analytics, AI assistance, and women safety emergency platform built for Bangladesh.

---

## 🌟 Features

| Feature | Phase | Status |
|---------|-------|--------|
| Base Architecture + Homepage | Phase 1 (main) | ✅ Complete |
| User Authentication & Security | Phase 2 | 🔲 Pending |
| Civic Problem Reporting | Phase 3 | 🔲 Pending |
| Location & Map Visualization | Phase 4 | 🔲 Pending |
| Community Feed & Comments | Phase 5 | 🔲 Pending |
| Duplicate Report Detection | Phase 6 | 🔲 Pending |
| Women Safety SOS | Phase 7 | 🔲 Pending |
| Admin Dashboard | Phase 8 | 🔲 Pending |
| Search, Filter & Analytics | Phase 9 | 🔲 Pending |
| AI-Powered Recognition | Phase 10 | 🔲 Pending |

---

## 🛠️ Technology Stack

**Frontend:**
- React.js + Vite
- React Router DOM
- Axios
- Bootstrap 5
- Leaflet.js + React Leaflet
- Recharts

**Backend:**
- Node.js + Express.js
- MySQL2
- bcrypt + JWT
- Multer (file uploads)
- Nodemailer (email)
- express-rate-limit

**Database:**
- MySQL 8.x

**AI:** Google Gemini API (Phase 10)

---

## 📁 Project Structure

```
Project_JanaoBangla/
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── components/     # Navbar, Footer, shared UI
│       ├── pages/          # One file per route/page
│       ├── services/       # API service (Axios)
│       ├── styles/         # CSS files
│       ├── App.jsx         # Router + layout
│       └── main.jsx        # Entry point
│
├── backend/
│   ├── server.js           # Express entry point
│   ├── package.json
│   ├── config/             # DB connection
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth, error, rate limit
│   ├── models/             # DB models (Phase 2+)
│   ├── routes/             # API route definitions
│   ├── services/           # Service layer
│   └── utils/              # Helper utilities
│
├── database/
│   ├── schema.sql          # All table definitions
│   └── seed.sql            # Development test data
│
├── .env.example            # Environment variable template
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js v18+
- MySQL 8.x (XAMPP, MySQL Workbench, or standalone)
- Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Project_JanaoBangla
```

### 2. Database Setup

Start your MySQL server (XAMPP → Start MySQL).

Then run the schema:

```bash
mysql -u root -p < database/schema.sql
```

Optional — seed development data:

```bash
mysql -u root -p < database/seed.sql
```

> 📝 Default seed admin: `admin@janaobangla.com` / `Admin@1234`

### 3. Backend Setup

```bash
cd backend
cp ../.env.example .env
# Edit .env with your MySQL password, email credentials etc.
npm install
npm run dev
```

Backend starts at: `http://localhost:5000`

Health check: `http://localhost:5000/api/health`

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at: `http://localhost:5173`

---

## 🔐 Environment Variables

Copy `.env.example` to `backend/.env` and configure:

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port (default: 5000) |
| `DB_HOST` | MySQL host (default: localhost) |
| `DB_PORT` | MySQL port (default: 3306) |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name (janao_bangla_db) |
| `JWT_SECRET` | JWT signing secret (min 64 chars) |
| `EMAIL_USER` | Gmail address for Nodemailer |
| `EMAIL_PASSWORD` | Gmail App Password |
| `GEMINI_API_KEY` | Google Gemini API key (Phase 10) |
| `SMS_PROVIDER` | SMS provider (use `mock` for dev) |

---

## 🗄️ Database Schema

All tables are defined in `database/schema.sql`:

- `users` — User accounts with role (user/admin)
- `email_verifications` — Email verification tokens
- `password_resets` — Password reset tokens
- `locations` — GPS coordinates for reports
- `reports` — Civic problem reports
- `report_evidence` — Uploaded images/videos
- `comments` — Community comments and replies
- `report_verifications` — Community confirmations
- `emergency_contacts` — Women safety SOS contacts
- `emergency_requests` — SOS activation history
- `notifications` — System notifications
- `duplicate_links` — Linked duplicate reports

---

## 🌐 API Endpoints

| Endpoint | Description | Phase |
|----------|-------------|-------|
| `GET /api/health` | Server + DB health check | Phase 1 ✅ |
| `POST /api/auth/register` | User registration | Phase 2 |
| `POST /api/auth/login` | User login | Phase 2 |
| `GET /api/reports` | List public reports | Phase 3 |
| `POST /api/reports` | Create report | Phase 3 |
| `GET /api/location` | Location data | Phase 4 |
| `GET /api/community` | Community feed | Phase 5 |
| `GET /api/duplicates` | Check duplicates | Phase 6 |
| `POST /api/sos` | Activate SOS | Phase 7 |
| `GET /api/admin` | Admin dashboard | Phase 8 |
| `GET /api/search` | Search reports | Phase 9 |
| `GET /api/analytics` | Analytics data | Phase 9 |
| `POST /api/ai` | AI suggestions | Phase 10 |

---

## 🔀 Git Branch Workflow

| Branch | Purpose |
|--------|---------|
| `main` | Foundation — base architecture |
| `feature-user-authentication-and-security` | Phase 2 |
| `feature-civic-problem-reporting-visibility-and-management` | Phase 3 |
| `feature-location-and-civic-problem-map-visualization` | Phase 4 |
| `feature-community-feed-comments-and-discussion` | Phase 5 |
| `feature-duplicate-civic-problem-report-detection` | Phase 6 |
| `feature-women-safety-sos-and-emergency-notifications` | Phase 7 |
| `feature-admin-dashboard-and-system-monitoring` | Phase 8 |
| `feature-civic-report-search-filter-and-analytics` | Phase 9 |
| `feature-ai-powered-civic-problem-recognition-and-smart-suggestions` | Phase 10 |

---

## 🧪 Testing Commands

```bash
# Backend health check
curl http://localhost:5000/api/health

# Frontend build test
cd frontend && npm run build

# Backend syntax check
cd backend && node -c server.js
```

---

## 🔒 Security Notes

- Never commit `.env` files
- Passwords are hashed using bcrypt (cost factor 12)
- JWT tokens expire in 7 days
- Admin accounts must be created via database seed — never through public registration
- Rate limiting: 100 requests per 15 minutes per IP

---

## 📞 Emergency Numbers (Bangladesh)

- National Emergency: **999**
- Fire Service: **16430**
- Police: **999**
- Ambulance: **199**