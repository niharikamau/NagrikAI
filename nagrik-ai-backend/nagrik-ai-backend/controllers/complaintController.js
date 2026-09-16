const asyncHandler = require("express-async-handler");
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const { analyzeComplaintDescription } = require("../utils/aiAssessment");
const { formatDateTime, formatDate, formatTime } = require("../utils/formatDate");
const { getNextSequence } = require("../utils/counter");
const { notify } = require("../utils/notify");
const AILog = require("../models/AILog");

// @route   POST /api/complaints/analyze
// @access  Private (citizen) — Step 4 "Analyze Complaint" in the File Complaint flow
const analyzeComplaint = asyncHandler(async (req, res) => {
  const { description } = req.body;

  const assessment = analyzeComplaintDescription(description);

  // record the AI activity for the admin AI Monitoring dashboard
  const logId = await getNextSequence("aiLogId");
  await AILog.create({
    id: `AI-LOG-${logId}`,
    time: formatTime(new Date()),
    date: formatDate(new Date()),
    model: "Hugging Face",
    task: "Classification",
  });

  res.status(200).json({ success: true, assessment });
});

// @route   POST /api/complaints
// @access  Private (citizen)
// Mirrors mockDb.saveComplaint — but unlike the old frontend mock, the
// citizen's identity is always taken from the authenticated user, never
// from the request body, so complaints can't be filed under someone else's name.
const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, locationName, locationCoordinates, evidence, aiAssessment } =
    req.body;

  const now = new Date();
  const id = await getNextSequence("complaintId");

  const complaint = await Complaint.create({
    id,
    title,
    issue: title,
    description,
    rawText: description,
    aiSummary: aiAssessment?.understanding || "",
    category: category || aiAssessment?.category || "General Municipal Issue",
    urgency: "Medium",
    status: "Pending Review",
    submittedDate: formatDateTime(now),
    lastUpdated: formatDateTime(now),
    citizenName: req.user.name,
    citizenEmail: req.user.email,
    citizenPhone: req.user.phone,
    locationName,
    locationCoordinates,
    evidence: evidence || [],
    aiAssessment,
    history: [
      {
        status: "Submitted",
        date: formatDate(now),
        time: formatTime(now),
        notes: "Complaint received by the system.",
      },
    ],
  });

  await notify("admin", {
    title: "New Complaint Registered",
    message: `Complaint #${complaint.id} (${complaint.category}) is waiting for assignment.`,
    type: "urgent",
    complaintId: complaint.id,
  });

  await notify("citizen", {
    recipientEmail: req.user.email,
    title: "Complaint Registered",
    message: `Your complaint #${complaint.id} has been submitted successfully for verification.`,
    type: "tracking",
    complaintId: complaint.id,
  });

  res.status(201).json({ success: true, complaint });
});

// @route   GET /api/complaints
// @access  Private
// Role-scoped: citizens see only their own complaints, officials see only
// complaints assigned to them, admins see everything. Optional ?status=
// and ?category= query filters apply on top of that scope.
const getComplaints = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === "citizen") {
    filter.citizenEmail = req.user.email;
  } else if (req.user.role === "official") {
    filter.assignedOfficialEmail = req.user.email;
  }
  // admin: no extra filter — sees all complaints

  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;

  const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: complaints.length, complaints });
});

// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOne({ id: Number(req.params.id) });

  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  const isOwner = req.user.role === "citizen" && complaint.citizenEmail === req.user.email;
  const isAssignedOfficial =
    req.user.role === "official" && complaint.assignedOfficialEmail === req.user.email;

  if (req.user.role !== "admin" && !isOwner && !isAssignedOfficial) {
    res.status(403);
    throw new Error("You do not have access to this complaint");
  }

  res.status(200).json({ success: true, complaint });
});

// @route   PUT /api/complaints/:id/status
// @access  Private (admin, or the official it's assigned to)
const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  const complaint = await Complaint.findOne({ id: Number(req.params.id) });
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  if (req.user.role === "official" && complaint.assignedOfficialEmail !== req.user.email) {
    res.status(403);
    throw new Error("You are not assigned to this complaint");
  }

  const now = new Date();
  complaint.status = status;
  complaint.lastUpdated = formatDateTime(now);
  complaint.history.push({
    status,
    date: formatDate(now),
    time: formatTime(now),
    notes: notes || `Status changed to ${status}.`,
  });
  await complaint.save();

  await notify("citizen", {
    recipientEmail: complaint.citizenEmail,
    title: "Complaint Status Updated",
    message: `Complaint #${complaint.id} is now ${status}.`,
    type: "tracking",
    complaintId: complaint.id,
  });

  res.status(200).json({ success: true, complaint });
});

// @route   PUT /api/complaints/:id/assign
// @access  Private (admin)
// Mirrors mockDb.assignComplaint + addOfficialCase in one atomic-ish flow.
const assignComplaintToOfficial = asyncHandler(async (req, res) => {
  const { department, officialId, notes } = req.body;

  const complaint = await Complaint.findOne({ id: Number(req.params.id) });
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  let official = null;
  if (officialId) {
    official = await User.findOne({ _id: officialId, role: "official" });
    if (!official) {
      res.status(404);
      throw new Error("Official not found");
    }
  }

  const now = new Date();
  complaint.assignedDepartment = department;
  complaint.assignedOfficial = official ? official.name : undefined;
  complaint.assignedOfficialEmail = official ? official.email : undefined;
  complaint.status = "Assigned";
  complaint.lastUpdated = formatDateTime(now);
  complaint.history.push({
    status: "Assigned",
    date: formatDate(now),
    time: formatTime(now),
    notes: notes || `Assigned to ${official ? official.name : department}.`,
  });
  await complaint.save();

  if (official) {
    official.caseHistory.unshift({
      complaintId: complaint.id,
      issue: complaint.title,
      assignedDate: formatDate(now),
      status: "Assigned",
      timestamp: formatDateTime(now),
    });
    official.totalAssigned = (official.totalAssigned || 0) + 1;
    official.complaintStatus = "Assigned";
    await official.save();

    await notify("official", {
      recipientEmail: official.email,
      title: "New Complaint Assigned",
      message: `Complaint #${complaint.id} (${complaint.category}) has been assigned to you.`,
      type: "update",
      complaintId: complaint.id,
    });
  }

  await notify("citizen", {
    recipientEmail: complaint.citizenEmail,
    title: "Complaint Assigned",
    message: `Complaint #${complaint.id} has been assigned to ${official ? official.name : department}.`,
    type: "tracking",
    complaintId: complaint.id,
  });

  res.status(200).json({ success: true, complaint });
});

// @route   PUT /api/complaints/:id/decision
// @access  Private (official assigned to the complaint, or admin)
// Mirrors mockDb.submitOfficialDecision — the multi-step official review
// (Step 1 decision -> Step 2 data -> Step 3 action -> Step 4 status).
const submitOfficialDecision = asyncHandler(async (req, res) => {
  const { step1Decision, step2Data, step3Action, step4Status, remarks } = req.body;

  const complaint = await Complaint.findOne({ id: Number(req.params.id) });
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  if (req.user.role === "official" && complaint.assignedOfficialEmail !== req.user.email) {
    res.status(403);
    throw new Error("You are not assigned to this complaint");
  }

  let nextStatus = step4Status || complaint.status;
  if (step1Decision === "Requires Information") nextStatus = "Requires Information";
  else if (step1Decision === "Unable to Verify") nextStatus = "Unable to Verify";
  else if (step1Decision === "Not Applicable") nextStatus = "Not Applicable";
  else if (step1Decision === "Verified") nextStatus = step4Status || "In Progress";

  const now = new Date();
  complaint.status = nextStatus;
  complaint.officialAction = {
    decision: step1Decision,
    step2Data: step2Data || null,
    actionSelected: step3Action || null,
    remarks: remarks || "Official assessment completed.",
  };
  complaint.lastUpdated = formatDateTime(now);
  complaint.history.push({
    status: nextStatus,
    date: formatDate(now),
    time: formatTime(now),
    notes: remarks || `Official action decision: ${step1Decision}. Status set to ${nextStatus}.`,
  });
  await complaint.save();

  await notify("citizen", {
    recipientEmail: complaint.citizenEmail,
    title: `Complaint #${complaint.id} Update`,
    message: remarks || `Official review decision: ${step1Decision} (${nextStatus}).`,
    type: "official",
    complaintId: complaint.id,
  });

  await notify("official", {
    recipientEmail: req.user.email,
    title: "Decision Submitted",
    message: `Decision '${step1Decision}' submitted for Complaint #${complaint.id}.`,
    type: "update",
    complaintId: complaint.id,
  });

  res.status(200).json({ success: true, complaint });
});

module.exports = {
  analyzeComplaint,
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaintToOfficial,
  submitOfficialDecision,
};
