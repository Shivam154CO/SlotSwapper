import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ✅ Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // 1. Validation and Check
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, msg: "All fields (name, email, password) are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, msg: "Password must be at least 6 characters long" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, msg: "User already exists with this email" });
    }

    // 2. Hash Password and Create User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hashedPassword });
    
    // 3. Generate Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "a_secure_fallback_secret_key", // Use a strong secret in .env
      { expiresIn: "7d" }
    );

    console.log("[Signup Success]:", user.email);

    res.status(201).json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("[Signup Error]:", err.message);
    res.status(500).json({ success: false, msg: "Server error during signup" });
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
        return res.status(400).json({ success: false, msg: "Email and password are required" });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, msg: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ success: false, msg: "Invalid credentials" });
    }

    // 2. Generate Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "a_secure_fallback_secret_key", // Use a strong secret in .env
      { expiresIn: "7d" }
    );

    console.log("[Login Success]:", user.email);

    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("[Login Error]:", err);
    res.status(500).json({ success: false, msg: "Server error during login" });
  }
});

export default router;