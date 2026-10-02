const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const officialRoutes = require("./routes/officialRoutes");
const citizenRoutes = require("./routes/citizenRoutes");
const sensorRoutes = require("./routes/sensorRoutes");
const eventRoutes = require("./routes/eventRoutes");
const aiLogRoutes = require("./routes/aiLogRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const fieldActionRoutes = require("./routes/fieldActionRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

connectDB();

const app = express();

// --- Core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Nagrik AI backend is running" });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/officials", officialRoutes);
app.use("/api/citizens", citizenRoutes);
app.use("/api/sensors", sensorRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/ai-logs", aiLogRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/field-actions", fieldActionRoutes);

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

module.exports = app;
