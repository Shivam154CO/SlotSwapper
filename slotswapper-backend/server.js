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

// CORS configuration
app.use(cors({
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));

app.use(express.json());

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

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

// Simple User model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Clean signup endpoint
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("[Signup] Starting signup for:", email);

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        msg: "All fields are required"
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
        msg: "User already exists"
      });
    }

    // Create user ONLY - no events
    const user = await User.create({
      name,
      email,
      password: "hashed_" + password // In real app, use bcrypt
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

// Error handling
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
    message: 'Route not found' 
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();