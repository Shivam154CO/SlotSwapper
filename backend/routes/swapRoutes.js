import express from "express";
import {
  createSwapRequest,
  getIncomingRequests,
  getOutgoingRequests,
  updateRequestStatus,
  getSwapRequest
} from "../controllers/swapController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Public routes (no authentication required for creating swap requests)
router.post("/", createSwapRequest);

// Protected routes (authentication required)
router.use(auth);

// Parameterized routes - MUST COME LAST
router.get("/:id", getSwapRequest);
router.patch("/:id", updateRequestStatus);

export default router;