# Swachhta & Green Standard Compliance Monitoring Dashboard

A MERN stack web application to digitize cleanliness (Swachhta) and green-standard compliance monitoring across campus/institutional locations. Auditors record inspections against scoring criteria, the system auto-computes compliance percentages, flags locations below threshold, and tracks violations through to resolution.

**Full Stack Development — Zeroth Review Project**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Database | MongoDB + Mongoose |
| Backend | Node.js + Express.js |
| Frontend | React 18 (Vite) + Tailwind CSS |
| Charts | Recharts |
| Auth | JWT + bcryptjs |
| HTTP Client | Axios |

---

## Features

**Authentication & Roles**
- JWT-based register/login
- Two roles: `admin` (full control) and `auditor` (record inspections & violations)
- Protected routes on both frontend and backend

**Location Management**
- CRUD for campus locations (Academic Block, Hostel, Canteen, Lab, Washroom, etc.)
- Per-location configurable compliance threshold (%)
- Search and category filtering

**Inspection Module**
- 5 weighted scoring criteria: Cleanliness & Sanitation, Waste Segregation & Disposal, Water & Energy Conservation, Green Cover Upkeep, Signage & Awareness
- Compliance score auto-computed as a percentage via a Mongoose pre-save hook
- Status auto-assigned as Compliant / Non-Compliant against the location's threshold
- Live score preview while filling the form

**Violation Tracking**
- Report violations by category and severity (Low / Medium / High)
- Status workflow: Open → In Progress → Resolved
- Inline status updates from the table

**Dashboard & Analytics**
- Summary cards: total locations, total inspections, open violations, average compliance score
- Alert panel listing locations whose latest inspection fell below threshold
- Compliance score trend line chart
- Violations-by-category bar chart

---

## Project Structure

```
swachhta-green-dashboard/
├── backend/
│   ├── config/db.js                  # MongoDB connection
│   ├── models/                       # User, Location, Inspection, Violation
│   ├── middleware/                   # auth.js (JWT), role.js (RBAC)
│   ├── controllers/                  # Business logic per module
│   ├── routes/                       # Express routers
│   ├── seed.js                       # Demo data seeder
│   ├── server.js                     # App entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/axios.js              # Axios instance + token interceptor
    │   ├── context/AuthContext.jsx   # Global auth state
    │   ├── components/               # Navbar, ProtectedRoute
    │   ├── pages/                    # Login, Register, Dashboard,
    │   │                             #   Locations, Inspections, Violations
    │   ├── App.jsx                   # Routing
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## Setup Instructions

### Prerequisites
- Node.js v18 or higher
- MongoDB running locally (or a MongoDB Atlas connection string)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/swachhta_green_dashboard
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
```

Seed demo data (optional but recommended for the review demo):

```bash
npm run seed
```

Start the server:

```bash
npm run dev      # with nodemon
# or
npm start
```

Backend runs at `http://localhost:5000`

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Demo Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@college.edu | admin123 |
| Auditor | auditor@college.edu | auditor123 |

---

## API Endpoints

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |

### Locations
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/locations` | Authenticated |
| GET | `/api/locations/:id` | Authenticated |
| POST | `/api/locations` | Admin |
| PUT | `/api/locations/:id` | Admin |
| DELETE | `/api/locations/:id` | Admin |

### Inspections
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/inspections` | Authenticated |
| GET | `/api/inspections/:id` | Authenticated |
| POST | `/api/inspections` | Admin, Auditor |
| PUT | `/api/inspections/:id` | Admin, Auditor |
| DELETE | `/api/inspections/:id` | Admin |

### Violations
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/violations` | Authenticated |
| POST | `/api/violations` | Admin, Auditor |
| PUT | `/api/violations/:id` | Admin, Auditor |
| DELETE | `/api/violations/:id` | Admin |

### Dashboard
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/dashboard/summary` | Authenticated |

---

## Database Schema Summary

**User** — name, email (unique), password (hashed), role (admin/auditor)

**Location** — name, department, category, incharge, complianceThreshold, createdBy

**Inspection** — location (ref), auditor (ref), inspectionDate, criteria[{name, maxScore, obtainedScore, remarks}], complianceScore (auto), status (auto), notes

**Violation** — location (ref), inspection (ref), reportedBy (ref), category, description, severity, status, correctiveAction, resolvedAt

---

## Compliance Score Logic

```
complianceScore = round( (Σ obtainedScore / Σ maxScore) × 100 )

status = complianceScore >= location.complianceThreshold
         ? 'Compliant'
         : 'Non-Compliant'
```

Computed in a Mongoose `pre('save')` hook on the Inspection model, so the score stays consistent regardless of whether the record is created or updated.

---

## Possible Enhancements for Later Reviews

- Photo upload for inspections and violations (Multer + Cloudinary)
- PDF / Excel export of compliance reports
- Email notifications when a location drops below threshold
- Scheduled/recurring inspection reminders
- QR code per location for quick mobile audit entry
- Department-wise comparative leaderboard
