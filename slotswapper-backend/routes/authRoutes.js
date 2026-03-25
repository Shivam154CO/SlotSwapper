import express from "express";
import { signup, login, refreshToken, logout, getProfile, updateProfile } from "../controllers/authController.js";
import auth from "../middleware/auth.js";
import { validate, signupSchema, loginSchema } from "../middleware/validate.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "Auth API is working!" });
});

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

// Protected Profile Routes
router.get("/me", auth, getProfile);
router.patch("/me", auth, updateProfile);

export default router;