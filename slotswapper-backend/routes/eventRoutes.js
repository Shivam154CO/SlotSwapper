import express from "express";
const router = express.Router();

// Basic event routes (replace with your actual controllers)
router.get("/test", (req, res) => {
  console.log("/api/events/test route hit!");
  res.json({ 
    message: "Events API is working!", 
    timestamp: new Date(),
    route: "/api/events/test" 
  });
});

router.get("/debug/all-events", async (req, res) => {
  try {
    const Event = (await import("../models/Event.js")).default;
    const events = await Event.find({}).populate("userId", "name email");
    res.json({
      totalEvents: events.length,
      events: events.map(e => ({
        id: e._id,
        title: e.title,
        swappable: e.swappable,
        userId: e.userId,
        startTime: e.startTime,
        endTime: e.endTime
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/debug/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Debug event ID:", id);
    
    const Event = (await import("../models/Event.js")).default;
    const event = await Event.findById(id).populate("userId", "name email");
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found in database",
        searchedId: id
      });
    }

    res.json({
      success: true,
      found: true,
      event: {
        id: event._id,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        swappable: event.swappable,
        userId: event.userId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Debug error",
      error: error.message
    });
  }
});

// Basic placeholder routes (remove the controller imports that don't exist)
router.get("/swappable", async (req, res) => {
  res.json({
    success: true,
    message: "Swappable events endpoint",
    events: []
  });
});

router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log("[getUserEvents] Fetching events for user:", userId);
  
  try {
    const Event = (await import("../models/Event.js")).default;
    const events = await Event.find({ userId }).populate("userId", "name email");
    console.log(`[getUserEvents] Found ${events.length} events for user ${userId}`);
    
    res.json({
      success: true,
      events: events.map(event => ({
        id: event._id,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        swappable: event.swappable,
        userId: event.userId
      }))
    });
  } catch (error) {
    console.error("[getUserEvents] Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user events"
    });
  }
});

router.patch("/toggle/:id", async (req, res) => {
  res.json({
    success: true,
    message: "Toggle swappable endpoint"
  });
});

router.post("/", async (req, res) => {
  const { title, startTime, endTime, userId } = req.body;
  
  try {
    const Event = (await import("../models/Event.js")).default;
    const event = await Event.create({
      title: title || "New Event",
      startTime: startTime || new Date(),
      endTime: endTime || new Date(Date.now() + 60 * 60 * 1000),
      userId: userId,
      swappable: false
    });
    
    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: {
        id: event._id,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        swappable: event.swappable,
        userId: event.userId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating event",
      error: error.message
    });
  }
});

router.get("/:id", async (req, res) => {
  res.json({
    success: true,
    message: "Get event by ID endpoint"
  });
});

export default router;