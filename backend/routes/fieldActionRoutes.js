const express = require("express");
const {
  getFieldActions,
  saveFieldAction,
  verifyFieldActionAndResolve,
} = require("../controllers/fieldActionController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("official", "admin"));

router.get("/", getFieldActions);
router.post("/", saveFieldAction);
router.put("/:complaintId/verify", verifyFieldActionAndResolve);

module.exports = router;
