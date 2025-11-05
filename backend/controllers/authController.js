// backend/controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("🟡 [Signup] Received data:", { name, email, password: password ? "***" : "missing" });

    // Validation
    if (!name || !email || !password) {
      console.log("❌ [Signup] Missing fields:", { name: !!name, email: !!email, password: !!password });
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

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        msg: "User already exists with this email"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Generate token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    console.log("✅ [Signup] User created successfully:", user.email);

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
    console.error("❌ [Signup] Server error:", err);
    res.status(500).json({
      success: false,
      msg: "Server error during signup",
      error: err.message
    });
  }
};