import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

console.log("🔧 Environment check:");
console.log("   MONGO_URI:", process.env.MONGO_URI ? "✓ Loaded" : "✗ Missing");
console.log("   JWT_SECRET:", process.env.JWT_SECRET ? "✓ Loaded" : "✗ Missing");
console.log("   PORT:", process.env.PORT || 5000);

const app = express();

// SIMPLE CORS - Allow everything
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.originalUrl}`);
  next();
});

// ========== ROUTES ==========

// Health check - TEST THIS FIRST
app.get("/api/health", (req, res) => {
  console.log("✅ Health check called");
  res.status(200).json({ 
    success: true, 
    message: "Server is running perfectly!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Test CORS route
app.get("/api/test-cors", (req, res) => {
  console.log("✅ CORS test called");
  res.json({ 
    success: true, 
    message: "CORS is working!",
    timestamp: new Date().toISOString()
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Simple User model
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Clean signup endpoint
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("[Signup] Starting signup for:", email);
    console.log("[Signup] Request body:", { name, email, password: password ? "***" : "missing" });

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        msg: "All fields are required: name, email, password"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        msg: "Password must be at least 6 characters"
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        msg: "User already exists with this email"
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password: "hashed_" + password // Simple for testing
    });

    console.log("[Signup] User created successfully:", user.email);

    // Success response
    res.status(201).json({
      success: true,
      token: "jwt_token_placeholder",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error("[Signup] Error:", err);
    res.status(500).json({
      success: false,
      msg: "Server error during signup",
      error: err.message
    });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("[Login] Attempt for:", email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Email and password required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "Invalid credentials"
      });
    }

    // Simple password check
    if (user.password !== "hashed_" + password) {
      return res.status(400).json({
        success: false,
        msg: "Invalid credentials"
      });
    }

    console.log("[Login] Successful for:", email);

    res.json({
      success: true,
      token: "jwt_token_placeholder",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error("[Login] Error:", err);
    res.status(500).json({
      success: false,
      msg: "Server error during login"
    });
  }
});

// Simple test route
app.get("/api/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "Test route working!",
    timestamp: new Date().toISOString()
  });
});

// 404 handler - MUST BE LAST
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.originalUrl}`);
  res.status(404).json({ 
    success: false, 
    message: 'Route not found: ' + req.originalUrl,
    availableRoutes: [
      '/api/health',
      '/api/test-cors', 
      '/api/test',
      '/api/auth/signup',
      '/api/auth/login'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: err.message
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 CORS enabled for ALL origins (*)`);
      console.log(`📍 Available routes:`);
      console.log(`   GET  /api/health`);
      console.log(`   GET  /api/test-cors`);
      console.log(`   GET  /api/test`);
      console.log(`   POST /api/auth/signup`);
      console.log(`   POST /api/auth/login`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();