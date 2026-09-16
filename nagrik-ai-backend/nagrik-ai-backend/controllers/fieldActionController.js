const asyncHandler = require("express-async-handler");
const FieldAction = require("../models/FieldAction");
const Complaint = require("../models/Complaint");
const { formatDate, formatDateTime, formatTime } = require("../utils/formatDate");
const { notify } = require("../utils/notify");

// @route   GET /api/field-actions
// @access  Private (official, admin) — optional ?complaintId= filter
const getFieldActions = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.complaintId) filter.complaintId = Number(req.query.complaintId);

  const actions = await FieldAction.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, actions });
});

// @route   POST /api/field-actions
// @access  Private (official)
// Mirrors mockDb.saveFieldAction — dispatches a field team and pushes the
// linked complaint into "In Progress".
const saveFieldAction = asyncHandler(async (req, res) => {
  const { complaintId, action, assignedTeam, priority, targetDate, instructions } = req.body;

  const complaint = await Complaint.findOne({ id: Number(complaintId) });
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }
  if (req.user.role === "official" && complaint.assignedOfficialEmail !== req.user.email) {
    res.status(403);
    throw new Error("You are not assigned to this complaint");
  }

  const now = new Date();
  const fieldAction = await FieldAction.findOneAndUpdate(
    { complaintId: Number(complaintId) },
    {
      id: `FA-${complaintId}`,
      complaintId: Number(complaintId),
      action: action || "Site Inspection",
      assignedTeam: assignedTeam || "Field Team",
      priority: priority || "High",
      assignedOn: formatDate(now),
      targetDate: targetDate || formatDate(now),
      instructions: instructions || "",
      status: "In Progress",
      completionReport: {
        completionNote: "Field unit dispatched and work scheduled according to departmental protocol.",
        completionEvidence: [],
        completedOn: targetDate || formatDate(now),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // update the complaint status + history, same as mockDb.updateComplaintStatus
  complaint.status = "In Progress";
  complaint.lastUpdated = formatDateTime(now);
  complaint.history.push({
    status: "In Progress",
    date: formatDate(now),
    time: formatTime(now),
    notes: `Field Action Assigned: ${fieldAction.action} assigned to ${fieldAction.assignedTeam}`,
  });
  await complaint.save();

  await notify("official", {
    recipientEmail: req.user.email,
    title: "Field Action Dispatched",
    message: `Action '${fieldAction.action}' assigned to ${fieldAction.assignedTeam} for Complaint #${complaintId}.`,
    type: "update",
    complaintId: Number(complaintId),
  });

  res.status(201).json({ success: true, fieldAction });
});

// @route   PUT /api/field-actions/:complaintId/verify
// @access  Private (official)
// Mirrors mockDb.verifyFieldActionAndResolve
const verifyFieldActionAndResolve = asyncHandler(async (req, res) => {
  const { resolutionNote } = req.body;
  const complaintId = Number(req.params.complaintId);

  const complaint = await Complaint.findOne({ id: complaintId });
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }
  if (req.user.role === "official" && complaint.assignedOfficialEmail !== req.user.email) {
    res.status(403);
    throw new Error("You are not assigned to this complaint");
  }

  const now = new Date();
  const note = resolutionNote || "Field remediation verified and quality check passed.";

  const fieldAction = await FieldAction.findOne({ complaintId });
  if (fieldAction) {
    fieldAction.status = "Completed";
    fieldAction.resolutionDetails = {
      fieldActionCompleted: true,
      evidenceReviewed: true,
      issueResolved: true,
      resolutionNote: note,
      resolvedOn: formatDate(now),
    };
    await fieldAction.save();
  }

  complaint.status = "Resolved";
  complaint.lastUpdated = formatDateTime(now);
  complaint.history.push({
    status: "Resolved",
    date: formatDate(now),
    time: formatTime(now),
    notes: resolutionNote || "Field action verified complete. Issue resolved.",
  });
  await complaint.save();

  // bump the assigned official's resolved count
  if (complaint.assignedOfficialEmail) {
    const User = require("../models/User");
    const official = await User.findOne({ email: complaint.assignedOfficialEmail });
    if (official) {
      official.totalResolved = (official.totalResolved || 0) + 1;
      await official.save();
    }
  }

  await notify("official", {
    recipientEmail: req.user.email,
    title: "Complaint Resolved",
    message: `Complaint #${complaintId} has been verified and marked as Resolved.`,
    type: "resolved",
    complaintId,
  });

  await notify("citizen", {
    recipientEmail: complaint.citizenEmail,
    title: "Complaint Resolved",
    message: `Great news — complaint #${complaintId} has been resolved.`,
    type: "resolved",
    complaintId,
  });

  res.status(200).json({ success: true, complaint, fieldAction });
});

module.exports = { getFieldActions, saveFieldAction, verifyFieldActionAndResolve };
