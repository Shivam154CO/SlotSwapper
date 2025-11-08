import express from "express";
import {
  getIncomingRequests,
  getOutgoingRequests,
  cleanupTestRequests
} from "../controllers/swapController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.use((req, res, next) => {
  next();
});

router.use(auth);

router.get("/incoming", getIncomingRequests);
router.get("/outgoing", getOutgoingRequests);
router.delete("/cleanup-test", cleanupTestRequests);

router.get("/debug/all", async (req, res) => {
  try {
    const SwapRequest = (await import("../../slotswapper-backend/models/SwapRequest.js")).default;
    const allRequests = await SwapRequest.find({})
      .populate("requestedEvent", "title startTime endTime userId")
      .populate("eventOwner", "name email")
      .populate("requester", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total: allRequests.length,
      requests: allRequests.map(req => ({
        id: req._id,
        eventTitle: req.requestedEvent?.title,
        eventOwner: {
          id: req.eventOwner?._id,
          name: req.eventOwner?.name,
          email: req.eventOwner?.email
        },
        requester: {
          id: req.requester?._id,
          name: req.requester?.name,
          email: req.requester?.email
        },
        contactEmail: req.contactEmail,
        requesterName: req.requesterName,
        status: req.status,
        message: req.message,
        preferredDate: req.preferredDate,
        preferredTime: req.preferredTime,
        createdAt: req.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;