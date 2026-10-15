const mongoose = require("mongoose");

// Loosely-typed log of AI-engine activity (complaint classification, summarization, etc.)
// shown on the Admin AI Monitoring screen. `strict: false` lets it carry whatever
// extra fields a given task type needs without a schema change.
const aiLogSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }, // e.g. "AI-LOG-482"
    time: String,
    date: String,
    model: String, // "Gemini" for Summarization tasks, "Hugging Face" otherwise
    task: String,
    complaintId: Number,
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model("AILog", aiLogSchema);
