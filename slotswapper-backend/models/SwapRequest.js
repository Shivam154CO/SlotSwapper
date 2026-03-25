
import mongoose from "mongoose";

const swapRequestSchema = new mongoose.Schema({
  // Core Participants
  requestedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  eventOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },

  // Request Metadata
  type: {
    type: String,
    enum: ["direct", "chain", "partial", "auction", "future", "blind"],
    default: "direct"
  },
  status: {
    type: String,
    enum: ["pending", "negotiating", "accepted", "rejected", "cancelled", "completed"],
    default: "pending"
  },

  // Initial Offer Details
  offeredEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: false
  },
  initialMessage: { type: String, default: "" },

  // Flexible Preferences
  preferredDate: { type: String, required: false }, // Format: YYYY-MM-DD
  preferredTime: { type: String, required: false }, // Format: HH:MM

  // Negotiation History (Chat & Counter-offers)
  negotiationHistory: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: String,
    type: { type: String, enum: ["message", "counter_offer", "system", "ai_suggestion"], default: "message" },
    proposedDate: String,
    proposedTime: String,
    timestamp: { type: Date, default: Date.now }
  }],

  // Contact Info
  contactEmail: { type: String, required: false },
  requesterName: { type: String, required: false },

  // Advanced Logic
  chainId: { type: String, index: true },
  conditions: {
    minReputation: { type: Number, default: 0 },
    expiresAt: { type: Date },
    autoAccept: { type: Boolean, default: false }
  },

  // AI Analysis
  aiAnalysis: {
    compatibilityScore: { type: Number, default: 0 },
    riskLevel: { type: String, enum: ["low", "medium", "high"], default: "low" },
    predictedSuccessRate: { type: Number, default: 0 },
    matchReason: { type: String }
  },

  // Auction Data
  auctionData: {
    currentBidValue: { type: Number },
    bidHistory: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      amount: Number,
      timestamp: Date
    }]
  }

}, {
  timestamps: true
});

swapRequestSchema.index({ eventOwner: 1, status: 1 });
swapRequestSchema.index({ requester: 1 });
swapRequestSchema.index({ "negotiationHistory.timestamp": -1 });

export default mongoose.model("SwapRequest", swapRequestSchema);