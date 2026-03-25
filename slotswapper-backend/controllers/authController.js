import User from "../models/User.js";
import Organization from "../models/Organization.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET || "fallback_refresh_secret",
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, timezone, chronotype, organizationName, organizationKey } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Name, email, and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        msg: "Password must be at least 6 characters long"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        msg: "User already exists with this email"
      });
    }

    // Organization Logic
    const domain = email.split('@')[1].toLowerCase();
    let organization;
    let isOrgCreator = false;

    if (organizationKey) {
      // JOINING EXISTING ORG VIA KEY
      organization = await Organization.findOne({ organizationKey: organizationKey.toUpperCase() });
      if (!organization) {
        return res.status(404).json({ success: false, msg: "Invalid Organization Key" });
      }
    } else if (organizationName) {
      // ATTEMPTING TO CREATE OR AUTO-JOIN ORG
      organization = await Organization.findOne({
        $or: [{ domain: domain }, { name: new RegExp('^' + organizationName + '$', "i") }]
      });

      if (!organization) {
        // Create new Organization (Admin Setup)
        organization = await Organization.create({
          name: organizationName,
          domain: domain,
          allowedDomains: [domain]
        });
        isOrgCreator = true;
      }
    } else {
      return res.status(400).json({ success: false, msg: "Organization Name or Key is required" });
    }

    // Domain Restriction Security Check
    if (organization.isDomainRestricted || organization.allowedDomains?.length > 0) {
      const isAllowed = organization.allowedDomains.includes(domain);
      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          msg: `Security Violation: Your email domain (@${domain}) is not authorized for this workspace.`
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      organization: organization._id,
      roles: isOrgCreator ? ["org_admin", "employee"] : ["employee"],
      profile: {
        timezone: timezone || "UTC",
        chronotype: chronotype || "flexible"
      }
    });

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token
    user.refreshTokens.push({
      token: refreshToken,
      device: req.headers["user-agent"] || "Unknown Device",
      ip: req.ip
    });
    await user.save();

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        profile: user.profile,
        auth: { twoFactorEnabled: user.auth.twoFactorEnabled },
        points: user.points,
        level: user.level,
        badges: user.badges,
        completedSwaps: user.completedSwaps
      }
    });

  } catch (err) {
    console.error("[Signup] Server error:", err);
    res.status(500).json({
      success: false,
      msg: "Server error during signup",
      error: err.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Email and password are required"
      });
    }

    const user = await User.findOne({ email }).select("+password +refreshTokens");
    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        msg: "Invalid email or password"
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Rotate/Add Refresh Token
    // Optional: Remove old tokens from this device to implement rotation strictness
    // For now, simpler multi-device: just push new one
    user.refreshTokens.push({
      token: refreshToken,
      device: req.headers["user-agent"] || "Unknown Device",
      ip: req.ip
    });

    // Housekeeping: Remove expired tokens (older than 7 days) if array gets too big
    if (user.refreshTokens.length > 10) {
      user.refreshTokens = user.refreshTokens.slice(-10);
    }

    await user.save();

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        profile: user.profile,
        auth: { twoFactorEnabled: user.auth.twoFactorEnabled },
        points: user.points,
        level: user.level,
        badges: user.badges,
        completedSwaps: user.completedSwaps
      }
    });

  } catch (err) {
    console.error("[Login] Server error:", err);
    res.status(500).json({
      success: false,
      msg: "Server error during login",
      error: err.message
    });
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ success: false, msg: "No refresh token provided" });
  }

  try {
    // Verify token first (stateless check)
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || "fallback_refresh_secret"
    );

    // Find user and token in DB (stateful check)
    const user = await User.findById(decoded.id).select("+refreshTokens");

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    // Find the token object in the user's array
    const tokenIndex = user.refreshTokens.findIndex(rt => rt.token === refreshToken);

    if (tokenIndex === -1) {
      // Security Alert: Reuse Attempt? 
      // If a valid signed token is not in DB, it might be a reused token.
      // In a strict implementation, we might wipe all tokens for this user.
      console.warn(`[Security] Refresh token reuse attempt for user ${decoded.id}`);
      return res.status(403).json({ success: false, msg: "Invalid refresh token" });
    }

    // Generate new token pair (Rotation)
    const tokens = generateTokens(user._id);

    // Replace the old token with the new one
    user.refreshTokens[tokenIndex] = {
      token: tokens.refreshToken,
      device: req.headers["user-agent"] || "Unknown Device",
      ip: req.ip,
      createdAt: Date.now()
    };

    await user.save();

    res.json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });

  } catch (err) {
    console.error("[RefreshToken] Error:", err.message);
    res.status(403).json({ success: false, msg: "Invalid or expired refresh token" });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // If refreshToken is provided, remove it from DB
    if (refreshToken) {
      // Find user who has this token
      const user = await User.findOne({ "refreshTokens.token": refreshToken });

      if (user) {
        // Remove the specific token
        user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
        await user.save();
      }
    }

    // If user is authenticated via access token (req.user exists), 
    // we could also log them out more broadly if needed, but for now just removing the refresh token is enough.

    res.json({ success: true, msg: "Logged out successfully" });
  } catch (err) {
    console.error("[Logout] Error:", err);
    res.status(500).json({ success: false, msg: "Server error during logout" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -refreshTokens -auth.twoFactorSecret");
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("[GetProfile] Error:", err);
    res.status(500).json({ success: false, msg: "Server error fetching profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, bio, skills, chronotype, workingHours, timezone } = req.body;

    // Use $set to update nested fields without overwriting the whole object
    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData["profile.bio"] = bio;
    if (skills !== undefined) updateData["profile.skills"] = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    if (chronotype) updateData["profile.chronotype"] = chronotype;
    if (timezone) updateData["profile.timezone"] = timezone;
    if (workingHours) updateData["availability.workingHours"] = workingHours;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password -refreshTokens");

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    res.json({ success: true, user, msg: "Profile updated successfully" });
  } catch (err) {
    console.error("[UpdateProfile] Error:", err);
    res.status(500).json({ success: false, msg: "Server error updating profile" });
  }
};