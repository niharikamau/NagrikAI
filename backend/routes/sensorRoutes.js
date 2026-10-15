const express = require("express");

const {
  getSensors,
  updateSensor,
  addSensorReadings
} = require("../controllers/sensorController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/", getSensors);

router.put("/:id", updateSensor);

router.post("/:id/readings", addSensorReadings);

module.exports = router;
//POST http://localhost:5000/api/sensors/SENSOR%20%2301/readings