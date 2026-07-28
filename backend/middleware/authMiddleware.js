const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

// Verify Bearer JWT Token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Reject obviously malformed tokens early
      if (!token || token.split(".").length !== 3) {
        return res.status(401).json({
          success: false,
          message: "Malformed authentication token",
        });
      }

      const secret = process.env.ACCESS_TOKEN_SECRET;
      if (!secret) {
        console.error("[CRITICAL] ACCESS_TOKEN_SECRET is not set in environment");
        return res.status(500).json({
          success: false,
          message: "Server configuration error",
        });
      }

      const decoded = jwt.verify(token, secret, {
        algorithms: ["HS256"], // Restrict to expected signing algorithm
      });

      // Validate decoded ID is a valid ObjectId
      if (!decoded.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
        return res.status(401).json({
          success: false,
          message: "Invalid token payload",
        });
      }

      // Attach user object without password hash
      const user = await User.findById(decoded.id).select(
        "-password -refreshToken -loginAttempts -lockUntil"
      );
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User account no longer exists",
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      // Distinguish token expiry from other failures for client retry logic
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired. Please refresh your session.",
          code: "TOKEN_EXPIRED",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Unauthorized access, token invalid",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No authentication token provided",
    });
  }
};

// Role-Based Access Control (RBAC)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // Check both assigned role and active role
    const hasRole =
      roles.includes(req.user.role) || roles.includes(req.user.activeRole);

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. Your current role is not authorized for this resource.",
      });
    }

    next();
  };
};

// Validate that :id param is a valid MongoDB ObjectId
const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`,
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles, validateObjectId };
