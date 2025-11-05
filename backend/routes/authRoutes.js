// backend/routes/authRoutes.js
import express from "express";
import { signup, login } from "../controllers/authController.js";

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Auth API is working!" });
});

router.post("/signup", signup);
router.post("/login", login);

export default router;