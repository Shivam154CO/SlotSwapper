import Invite from "../models/Invite.js";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import crypto from "crypto";

export const sendInvite = async (req, res) => {
    try {
        const { email, role } = req.body;
        const organizationId = req.user.organization;
        const invitedById = req.user.id;

        if (!email) {
            return res.status(400).json({ success: false, msg: "Email is required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, msg: "User already registered" });
        }

        // Check for existing pending invite
        let invite = await Invite.findOne({ email, organization: organizationId, status: "pending" });

        const token = crypto.randomBytes(32).toString("hex");

        if (invite) {
            // Update existing invite
            invite.token = token;
            invite.expiresAt = new Date(+new Date() + 7 * 24 * 60 * 60 * 1000);
            await invite.save();
        } else {
            // Create new invite
            invite = await Invite.create({
                email,
                organization: organizationId,
                invitedBy: invitedById,
                role: role || "employee",
                token: token
            });
        }

        // In a real app, send email here with the token link
        // For now, return the link in response for testing
        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/signup?token=${token}&email=${email}`;

        res.json({
            success: true,
            msg: "Invite sent successfully",
            inviteLink // In production, don't return this!
        });

    } catch (err) {
        console.error("[SendInvite] Error:", err);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};

export const getInvites = async (req, res) => {
    try {
        const organizationId = req.user.organization;
        const invites = await Invite.find({ organization: organizationId }).populate("invitedBy", "name email");
        res.json({ success: true, invites });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server error" });
    }
};

export const revokeInvite = async (req, res) => {
    try {
        const { id } = req.params;
        const organizationId = req.user.organization;

        const invite = await Invite.findOneAndDelete({ _id: id, organization: organizationId });
        if (!invite) {
            return res.status(404).json({ success: false, msg: "Invite not found" });
        }

        res.json({ success: true, msg: "Invite revoked" });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server error" });
    }
};
