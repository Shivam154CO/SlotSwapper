import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import swapRoutes from "./routes/swapRoutes.js";
import swapRequestsRoutes from "./routes/swapRequestsRoutes.js";

// Load environment variables FIRST
dotenv.config();

// Debug: Check if environment variables are loading
console.log("🔧 Environment check:");
console.log("   MONGODB_URI:", process.env.MONGODB_URI ? "✓ Loaded" : "✗ Missing");
console.log("   JWT_SECRET:", process.env.JWT_SECRET ? "✓ Loaded" : "✗ Missing");
console.log("   PORT:", process.env.PORT || 5000);

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/swaps", swapRoutes);
app.use("/api/swap-requests", swapRequestsRoutes);

// Request logging
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.url}`);
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: "Server is running!",
    timestamp: new Date().toISOString()
  });
});

// Test route for swap-requests
app.get("/api/swap-requests/test", (req, res) => {
  res.json({ 
    message: "Swap requests route is working!",
    timestamp: new Date() 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found: ' + req.originalUrl
  });
});

const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB Connected");
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📋 Available endpoints:`);
      console.log(`   http://localhost:${PORT}/api/health`);
      console.log(`   http://localhost:${PORT}/api/auth/signup`);
      console.log(`   http://localhost:${PORT}/api/auth/login`);
      console.log(`   http://localhost:${PORT}/api/events`);
      console.log(`   http://localhost:${PORT}/api/swaps`);
      console.log(`   http://localhost:${PORT}/api/swap-requests`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();