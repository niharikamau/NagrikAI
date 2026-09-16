const express = require("express");
const {
  analyzeComplaint,
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaintToOfficial,
  submitOfficialDecision,
} = require("../controllers/complaintController");
const {
  createComplaintValidation,
  analyzeValidation,
  assignComplaintValidation,
  updateStatusValidation,
} = require("../middleware/validators");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect); // every complaint route requires a logged-in user

router.post("/analyze", authorize("citizen"), analyzeValidation, analyzeComplaint);
router.post("/", authorize("citizen"), createComplaintValidation, createComplaint);
router.get("/", getComplaints);
router.get("/:id", getComplaintById);
router.put("/:id/status", authorize("admin", "official"), updateStatusValidation, updateComplaintStatus);
router.put("/:id/assign", authorize("admin"), assignComplaintValidation, assignComplaintToOfficial);
router.put("/:id/decision", authorize("admin", "official"), submitOfficialDecision);

module.exports = router;
