import express from "express";
import {
  addEvent,
  getUserEvents,
  toggleSwappable,
  getSwappableEvents,
  getEventById
} from "../controllers/eventController.js";

const router = express.Router();

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

router.get("/swappable", getSwappableEvents);
router.get("/user/:userId", getUserEvents);
router.patch("/toggle/:id", toggleSwappable);
router.post("/", addEvent);
router.get("/:id", getEventById);

export default router;