import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";

import authRouter from './routes/authRouter.js';

dotenv.config()


const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    data: null,
  });
});

app.use('/api/auth', authRouter);

app.listen(PORT, () => {
    console.log(`[SERVER] LendIQ backend running on http://localhost:${PORT}`);
    console.log(`[SERVER] Environment: ${process.env.NODE_ENV || "development"}`);
});