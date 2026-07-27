# LendIQ 📊

LendIQ is an end-to-end Machine Learning web application designed to empower loan officers to make credit decisions powered by intelligence, not guesswork. It utilizes alternative data scoring to bring credit-invisible populations (such as the 40+ million unbanked in Nigeria) into the formal economy, while protecting institutions from risk through transparent, explainable AI.

Live Application: [https://lendiq-eosin.vercel.app/](https://lendiq-eosin.vercel.app/)
*(**Caveat**: The Render-hosted backend and ML-service instances may go to sleep after periods of inactivity. Your first login or initial prediction might take up to a minute as the servers wake up!)*

---

## 1. Project Overview & Architecture

LendIQ is built on a robust **3-Tier Architecture**, cleanly separating the user interface, business logic, and predictive modeling into dedicated services.

- **Frontend UI (Next.js & React)**: A modern, responsive dashboard built with Next.js (App Router) and Tailwind CSS. It handles user authentication securely via a Backend-For-Frontend (BFF) proxy pattern, protecting against XSS attacks using `HttpOnly` cookies.
- **Backend API (Node.js, Express, & Prisma)**: The central nervous system of the application. It acts as an orchestration layer, securely handling authentication (bcrypt + JWT), managing loan application records in **MongoDB** via the **Prisma ORM**, and routing prediction requests to the ML service.
- **Machine Learning Tier (FastAPI, Python, & XGBoost)**: A dedicated microservice exposing RESTful endpoints. It ingests formatted applicant data, applies necessary transformations and feature engineering, and feeds it into the XGBoost model to generate risk probabilities and SHAP explanations.

---

## 2. Key Engineering Decisions

Building an MLOps pipeline requires bridging the gap between raw data science and production-ready software engineering.

### Currency-Agnostic Feature Engineering
Instead of passing absolute values (like raw NGN/USD incomes and loan amounts) directly into the model, the pipeline computes financial ratios:
- **Credit-to-Income Ratio**
- **Annuity-to-Income Ratio**
- **Years Employed** (derived from age and employment duration)

*Why?* Tree-based algorithms like XGBoost struggle to natively simulate division across features. By engineering these ratios explicitly, the model becomes significantly more robust and generalizes better to varying economic scales and currencies. Explaining that tree-based algorithms struggle to simulate division on their own makes the model much more efficient.

### Model Interpretability with SHAP
To ensure loan officers understand *why* a decision was made, the ML service integrates SHAP (SHapley Additive exPlanations). 
*Why?* A black-box model is useless in finance. The pipeline intercepts the model's raw log-odds output, converts it into human-readable probabilities, and maps the SHAP values back to their original feature names so the frontend can render an interactive impact chart.

---

## 3. Known Limitations & Drawbacks

Transparency is critical in Machine Learning. 

### Highly Imbalanced Dataset
The raw historical credit dataset used to train this model was heavily skewed (a massive majority of loans were repaid). In such environments, standard "accuracy" metrics are dangerously misleading.

### Current Model Performance
The current `v4` iteration of the XGBoost model sits at a **0.672 ROC-AUC score**. While hyperparameter tuning and early stopping were employed, the inherent data imbalance creates an upper ceiling on performance without losing calibration. This reflects a truthful evaluation of the model. You can view the progression of the model's performance across three versions in the `ml-service/notebooks` directory.

### SHAP Pipeline Constraints
Integrating SHAP with a standard `scikit-learn` pipeline (`StandardScaler` -> `XGBClassifier`) presents technical hurdles, as SHAP explainers do not natively read through transformation pipelines smoothly. A technical workaround was implemented in the API to manually extract the transformer step, scale the incoming data, and feed the raw numpy arrays directly into the SHAP TreeExplainer.

---

## 4. File Arrangement

The monorepo is cleanly divided into three primary workspaces:

```text
lendiq/
├── backend/                  # Node.js / Express API Server
│   ├── prisma/               # Database schema (schema.prisma)
│   ├── src/                  # Controllers, Routes, and Middleware
│   └── .env.example
├── frontend/                 # Next.js UI
│   ├── app/                  # Next.js App Router (Pages & API proxy routes)
│   ├── components/           # Reusable React components & UI charts
│   ├── lib/                  # API clients, Context providers, Utilities
│   └── .env
└── ml-service/               # Python FastAPI Microservice
    ├── app/                  # model.py, schemas.py, main.py
    ├── notebooks/            # Jupyter notebooks showing EDA & model progression
    └── .env.example
```

---

## 5. Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MongoDB (Running locally or via MongoDB Atlas)
- `pnpm` (Package manager for the JS workspaces)

### Step 1: Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   pnpm install
   ```
2. Create a `.env` file in the `backend/` root with the following variables:
   ```env
   # === Required ===
   MONGODB_URI=mongodb://localhost:27017/lendiq          # Your MongoDB connection string
   JWT_SECRET=<your-secret-key>                          # A long, random string for signing JWTs
   ML_SERVICE_URL=http://localhost:8000/predict           # URL to the ML prediction endpoint

   # === Optional (have sensible defaults) ===
   PORT=5000                                             # Server port (default: 5000)
   NODE_ENV=development                                  # "development" or "production"
   JWT_EXPIRES_IN=1h                                     # JWT token lifetime (default: "1h")
   FRONTEND_ORIGIN=http://localhost:3000                  # Allowed CORS origin for the frontend

   # === Seed Script (Optional) ===
   # Used by `prisma/seed.ts` to create an initial admin user.
   # All have defaults if omitted.
   SEED_ADMIN_FIRST_NAME=LendIQ                          # Default: "LendIQ"
   SEED_ADMIN_LAST_NAME=Admin User                       # Default: "Admin User"
   SEED_ADMIN_EMAIL=admin@lendiq.com                     # Default: "admin@lendiq.com"
   SEED_ADMIN_PASSWORD_HASH=<bcrypt-hash>                # Default: pre-set hash
   ```
3. Push the Prisma schema to your database:
   ```bash
   npx prisma db push
   ```
4. *(Optional)* Seed the database with a default admin user:
   ```bash
   npx prisma db seed
   ```
5. Start the backend server:
   ```bash
   pnpm run dev
   ```

### Step 2: ML Service Setup
1. Open a new terminal and navigate to the ML service:
   ```bash
   cd ml-service
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Mac/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file inside the `ml-service/app/` directory:
   ```env
   # === Required ===
   ALLOWED_ORIGIN=http://localhost:5000                   # The backend origin allowed to call this service
   model_path=./loan_default_xgb_pipeline_v3.joblib      # Path or URL to the trained model file
   ```
   > **Note:** In production, `model_path` points to a HuggingFace-hosted URL so the model is downloaded at startup.
5. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Step 3: Frontend Setup
1. Open a new terminal and navigate to the frontend:
   ```bash
   cd frontend
   pnpm install
   ```
2. Create a `.env` file in the `frontend/` root:
   ```env
   # === Required ===
   NEXT_PUBLIC_BACKEND_ORIGIN=http://localhost:5000       # The backend API base URL
   ```
3. Start the Next.js development server:
   ```bash
   pnpm run dev
   ```

You can now access the application at `http://localhost:3000`.

> 📖 For more detailed setup information including Prisma scripts, database notes, troubleshooting, and security considerations, see [**SETUP.md**](./setup.md).
