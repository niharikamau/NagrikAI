const asyncHandler = require("express-async-handler");
const Sensor = require("../models/Sensor");

// @route   GET /api/sensors
// @access  Private (admin)
const getSensors = asyncHandler(async (req, res) => {
  const sensors = await Sensor.find({}).sort({ id: 1 });
  res.status(200).json({ success: true, sensors });
});

// @route   PUT /api/sensors/:id
// @access  Private (admin)
// :id is the sensor's display id, e.g. "SENSOR #01"
const updateSensor = asyncHandler(async (req, res) => {
  const sensor = await Sensor.findOne({ id: req.params.id });
  if (!sensor) {
    res.status(404);
    throw new Error("Sensor not found");
  }

  Object.assign(sensor, req.body);
  await sensor.save();

  res.status(200).json({ success: true, sensor });
});

module.exports = { getSensors, updateSensor };
