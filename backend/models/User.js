const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const caseHistoryItemSchema = new mongoose.Schema(
  {
    complaintId: { type: Number, required: true },
    issue: String,
    assignedDate: String,
    status: String,
    timestamp: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    // --- Core identity (all roles) ---
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
      default: "",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["citizen", "official", "admin"],
      default: "citizen",
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },

    // --- Official-only roster/performance fields (role === 'official') ---
    department: { type: String, default: "" },
    jobTitle: { type: String, default: "Department Officer" },
    status: {
      type: String,
      enum: ["Active", "Busy", "Inactive"],
      default: "Active",
    },
    complaintStatus: {
      type: String,
      enum: ["Free", "Assigned", "Review", "Rejected"],
      default: "Free",
    },
    resolutionRate: { type: String, default: "100%" },
    totalAssigned: { type: Number, default: 0 },
    totalResolved: { type: Number, default: 0 },
    caseHistory: { type: [caseHistoryItemSchema], default: [] },

    // --- Security / lockout ---
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  const expiryMinutes = Number(process.env.RESET_TOKEN_EXPIRY_MIN) || 15;
  this.resetPasswordExpire = Date.now() + expiryMinutes * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
