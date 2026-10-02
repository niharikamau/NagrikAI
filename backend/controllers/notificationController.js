const asyncHandler = require("express-async-handler");
const Notification = require("../models/Notification");

// Notifications addressed to this user specifically, plus any broadcast
// notifications for their audience (recipientEmail left unset = broadcast).
const inboxFilter = (audience, email) => ({
  audience,
  $or: [{ recipientEmail: email }, { recipientEmail: { $exists: false } }, { recipientEmail: null }],
});

// @route   GET /api/notifications
// @access  Private (citizen)
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find(inboxFilter("citizen", req.user.email)).sort({
    createdAt: -1,
  });
  res.status(200).json({ success: true, notifications });
});

// @route   PUT /api/notifications/read
// @access  Private (citizen)
const markMyNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(inboxFilter("citizen", req.user.email), { unread: false });
  res.status(200).json({ success: true });
});

// @route   GET /api/notifications/official
// @access  Private (official)
const getOfficialNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find(inboxFilter("official", req.user.email)).sort({
    createdAt: -1,
  });
  res.status(200).json({ success: true, notifications });
});

// @route   PUT /api/notifications/official/read
// @access  Private (official)
const markOfficialNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(inboxFilter("official", req.user.email), { unread: false });
  res.status(200).json({ success: true });
});

// @route   GET /api/notifications/admin
// @access  Private (admin)
const getAdminNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ audience: "admin" }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, notifications });
});

// @route   PUT /api/notifications/admin/read
// @access  Private (admin)
const markAdminNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ audience: "admin" }, { unread: false });
  res.status(200).json({ success: true });
});

module.exports = {
  getMyNotifications,
  markMyNotificationsRead,
  getOfficialNotifications,
  markOfficialNotificationsRead,
  getAdminNotifications,
  markAdminNotificationsRead,
};
