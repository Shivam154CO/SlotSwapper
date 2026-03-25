import SwapRequest from "../models/SwapRequest.js";
import Event from "../models/Event.js";
import mongoose from "mongoose";

import SwapEngine from "../services/SwapEngine.js";

export const analyzeSwap = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;
    const organization = req.user.organization;

    // Verify event belongs to organization
    const event = await Event.findOne({ _id: eventId, organization });
    if (!event) {
      return res.status(403).json({ success: false, message: "Unauthorized: Event outside organization" });
    }

    const analysis = await SwapEngine.analyzeCompatibility(userId, eventId);

    res.json({
      success: true,
      analysis
    });
  } catch (err) {
    console.error("Error analyzing swap:", err);
    res.status(500).json({ success: false, message: "Analysis failed" });
  }
};

export const createSwapRequest = async (req, res) => {
  try {
    const { eventId, reason, preferredDate, preferredTime, contactEmail, type, conditions } = req.body;
    const userId = req.user?.id;
    const organization = req.user.organization;

    if (!eventId || !reason || !preferredDate || !preferredTime || !contactEmail) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address"
      });
    }

    let requestedEvent;
    if (mongoose.Types.ObjectId.isValid(eventId)) {
      requestedEvent = await Event.findOne({ _id: eventId, organization }).populate("userId", "name email");
    }

    if (!requestedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found in your organization"
      });
    }

    // Security Check: Owner cannot request swap for their own event
    if (requestedEvent.userId._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot request a swap for your own event"
      });
    }

    // Run AI Analysis
    const analysis = await SwapEngine.analyzeCompatibility(userId, eventId);

    const swapRequest = await SwapRequest.create({
      requestedEvent: eventId,
      eventOwner: requestedEvent.userId._id,
      requester: userId,
      requesterName: req.user?.name || contactEmail.split('@')[0],
      contactEmail,
      organization: organization, // <--- Scoped to Org

      // Store initial message + push to chat history
      initialMessage: reason,
      negotiationHistory: [{
        sender: userId,
        message: reason,
        type: "message",
        timestamp: new Date()
      }],

      preferredDate: preferredDate,
      preferredTime: preferredTime,

      // Advanced Fields
      type: type || "direct",
      conditions: conditions || {},
      status: "pending",

      // Store AI Analysis
      aiAnalysis: {
        compatibilityScore: analysis.score,
        riskLevel: analysis.risk?.toLowerCase() || "low",
        matchReason: analysis.reason,
        predictedSuccessRate: analysis.score // for now same as compatibility
      }
    });

    const populatedRequest = await SwapRequest.findById(swapRequest._id)
      .populate("requestedEvent", "title startTime endTime")
      .populate("eventOwner", "name email")
      .populate("requester", "name email")
      .populate("negotiationHistory.sender", "name email");

    res.status(201).json({
      success: true,
      message: "Swap request submitted successfully! AI analysis complete.",
      data: {
        requestId: populatedRequest._id,
        eventTitle: populatedRequest.requestedEvent.title,
        status: populatedRequest.status,
        aiAnalysis: populatedRequest.aiAnalysis,
        negotiationHistory: populatedRequest.negotiationHistory,
        nextSteps: "The event owner has been notified and will contact you via email to arrange the swap."
      }
    });

  } catch (err) {
    console.error("Create Swap Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while creating swap request"
    });
  }
};

export const getIncomingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const organization = req.user.organization;

    const incomingRequests = await SwapRequest.find({
      eventOwner: userId,
      organization: organization // Ensure org match
    })
      .populate("requestedEvent", "title startTime endTime")
      .populate("eventOwner", "name email")
      .populate("requester", "name email")
      .sort({ createdAt: -1 });

    const formattedRequests = incomingRequests.map(request => ({
      id: request._id,
      eventTitle: request.requestedEvent?.title,
      eventTime: request.requestedEvent?.startTime,
      requesterEmail: request.contactEmail,
      requesterName: request.requester?.name || request.requesterName,
      requesterId: request.requester?._id,
      reason: request.initialMessage || 'No reason provided',
      preferredDate: request.preferredDate,
      preferredTime: request.preferredTime,
      status: request.status,
      createdAt: request.createdAt,
      requestType: request.type || 'direct'
    }));

    res.json({
      success: true,
      data: formattedRequests
    });

  } catch (err) {
    console.error("Error fetching incoming requests:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching incoming requests"
    });
  }
};

export const getOutgoingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const organization = req.user.organization;

    const outgoingRequests = await SwapRequest.find({
      organization: organization,
      $or: [
        { requester: userId },
        { contactEmail: userEmail }
      ]
    })
      .populate("requestedEvent", "title startTime endTime")
      .populate("eventOwner", "name email")
      .populate("requester", "name email")
      .sort({ createdAt: -1 });

    const formattedRequests = outgoingRequests.map(request => ({
      id: request._id,
      eventTitle: request.requestedEvent?.title,
      eventTime: request.requestedEvent?.startTime,
      ownerName: request.eventOwner?.name,
      ownerEmail: request.eventOwner?.email,
      reason: request.initialMessage || 'No reason provided',
      preferredDate: request.preferredDate,
      preferredTime: request.preferredTime,
      status: request.status,
      createdAt: request.createdAt,
      requestType: request.type || 'direct'
    }));

    res.json({
      success: true,
      data: formattedRequests
    });

  } catch (err) {
    console.error("Error fetching outgoing requests:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching outgoing requests"
    });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const organization = req.user.organization;

    console.log(`[updateRequestStatus] Request ID: ${id}, New Status: ${status}`);

    if (!["pending", "negotiating", "accepted", "rejected", "cancelled", "completed"].includes(status)) {
      console.warn(`[updateRequestStatus] Invalid status attempted: ${status}`);
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const swapRequest = await SwapRequest.findOne({ _id: id, organization })
      .populate("requestedEvent")
      .populate("eventOwner")
      .populate("requester", "name email");

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: "Swap request not found in your organization"
      });
    }

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
    console.error("Error updating request status:", err);
    res.status(500).json({
      success: false,
      message: "Server error updating request status"
    });
  }
};

export const cleanupTestRequests = async (req, res) => {
  try {
    const organization = req.user.organization;
    const userRoles = req.user.roles || [];

    if (!userRoles.includes("admin")) {
      return res.status(403).json({ success: false, message: "Only admins can clean up requests" });
    }

    console.log(`Cleaning up test swap requests for organization: ${organization}...`);

    const result = await SwapRequest.deleteMany({ organization: organization });

    res.json({
      success: true,
      message: `Cleaned up ${result.deletedCount} requests from your organization`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error("Error cleaning up test requests:", err);
    res.status(500).json({
      success: false,
      message: "Error cleaning up test requests"
    });
  }
};

export const getSwapRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const organization = req.user.organization;

    const swapRequest = await SwapRequest.findOne({ _id: id, organization })
      .populate("requestedEvent", "title startTime endTime")
      .populate("eventOwner", "name email")
      .populate("requester", "name email")
      .populate("negotiationHistory.sender", "name email");

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: "Swap request not found in your organization"
      });
    }

    res.status(200).json({
      success: true,
      data: swapRequest
    });
  } catch (err) {
    console.error("Error fetching swap request:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching swap request"
    });
  }
};

export const getSwapOpportunities = async (req, res) => {
  try {
    const userId = req.user.id;
    // In a real implementation, this would use SwapEngine.findSwapChains(userId)
    // For now, return a placeholder simulation
    res.json({
      success: true,
      opportunities: [
        {
          type: "chain",
          path: ["You", "Alice", "You"],
          benefit: "Get Friday off",
          confidence: 85
        },
        {
          type: "auction",
          eventTitle: "Monday Morning Shift",
          currentBid: 50,
          expiresIn: "2h"
        }
      ]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching opportunities" });
  }
};

export const addNegotiationStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, type, proposedDate, proposedTime } = req.body; // type: message | counter_offer | ai_suggestion
    const userId = req.user.id;
    const organization = req.user.organization;

    const request = await SwapRequest.findOne({ _id: id, organization });
    if (!request) return res.status(404).json({ success: false, message: "Request not found in your organization" });

    // Validate permission (requester or owner)
    const isOwner = request.eventOwner.toString() === userId;
    const isRequester = request.requester.toString() === userId;

    if (!isOwner && !isRequester) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Logic: If counter-offer, update status to 'negotiating'
    if (type === "counter_offer") {
      request.status = "negotiating";

      // Update top-level preferred time if it's a counter-offer
      if (proposedDate) request.preferredDate = proposedDate;
      if (proposedTime) request.preferredTime = proposedTime;
    }

    request.negotiationHistory.push({
      sender: userId,
      message,
      type: type || "message",
      proposedDate,
      proposedTime,
      timestamp: new Date()
    });

    await request.save();

    // Re-fetch to populate sender info
    const updatedRequest = await SwapRequest.findById(id)
      .populate("negotiationHistory.sender", "name email");

    // Real-time Socket Emission
    const io = req.app.get("io");
    if (io) {
      const lastMessage = updatedRequest.negotiationHistory[updatedRequest.negotiationHistory.length - 1];
      io.to(id).emit("new_message", {
        requestId: id,
        ...lastMessage._doc,
        status: updatedRequest.status
      });
    }

    res.json({
      success: true,
      data: updatedRequest.negotiationHistory,
      status: updatedRequest.status
    });

  } catch (err) {
    console.error("Negotiation Error:", err);
    res.status(500).json({ success: false, message: "Failed to add negotiation step" });
  }
};