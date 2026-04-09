import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ message: "Access denied: Account blocked by administrator." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please login again" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Not authorized, token is invalid" });
    }
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// @desc    Generic check for admin access (any admin level)
export const authorizeAdmin = (req, res, next) => {
  const adminRoles = ["superadmin", "moderator", "support"];
  if (req.user && adminRoles.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ success: false, message: "Restricted Error: Administrator identity verification failed." });
  }
};

// @desc    Granular check for specific roles
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `RBAC Violation: Role [${req.user.role}] does not have required permissions for this segment.` 
            });
        }
        next();
    };
};
