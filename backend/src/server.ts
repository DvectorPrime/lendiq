/**
 * Main Express server setup for the LendIQ backend API.
 * Initializes the Express app with middleware (JSON parsing, cookie parsing),
 * sets up the /health endpoint for health checks, and mounts the /api/auth routes.
 * Listens on PORT (default 5000) and logs server startup information.
 */

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from "dotenv";

import authRouter from './routes/authRouter.js';
import { requestLogger } from './middlewares/requestLogger.js';

dotenv.config();


const app = express();
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

const PORT = process.env.PORT || 5000;

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    data: null,
  });
});

app.use('/api/auth', authRouter);

function logConfigurationWarnings() {
  if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
    console.warn('[CONFIG] JWT_SECRET is missing in backend/.env. Auth routes will fail with "JWT secret is not configured".');
  }

  if (!process.env.MONGODB_URI || !process.env.MONGODB_URI.trim()) {
    console.warn('[CONFIG] MONGODB_URI is missing in backend/.env. Database operations will fail.');
  }
}

app.listen(PORT, () => {
    console.log(`[SERVER] LendIQ backend running on http://localhost:${PORT}`);
    console.log(`[SERVER] Environment: ${process.env.NODE_ENV || "development"}`);
    logConfigurationWarnings();
});