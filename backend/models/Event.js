import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  swappable: { type: Boolean, default: false },
});

export default mongoose.model("Event", eventSchema);

