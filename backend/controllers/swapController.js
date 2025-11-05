import SwapRequest from "../models/SwapRequest.js";
import Event from "../models/Event.js";
import mongoose from "mongoose";

// ✅ Create a swap request and SAVE to database
export const createSwapRequest = async (req, res) => {
  try {
    const { eventId, reason, preferredDate, preferredTime, contactEmail } = req.body;
    const userId = req.user?.id; // Get the logged-in user ID

    console.log("🟡 [createSwapRequest] Creating swap request:", {
      eventId,
      reason,
      preferredDate,
      preferredTime,
      contactEmail,
      userId
    });

    // Validate required fields
    if (!eventId || !reason || !preferredDate || !preferredTime || !contactEmail) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address"
      });
    }

    // Get the requested event
    let requestedEvent;
    if (mongoose.Types.ObjectId.isValid(eventId)) {
      requestedEvent = await Event.findById(eventId).populate("userId", "name email");
    }

    if (!requestedEvent) {
      console.log("[createSwapRequest] Event not found:", eventId);
      return res.status(404).json({ 
        success: false,
        message: "Event not found" 
      });
    }

    // ✅ SAVE TO DATABASE - Create swap request with requester ID
    const swapRequest = await SwapRequest.create({
      requestedEvent: eventId,
      eventOwner: requestedEvent.userId._id,
      requester: userId, // ✅ ADD THE LOGGED-IN USER ID
      message: reason,
      preferredDate: preferredDate,
      preferredTime: preferredTime,
      contactEmail: contactEmail,
      requesterName: req.user?.name || contactEmail.split('@')[0],
      requestType: "simple",
      status: "pending"
    });

    // Populate the response to get event details
    const populatedRequest = await SwapRequest.findById(swapRequest._id)
      .populate("requestedEvent", "title startTime endTime")
      .populate("eventOwner", "name email")
      .populate("requester", "name email"); // ✅ POPULATE REQUESTER TOO

    console.log("✅ [createSwapRequest] Swap request saved to database:", populatedRequest._id);

    res.status(201).json({
      success: true,
      message: "Swap request submitted successfully! The event owner will contact you soon.",
      data: {
        requestId: populatedRequest._id,
        eventTitle: populatedRequest.requestedEvent.title,
        ownerName: populatedRequest.eventOwner?.name || "Event Owner",
        ownerEmail: populatedRequest.eventOwner?.email,
        status: populatedRequest.status,
        nextSteps: "The event owner has been notified and will contact you via email to arrange the swap."
      }
    });

  } catch (err) {
    console.error("❌ Error creating swap request:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error while creating swap request" 
    });
  }
};

// ✅ Get incoming swap requests (requests for my events)
export const getIncomingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("🟢 [getIncomingRequests] Function called for user:", userId);

    // Find incoming requests where current user is the event owner
    const incomingRequests = await SwapRequest.find({
      eventOwner: userId // ✅ Only requests for events YOU own
    })
      .populate("requestedEvent", "title startTime endTime")
      .populate("eventOwner", "name email")
      .populate("requester", "name email") // ✅ POPULATE REQUESTER INFO
      .sort({ createdAt: -1 });

    console.log(`✅ [getIncomingRequests] Found ${incomingRequests.length} incoming requests for event owner: ${userId}`);

    // Format the response
    const formattedRequests = incomingRequests.map(request => ({
      id: request._id,
      eventTitle: request.requestedEvent?.title,
      eventTime: request.requestedEvent?.startTime,
      requesterEmail: request.contactEmail,
      requesterName: request.requester?.name || request.requesterName,
      requesterId: request.requester?._id,
      reason: request.message,
      preferredDate: request.preferredDate,
      preferredTime: request.preferredTime,
      status: request.status,
      createdAt: request.createdAt,
      requestType: request.requestType
    }));

    res.json({
      success: true,
      data: formattedRequests
    });

  } catch (err) {
    console.error("❌ Error fetching incoming requests:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error fetching incoming requests" 
    });
  }
};

// ✅ Get outgoing swap requests (requests I made)
export const getOutgoingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    console.log("🟢 [getOutgoingRequests] Function called for user:", userId);

    // Find outgoing requests by USER ID (not just email)
    const outgoingRequests = await SwapRequest.find({
      $or: [
        { requester: userId }, // ✅ PRIMARY: Find by user ID
        { contactEmail: userEmail } // ✅ SECONDARY: Find by email (backward compatibility)
      ]
    })
      .populate("requestedEvent", "title startTime endTime")
      .populate("eventOwner", "name email")
      .populate("requester", "name email") // ✅ POPULATE REQUESTER INFO
      .sort({ createdAt: -1 });

    console.log(`✅ [getOutgoingRequests] Found ${outgoingRequests.length} outgoing requests for user: ${userId}`);

    // Format the response
    const formattedRequests = outgoingRequests.map(request => ({
      id: request._id,
      eventTitle: request.requestedEvent?.title,
      eventTime: request.requestedEvent?.startTime,
      ownerName: request.eventOwner?.name,
      ownerEmail: request.eventOwner?.email,
      reason: request.message,
      preferredDate: request.preferredDate,
      preferredTime: request.preferredTime,
      status: request.status,
      createdAt: request.createdAt,
      requestType: request.requestType
    }));

    res.json({
      success: true,
      data: formattedRequests
    });

  } catch (err) {
    console.error("❌ Error fetching outgoing requests:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error fetching outgoing requests" 
    });
  }
};

// ✅ Update swap request status (accept/reject)
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    console.log("🟡 [updateRequestStatus] Updating request:", { id, status, userId });

    if (!["accepted", "rejected", "cancelled"].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid status" 
      });
    }

    const swapRequest = await SwapRequest.findById(id)
      .populate("requestedEvent")
      .populate("eventOwner")
      .populate("requester", "name email");

    if (!swapRequest) {
      return res.status(404).json({ 
        success: false,
        message: "Swap request not found" 
      });
    }

    // Verify user has permission (event owner can accept/reject)
    const isEventOwnerById = swapRequest.eventOwner?._id?.toString() === userId;
    const isEventOwnerByEmail = swapRequest.eventOwner?.email === req.user.email;

    if (!isEventOwnerById && !isEventOwnerByEmail) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to update this request. You are not the event owner."
      });
    }

    swapRequest.status = status;
    await swapRequest.save();

    console.log("✅ [updateRequestStatus] Request status updated to:", status);

    const populatedRequest = await SwapRequest.findById(swapRequest._id)
      .populate("requestedEvent", "title startTime endTime")
      .populate("eventOwner", "name email")
      .populate("requester", "name email");

    res.json({
      success: true,
      message: `Request ${status} successfully`,
      data: populatedRequest
    });

  } catch (err) {
    console.error("❌ Error updating request status:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error updating request status" 
    });
  }
};

// Clean up ALL test swap requests
export const cleanupTestRequests = async (req, res) => {
  try {
    console.log("🧹 Cleaning up ALL test swap requests...");
    
    // Delete ALL swap requests to completely clean the database
    const result = await SwapRequest.deleteMany({});
    
    console.log(`✅ Deleted ${result.deletedCount} ALL requests from database`);
    
    res.json({
      success: true,
      message: `Cleaned up ${result.deletedCount} ALL requests from database`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error("❌ Error cleaning up test requests:", err);
    res.status(500).json({
      success: false,
      message: "Error cleaning up test requests"
    });
  }
};

// ✅ Get single swap request by ID
export const getSwapRequest = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🟡 [getSwapRequest] Fetching swap request:", id);

    const swapRequest = await SwapRequest.findById(id)
      .populate("requestedEvent", "title startTime endTime")
      .populate("eventOwner", "name email")
      .populate("requester", "name email");

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: "Swap request not found"
      });
    }

    res.status(200).json({
      success: true,
      data: swapRequest
    });

  } catch (err) {
    console.error("❌ Error fetching swap request:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching swap request"
    });
  }
};