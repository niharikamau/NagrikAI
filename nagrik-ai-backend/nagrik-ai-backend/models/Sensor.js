const mongoose = require("mongoose");

const readingSchema = new mongoose.Schema(
  { time: String, value: String, urgency: String },
  { _id: false }
);

const historyLogSchema = new mongoose.Schema(
  { sno: Number, reading: String, location: String, time: String, urgency: String, status: String },
  { _id: false }
);

const sensorSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }, // e.g. "SENSOR #01"
    modelName: String,
    type: String,
    location: String,
    status: { type: String, enum: ["Online", "Offline"], default: "Online" },
    currentReading: String,
    currentValue: Number,
    threshold: String,
    thresholdValue: Number,
    unit: String,
    urgency: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Low" },
    lastMaintained: String,
    lastReadingTime: String,
    lastEvent: String,
    recentReadings: { type: [readingSchema], default: [] },
    historyLogs: { type: [historyLogSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sensor", sensorSchema);
