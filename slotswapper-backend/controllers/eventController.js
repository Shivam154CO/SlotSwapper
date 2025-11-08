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

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid userId" });
    }

    const events = await Event.find({ userId });
    res.json(events);
  } catch (err) {
    console.error("Error fetching user events:", err);
    res.status(500).json({ msg: "Server error fetching events" });
  }
};

export const toggleSwappable = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    event.swappable = !event.swappable;
    await event.save();

    res.json(event);
  } catch (err) {
    console.error("Error toggling swappable:", err);
    res.status(500).json({ msg: "Server error while toggling swappable" });
  }
};

export const getSwappableEvents = async (req, res) => {
  try {
    
    const allEvents = await Event.find({});
    
    
    allEvents.forEach(event => {
    });

    const swappableEvents = await Event.find({ swappable: true })
      .populate("userId", "name email")
      .sort({ startTime: 1 });

    const formattedEvents = swappableEvents.map((event) => ({
      _id: event._id,
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      ownerName: event.userId?.name || "Unknown User",
      ownerEmail: event.userId?.email || "No email available",
      swappable: event.swappable,
    }));

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
    
    res.json(formattedEvent);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event details'
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid event ID" });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        msg: "Event not found" 
      });
    }
    await Event.findByIdAndDelete(id);
    res.json({ 
      success: true, 
      message: "Event deleted successfully",
      deletedEventId: id 
    });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ 
      success: false,
      msg: "Server error while deleting event",
      error: err.message 
    });
  }
};