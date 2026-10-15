const express = require("express");
const {
  getOfficials,
  getOfficialById,
  addOfficial,
  updateOfficial,
} = require("../controllers/officialController");
const { addOfficialValidation } = require("../middleware/validators");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/", getOfficials);
router.get("/:id", getOfficialById);
router.post("/", addOfficialValidation, addOfficial);
router.put("/:id", updateOfficial);

module.exports = router;
