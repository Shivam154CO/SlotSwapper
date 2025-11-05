import express from "express";
import {
  getIncomingRequests,
  getOutgoingRequests
} from "../controllers/swapController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Add route debugging
router.use((req, res, next) => {
  console.log(`🟢 [swapRequestsRoutes] ${req.method} ${req.path}`);
  next();
});

// All routes require authentication
router.use(auth);

// These routes won't conflict because they're on a different path
router.get("/incoming", getIncomingRequests);
router.get("/outgoing", getOutgoingRequests);

export default router;