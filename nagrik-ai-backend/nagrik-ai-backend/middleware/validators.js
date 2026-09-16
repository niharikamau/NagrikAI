const { body, validationResult } = require("express-validator");

// Runs after a validation chain; short-circuits with 400 + field errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// --- Auth ---

const signupValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isLength({ min: 7, max: 20 })
    .withMessage("Please provide a valid phone number"),

  body("address").optional({ checkFalsy: true }).trim().isLength({ max: 500 }),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  handleValidationErrors,
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

const forgotPasswordValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  handleValidationErrors,
];

const resetPasswordValidation = [
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  handleValidationErrors,
];

const changePasswordValidation = [
  body("oldPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
  handleValidationErrors,
];

// --- Complaints ---

const createComplaintValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10 })
    .withMessage("Please describe the issue in a bit more detail (min 10 characters)"),
  handleValidationErrors,
];

const analyzeValidation = [
  body("description").trim().notEmpty().withMessage("Description is required"),
  handleValidationErrors,
];

const assignComplaintValidation = [
  body("department").trim().notEmpty().withMessage("Department is required"),
  handleValidationErrors,
];

const updateStatusValidation = [
  body("status").trim().notEmpty().withMessage("Status is required"),
  handleValidationErrors,
];

// --- Officials ---

const addOfficialValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("department").optional({ checkFalsy: true }).trim(),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  signupValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
  createComplaintValidation,
  analyzeValidation,
  assignComplaintValidation,
  updateStatusValidation,
  addOfficialValidation,
};
