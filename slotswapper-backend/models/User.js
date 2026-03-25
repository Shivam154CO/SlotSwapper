import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6,
    select: false
  },
  roles: {
    type: [String],
    enum: ["super_admin", "org_admin", "manager", "employee", "viewer", "user"],
    default: ["employee"]
  },

  // Security & Session
  refreshTokens: [{
    token: String,
    device: String,
    ip: String,
    createdAt: { type: Date, default: Date.now }
  }],

  // 2FA & Social Auth
  auth: {
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    googleId: String,
    microsoftId: String,
    slackId: String
  },

  // User Profile Intelligence
  profile: {
    timezone: { type: String, default: "UTC" },
    chronotype: { type: String, enum: ["early_bird", "night_owl", "flexible"], default: "flexible" },
    skills: [String],
    bio: String,
    avatar: String
  },

  // Availability & Reputation
  availability: {
    reputationScore: { type: Number, default: 100 },
    workingHours: {
      type: Map, // Store flexible JSON structure for hours
      of: String
    }
  },

  // Gamification (Existing)
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{ type: String }],
  completedSwaps: { type: Number, default: 0 },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    index: true
  }
}, {
  timestamps: true
});

export default mongoose.model("User", userSchema);