const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // human-friendly sequential id (frontend used string/number ids like "adm-1234")
    displayId: { type: String, required: true, unique: true },

    audience: {
      type: String,
      enum: ["citizen", "official", "admin"],
      required: true,
      index: true,
    },
    // scopes a notification to one person's inbox. Left blank to broadcast
    // to everyone in that audience (used for admin/official announcements).
    recipientEmail: { type: String, lowercase: true, index: true },

    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: "update" }, // tracking | urgent | update | resolved | official ...
    complaintId: Number,

    time: { type: String, default: "Just now" },
    timestamp: String,
    unread: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
