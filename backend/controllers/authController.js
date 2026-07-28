const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Generate JWT tokens with short-lived access and longer refresh
const generateTokens = (id) => {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

  if (!accessTokenSecret || !refreshTokenSecret) {
    throw new Error("JWT secrets are not configured in environment variables");
  }

  const accessToken = jwt.sign({ id }, accessTokenSecret, {
    expiresIn: "15m", // Short-lived: 15 minutes
    algorithm: "HS256",
  });

  const refreshToken = jwt.sign({ id }, refreshTokenSecret, {
    expiresIn: "7d", // Refresh: 7 days
    algorithm: "HS256",
  });

  return { accessToken, refreshToken };
};

// Sanitize user object for API response (defense-in-depth)
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  activeRole: user.activeRole,
  isOnline: user.isOnline,
  rating: user.rating,
  serviceCategories: user.serviceCategories,
  location: user.location,
});

// @desc Register user (Customer or Provider)
// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role, serviceCategories } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists",
      });
    }

    // Only allow customer or provider at registration, never admin
    const assignedRole = role === "provider" ? "provider" : "customer";

    // Sanitize serviceCategories: only accept strings, trim, cap length
    let cleanCategories = [];
    if (Array.isArray(serviceCategories)) {
      cleanCategories = serviceCategories
        .filter((c) => typeof c === "string")
        .map((c) => c.trim().slice(0, 50))
        .slice(0, 10);
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: assignedRole,
      activeRole: assignedRole,
      serviceCategories: cleanCategories,
    });

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store hashed refresh token (not plaintext)
    user.refreshToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    await user.save();

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token: accessToken,
      refreshToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("[Register Error]:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// @desc Login user with account lockout
// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select(
      "+password +refreshToken +loginAttempts +lockUntil"
    );

    if (!user) {
      // Generic message to prevent user enumeration
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check account lockout
    if (user.isLocked) {
      const remainingMs = user.lockUntil - Date.now();
      const remainingMins = Math.ceil(remainingMs / 60000);
      return res.status(423).json({
        success: false,
        message: `Account temporarily locked. Try again in ${remainingMins} minute(s).`,
        code: "ACCOUNT_LOCKED",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Successful login: reset lockout counters
    await user.resetLoginAttempts();

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store hashed refresh token
    user.refreshToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: accessToken,
      refreshToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("[Login Error]:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// @desc Refresh access token using refresh token
// @route POST /api/auth/refresh-token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken: clientRefreshToken } = req.body;

    if (!clientRefreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Verify refresh token signature
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
    let decoded;
    try {
      decoded = jwt.verify(clientRefreshToken, refreshSecret, {
        algorithms: ["HS256"],
      });
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
        code: "REFRESH_INVALID",
      });
    }

    // Compare hashed token with stored hash (prevents stolen plaintext reuse)
    const hashedToken = crypto
      .createHash("sha256")
      .update(clientRefreshToken)
      .digest("hex");

    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== hashedToken) {
      // Token reuse detected — possible theft. Invalidate all sessions.
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
      return res.status(401).json({
        success: false,
        message: "Refresh token revoked. Please log in again.",
        code: "REFRESH_REVOKED",
      });
    }

    // Rotate: issue new token pair and invalidate old refresh token
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      generateTokens(user._id);

    user.refreshToken = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");
    await user.save();

    res.status(200).json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("[Refresh Token Error]:", error.message);
    res.status(500).json({
      success: false,
      message: "Error refreshing token",
    });
  }
};

// @desc Get current authenticated profile
// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching profile",
    });
  }
};

// @desc Switch active role (Customer <-> Provider)
// @route PUT /api/auth/switch-role
exports.switchRole = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const newActiveRole =
      user.activeRole === "customer" ? "provider" : "customer";

    user.activeRole = newActiveRole;
    // Force offline when switching away from provider mode
    if (newActiveRole === "customer") {
      user.isOnline = false;
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: `Switched active mode to ${newActiveRole}`,
      activeRole: user.activeRole,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error switching role",
    });
  }
};

// @desc Toggle Online / Offline status for Service Providers
// @route PUT /api/auth/toggle-online
exports.toggleOnline = async (req, res) => {
  try {
    const { isOnline, coordinates, address } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "provider" && user.activeRole !== "provider") {
      return res.status(403).json({
        success: false,
        message:
          "Only Service Providers can switch online/offline availability",
      });
    }

    if (typeof isOnline === "boolean") {
      user.isOnline = isOnline;
    } else {
      user.isOnline = !user.isOnline;
    }

    // Coordinates validated by express-validator middleware before reaching here
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      user.location.coordinates = coordinates;
    }
    if (address && typeof address === "string") {
      user.location.address = address.slice(0, 500);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Provider is now ${user.isOnline ? "ONLINE" : "OFFLINE"}`,
      isOnline: user.isOnline,
      location: user.location,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating online availability",
    });
  }
};

// @desc Logout — invalidate refresh token
// @route POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+refreshToken");
    if (user) {
      user.refreshToken = undefined;
      user.isOnline = false;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error during logout",
    });
  }
};
