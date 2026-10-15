const express = require("express");
const { getDetectedEvents, markEventReviewed } = require("../controllers/eventController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/", getDetectedEvents);
router.put("/:id/review", markEventReviewed);

module.exports = router;
