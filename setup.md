<!--
Setup guide for local development: backend, frontend, and ML service.
Do not commit secrets. This file was updated to reflect recent auth and runtime changes.
-->

# LendIQ — Detailed Setup Guide (Developer)

This guide provides in-depth setup steps, scripts, and troubleshooting tips for local development. For a quick overview and environment variable reference, see [**README.md**](./README.md).

Prerequisites
-------------
- Node.js (recommended v18+ or current LTS)
- pnpm
- MongoDB (local or Atlas)
- Python 3.9+ (for ML service)

---

## Environment Variables

### Backend (`backend/.env`)

```env
# === Required ===
MONGODB_URI=mongodb://localhost:27017/lendiq          # Your MongoDB connection string
JWT_SECRET=replace-with-a-secure-secret-at-least-32-chars
ML_SERVICE_URL=http://localhost:8000/predict           # URL to the ML prediction endpoint

# === Optional (have sensible defaults) ===
PORT=5000                                             # Server port (default: 5000)
NODE_ENV=development                                  # "development" or "production"
JWT_EXPIRES_IN=1h                                     # JWT token lifetime (default: "1h")
FRONTEND_ORIGIN=http://localhost:3000                  # Allowed CORS origin for the frontend

# === Seed Script (Optional) ===
SEED_ADMIN_FIRST_NAME=LendIQ
SEED_ADMIN_LAST_NAME=Admin User
SEED_ADMIN_EMAIL=admin@lendiq.com
SEED_ADMIN_PASSWORD_HASH=<bcrypt-hash>
```

### ML Service (`ml-service/app/.env`)

```env
ALLOWED_ORIGIN=http://localhost:5000                   # The backend origin allowed to call this service
model_path=./loan_default_xgb_pipeline_v3.joblib      # Path or URL to the trained model file
```

> In production, `model_path` points to a HuggingFace-hosted URL so the model is downloaded at startup.

### Frontend (`frontend/.env`)

```env
NEXT_PUBLIC_BACKEND_ORIGIN=http://localhost:5000       # The backend API base URL
```

**Notes:**
- Do not commit `backend/.env` or any secrets.
- `JWT_SECRET` must be set for auth routes to work; the server logs internal details but will not expose secrets to clients.

---

## Backend Setup & Common Commands

1. Install dependencies and build

```bash
cd backend
pnpm install
pnpm prisma:generate
pnpm build
```

2. Push Prisma schema (development) and setup TTL index

```bash
pnpm prisma:db:push
pnpm prisma:setup:ttl
```

3. Seed development data (optional)

```bash
pnpm prisma:seed
```

4. Start in development

```bash
pnpm dev
```

### Scripts Summary
- `pnpm dev` — Start development server (watch)
- `pnpm build` — Compile TypeScript to `dist/`
- `pnpm start` — Run compiled server from `dist/`
- `pnpm prisma:generate`, `pnpm prisma:db:push`, `pnpm prisma:seed` — Prisma-related tasks

---

## Frontend Setup

```bash
cd frontend
pnpm install
pnpm dev
```

Open `http://localhost:3000` and test `/login` and `/register`.

---

## ML Service (Local Dev)

```bash
cd ml-service
python -m venv .venv
.venv\Scripts\activate   # Windows
source .venv/bin/activate # macOS / Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## Database Notes
- Prisma + MongoDB requires a replica set for some Prisma operations. For local testing start `mongod --replSet rs0` and run `rs.initiate()` in `mongosh`.

---

## Troubleshooting
- **Authentication failures:** Check `backend/.env` for `JWT_SECRET` and `MONGODB_URI`, then restart the backend.
- **Prisma client generation errors:** Run `pnpm prisma:generate`.
- **CORS errors in browser:** Confirm `FRONTEND_ORIGIN` is correct in `backend/.env` and restart the backend.
- **ML service connection refused:** Ensure the FastAPI server is running and `ML_SERVICE_URL` in the backend `.env` points to the correct address.

---

## Quick Run Checklist

```bash
# Backend
cd backend
pnpm install
# create backend/.env (see above)
pnpm prisma:generate
pnpm prisma:db:push
pnpm prisma:setup:ttl
pnpm prisma:seed
pnpm dev

# ML Service (in another terminal)
cd ml-service
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
# create ml-service/app/.env (see above)
uvicorn app.main:app --reload --port 8000

# Frontend (in another terminal)
cd frontend
pnpm install
# create frontend/.env (see above)
pnpm dev
```

---

## Security & Logging Notes
- Internal/config errors are logged server-side (console). The API returns sanitized client-facing messages (e.g., "Internal server error") so secrets/config details are never sent to clients.
- Authentication tokens are stored in `HttpOnly` cookies and proxied through the Next.js BFF layer to prevent XSS exposure.
- Consider adding a structured logger (pino/winston) and request IDs for production.
