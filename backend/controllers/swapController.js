import SwapRequest from "../models/SwapRequest.js";
import Event from "../models/Event.js";
import mongoose from "mongoose";

// ✅ Create a swap request and SAVE to database
export const createSwapRequest = async (req, res) => {
  try {
    const { eventId, reason, preferredDate, preferredTime, contactEmail } = req.body;

    console.log("🟡 [createSwapRequest] Creating swap request:", {
      eventId,
      reason,
      preferredDate,
      preferredTime,
      contactEmail
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

    // ✅ SAVE TO DATABASE - Create swap request in MongoDB
    const swapRequest = await SwapRequest.create({
      requestedEvent: eventId,
      eventOwner: requestedEvent.userId._id,
      message: reason,
      preferredDate: preferredDate,
      preferredTime: preferredTime,
      contactEmail: contactEmail,
      requesterName: contactEmail.split('@')[0], // Use email username as name
      requestType: "simple",
      status: "pending"
      // offeredEvent and requester are optional, so we don't need to provide them
    });

    // Populate the response to get event details
    const populatedRequest = await SwapRequest.findById(swapRequest._id)
      .populate("requestedEvent", "title startTime endTime")
      .populate("eventOwner", "name email");

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
// ✅ Get incoming swap requests (requests for my events)
export const getIncomingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("🟢 [getIncomingRequests] Function called for user:", userId);
    console.log("🟢 User from token:", req.user);

    const incomingRequests = await SwapRequest.find({ eventOwner: userId })
      .populate("requestedEvent", "title startTime endTime")
      .populate("eventOwner", "name email")
      .sort({ createdAt: -1 });

    console.log(`✅ [getIncomingRequests] Found ${incomingRequests.length} incoming requests`);

    // Format the response
    const formattedRequests = incomingRequests.map(request => ({
      id: request._id,
      eventTitle: request.requestedEvent?.title,
      eventTime: request.requestedEvent?.startTime,
      requesterEmail: request.contactEmail,
      requesterName: request.requesterName,
      reason: request.message,
      preferredDate: request.preferredDate,
      preferredTime: request.preferredTime,
      status: request.status,
      createdAt: request.createdAt,
      requestType: request.requestType
    }));

    console.log("🟢 [getIncomingRequests] Sending response:", formattedRequests);

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

    console.log("🟢 [getOutgoingRequests] Function called for user:", userId);
    console.log("🟢 User from token:", req.user);

    // For outgoing requests, we need to find by user email since we don't have user ID in the request
    // First, let's try to get the user's email from the token or database
    const userEmail = req.user.email; // This should be available if your auth middleware adds it
    
    console.log("🟢 Searching for requests by user email:", userEmail);

    if (!userEmail) {
      console.log("❌ No user email found in token");
      return res.json({
        success: true,
        data: []
      });
    }

    const outgoingRequests = await SwapRequest.find({ contactEmail: userEmail })
      .populate("requestedEvent", "title startTime endTime")
      .populate("eventOwner", "name email")
      .sort({ createdAt: -1 });

    console.log(`✅ [getOutgoingRequests] Found ${outgoingRequests.length} outgoing requests`);

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

    console.log("🟢 [getOutgoingRequests] Sending response:", formattedRequests);

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
      .populate("eventOwner");

    if (!swapRequest) {
      return res.status(404).json({ 
        success: false,
        message: "Swap request not found" 
      });
    }

    // Verify user has permission (event owner can accept/reject)
    const isEventOwner = swapRequest.eventOwner._id.toString() === userId;

    if (!isEventOwner) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to update this request" 
      });
    }

    swapRequest.status = status;
    await swapRequest.save();

    console.log("✅ [updateRequestStatus] Request status updated to:", status);

    const populatedRequest = await SwapRequest.findById(swapRequest._id)
      .populate("requestedEvent", "title startTime endTime")
      .populate("eventOwner", "name email");

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

// ✅ Get single swap request by ID
export const getSwapRequest = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🟡 [getSwapRequest] Fetching swap request:", id);

    const swapRequest = await SwapRequest.findById(id)
      .populate("requestedEvent", "title startTime endTime")
      .populate("eventOwner", "name email");

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