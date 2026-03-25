import { Server } from "socket.io";
import SwapRequest from "../models/SwapRequest.js";

const socketHandler = (server) => {
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
            methods: ["GET", "POST"]
        }
    });

    // Map to track user presence
    // Key: userId, Value: socketId
    const users = new Map();

    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        socket.on("authenticate", (userId) => {
            if (userId) {
                users.set(userId, socket.id);
                socket.userId = userId;
                io.emit("user_status", { userId, status: "online" });
                console.log(`User ${userId} authenticated on socket ${socket.id}`);
            }
        });

        // Join a swap request room
        socket.on("join_swap", (requestId) => {
            socket.join(requestId);
            console.log(`Socket ${socket.id} joined room ${requestId}`);
        });

        // Handle sending messages
        socket.on("send_message", async (data) => {
            const { requestId, senderId, message, type, proposedDate, proposedTime } = data;

            try {
                // We don't save to DB here if the controller already does it
                // But for real-time, we emit to the room
                io.to(requestId).emit("new_message", {
                    sender: senderId,
                    message,
                    type,
                    proposedDate,
                    proposedTime,
                    timestamp: new Date()
                });

                // If it's a counter-offer, we might want to notify the other party specifically
                // (Though room emission handles it if they are online and in the room)
            } catch (err) {
                console.error("Socket message error:", err);
            }
        });

        // Presence indicators
        socket.on("check_presence", (targetUserId) => {
            const isOnline = users.has(targetUserId);
            socket.emit("presence_result", { userId: targetUserId, isOnline });
        });

        // WebRTC Signaling for Calls
        socket.on("call_user", (data) => {
            const { userToCall, signalData, from, name } = data;
            const targetSocketId = users.get(userToCall);
            if (targetSocketId) {
                io.to(targetSocketId).emit("incoming_call", { signal: signalData, from, name });
            }
        });

        socket.on("answer_call", (data) => {
            const targetSocketId = users.get(data.to);
            if (targetSocketId) {
                io.to(targetSocketId).emit("call_accepted", data.signal);
            }
        });

        socket.on("disconnect", () => {
            if (socket.userId) {
                users.delete(socket.userId);
                io.emit("user_status", { userId: socket.userId, status: "offline" });
                console.log(`User ${socket.userId} disconnected`);
            }
            console.log("Client disconnected:", socket.id);
        });
    });

    return io;
};

export default socketHandler;
