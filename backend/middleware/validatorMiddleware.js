const { body, param, validationResult } = require("express-validator");

// Helper to handle validation error formatted response
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Input validation error",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Validation rules for Register
const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be 2-100 characters")
    .matches(/^[a-zA-Z\s.\-'ñÑ]+$/)
    .withMessage("Name may only contain letters, spaces, hyphens, and periods"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage("Email address is too long"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\+[1-9]\d{7,14}$/)
    .withMessage("Phone number must be in international format (e.g. +639171234567) without spaces or hyphens"),
  body("password")
    .isLength({ min: 8, max: 72 })
    .withMessage("Password must be between 8 and 72 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
  body("role")
    .optional()
    .isIn(["customer", "provider"])
    .withMessage("Invalid role selected"),
  body("serviceCategories")
    .optional()
    .isArray({ max: 10 })
    .withMessage("Maximum of 10 service categories allowed"),
  body("serviceCategories.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Each service category must be 1-50 characters"),
  handleValidationErrors,
];

// Validation rules for Login
const validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ max: 72 })
    .withMessage("Password too long"),
  handleValidationErrors,
];

// Validation rules for Forgot Password
const validateForgotPassword = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  handleValidationErrors,
];

// Validation rules for Reset Password
const validateResetPassword = [
  body("token")
    .trim()
    .notEmpty()
    .withMessage("Reset token is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Reset token must be a 6-digit code"),
  body("password")
    .isLength({ min: 8, max: 72 })
    .withMessage("Password must be between 8 and 72 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
  handleValidationErrors,
];

// Validation rules for Booking Request
const validateBooking = [
  body("serviceName")
    .trim()
    .notEmpty()
    .withMessage("Service name is required")
    .isLength({ max: 100 })
    .withMessage("Service name too long"),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Service category is required")
    .isLength({ max: 50 })
    .withMessage("Category name too long"),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Service location address is required")
    .isLength({ max: 500 })
    .withMessage("Address too long"),
  body("coordinates")
    .isArray({ min: 2, max: 2 })
    .withMessage("Valid coordinates [longitude, latitude] are required"),
  body("coordinates.*")
    .isFloat()
    .withMessage("Coordinates must be valid numbers"),
  body("coordinates.0")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
  body("coordinates.1")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must be under 500 characters"),
  body("paymentMethod")
    .optional()
    .isIn(["CASH", "GCASH", "PAYMONGO"])
    .withMessage("Invalid payment method"),
  handleValidationErrors,
];

// Validation rules for status update
const validateStatusUpdate = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["EN_ROUTE", "ARRIVED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .withMessage("Invalid status value"),
  handleValidationErrors,
];

// Validation rules for toggleOnline
const validateToggleOnline = [
  body("isOnline")
    .optional()
    .isBoolean()
    .withMessage("isOnline must be a boolean"),
  body("coordinates")
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage("Coordinates must be [longitude, latitude]"),
  body("coordinates.0")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),
  body("coordinates.1")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),
  body("address")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Address too long"),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateBooking,
  validateStatusUpdate,
  validateToggleOnline,
};
