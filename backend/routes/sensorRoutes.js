const express = require("express");
const { getSensors, updateSensor } = require("../controllers/sensorController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/", getSensors);
router.put("/:id", updateSensor);

module.exports = router;
