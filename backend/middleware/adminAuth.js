import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        console.log("❌ adminAuth: No token found");
        return res.status(401).json({ message: "Unauthorized - No Token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ message: "User not found" });

    // Check either legacy role OR boolean flag
    if (user.role !== "admin" && !user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    req.user = { 
        id: user._id, 
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin
    };
    next();
  } catch (error) {
    console.error("❌ adminAuth error:", error.message);
    res.status(401).json({ message: "Unauthorized - Invalid Token" });
  }
};
