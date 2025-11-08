import express from "express";
import {
  createSwapRequest,
  getSwapRequest,
  updateRequestStatus
} from "../controllers/swapController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, createSwapRequest);

router.use(auth);

router.get("/:id", getSwapRequest);
router.patch("/:id", updateRequestStatus);

export default router;