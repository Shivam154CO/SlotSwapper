import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ✅ Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("[Signup] Data:", { name, email, password: password ? "***" : "missing" });

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, msg: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, msg: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, msg: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    console.log("[Signup] Success:", user.email);

    res.status(201).json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("[Signup] Error:", err);
    res.status(500).json({ success: false, msg: "Server error during signup" });
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("[Login] Attempt for:", email);

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, msg: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("[Login] Error:", err);
    res.status(500).json({ success: false, msg: "Server error during login" });
  }
});

export default router;
