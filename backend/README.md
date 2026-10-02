# Nagrik AI — Backend

Full backend for the Nagrik AI civic-complaint platform, built to match the
data shapes your React frontend already expects (it was reverse-engineered
straight from `src/utils/mockDb.js` and the three portals: Citizen, Official,
Admin). Swap `mockDb.xxx()` calls in the frontend for `fetch()` calls to
these endpoints and the UI should work with no data-shape changes.

## Stack
Node.js + Express, MongoDB + Mongoose, JWT auth, bcryptjs, express-validator,
helmet / cors / express-rate-limit / express-mongo-sanitize for security.

## Setup

```bash
npm install
cp .env.example .env
# edit .env — set MONGO_URI and a strong JWT_SECRET
npm run seed        # populates demo accounts, officials, sensors, sample complaints
npm run dev         # nodemon
# or
npm start
```

Requires a running MongoDB instance (local `mongod` or MongoDB Atlas).

### Demo logins (created by `npm run seed`)
| Role | Email | Password |
|---|---|---|
| Admin | `admin@nagrik.ai` | `password123` |
| Official | `grievance.officer@nagrikai.in` | `12345` |
| Citizen | `example@gmail.com` | `password123` |

Run `npm run seed:fresh` to wipe and reseed from scratch.

## How this differs from the old frontend mock (on purpose)

The old `mockDb.js` stored everything in one browser's `localStorage`, so it
never had to solve multi-user problems. Moving to a real backend fixes a few
things that were mock-only shortcuts:

- **Complaints are scoped per user.** `GET /api/complaints` returns only
  *your* complaints as a citizen, only complaints *assigned to you* as an
  official, and everything as an admin — the mock returned the same global
  list to everyone.
- **The citizen on a complaint is taken from the logged-in session, never
  from the request body** — so nobody can file a complaint "as" someone else.
- **New officials get a real login.** The mock's "Add Official" only added a
  staff-directory row with no way to actually sign in. Here it creates a
  full account.
- **IDs never collide.** The mock generated complaint/log IDs with
  `Math.random()`. Here they come from an atomic counter.
- **Self-registration always creates a citizen account.** Only an admin can
  create official/admin accounts (via `POST /api/officials` or the seed
  script) — the mock let anyone register as `admin@nagrik.ai` and become an
  admin.

## Auth

All endpoints except `/api/auth/register`, `/api/auth/login`,
`/api/auth/forgot-password`, and `/api/auth/reset-password/:token` require
`Authorization: Bearer <jwt>`. Role restrictions are noted per route below.

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | Public | `name, email, phone, address, password` — always creates a **citizen** |
| POST | `/api/auth/login` | Public | `email, password` → `{ token, user }` |
| POST | `/api/auth/forgot-password` | Public | `email` |
| PUT | `/api/auth/reset-password/:token` | Public | `password` |
| GET | `/api/auth/me` | Private | current user |
| PUT | `/api/auth/profile` | Private | `name, phone, address, notificationsEnabled` |
| PUT | `/api/auth/change-password` | Private | `oldPassword, newPassword` |
| POST | `/api/auth/logout` | Private | client should also discard the token |

## Complaints

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| POST | `/api/complaints/analyze` | Citizen | `{ description }` → AI category/laws/authority (Step 4 of File Complaint) |
| POST | `/api/complaints` | Citizen | `title, description, category, locationName, locationCoordinates, evidence, aiAssessment` |
| GET | `/api/complaints` | Any | role-scoped; optional `?status=` `?category=` |
| GET | `/api/complaints/:id` | Any (owner/assignee/admin) | |
| PUT | `/api/complaints/:id/status` | Admin, assigned Official | `{ status, notes }` |
| PUT | `/api/complaints/:id/assign` | Admin | `{ department, officialId, notes }` |
| PUT | `/api/complaints/:id/decision` | Admin, assigned Official | `{ step1Decision, step2Data, step3Action, step4Status, remarks }` |

## Officials (admin roster)

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/officials` | Admin |
| GET | `/api/officials/:id` | Admin |
| POST | `/api/officials` | Admin — `{ name, email, phone, department, role, password }` |
| PUT | `/api/officials/:id` | Admin |

## Citizens directory

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/citizens` | Admin — every non-admin user with their complaint count/list |

## IoT: Sensors & Detected Events

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/sensors` | Admin |
| PUT | `/api/sensors/:id` | Admin |
| GET | `/api/events` | Admin |
| PUT | `/api/events/:id/review` | Admin |

## AI activity logs

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/ai-logs` | Admin |
| POST | `/api/ai-logs` | Admin |

## Notifications (three separate inboxes, same as the frontend's three tabs)

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/notifications` | Citizen — your own |
| PUT | `/api/notifications/read` | Citizen |
| GET | `/api/notifications/official` | Official — your own |
| PUT | `/api/notifications/official/read` | Official |
| GET | `/api/notifications/admin` | Admin |
| PUT | `/api/notifications/admin/read` | Admin |

Notifications are created automatically by other actions (filing a
complaint, assignment, status changes, official decisions, field-action
dispatch/resolution) — there's no manual "create notification" endpoint.

## Field Actions (official field-dispatch workflow)

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/field-actions?complaintId=` | Official, Admin |
| POST | `/api/field-actions` | Official — `{ complaintId, action, assignedTeam, priority, targetDate, instructions }` |
| PUT | `/api/field-actions/:complaintId/verify` | Official — `{ resolutionNote }` |

## Security features
- bcrypt password hashing (12 rounds), passwords never returned in responses
- JWT auth with configurable expiry, role-based route guards (`authorize(...)`)
- Account lockout after 5 failed logins (15 min), rate limiting on login/forgot-password
- Forgot-password gives an identical response whether the email exists or not
- `express-mongo-sanitize` strips `$`/`.` from request bodies (NoSQL injection)
- `helmet` secure headers; JSON body capped at 1mb

## Not yet wired up
- Real email delivery for password reset (link is logged to the console — swap in
  nodemailer/SendGrid in `controllers/authController.js` → `forgotPassword`)
- File uploads: like the original frontend, evidence is stored as filename
  strings, not actual uploaded files. Add `multer` + object storage if you need
  real image uploads.
- Live IoT sensor ingestion — sensor readings are static/seeded; if you want
  sensors to update in real time, add a POST endpoint (or a small interval
  job) that writes new readings and pushes over WebSockets/SSE.

## Folder structure
```
nagrik-ai-backend/
├── config/db.js
├── controllers/        auth, complaint, official, citizen, sensor, event,
│                        aiLog, notification, fieldAction
├── middleware/          auth (protect/authorize), errorHandler, validators
├── models/               User, Complaint, Sensor, DetectedEvent, AILog,
│                        Notification, FieldAction
├── routes/               one router per resource, mirrors controllers
├── scripts/seed.js      demo accounts + sensors + events + sample complaints
├── utils/                aiAssessment, counter, formatDate, notify, generateToken
├── server.js
├── package.json
└── .env.example
```
