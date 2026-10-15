const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

// Shape the user object sent back to the client (never send password/tokens)
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  role: user.role,
  notificationsEnabled: user.notificationsEnabled,
  department: user.department,
  jobTitle: user.jobTitle,
  status: user.status,
  complaintStatus: user.complaintStatus,
  resolutionRate: user.resolutionRate,
  totalAssigned: user.totalAssigned,
  totalResolved: user.totalResolved,
  createdAt: user.createdAt,
});

// @route   POST /api/auth/register
// @access  Public
// Always creates a CITIZEN account. Official/admin accounts are created by an
// admin via POST /api/officials (or seeded) — that's the correct real-world
// flow, unlike the old frontend mock which let anyone self-register as admin.
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, address, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    phone,
    address,
    password,
    role: "citizen",
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    token,
    user: sanitizeUser(user),
  });
});

// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select(
    "+password +failedLoginAttempts +lockUntil"
  );

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (user.isLocked()) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    res.status(423);
    throw new Error(
      `Account temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`
    );
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = Date.now() + LOCK_TIME_MS;
      user.failedLoginAttempts = 0;
    }

    await user.save({ validateBeforeSave: false });

    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (user.failedLoginAttempts || user.lockUntil) {
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save({ validateBeforeSave: false });
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: sanitizeUser(user),
  });
});

// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  const genericResponse = {
    success: true,
    message: "If an account with that email exists, a password reset link has been sent.",
  };

  if (!user) {
    return res.status(200).json(genericResponse);
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // TODO: wire up a real email provider. For now the link is logged so it
  // can be tested locally without SMTP configured.
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  console.log(`Password reset link for ${user.email}: ${resetUrl}`);

  res.status(200).json(genericResponse);
});

// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpire");

  if (!user) {
    res.status(400);
    throw new Error("Reset token is invalid or has expired");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;

  await user.save();

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Password has been reset successfully",
    token,
    user: sanitizeUser(user),
  });
});

// @route   PUT /api/auth/change-password
// @access  Private
// Mirrors mockDb.changePassword(oldPass, newPass)
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  const isMatch = await user.matchPassword(oldPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error("Current password does not match");
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: "Password changed successfully" });
});

// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: sanitizeUser(req.user) });
});

// @route   PUT /api/auth/profile
// @access  Private
// Mirrors mockDb.updateProfile(profileData) — lets a user edit their own
// name/phone/address/notification preference. Email and role are never
// editable through this endpoint.
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, notificationsEnabled } = req.body;

  const user = await User.findById(req.user.id);

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (notificationsEnabled !== undefined) user.notificationsEnabled = notificationsEnabled;

  await user.save();

  res.status(200).json({ success: true, user: sanitizeUser(user) });
});

// @route   POST /api/auth/logout
// @access  Private
// JWTs are stateless — logout is really a client-side "discard the token"
// action. This endpoint exists so the frontend has a consistent call to make.
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  updateProfile,
  logout,
  sanitizeUser,
};
