### TokenBlacklist
### Enums
## 🖼️ Current UI Notes
<!--
Project status overview: short, current-state snapshot for quick onboarding.
Automatically updated by the dev agent on changes to core auth and setup.
-->

# LendIQ — Project Snapshot

Last updated: 2026-05-28

Summary
-------
LendIQ is an early-stage lending platform composed of:
- Backend API (TypeScript + Express + Prisma + MongoDB)
- Frontend app (Next.js, App Router, Tailwind CSS)
- ML service (Python; model training and scoring)

This file captures the current implementation summary, important notes for developers, and next priorities.

Backend — Current Implementation
--------------------------------
- Authentication: cookie-based JWT auth plus optional Bearer token support.
- Endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`.
- Security: JWT tokens include `jti` for revocation; revoked tokens are stored in `token_blacklist` with a TTL index.
- Error handling: internal/config errors are logged server-side and user-facing responses are sanitized (no secrets or config details are returned).
- Runtime fixes: jsonwebtoken ESM/CJS interop issues were fixed by using the default import pattern and adjusting middleware checks.
- Request logging: lightweight request/response logging middleware added to aid diagnostics.

Database & Prisma
-----------------
- MongoDB used as the primary datastore via Prisma (Mongo provider).
- Models: `User`, `Application`, `TokenBlacklist`, enums for roles and application statuses.
- Seed data: project includes a seed script (`pnpm prisma:seed`) which populates basic users and sample applications.

Frontend — Current Implementation
---------------------------------
- Next.js (App Router) with minimal UI for `/login` and `/register` implemented as single responsive cards.
- Client helper libraries: `frontend/lib/api.ts` (fetch wrapper) and `frontend/lib/auth.ts` (auth helpers).
- Protected dashboard shell at `/dashboard` with redirect guards to `/login` when unauthenticated.

ML Service
----------
- FastAPI service implemented in `ml-service/app/` to serve the loan prediction model.
- Integrated SHAP-based explainer to provide risk score probabilities and feature-level contribution explanations on every prediction.
- Models are loaded into memory during app lifespan initialization for low-latency inference.

Key Files / Paths
-----------------
- Backend server: `backend/src/server.ts`
- Auth service: `backend/src/services/authService.ts`
- Auth controllers: `backend/src/controllers/authController.ts`
- Auth middleware: `backend/src/middlewares/authMiddleware.ts`
- Frontend app: `frontend/app/`
- ML service entry: `ml-service/app/main.py`

Environment & Runtime Notes
--------------------------
- Required environment variables (backend): `MONGODB_URI`, `JWT_SECRET` (secure, >=32 chars), `PORT`, `FRONTEND_ORIGIN`, `NODE_ENV`.
- Frontend needs `NEXT_PUBLIC_API_URL` (pointing to backend).
- Ensure MongoDB runs with a replica set when using Prisma + Mongo (see `setup.md`).

Short-Term Priorities
---------------------
1. Backend: implement application CRUD endpoints and integrate with the new ML scoring endpoint.
2. Backend: add standardized API error format and increase test coverage for auth flows.
3. Frontend: complete application dashboard and build visual components for the SHAP risk explanations.
4. Integrate the ML service properly into the backend submission flow and verify end-to-end communication.

Notes for Maintainers
---------------------
- The backend now sanitizes internal messages (e.g., missing `JWT_SECRET`) before returning responses; full details are logged server-side.
- If you see authentication failures, confirm `backend/.env` contains `JWT_SECRET` and `MONGODB_URI` and then restart the backend.
- To seed development data run: `cd backend && pnpm prisma:seed`.

Where to look next
------------------
- Start with `backend/src/services/authService.ts` and `backend/src/controllers/authController.ts` for auth logic.
- Frontend auth UI lives in `frontend/app/(auth)`.

Contact
-------
For questions about the current implementation or next steps, open an issue or message the core dev working on auth.

File Tree (Simplified)
----------------------
```text
LendIQ/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── setup-ttl-index.ts
│   └── src/
│       ├── server.ts
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       └── services/
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   └── lib/
└── ml-service/
    ├── app/
    │   ├── main.py
    │   ├── model.py
    │   ├── requirements.txt
    │   └── schemas.py
    ├── models/
    │   └── loan_default_xgb_pipeline.joblib
    └── notebooks/
        ├── Data Cleaning and EDA.ipynb
        └── Final Model and SHAP Notebook.ipynb
```
