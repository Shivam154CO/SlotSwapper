import express from "express";
const router = express.Router();

router.use((req, res, next) => {
  console.log(`[swapRequestsRoutes] ${req.method} ${req.path}`);
  next();
});

// Basic placeholder routes (remove the controller imports that don't exist)
router.get("/incoming", async (req, res) => {
  res.json({
    success: true,
    message: "Incoming requests endpoint",
    requests: []
  });
});

router.get("/outgoing", async (req, res) => {
  res.json({
    success: true,
    message: "Outgoing requests endpoint",
    requests: []
  });
});

router.delete("/cleanup-test", async (req, res) => {
  res.json({
    success: true,
    message: "Cleanup test endpoint"
  });
});

router.get("/debug/all", async (req, res) => {
  try {
    const SwapRequest = (await import("../models/SwapRequest.js")).default;
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