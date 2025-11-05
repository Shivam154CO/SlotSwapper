import express from "express";
import {
  createSwapRequest,
  getSwapRequest,
  updateRequestStatus
} from "../controllers/swapController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Create swap request (requires auth to get user ID)
router.post("/", auth, createSwapRequest);

// These routes require authentication
router.use(auth);

router.get("/:id", getSwapRequest);
router.patch("/:id", updateRequestStatus);

export default router;