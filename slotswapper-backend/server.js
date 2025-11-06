import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import swapRoutes from "./routes/swapRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Define allowed origins once
const allowedOrigins = [
  "http://localhost:3000",
  "https://slot-swapper1-eight.vercel.app"
];

// ✅ Apply CORS before routes
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// ✅ Handle preflight requests (Express 5 compatible)
app.options(/.*/, cors());

// ✅ Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/swaps", swapRoutes);

// ✅ Health/CORS test
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "CORS test route working!",
    timestamp: new Date().toISOString(),
  });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(500).json({
    success: false,
    msg: "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? undefined : err.message
  });
});

// ✅ 404 handler (Express 5 safe)
app.use(/.*/, (req, res) => {
  res.status(404).json({
    success: false,
    msg: `Route ${req.originalUrl} not found`
  });
});

// ✅ Connect MongoDB & start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const startServer = async () => {
  try {
    console.log("🔧 Connecting to MongoDB...");
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log("🌐 CORS allowed for:");
      allowedOrigins.forEach(o => console.log("   -", o));
    });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

startServer();
