const asyncHandler = require("express-async-handler");
const AILog = require("../models/AILog");
const { getNextSequence } = require("../utils/counter");
const { formatDate, formatTime } = require("../utils/formatDate");

// @route   GET /api/ai-logs
// @access  Private (admin)
const getAILogs = asyncHandler(async (req, res) => {
  const logs = await AILog.find({}).sort({ createdAt: -1 });
  res.status(200).json({ success: true, logs });
});

// @route   POST /api/ai-logs
// @access  Private (admin)
// Mirrors mockDb.addAILog — mainly useful for manually logging an AI task
// outside the automatic ones created during complaint analysis.
const addAILog = asyncHandler(async (req, res) => {
  const id = await getNextSequence("aiLogId");
  const now = new Date();

  const log = await AILog.create({
    ...req.body,
    id: `AI-LOG-${id}`,
    time: formatTime(now),
    date: formatDate(now),
    model: req.body.task === "Summarization" ? "Gemini" : "Hugging Face",
  });

  res.status(201).json({ success: true, log });
});

module.exports = { getAILogs, addAILog };
