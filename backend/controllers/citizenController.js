const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Complaint = require("../models/Complaint");

// @route   GET /api/citizens
// @access  Private (admin)
// Mirrors mockDb.getCitizens — every non-admin user (citizens AND officials,
// same as the original mock's `role !== "admin"` filter) with their
// complaint count and list attached.
const getCitizens = asyncHandler(async (req, res) => {
  const users = await User.find({ role: { $ne: "admin" } }).sort({ createdAt: -1 });
  const complaints = await Complaint.find({});

  const citizens = users.map((u) => {
    const userComplaints = complaints.filter(
      (c) => c.citizenEmail === u.email || (c.citizenName || "").toLowerCase() === u.name.toLowerCase()
    );
    return {
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      address: u.address,
      role: u.role,
      notificationsEnabled: u.notificationsEnabled,
      totalComplaints: userComplaints.length,
      complaintsList: userComplaints,
    };
  });

  res.status(200).json({ success: true, count: citizens.length, citizens });
});

module.exports = { getCitizens };
