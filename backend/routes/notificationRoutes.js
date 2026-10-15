const express = require("express");
const {
  getMyNotifications,
  markMyNotificationsRead,
  getOfficialNotifications,
  markOfficialNotificationsRead,
  getAdminNotifications,
  markAdminNotificationsRead,
} = require("../controllers/notificationController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", authorize("citizen"), getMyNotifications);
router.put("/read", authorize("citizen"), markMyNotificationsRead);

router.get("/official", authorize("official"), getOfficialNotifications);
router.put("/official/read", authorize("official"), markOfficialNotificationsRead);

router.get("/admin", authorize("admin"), getAdminNotifications);
router.put("/admin/read", authorize("admin"), markAdminNotificationsRead);

module.exports = router;
