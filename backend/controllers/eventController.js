import Event from "../models/Event.js";
import mongoose from "mongoose";

export const addEvent = async (req, res) => {
  try {
    const { title, startTime, endTime, userId } = req.body;

    console.log("[addEvent] Received data:", { title, startTime, endTime, userId });

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid userId" });
    }

    const event = await Event.create({
      title,
      startTime,
      endTime,
      userId,
      swappable: false,
    });

    console.log("[addEvent] Event created:", event);
    res.status(201).json(event);
  } catch (err) {
    console.error("Error adding event:", err);
    res.status(500).json({ msg: "Server error while adding event" });
  }
};

export const getUserEvents = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("[getUserEvents] Fetching events for user:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid userId" });
    }

    const events = await Event.find({ userId });
    console.log(`[getUserEvents] Found ${events.length} events for user ${userId}`);
    res.json(events);
  } catch (err) {
    console.error("Error fetching user events:", err);
    res.status(500).json({ msg: "Server error fetching events" });
  }
};

export const toggleSwappable = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("[toggleSwappable] Toggling event:", id);

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    event.swappable = !event.swappable;
    await event.save();

    console.log(`[toggleSwappable] Event ${id} swappable set to: ${event.swappable}`);
    res.json(event);
  } catch (err) {
    console.error("Error toggling swappable:", err);
    res.status(500).json({ msg: "Server error while toggling swappable" });
  }
};

export const getSwappableEvents = async (req, res) => {
  try {
    console.log("[getSwappableEvents] Fetching all swappable events...");
    
    const allEvents = await Event.find({});
    console.log(`[getSwappableEvents] Total events in DB: ${allEvents.length}`);
    
    allEvents.forEach(event => {
      console.log(`Event: "${event.title}", Swappable: ${event.swappable}, ID: ${event._id}`);
    });

    const swappableEvents = await Event.find({ swappable: true })
      .populate("userId", "name email")
      .sort({ startTime: 1 });

    console.log(`[getSwappableEvents] Found ${swappableEvents.length} swappable events`);

    const formattedEvents = swappableEvents.map((event) => ({
      _id: event._id,
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      ownerName: event.userId?.name || "Unknown User",
      ownerEmail: event.userId?.email || "No email available",
      swappable: event.swappable,
    }));

    console.log("[getSwappableEvents] Sending formatted events:", formattedEvents);
    res.json(formattedEvents);
    
  } catch (err) {
    console.error("[getSwappableEvents] ERROR:", err);
    res.status(500).json({ 
      msg: "Server error while fetching swappable events",
      error: err.message 
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("[getEventById] Fetching event with ID:", id);
    
    const event = await Event.findById(id).populate("userId", "name email");
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    const formattedEvent = {
      _id: event._id,
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      ownerName: event.userId?.name || "Unknown User",
      ownerEmail: event.userId?.email || "No email available",
      swappable: event.swappable,
    };
    
    console.log("[getEventById] Found event:", formattedEvent);
    res.json(formattedEvent);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event details'
    });
  }
};
