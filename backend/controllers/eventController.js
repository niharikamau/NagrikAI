const asyncHandler = require("express-async-handler");
const DetectedEvent = require("../models/DetectedEvent");

// @route   GET /api/events
// @access  Private (admin)
const getDetectedEvents = asyncHandler(async (req, res) => {
  const events = await DetectedEvent.find({}).sort({ createdAt: -1 });
  res.status(200).json({ success: true, events });
});

// @route   PUT /api/events/:id/review
// @access  Private (admin)
const markEventReviewed = asyncHandler(async (req, res) => {
  const event = await DetectedEvent.findOne({ id: req.params.id });
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  event.status = "Reviewed";
  await event.save();

  res.status(200).json({ success: true, event });
});

module.exports = { getDetectedEvents, markEventReviewed };
