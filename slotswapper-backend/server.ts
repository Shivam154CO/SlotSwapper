import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import http from "http";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import swapRoutes from "./routes/swapRoutes.js";
import swapRequestsRoutes from "./routes/swapRequestsRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";
import socketHandler from "./sockets/socketHandler.js";
import { errorHandler, AppError } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketHandler(server);

// Security: Set security headers
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
}));

// Performance: Compress responses
app.use(compression());

// Logging: Log requests to console
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate Limiting: Prevent DDoS/brute-force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many requests from this IP, please try again after 15 minutes"
  }
});

app.use("/api", limiter);
app.set("io", io);

const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(",") 
  : ["http://localhost:3000", "http://127.0.0.1:3000"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"]
}));

app.use(express.json({ limit: "10kb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/swaps", swapRoutes);
app.use("/api/swap-requests", swapRequestsRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/invites", inviteRoutes);

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy and running with TS support!",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// 404 Handler
app.all(/.*/, (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`[INFO] Server running on port ${PORT} [TypeScript Enabled]`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
