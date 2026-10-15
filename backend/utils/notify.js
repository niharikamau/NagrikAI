const Notification = require("../models/Notification");
const { formatDateTime } = require("./formatDate");

let counter = 0;
// Cheap unique-enough display id generator (id, timestamp, small random +
// incrementing counter) — good enough for a display label, not a security token.
const nextDisplayId = (prefix) => {
  counter = (counter + 1) % 100000;
  return `${prefix}-${Date.now().toString(36)}${counter}`;
};

/**
 * @param {"citizen"|"official"|"admin"} audience
 * @param {object} data - { title, message, type, complaintId, recipientEmail }
 *   recipientEmail scopes the notification to one inbox; omit it to
 *   broadcast to everyone in that audience (used for admin-wide alerts).
 */
async function notify(audience, data) {
  const prefixByAudience = { citizen: "ntf", official: "off", admin: "adm" };

  return Notification.create({
    displayId: nextDisplayId(prefixByAudience[audience] || "ntf"),
    audience,
    recipientEmail: data.recipientEmail ? data.recipientEmail.toLowerCase() : undefined,
    title: data.title,
    message: data.message,
    type: data.type || "update",
    complaintId: data.complaintId,
    time: "Just now",
    timestamp: formatDateTime(new Date()),
    unread: true,
  });
}

module.exports = { notify };
