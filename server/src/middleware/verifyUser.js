import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized: No token found",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized: User not found",
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    console.error("Verify User Error:", error);

    return res.status(401).json({
      message: "Unauthorized: Invalid or expired token",
    });
  }
};