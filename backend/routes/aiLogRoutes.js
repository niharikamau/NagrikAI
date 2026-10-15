const express = require("express");
const { getAILogs, addAILog } = require("../controllers/aiLogController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/", getAILogs);
router.post("/", addAILog);

module.exports = router;
