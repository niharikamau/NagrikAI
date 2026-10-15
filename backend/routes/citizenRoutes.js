const express = require("express");
const { getCitizens } = require("../controllers/citizenController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, authorize("admin"), getCitizens);

module.exports = router;
