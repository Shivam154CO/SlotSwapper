
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },

  // Smart Status & State
  status: {
    type: String,
    enum: ["busy", "flexible", "swappable", "high_priority", "blocked", "ai_optimized"],
    default: "busy"
  },

  swappable: { type: Boolean, default: false }, // Legacy support, keep synced with status if needed

  category: {
    type: String,
    enum: ["work", "personal", "focus", "meeting", "other"],
    default: "work"
  },

  // AI Intelligence Fields
  aiScore: { type: Number, default: 0 }, // For optimization ranking
  conflictResolved: { type: Boolean, default: false },

  // UI & Visualization
  color: { type: String, default: "#3b82f6" }, // Default blue

  recurrence: {
    type: { type: String, enum: ["none", "daily", "weekly", "monthly"], default: "none" },
    endDate: { type: Date }
  }
}, { timestamps: true });

// Middleware to sync swappable boolean with status (optional helper)
eventSchema.pre('save', function (next) {
  if (this.status === 'swappable') {
    this.swappable = true;
  }
  next();
});

export default mongoose.model("Event", eventSchema);
