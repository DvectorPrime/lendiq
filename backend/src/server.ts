import express from 'express';
import dotenv from "dotenv";

dotenv.config()


const app = express();

const PORT = process.env.PORT || 5000;

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    data: null,
  });
});

app.listen(PORT, () => {
    console.log(`[SERVER] LendIQ backend running on http://localhost:${PORT}`);
    console.log(`[SERVER] Environment: ${process.env.NODE_ENV || "development"}`);
});