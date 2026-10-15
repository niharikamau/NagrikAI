const mongoose = require("mongoose");

const completionReportSchema = new mongoose.Schema(
  {
    completionNote: String,
    completionEvidence: { type: [String], default: [] },
    completedOn: String,
  },
  { _id: false }
);

const resolutionDetailsSchema = new mongoose.Schema(
  {
    fieldActionCompleted: Boolean,
    evidenceReviewed: Boolean,
    issueResolved: Boolean,
    resolutionNote: String,
    resolvedOn: String,
  },
  { _id: false }
);

const fieldActionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }, // e.g. "FA-1048"
    complaintId: { type: Number, required: true, index: true },
    action: { type: String, default: "Site Inspection" },
    assignedTeam: { type: String, default: "Field Team" },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "High" },
    assignedOn: String,
    targetDate: String,
    instructions: String,
    status: { type: String, enum: ["In Progress", "Completed"], default: "In Progress" },
    completionReport: completionReportSchema,
    resolutionDetails: resolutionDetailsSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("FieldAction", fieldActionSchema);
