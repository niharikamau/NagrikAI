// Populates the database with the same demo accounts, officials, sensors,
// detected events, and a few sample complaints that the old frontend mock
// (mockDb.js) used to seed into localStorage — so every demo login button
// and screen in the UI has real data to show immediately.
//
// Usage:
//   npm run seed          # adds demo data (skips anything that already exists)
//   npm run seed:fresh    # wipes the relevant collections first, then seeds

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const Sensor = require("../models/Sensor");
const DetectedEvent = require("../models/DetectedEvent");
const { seedSequence } = require("../utils/counter");

const FRESH = process.argv.includes("--fresh");

const DEMO_USERS = [
  {
    name: "System Administrator",
    email: "admin@nagrik.ai",
    password: "password123",
    phone: "+91 9811002233",
    address: "Nagrik Command & Control Center, HQ",
    role: "admin",
  },
  {
    name: "Rahul Sharma",
    email: "grievance.officer@nagrikai.in",
    password: "12345",
    phone: "+91 9876541102",
    address: "Zonal Municipal Office, Ward 4",
    role: "official",
    department: "Water & Drainage",
    jobTitle: "Zonal Sanitation Officer",
    resolutionRate: "92%",
    totalAssigned: 14,
    totalResolved: 13,
  },
  {
    name: "Anjali Singh",
    email: "anjali.singh@nagrik.gov.in",
    password: "password123",
    phone: "+91 9876541103",
    address: "Zonal Municipal Office, Ward 2",
    role: "official",
    department: "Roads & Infrastructure",
    jobTitle: "Senior Road Engineer",
    resolutionRate: "88%",
    totalAssigned: 17,
    totalResolved: 15,
  },
  {
    name: "Amit Kumar",
    email: "amit.kumar@nagrik.gov.in",
    password: "password123",
    phone: "+91 9876541109",
    address: "Zonal Municipal Office, Ward 3",
    role: "official",
    department: "Water & Drainage",
    jobTitle: "Water & Sewage Inspector",
    status: "Busy",
    resolutionRate: "79%",
    totalAssigned: 19,
    totalResolved: 15,
  },
  {
    name: "Priya Verma",
    email: "priya.verma@nagrik.gov.in",
    password: "password123",
    phone: "+91 9876541115",
    address: "Zonal Municipal Office, Ward 1",
    role: "official",
    department: "Public Utilities",
    jobTitle: "Electrical Operations Officer",
    resolutionRate: "95%",
    totalAssigned: 20,
    totalResolved: 19,
  },
  {
    name: "Niharika Maurya",
    email: "example@gmail.com",
    password: "password123",
    phone: "9876543210",
    address: "House 123, Sector 4, Nagrik Heights",
    role: "citizen",
  },
  {
    name: "Rahul Verma",
    email: "rahul@gmail.com",
    password: "password123",
    phone: "9822334455",
    address: "Flat 4B, Green Glen, Sector 7",
    role: "citizen",
  },
  {
    name: "Rajesh Gupta",
    email: "rajesh@xyz.com",
    password: "password123",
    phone: "9711223344",
    address: "Block C-12, Sunrise Enclave",
    role: "citizen",
  },
];

const SENSORS = [
  {
    id: "SENSOR #01",
    modelName: "HydroTrack Pro v3",
    type: "Water / Drain Monitoring",
    location: "XYZ Drain (Demo Location A)",
    status: "Online",
    currentReading: "72%",
    currentValue: 72,
    threshold: "85%",
    thresholdValue: 85,
    unit: "%",
    urgency: "Critical",
    lastMaintained: "10 Jul 2026",
    lastReadingTime: "12 Aug 2026, 01:00 PM",
    recentReadings: [
      { time: "10:00 AM", value: "65%", urgency: "Medium" },
      { time: "11:00 AM", value: "67%", urgency: "Medium" },
      { time: "01:00 PM", value: "72%", urgency: "High" },
    ],
    historyLogs: [
      { sno: 1, reading: "91%", location: "XYZ Drain", time: "12 Aug 2026, 10:32 AM", urgency: "Critical", status: "Threshold Exceeded" },
      { sno: 2, reading: "72%", location: "XYZ Drain", time: "12 Aug 2026, 01:00 PM", urgency: "High", status: "Normal Range" },
    ],
  },
  {
    id: "SENSOR #02",
    modelName: "TerraVibe Structural 400",
    type: "Road / Infrastructure Monitoring",
    location: "Sector 5 Flyover (Demo Location B)",
    status: "Online",
    currentReading: "58 mm/s",
    currentValue: 58,
    threshold: "80 mm/s",
    thresholdValue: 80,
    unit: "mm/s",
    urgency: "High",
    lastMaintained: "01 Aug 2026",
    lastReadingTime: "14 Aug 2026, 03:00 PM",
    recentReadings: [
      { time: "09:00 AM", value: "42 mm/s", urgency: "Low" },
      { time: "03:00 PM", value: "58 mm/s", urgency: "High" },
    ],
    historyLogs: [
      { sno: 1, reading: "84 mm/s", location: "Sector 5 Flyover", time: "14 Aug 2026, 09:12 AM", urgency: "High", status: "Vibration Spike" },
    ],
  },
  {
    id: "SENSOR #03",
    modelName: "AeroSense Gas & Particulate",
    type: "Air & Sanitation Monitoring",
    location: "Industrial Zone (Demo Location C)",
    status: "Offline",
    currentReading: "--",
    currentValue: 0,
    threshold: "150 AQI",
    thresholdValue: 150,
    unit: "AQI",
    urgency: "Critical",
    lastMaintained: "25 May 2026",
    lastReadingTime: "Today (Offline for 20 mins)",
    lastEvent: "Sensor #03 has been offline for 20 minutes",
    recentReadings: [{ time: "08:00 AM", value: "112 AQI", urgency: "High" }],
    historyLogs: [
      { sno: 1, reading: "Offline", location: "Industrial Zone", time: "Today, 20 mins ago", urgency: "Critical", status: "Signal Lost" },
    ],
  },
  {
    id: "SENSOR #04",
    modelName: "SonicFlow Sewer Acoustic",
    type: "Water / Drain Monitoring",
    location: "Sector 4 Main Sump (Demo Location D)",
    status: "Online",
    currentReading: "44 dB",
    currentValue: 44,
    threshold: "75 dB",
    thresholdValue: 75,
    unit: "dB",
    urgency: "Low",
    lastMaintained: "05 Aug 2026",
    lastReadingTime: "Today, 01:00 PM",
    recentReadings: [{ time: "01:00 PM", value: "44 dB", urgency: "Low" }],
    historyLogs: [],
  },
  {
    id: "SENSOR #05",
    modelName: "LumaGrid Smart Pole Lux",
    type: "Public Lighting Monitoring",
    location: "Main Avenue (Demo Location E)",
    status: "Online",
    currentReading: "14 Lux",
    currentValue: 14,
    threshold: "25 Lux",
    thresholdValue: 25,
    unit: "Lux",
    urgency: "Low",
    lastMaintained: "12 Aug 2026",
    lastReadingTime: "Today, 07:00 PM",
    recentReadings: [{ time: "07:00 PM", value: "14 Lux", urgency: "Low" }],
    historyLogs: [],
  },
];

const DETECTED_EVENTS = [
  { id: "EVT-2101", sensorId: "SENSOR #01", eventType: "Possible waterlogging / abnormal level", time: "12 Aug 2026, 10:32 AM", reading: "91%", threshold: "85%", status: "New", urgency: "Critical", location: "XYZ Drain (Demo Location A)", evidence: "sensor_waveform_water_level.dat", notes: "Drain water volume exceeded 85% safety baseline. Spill risk elevated." },
  { id: "EVT-2102", sensorId: "SENSOR #02", eventType: "Structural vibration spike / Road depression", time: "14 Aug 2026, 09:12 AM", reading: "84 mm/s", threshold: "80 mm/s", status: "Under Review", urgency: "High", location: "Sector 5 Flyover (Demo Location B)", evidence: "vibration_sensor.dat", notes: "Heavy transit resonance detected on pillar section." },
  { id: "EVT-2103", sensorId: "SENSOR #03", eventType: "Sensor connectivity offline alarm", time: "18 Aug 2026, 01:45 PM", reading: "0 ms ping", threshold: "Timeout > 15m", status: "New", urgency: "Critical", location: "Industrial Zone (Demo Location C)", evidence: "heartbeat_timeout.log", notes: "No heartbeat signal response for 20+ minutes." },
  { id: "EVT-2104", sensorId: "SENSOR #01", eventType: "Monsoon surge warning", time: "11 Aug 2026, 04:15 PM", reading: "88%", threshold: "85%", status: "Reviewed", urgency: "High", location: "XYZ Drain (Demo Location A)", evidence: "water_surge_run.dat", notes: "Managed by emergency storm pumping station crew." },
];

async function run() {
  await connectDB();

  if (FRESH) {
    console.log("Wiping existing demo collections...");
    await Promise.all([
      User.deleteMany({}),
      Complaint.deleteMany({}),
      Sensor.deleteMany({}),
      DetectedEvent.deleteMany({}),
    ]);
  }

  console.log("Seeding users (citizens, officials, admin)...");
  const emailToUser = {};
  for (const u of DEMO_USERS) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      user = await User.create(u);
      console.log(`  created ${u.role}: ${u.email}`);
    } else {
      console.log(`  already exists, skipped: ${u.email}`);
    }
    emailToUser[u.email] = user;
  }

  console.log("Seeding IoT sensors...");
  for (const s of SENSORS) {
    await Sensor.findOneAndUpdate({ id: s.id }, s, { upsert: true, setDefaultsOnInsert: true });
  }

  console.log("Seeding detected events...");
  for (const e of DETECTED_EVENTS) {
    await DetectedEvent.findOneAndUpdate({ id: e.id }, e, { upsert: true, setDefaultsOnInsert: true });
  }

  console.log("Seeding sample complaints...");
  const rahul = emailToUser["rahul@gmail.com"];
  const niharika = emailToUser["example@gmail.com"];
  const officer = emailToUser["grievance.officer@nagrikai.in"];

  const sampleComplaints = [
    {
      id: 1042,
      title: "Garbage accumulation near ABC School",
      issue: "Garbage accumulation",
      description: "Huge pile of solid waste has been accumulating right next to the school entrance. Severe odor and street blockage.",
      category: "Waste & Sanitation",
      urgency: "Medium",
      status: "Assigned",
      submittedDate: "10 Aug 2026, 09:00 AM",
      lastUpdated: "12 Aug 2026, 02:45 PM",
      citizenName: niharika.name,
      citizenEmail: niharika.email,
      citizenPhone: niharika.phone,
      locationName: "ABC School Lane, Sector 4",
      locationCoordinates: { x: 120, y: 150, lat: 28.615, lng: 77.208 },
      evidence: ["garbage.jpg"],
      assignedDepartment: "Water & Drainage",
      assignedOfficial: officer.name,
      assignedOfficialEmail: officer.email,
      history: [
        { status: "Submitted", date: "10 Aug 2026", time: "09:00 AM", notes: "Complaint received by system." },
        { status: "Assigned", date: "11 Aug 2026", time: "11:15 AM", notes: `Assigned to ${officer.name}.` },
      ],
      aiAssessment: {
        category: "Waste & Sanitation",
        understanding: "Garbage accumulation near public school area. Solid waste clearance needed.",
        relevantLaws: ["Section 15 of Solid Waste Management Rules."],
        suggestedAuthority: "Municipal Waste Department",
      },
    },
    {
      id: 1039,
      title: "Broken streetlight on Main Street",
      issue: "Broken streetlight",
      description: "The street light in front of house 45B is completely dark. The area is pitch-black at night.",
      category: "Public Utilities",
      urgency: "Low",
      status: "Resolved",
      submittedDate: "08 Aug 2026, 08:00 PM",
      lastUpdated: "10 Aug 2026, 11:00 AM",
      citizenName: rahul.name,
      citizenEmail: rahul.email,
      citizenPhone: rahul.phone,
      locationName: "Main Street, Sector 2",
      locationCoordinates: { x: 340, y: 210, lat: 28.629, lng: 77.225 },
      evidence: ["streetlight.jpg"],
      assignedDepartment: "Public Utilities",
      assignedOfficial: officer.name,
      assignedOfficialEmail: officer.email,
      officialAction: { decision: "Verified", actionSelected: "Repair Requested", remarks: "Bulb replaced and illumination restored." },
      history: [
        { status: "Submitted", date: "08 Aug 2026", time: "08:00 PM", notes: "Complaint received." },
        { status: "Resolved", date: "10 Aug 2026", time: "11:00 AM", notes: "Bulb replaced and tested OK." },
      ],
      aiAssessment: {
        category: "Public Utilities",
        understanding: "Dark public area reported due to a dysfunctional streetlight.",
        relevantLaws: ["Municipal Corporations Act, Sec 304."],
        suggestedAuthority: "Electrical & Street Lighting Wing",
      },
    },
  ];

  for (const c of sampleComplaints) {
    await Complaint.findOneAndUpdate({ id: c.id }, c, { upsert: true, setDefaultsOnInsert: true });
  }
  await seedSequence("complaintId", 1049); // next new complaint will be #1050
  await seedSequence("aiLogId", 900);

  console.log("\nSeed complete. Demo logins:");
  console.log("  Admin:     admin@nagrik.ai / password123");
  console.log("  Official:  grievance.officer@nagrikai.in / 12345");
  console.log("  Citizen:   example@gmail.com / password123");

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
