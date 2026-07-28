const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

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
  isOnboarded: user.isOnboarded,
  verificationStatus: user.verificationStatus,
  yearsExperience: user.yearsExperience,
  bio: user.bio,
  documents: user.documents || [],
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
      isOnboarded: false,
      verificationStatus: "NOT_SUBMITTED",
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
      message: "Registration successful. Please complete account onboarding.",
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

// @desc Customer Onboarding
// @route POST /api/auth/onboard/customer
exports.onboardCustomer = async (req, res) => {
  try {
    const { address, coordinates } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (address && typeof address === "string") {
      user.location.address = address.slice(0, 500);
    }
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      user.location.coordinates = coordinates;
    }

    user.isOnboarded = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Customer onboarding completed successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("[Customer Onboarding Error]:", error.message);
    res.status(500).json({ success: false, message: "Server error during customer onboarding" });
  }
};

// @desc Service Provider / Worker Onboarding with Document Submission (Degree, TESDA/NCII, ID, Licenses)
// @route POST /api/auth/onboard/provider
exports.onboardProvider = async (req, res) => {
  try {
    const { serviceCategories, yearsExperience, bio, documents, address, coordinates } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role !== "provider") {
      return res.status(403).json({ success: false, message: "Only provider accounts can perform provider onboarding" });
    }

    if (Array.isArray(serviceCategories) && serviceCategories.length > 0) {
      user.serviceCategories = serviceCategories
        .filter((c) => typeof c === "string")
        .map((c) => c.trim().slice(0, 50))
        .slice(0, 10);
    }

    if (typeof yearsExperience === "number") {
      user.yearsExperience = Math.max(0, Math.min(60, yearsExperience));
    }

    if (typeof bio === "string") {
      user.bio = bio.slice(0, 1000);
    }

    if (address && typeof address === "string") {
      user.location.address = address.slice(0, 500);
    }
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      user.location.coordinates = coordinates;
    }

    if (Array.isArray(documents) && documents.length > 0) {
      const validDocTypes = [
        "GOVERNMENT_ID",
        "DEGREE_CERTIFICATE",
        "TESDA_NC2_CERTIFICATE",
        "VOCATIONAL_CERTIFICATE",
        "WORK_LICENSE",
        "OTHER",
      ];

      const cleanDocs = documents
        .filter((doc) => doc && doc.title && doc.fileUrl && validDocTypes.includes(doc.docType))
        .map((doc) => ({
          docType: doc.docType,
          title: doc.title.trim().slice(0, 100),
          fileUrl: doc.fileUrl,
          status: "PENDING",
          uploadedAt: new Date(),
        }));

      user.documents = cleanDocs;
    }

    user.verificationStatus = "PENDING_VERIFICATION";
    user.isOnboarded = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Provider onboarding and certification documents submitted for review",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("[Provider Onboarding Error]:", error.message);
    res.status(500).json({ success: false, message: "Server error during provider onboarding" });
  }
};

// @desc Switch active role - DISABLED
// @route PUT /api/auth/switch-role
exports.switchRole = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: "Role switching is disabled. Accounts are permanently registered as Customer or Service Provider.",
  });
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

// @desc Forgot Password - sends recovery token email
// @route POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide an email address" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Return 200 success for obfuscation to prevent user enumeration
      return res.status(200).json({
        success: true,
        message: "If that email address exists, a reset code has been sent.",
      });
    }

    // Generate cryptographically secure random token (6-digit numeric string for easy mobile entry)
    const resetToken = crypto.randomInt(100000, 1000000).toString();

    // Hash token and save to database with 10 minute expiry
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Construct recovery email
    const subject = "Fix-Connect Secure Password Reset Code";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1E3A2F; background-color: #0B1510; color: #F1F5F9; border-radius: 12px;">
        <h2 style="color: #22C55E; border-bottom: 2px solid #16A34A; padding-bottom: 10px;">Password Reset Request</h2>
        <p>A request was received to reset the password for your Fix-Connect account.</p>
        <p>Your secure one-time verification code is:</p>
        <div style="background-color: #11221A; border: 1px solid #22C55E; color: #22C55E; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; margin: 20px 0;">
          ${resetToken}
        </div>
        <p style="color: #F97316; font-weight: 600;">This code is only valid for 10 minutes.</p>
        <p style="font-size: 12px; color: #64748B; margin-top: 30px; border-top: 1px solid #1E3A2F; padding-top: 10px;">
          If you did not request this reset, please ignore this email. Your password will remain unchanged.
        </p>
      </div>
    `;

    try {
      await sendEmail({ email: user.email, subject, html });
      res.status(200).json({
        success: true,
        message: "If that email address exists, a reset code has been sent.",
      });
    } catch (emailError) {
      console.error("[Email Sending Failed]:", emailError.message);
      // Clean database fields on failure
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: "Could not send verification email. Try again later.",
      });
    }
  } catch (error) {
    console.error("[Forgot Password Error]:", error.message);
    res.status(500).json({ success: false, message: "Server error processing request" });
  }
};

// @desc Reset Password using verification code
// @route PUT /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token and password are required" });
    }

    // Hash token to match database record
    const hashedToken = crypto.createHash("sha256").update(token.trim()).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
    }

    // Set new password
    user.password = password;

    // Invalidate reset tokens and active refresh tokens (force session invalidation globally)
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.refreshToken = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful. Please sign in with your new password.",
    });
  } catch (error) {
    console.error("[Reset Password Error]:", error.message);
    res.status(500).json({ success: false, message: "Server error updating password" });
  }
};
