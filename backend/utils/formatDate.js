/**
 * Formats a Date as "12 Aug 2026, 10:20 AM" — the exact string shape the
 * frontend already renders directly (submittedDate, lastUpdated, history
 * entries, notification timestamps, etc.), so no frontend date-parsing
 * changes are needed.
 */
function formatDateTime(date = new Date()) {
  const datePart = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart}, ${timePart}`;
}

function formatDate(date = new Date()) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date = new Date()) {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

module.exports = { formatDateTime, formatDate, formatTime };
