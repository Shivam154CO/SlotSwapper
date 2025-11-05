import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ msg: "Token is not valid" });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    };
    
    console.log("Auth middleware - User authenticated:", {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name
    });
    
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

export default auth;