import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("[Signup] Starting signup process for:", email);

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
        msg: "Password must be at least 6 characters long"
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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Generate token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    console.log("[Signup] User created successfully:", user.email);

    res.status(201).json({
      success: true,
      token,
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
      error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("[Login] Attempt for:", email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("[Login] User not found:", email);
      return res.status(400).json({
        success: false,
        msg: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("[Login] Invalid password for:", email);
      return res.status(400).json({
        success: false,
        msg: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    console.log("[Login] Successful for:", email);

    res.json({
      success: true,
      token,
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
      msg: "Server error during login",
      error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  }
});

// Test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes are working!",
    timestamp: new Date().toISOString()
  });
});

export default router;