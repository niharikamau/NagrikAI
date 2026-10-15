const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const User = require("../models/User");

const sanitizeOfficial = (o) => ({
  id: o._id,
  name: o.name,
  email: o.email,
  phone: o.phone,
  department: o.department,
  role: o.jobTitle,
  status: o.status,
  complaintStatus: o.complaintStatus,
  resolutionRate: o.resolutionRate,
  totalAssigned: o.totalAssigned,
  totalResolved: o.totalResolved,
  caseHistory: o.caseHistory,
  createdAt: o.createdAt,
});

// @route   GET /api/officials
// @access  Private (admin)
const getOfficials = asyncHandler(async (req, res) => {
  const officials = await User.find({ role: "official" }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, officials: officials.map(sanitizeOfficial) });
});

// @route   GET /api/officials/:id
// @access  Private (admin)
const getOfficialById = asyncHandler(async (req, res) => {
  const official = await User.findOne({ _id: req.params.id, role: "official" });
  if (!official) {
    res.status(404);
    throw new Error("Official not found");
  }
  res.status(200).json({ success: true, official: sanitizeOfficial(official) });
});

// @route   POST /api/officials
// @access  Private (admin)
// Mirrors mockDb.addOfficial — but unlike the old mock (which only added a
// roster entry with no way to actually log in), this creates a real account
// so the new official can sign in with the email/password given here.
const addOfficial = asyncHandler(async (req, res) => {
  const { name, email, phone, department, role: jobTitle, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error("An account with this email already exists");
  }

  const official = await User.create({
    name,
    email,
    phone: phone || "+91 9800000000",
    department: department || "General Administration",
    jobTitle: jobTitle || "Department Officer",
    password: password || crypto.randomBytes(6).toString("hex"), // random temp password if none supplied
    role: "official",
    status: "Active",
    complaintStatus: "Free",
    resolutionRate: "100%",
    totalAssigned: 0,
    totalResolved: 0,
    caseHistory: [],
  });

  res.status(201).json({ success: true, official: sanitizeOfficial(official) });
});

// @route   PUT /api/officials/:id
// @access  Private (admin)
const updateOfficial = asyncHandler(async (req, res) => {
  const official = await User.findOne({ _id: req.params.id, role: "official" });
  if (!official) {
    res.status(404);
    throw new Error("Official not found");
  }

  const updatable = ["name", "phone", "department", "status", "complaintStatus", "resolutionRate"];
  updatable.forEach((field) => {
    if (req.body[field] !== undefined) official[field] = req.body[field];
  });
  if (req.body.role !== undefined) official.jobTitle = req.body.role;

  await official.save();
  res.status(200).json({ success: true, official: sanitizeOfficial(official) });
});

module.exports = { getOfficials, getOfficialById, addOfficial, updateOfficial };
