import express from "express";
import {
  createSwapRequest,
  getSwapRequest,
  updateRequestStatus,
  analyzeSwap,
  getSwapOpportunities,
  addNegotiationStep
} from "../controllers/swapController.js";
import auth from "../middleware/auth.js";
import { validate, createSwapSchema } from "../middleware/validate.js";

const router = express.Router();

router.post("/", auth, validate(createSwapSchema), createSwapRequest);
router.post("/analyze", auth, analyzeSwap);
router.get("/opportunities", auth, getSwapOpportunities); // Placeholder for engine optimization logic

router.use(auth);

router.get("/:id", getSwapRequest);
router.patch("/:id", updateRequestStatus);
router.post("/:id/negotiate", addNegotiationStep);

export default router;