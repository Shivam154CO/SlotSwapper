import Event from "../models/Event.js";
import mongoose from "mongoose";
import { catchAsync, sendResponse } from "../utils/apiUtils.js";
import { AppError } from "../middleware/errorHandler.js";

export const addEvent = catchAsync(async (req, res, next) => {
  const { title, startTime, endTime, userId } = req.body;
  const organization = req.user.organization;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError("Invalid userId", 400));
  }

  const event = await Event.create({
    title,
    startTime,
    endTime,
    userId,
    organization,
    swappable: false,
  });

  sendResponse(res, 201, event, "Event created successfully");
});

export const getUserEvents = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const organization = req.user.organization;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError("Invalid userId", 400));
  }

  const events = await Event.find({ userId, organization });
  sendResponse(res, 200, events);
});

export const toggleSwappable = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const organization = req.user.organization;

  const event = await Event.findOne({ _id: id, organization });
  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  event.swappable = !event.swappable;
  await event.save();

  sendResponse(res, 200, event, "Swappable status updated");
});

export const getSwappableEvents = catchAsync(async (req, res, next) => {
  const organization = req.user.organization;

  const swappableEvents = await Event.find({
    swappable: true,
    organization: organization,
    userId: { $ne: req.user.id }
  })
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

  sendResponse(res, 200, formattedEvents);
});

export const getEventById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const organization = req.user.organization;

  const event = await Event.findOne({ _id: id, organization }).populate("userId", "name email");

  if (!event) {
    return next(new AppError("Event not found", 404));
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

  sendResponse(res, 200, formattedEvent);
});

export const deleteEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const organization = req.user.organization;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid event ID", 400));
  }

  const event = await Event.findOne({ _id: id, organization });
  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  await Event.findOneAndDelete({ _id: id, organization });
  sendResponse(res, 200, { deletedEventId: id }, "Event deleted successfully");
});