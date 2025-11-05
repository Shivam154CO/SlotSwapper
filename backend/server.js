import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import swapRoutes from "./routes/swapRoutes.js";
import swapRequestsRoutes from "./routes/swapRequestsRoutes.js"; // ADD THIS IMPORT

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/swaps", swapRoutes);
app.use("/api/swap-requests", swapRequestsRoutes); // ADD THIS LINE - This is what's missing!

app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.url}`);
  console.log(`🔍 Headers:`, req.headers);
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
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.originalUrl}`);
  console.log('🔍 Registered routes:');
  console.log('   - /api/auth/*');
  console.log('   - /api/events/*'); 
  console.log('   - /api/swaps/*');
  console.log('   - /api/swap-requests/*');
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

// 🔍 ADD A TEST ROUTE TO VERIFY swap-requests IS WORKING
app.get("/api/swap-requests/test", (req, res) => {
  console.log("✅ /api/swap-requests/test route is working!");
  res.json({ 
    message: "Swap requests route is working!",
    timestamp: new Date() 
  });
});

const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB Connected");
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Real API endpoints:`);
      console.log(`http://localhost:${PORT}/api/health`);
      console.log(`http://localhost:${PORT}/api/events/test`);
      console.log(`http://localhost:${PORT}/api/events/swappable`);
      console.log(`http://localhost:${PORT}/api/events/debug/all-events`);
      console.log(`http://localhost:${PORT}/api/swaps`);
      console.log(`http://localhost:${PORT}/api/swap-requests/incoming`); // ADD THIS
      console.log(`http://localhost:${PORT}/api/swap-requests/outgoing`); // ADD THIS
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();