import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import { AppError } from "./errorHandler.js";

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return next(new AppError("No token provided, authorization denied", 401));
    }

    if (!process.env.JWT_SECRET) {
      if (process.env.NODE_ENV === "development") {
        console.warn("CRITICAL: JWT_SECRET missing from environment");
      }
      return next(new AppError("Server configuration error", 500));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new AppError("User not found or token invalid", 401));
    }

    // Enterprise Self-Healing: Ensure user belongs to an organization
    if (!user.organization) {
      console.log(`[Auth] Auto-healing user ${user.email}: Attaching to Global Workspace`);
      let defaultOrg = await Organization.findOne({ name: "Global Workspace" });
      if (!defaultOrg) {
        defaultOrg = await Organization.create({ 
          name: "Global Workspace", 
          domain: "global.com",
          settings: { allowPublicSwaps: true }
        });
      }
      user.organization = defaultOrg._id;
      await user.save();
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      organization: user.organization.toString(),
      roles: user.roles || ["employee"]
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return next(new AppError("Session expired or invalid token", 401));
  }
};

export default auth;