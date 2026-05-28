<!--
Setup guide for local development: backend, frontend, and ML service.
Do not commit secrets. This file was updated to reflect recent auth and runtime changes.
-->

# LendIQ — Setup Guide (Developer)

This guide covers the minimal steps to get the repo running locally (backend, frontend, ML service).

Prerequisites
-------------
- Node.js (recommended v18+ or current LTS)
- pnpm
- MongoDB (local or Atlas)
- Python 3.8+ (for ML service)

Important environment variables
-------------------------------
Backend (`backend/.env`) — create this file and populate with:

```env
MONGODB_URI=mongodb://localhost:27017/lendiq
JWT_SECRET=replace-with-a-secure-secret-at-least-32-chars
JWT_EXPIRES_IN=1h
PORT=5000
FRONTEND_ORIGIN=http://localhost:3000
NODE_ENV=development
```

Frontend (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Notes:
- Do not commit `backend/.env` or any secrets.
- `JWT_SECRET` must be set for auth routes to work; server logs internal details but will not expose secrets to clients.

Backend setup and common commands
--------------------------------
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

Scripts summary
---------------
- `pnpm dev` — Start development server (watch)
- `pnpm build` — Compile TypeScript to `dist/`
- `pnpm start` — Run compiled server from `dist/`
- `pnpm prisma:generate`, `pnpm prisma:db:push`, `pnpm prisma:seed` — Prisma-related tasks

Frontend setup
--------------

```bash
cd frontend
pnpm install
pnpm dev
```

Open `http://localhost:3000` and test `/login` and `/register`.

ML service (local dev)
----------------------

```bash
cd ml-service
python -m venv venv
venv\Scripts\activate   # Windows
source venv/bin/activate # macOS / Linux
pip install -r app/requirements.txt
python app/main.py
```

Database notes
--------------
- Prisma + MongoDB requires a replica set for some Prisma operations. For local testing start `mongod --replSet rs0` and run `rs.initiate()` in `mongosh`.

Troubleshooting
---------------
- If you see authentication failures: check `backend/.env` for `JWT_SECRET` and `MONGODB_URI`, then restart backend.
- If Prisma complains about client generation, run `pnpm prisma:generate`.
- If browser requests receive CORS errors, confirm `FRONTEND_ORIGIN` is correct in `backend/.env` and restart the backend.

Quick run checklist
-------------------

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

# Frontend (in another terminal)
cd frontend
pnpm install
pnpm dev
```

Security & logging notes
------------------------
- Internal/config errors are logged server-side (console). The API returns sanitized client-facing messages (e.g., "Internal server error") so secrets/config details are never sent to clients.
- Consider adding a structured logger (pino/winston) and request IDs for production.

If you'd like, I can add a `.env.example` file (without secrets) and wire a structured logger next.
