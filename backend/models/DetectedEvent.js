const mongoose = require("mongoose");

const detectedEventSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }, // e.g. "EVT-2101"
    sensorId: { type: String, required: true },
    eventType: String,
    time: String,
    reading: String,
    threshold: String,
    status: { type: String, enum: ["New", "Under Review", "Reviewed"], default: "New" },
    urgency: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Low" },
    location: String,
    evidence: String,
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("DetectedEvent", detectedEventSchema);
