import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const trafficAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = req.cookies.token || (authHeader && authHeader.split(" ")[1]);
    
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return res.status(401).json({ message: "Invalid token" });

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    if (user.role !== "traffic" && !user.isTraffic) return res.status(403).json({ message: "Access denied. Traffic officers only." });

    req.user = { id: user._id.toString(), email: user.email, role: user.role, isTraffic: user.isTraffic };
    next();
  } catch (err) {
    console.error("trafficAuth error:", err);
    res.status(401).json({ message: "Unauthorized" });
  }
};
