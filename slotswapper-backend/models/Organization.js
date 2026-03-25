import mongoose from "mongoose";
import crypto from "crypto";

const organizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    organizationKey: {
        type: String,
        unique: true,
        index: true,
        default: () => crypto.randomBytes(4).toString("hex").toUpperCase() // e.g. "A1B2C3D4"
    },
    domain: {
        type: String,
        trim: true,
        lowercase: true,
        index: true
    },
    isDomainRestricted: {
        type: Boolean,
        default: false // If true, only users with the matching domain can join
    },
    allowedDomains: [{
        type: String,
        lowercase: true
    }],
    policies: {
        autoApproveSwaps: { type: Boolean, default: false },
        allowCrossDepartmentSwaps: { type: Boolean, default: true },
        requireManagerApproval: { type: Boolean, default: false },
        maxSwapsPerMonth: { type: Number, default: 0 }, // 0 = unlimited
        privacyLevel: {
            type: String,
            enum: ["internal", "external", "strict"],
            default: "internal"
        }
    },
    branding: {
        logo: String,
        primaryColor: { type: String, default: "#3b82f6" }
    },
    subscription: {
        plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
        status: { type: String, enum: ["active", "trialing", "past_due", "canceled"], default: "active" }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("Organization", organizationSchema);
