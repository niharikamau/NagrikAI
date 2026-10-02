const mongoose = require("mongoose");

const historyEntrySchema = new mongoose.Schema(
  {
    status: String,
    date: String,
    time: String,
    notes: String,
  },
  { _id: false }
);

const aiAssessmentSchema = new mongoose.Schema(
  {
    category: String,
    subcategory: String,

    understanding: String,

severity: String,


    relevantLaws: {
      type: [String],
      default: [],
    },

    citizenRight: String,

    suggestedAuthority: String,
  },
  { _id: false }
);

const officialActionSchema = new mongoose.Schema(
  {
    decision: String, // Verified | Requires Information | Unable to Verify | Not Applicable
    step2Data: mongoose.Schema.Types.Mixed,
    actionSelected: String,
    remarks: String,
  },
  { _id: false }
);

const sensorEvidenceSchema = new mongoose.Schema(
  {
    sensorId: String,
    model: String,
    location: String,
    reading: String,
    threshold: String,
    status: String,
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    // human-friendly sequential id, e.g. 1042 (kept alongside Mongo's _id
    // because the frontend displays and links complaints by this number)
    id: { type: Number, unique: true, index: true },

    title: { type: String, required: [true, "Title is required"], trim: true },
    issue: { type: String, trim: true },
    description: { type: String, required: [true, "Description is required"], trim: true },
    rawText: { type: String, trim: true },
    aiSummary: { type: String, trim: true },

    category: { type: String, default: "General Municipal Issue" },
    urgency: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: [
        "Pending Review",
        "Assigned",
        "In Progress",
        "Under Review",
        "Requires Information",
        "Unable to Verify",
        "Not Applicable",
        "Resolved",
      ],
      default: "Pending Review",
    },

    submittedDate: String,
    lastUpdated: String,

    // citizen who filed it — set from the authenticated user, never trusted from the client
    citizenName: { type: String, required: true },
    citizenEmail: { type: String, required: true, lowercase: true, index: true },
    citizenPhone: String,

    locationName: String,
    locationCoordinates: {
      x: Number,
      y: Number,
      lat: Number,
      lng: Number,
    },

    evidence: { type: [String], default: [] },
    audioEvidence: String,
    sensorEvidence: sensorEvidenceSchema,

    assignedDepartment: String,
    assignedOfficial: String, // display name
    assignedOfficialEmail: { type: String, lowercase: true, index: true }, // used for access control

    officialAction: officialActionSchema,
    history: { type: [historyEntrySchema], default: [] },
    aiAssessment: aiAssessmentSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
