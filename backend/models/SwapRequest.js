import mongoose from "mongoose";

const swapRequestSchema = new mongoose.Schema({
  // Required for both simple and complex swaps
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
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "cancelled"],
    default: "pending"
  },
  
  // Optional for simple swaps (make these not required)
  offeredEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: false // Change to false
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false // Change to false
  },
  
  // Simple form fields
  message: String,
  preferredDate: String,
  preferredTime: String,
  contactEmail: String,
  requesterName: String,
  
  // Track request type
  requestType: {
    type: String,
    enum: ["simple", "complex"],
    default: "simple"
  }
}, {
  timestamps: true
});

export default mongoose.model("SwapRequest", swapRequestSchema);