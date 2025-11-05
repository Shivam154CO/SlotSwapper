import mongoose from "mongoose";

const swapRequestSchema = new mongoose.Schema({
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
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "cancelled"],
    default: "pending"
  },
  
  offeredEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: false
  },
  
  message: {
    type: String,
    default: ""
  },
  preferredDate: {
    type: String,
    required: false
  },
  preferredTime: {
    type: String,
    required: false
  },
  contactEmail: {
    type: String,
    required: false
  },
  requesterName: {
    type: String,
    required: false
  },
  
  requestType: {
    type: String,
    enum: ["simple", "complex"],
    default: "simple"
  }
}, {
  timestamps: true
});

swapRequestSchema.index({ eventOwner: 1, status: 1 });
swapRequestSchema.index({ requester: 1 });
swapRequestSchema.index({ contactEmail: 1 });
swapRequestSchema.index({ createdAt: -1 });

export default mongoose.model("SwapRequest", swapRequestSchema);