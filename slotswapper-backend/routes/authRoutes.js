import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ✅ Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("[Signup] Starting signup process for:", email);

    if (!name || !email || !password) {
      console.log("[Signup] Missing fields:", { name, email, password });
      return res.status(400).json({ success: false, msg: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("[Signup] User already exists:", email);
      return res.status(400).json({ success: false, msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    console.log("[Signup] Creating user in DB...");
    const user = await User.create({ name, email, password: hashed });

    console.log("[Signup] User created successfully:", user.email);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    console.error("[Signup] Error:", err.message);
    res.status(500).json({ success: false, msg: err.message });
  }
});


// ✅ Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, msg: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

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
