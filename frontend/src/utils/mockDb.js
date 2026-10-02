// Mock Database for NagrikAI Portal (Citizen & Admin Platforms)
// Uses localStorage for full interactive persistence

const SEED_USERS_DB = [
  {
    email: "grievance.officer@nagrikai.in",
    password: "12345",
    name: "Rahul Sharma",
    phone: "+91 9876541102",
    role: "official",
    address: "Zonal Municipal Office, Ward 4",
    department: "Water & Drainage",
    notificationsEnabled: true
  },
  {
    email: "rahul@department.gov",
    password: "12345",
    name: "Rahul Sharma",
    phone: "+91 9876541102",
    role: "official",
    address: "Zonal Municipal Office, Ward 4",
    department: "Water & Drainage",
    notificationsEnabled: true
  },
  {
    email: "admin@nagrik.ai",
    password: "password123",
    name: "System Administrator",
    phone: "+91 9811002233",
    role: "admin",
    address: "Nagrik Command & Control Center, HQ",
    department: "Administration",
    notificationsEnabled: true
  },
  {
    email: "example@gmail.com",
    password: "password123",
    name: "Niharika Maurya",
    phone: "9876543210",
    role: "citizen",
    address: "House 123, Sector 4, Nagrik Heights",
    notificationsEnabled: true
  },
  {
    email: "rahul@gmail.com",
    password: "password123",
    name: "Rahul Verma",
    phone: "9822334455",
    role: "citizen",
    address: "Flat 4B, Green Glen, Sector 7",
    notificationsEnabled: true
  },
  {
    email: "rajesh@xyz.com",
    password: "password123",
    name: "XYZ (Rajesh Gupta)",
    phone: "9711223344",
    role: "citizen",
    address: "Block C-12, Sunrise Enclave",
    notificationsEnabled: true
  }
];

const SEED_OFFICIALS = [
  {
    id: 102,
    name: "Rahul Sharma",
    email: "rahul.sharma@nagrik.gov.in",
    phone: "+91 9876541102",
    department: "Waste & Sanitation",
    role: "Zonal Sanitation Officer",
    status: "Active",
    complaintStatus: "Assigned",
    resolutionRate: "92%",
    totalAssigned: 14,
    totalResolved: 13,
    caseHistory: [
      { id: 1042, issue: "Garbage accumulation near ABC School", assignedDate: "13 Aug 2026", status: "In Progress", timestamp: "14 Aug 2026, 02:45 PM" },
      { id: 1028, issue: "Illegal debris dumping on Sector 3 Bypass", assignedDate: "02 Aug 2026", status: "Resolved", timestamp: "04 Aug 2026, 05:30 PM" },
      { id: 1015, issue: "Commercial waste bin overflow", assignedDate: "20 Jul 2026", status: "Resolved", timestamp: "22 Jul 2026, 03:15 PM" }
    ]
  },
  {
    id: 103,
    name: "Anjali Singh",
    email: "anjali.singh@nagrik.gov.in",
    phone: "+91 9876541103",
    department: "Roads & Infrastructure",
    role: "Senior Road Engineer",
    status: "Active",
    complaintStatus: "Review",
    resolutionRate: "88%",
    totalAssigned: 17,
    totalResolved: 15,
    caseHistory: [
      { id: 1043, issue: "Large pothole outside Modern School", assignedDate: "14 Aug 2026", status: "Under Review", timestamp: "14 Aug 2026, 04:20 PM" },
      { id: 1021, issue: "Road surface erosion after storm", assignedDate: "05 Aug 2026", status: "Assigned", timestamp: "07 Aug 2026, 11:00 AM" }
    ]
  },
  {
    id: 109,
    name: "Amit Kumar",
    email: "amit.kumar@nagrik.gov.in",
    phone: "+91 9876541109",
    department: "Water & Drainage",
    role: "Water & Sewage Inspector",
    status: "Busy",
    complaintStatus: "Rejected",
    resolutionRate: "79%",
    totalAssigned: 19,
    totalResolved: 15,
    caseHistory: [
      { id: 1044, issue: "Drain overflow & water logging", assignedDate: "15 Aug 2026", status: "In Progress", timestamp: "16 Aug 2026, 09:10 AM" },
      { id: 1032, issue: "Main pipeline rupture near market", assignedDate: "28 Jul 2026", status: "Resolved", timestamp: "30 Jul 2026, 06:00 PM" }
    ]
  },
  {
    id: 115,
    name: "Priya Verma",
    email: "priya.verma@nagrik.gov.in",
    phone: "+91 9876541115",
    department: "Public Utilities",
    role: "Electrical Operations Officer",
    status: "Active",
    complaintStatus: "Assigned",
    resolutionRate: "95%",
    totalAssigned: 20,
    totalResolved: 19,
    caseHistory: [
      { id: 1039, issue: "Broken streetlight on Main Street", assignedDate: "17 Jul 2026", status: "Resolved", timestamp: "18 Jul 2026, 11:00 AM" }
    ]
  }
];

const SEED_COMPLAINTS = [
  {
    id: 1048,
    title: "Drain overflow near ABC School",
    issue: "Drain overflow near ABC School. Water has accumulated on the road and is affecting nearby residents. (ai assisted complaint label)",
    description: "Sewage and storm drain overflow has flooded the road right adjacent to ABC School. Black murky water is stagnant across the pedestrian walkway, causing strong odor and health hazard for arriving school students.",
    rawText: "Drain overflow near ABC School. Water has accumulated on the road and is affecting nearby residents.",
    aiSummary: "Severe drain overflow near ABC School resulting in stagnant street runoff and pedestrian disruption.",
    category: "Water & Drainage",
    urgency: "High",
    status: "Pending Review", // "Pending Review", "In Progress", "Resolved", "Under Review", "Requires Information"
    submittedDate: "12 Aug 2026, 10:20 AM",
    lastUpdated: "12 Aug 2026, 03:10 PM",
    citizenName: "Rahul Verma",
    citizenEmail: "rahul@gmail.com",
    citizenPhone: "+91 9822334455",
    locationName: "ABC School, XYZ Road",
    locationCoordinates: { x: 140, y: 170, lat: 28.6139, lng: 77.2090 },
    evidence: ["drain_overflow.jpg", "road_condition.jpg"],
    audioEvidence: "complaint_audio.mp3",
    sensorEvidence: {
      sensorId: "SENSOR #01",
      model: "HydroTrack Pro v3",
      location: "ABC School, XYZ Road",
      reading: "72% (High Surge)",
      threshold: "85%",
      status: "Threshold Elevated"
    },
    assignedDepartment: "Water & Drainage",
    assignedOfficial: "Rahul Sharma",
    officialAction: null,
    history: [
      { status: "Submitted", date: "12 Aug 2026", time: "10:20 AM", notes: "Complaint received by system from citizen." },
      { status: "Assigned to Water Department", date: "12 Aug 2026", time: "11:05 AM", notes: "Categorized and routed to Water & Drainage Department." },
      { status: "Official started review", date: "12 Aug 2026", time: "01:30 PM", notes: "Officer Rahul Sharma initiated technical assessment." }
    ],
    aiAssessment: {
      category: "Water & Drainage",
      understanding: "Active storm drain blockage causing wastewater overflow onto ABC School access road. Biological safety hazard for children and nearby residents.",
      relevantLaws: [
        "Public Health Act Section 23: Regulations regarding public drains and sewage overflow prevention.",
        "Water (Prevention and Control of Pollution) Act: Mandates municipal drainage maintenance."
      ],
      suggestedAuthority: "Water & Drainage Division, Zone 4"
    }
  },
  {
    id: 1045,
    title: "Major road damage",
    issue: "Major road damage",
    description: "Deep road depression and asphalt fragmentation causing heavy bottleneck and vehicular hazard during morning rush hour.",
    rawText: "Major road damage on Sector 5 Main Avenue. Deep potholes causing traffic slowdowns.",
    aiSummary: "Major road damage with structural asphalt fissure requiring urgent patch-up.",
    category: "Roads & Infrastructure",
    urgency: "Medium",
    status: "In Progress",
    submittedDate: "11 Aug 2026, 02:15 PM",
    lastUpdated: "12 Aug 2026, 09:30 AM",
    citizenName: "Niharika Maurya",
    citizenEmail: "example@gmail.com",
    citizenPhone: "9876543210",
    locationName: "Sector 5 Main Avenue",
    locationCoordinates: { x: 210, y: 180, lat: 28.6210, lng: 77.2150 },
    evidence: ["road_damage.jpg", "road_condition.jpg"],
    audioEvidence: "complaint_audio.mp3",
    sensorEvidence: {
      sensorId: "SENSOR #02",
      model: "TerraVibe Structural 400",
      location: "Sector 5 Main Avenue",
      reading: "58 mm/s",
      threshold: "80 mm/s",
      status: "Moderate Vibration"
    },
    assignedDepartment: "Roads & Infrastructure",
    assignedOfficial: "Rahul Sharma",
    officialAction: {
      decision: "Verified",
      actionSelected: "Repair Requested",
      remarks: "Asphalt maintenance crew deployed for resurfacing."
    },
    history: [
      { status: "Submitted", date: "11 Aug 2026", time: "02:15 PM", notes: "Complaint registered by citizen." },
      { status: "Assigned", date: "11 Aug 2026", time: "04:00 PM", notes: "Assigned to Rahul Sharma." },
      { status: "In Progress", date: "12 Aug 2026", time: "09:30 AM", notes: "Road repair equipment mobilized to site." }
    ],
    aiAssessment: {
      category: "Roads & Infrastructure",
      understanding: "Asphalt erosion and deep potholes on main transit lane.",
      relevantLaws: ["Motor Vehicles Act, Sec 198A: Duty of road authority for safety standards."],
      suggestedAuthority: "Department of Public Works (PWD) Road Division"
    }
  },
  {
    id: 1042,
    title: "Garbage accumulation near ABC School",
    issue: "Garbage accumulation",
    description: "Huge pile of solid waste has been accumulating right next to the school entrance. Severe odor and street blockage.",
    rawText: "There has been garbage accumulating outside ABC School for several days. It smells bad and nobody has collected it.",
    aiSummary: "Garbage accumulation near ABC School requiring sanitation truck dispatch.",
    category: "Waste & Sanitation",
    urgency: "Medium",
    status: "Pending Review",
    submittedDate: "10 Aug 2026, 09:00 AM",
    lastUpdated: "12 Aug 2026, 02:45 PM",
    citizenName: "Niharika Maurya",
    citizenEmail: "example@gmail.com",
    citizenPhone: "9876543210",
    locationName: "ABC School Lane, Sector 4",
    locationCoordinates: { x: 120, y: 150, lat: 28.6150, lng: 77.2080 },
    evidence: ["garbage.jpg"],
    audioEvidence: "complaint_audio.mp3",
    assignedDepartment: "Waste & Sanitation",
    assignedOfficial: "Rahul Sharma",
    history: [
      { status: "Submitted", date: "10 Aug 2026", time: "09:00 AM", notes: "Complaint received by system." },
      { status: "Assigned", date: "11 Aug 2026", time: "11:15 AM", notes: "Assigned to Rahul Sharma." }
    ],
    aiAssessment: {
      category: "Waste & Sanitation",
      understanding: "Garbage accumulation near public school area. Solid waste clearance needed.",
      relevantLaws: ["Section 15 of Solid Waste Management Rules."],
      suggestedAuthority: "Municipal Waste Department"
    }
  },
  {
    id: 1039,
    title: "Broken streetlight on Main Street",
    issue: "Broken streetlight",
    description: "The street light in front of house 45B is completely dark. The area is pitch-black at night.",
    rawText: "The street light in front of house 45B is completely dark. Pitch black at night.",
    aiSummary: "Dysfunctional sodium street lamp in Sector 2 requiring bulb replacement.",
    category: "Public Utilities",
    urgency: "Low",
    status: "Resolved",
    submittedDate: "08 Aug 2026, 08:00 PM",
    lastUpdated: "10 Aug 2026, 11:00 AM",
    citizenName: "Rahul Verma",
    citizenEmail: "rahul@gmail.com",
    citizenPhone: "9822334455",
    locationName: "Main Street, Sector 2",
    locationCoordinates: { x: 340, y: 210, lat: 28.6290, lng: 77.2250 },
    evidence: ["streetlight.jpg"],
    assignedDepartment: "Public Utilities",
    assignedOfficial: "Rahul Sharma",
    officialAction: {
      decision: "Verified",
      actionSelected: "Repair Requested",
      remarks: "Bulb replaced and illumination restored."
    },
    history: [
      { status: "Submitted", date: "08 Aug 2026", time: "08:00 PM", notes: "Complaint received." },
      { status: "Assigned", date: "09 Aug 2026", time: "10:00 AM", notes: "Assigned to Rahul Sharma." },
      { status: "In Progress", date: "09 Aug 2026", time: "01:30 PM", notes: "Maintenance van dispatched." },
      { status: "Resolved", date: "10 Aug 2026", time: "11:00 AM", notes: "Bulb replaced and tested OK." }
    ],
    aiAssessment: {
      category: "Public Utilities",
      understanding: "Dark public area reported due to a dysfunctional streetlight.",
      relevantLaws: ["Municipal Corporations Act, Sec 304."],
      suggestedAuthority: "Electrical & Street Lighting Wing"
    }
  },
  {
    id: 1043,
    title: "Large dangerous pothole outside school",
    issue: "Large pothole",
    description: "Deep crater formed right in the middle of Sector 5 Main Road outside the school. Two motorbikes slipped yesterday evening.",
    rawText: "Deep crater formed right in the middle of Sector 5 Main Road. Two motorbikes slipped yesterday evening.",
    aiSummary: "Large dangerous pothole causing road hazard on Sector 5 Main Road.",
    category: "Roads & Infrastructure",
    urgency: "High",
    status: "Assigned",
    submittedDate: "14 Aug 2026, 10:18 AM",
    lastUpdated: "14 Aug 2026, 04:20 PM",
    citizenName: "Rahul Verma",
    citizenEmail: "rahul@gmail.com",
    citizenPhone: "9822334455",
    locationName: "Sector 5 Main Road, near junction",
    locationCoordinates: { x: 210, y: 180, lat: 28.6200, lng: 77.2140 },
    evidence: ["pothole.jpg"],
    assignedDepartment: "Roads & Infrastructure",
    assignedOfficial: "Anjali Singh",
    history: [
      { status: "Submitted", date: "14 Aug 2026", time: "10:18 AM", notes: "Complaint logged by citizen." },
      { status: "Assigned", date: "14 Aug 2026", time: "04:20 PM", notes: "Assigned to Senior Road Engineer Anjali Singh for onsite patching." }
    ],
    aiAssessment: {
      category: "Roads & Infrastructure",
      understanding: "Severe asphalt cavity on heavy transit arterial road.",
      relevantLaws: ["Motor Vehicles Act, Sec 198A."],
      suggestedAuthority: "Department of Public Works (PWD)"
    }
  },
  {
    id: 1044,
    title: "Drain overflow & wastewater blockage",
    issue: "Drain overflow",
    description: "Sewage drain is overflowing with filthy black water onto pedestrian pathway near Metro Gate 2.",
    rawText: "Sewage drain is overflowing with filthy black water onto pedestrian pathway near Metro Gate 2.",
    aiSummary: "Severe storm drain blockage causing wastewater overflow onto walking pathway.",
    category: "Water & Drainage",
    urgency: "Critical",
    status: "In Progress",
    submittedDate: "15 Aug 2026, 08:45 AM",
    lastUpdated: "16 Aug 2026, 09:10 AM",
    citizenName: "Niharika Maurya",
    citizenEmail: "example@gmail.com",
    citizenPhone: "9876543210",
    locationName: "Metro Gate 2 Pathway, Central Ward",
    locationCoordinates: { x: 190, y: 310, lat: 28.6180, lng: 77.2100 },
    evidence: ["leakage.jpg"],
    assignedDepartment: "Water & Drainage",
    assignedOfficial: "Amit Kumar",
    history: [
      { status: "Submitted", date: "15 Aug 2026", time: "08:45 AM", notes: "Reported via citizen mobile app." },
      { status: "Assigned", date: "15 Aug 2026", time: "11:30 AM", notes: "Routed to Amit Kumar." },
      { status: "In Progress", date: "16 Aug 2026", time: "09:10 AM", notes: "Suction tanker and desilting crew on location." }
    ],
    aiAssessment: {
      category: "Water & Drainage",
      understanding: "Contaminated wastewater spill on high-footfall metro connector.",
      relevantLaws: ["Public Health Act Section 23."],
      suggestedAuthority: "Water Supply & Sewerage Board"
    }
  }
];

const SEED_SENSORS = [
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
      { time: "01:00 PM", value: "72%", urgency: "High" }
    ],
    historyLogs: [
      { sno: 1, reading: "91%", location: "XYZ Drain", time: "12 Aug 2026, 10:32 AM", urgency: "Critical", status: "Threshold Exceeded" },
      { sno: 2, reading: "88%", location: "XYZ Drain", time: "11 Aug 2026, 04:15 PM", urgency: "Critical", status: "Threshold Exceeded" },
      { sno: 3, reading: "72%", location: "XYZ Drain", time: "12 Aug 2026, 01:00 PM", urgency: "High", status: "Normal Range" }
    ]
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
    lastEvent: "Possible infrastructure issue detected with date",
    recentReadings: [
      { time: "09:00 AM", value: "42 mm/s", urgency: "Low" },
      { time: "12:00 PM", value: "54 mm/s", urgency: "Medium" },
      { time: "03:00 PM", value: "58 mm/s", urgency: "High" }
    ],
    historyLogs: [
      { sno: 1, reading: "84 mm/s", location: "Sector 5 Flyover", time: "14 Aug 2026, 09:12 AM", urgency: "High", status: "Vibration Spike" }
    ]
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
    recentReadings: [
      { time: "08:00 AM", value: "112 AQI", urgency: "High" }
    ],
    historyLogs: [
      { sno: 1, reading: "Offline", location: "Industrial Zone", time: "Today, 20 mins ago", urgency: "Critical", status: "Signal Lost" }
    ]
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
    recentReadings: [
      { time: "10:00 AM", value: "40 dB", urgency: "Low" },
      { time: "01:00 PM", value: "44 dB", urgency: "Low" }
    ],
    historyLogs: []
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
    recentReadings: [
      { time: "07:00 PM", value: "14 Lux", urgency: "Low" }
    ],
    historyLogs: []
  }
];

const SEED_DETECTED_EVENTS = [
  {
    id: "EVT-2101",
    sensorId: "SENSOR #01",
    eventType: "Possible waterlogging / abnormal level",
    time: "12 Aug 2026, 10:32 AM",
    reading: "91%",
    threshold: "85%",
    status: "New",
    urgency: "Critical",
    location: "XYZ Drain (Demo Location A)",
    evidence: "sensor_waveform_water_level.dat",
    notes: "Drain water volume exceeded 85% safety baseline. Spill risk elevated."
  },
  {
    id: "EVT-2102",
    sensorId: "SENSOR #02",
    eventType: "Structural vibration spike / Road depression",
    time: "14 Aug 2026, 09:12 AM",
    reading: "84 mm/s",
    threshold: "80 mm/s",
    status: "Under Review",
    urgency: "High",
    location: "Sector 5 Flyover (Demo Location B)",
    evidence: "vibration_sensor.dat",
    notes: "Heavy transit resonance detected on pillar section."
  },
  {
    id: "EVT-2103",
    sensorId: "SENSOR #03",
    eventType: "Sensor connectivity offline alarm",
    time: "18 Aug 2026, 01:45 PM",
    reading: "0 ms ping",
    threshold: "Timeout > 15m",
    status: "New",
    urgency: "Critical",
    location: "Industrial Zone (Demo Location C)",
    evidence: "heartbeat_timeout.log",
    notes: "No heartbeat signal response for 20+ minutes."
  },
  {
    id: "EVT-2104",
    sensorId: "SENSOR #01",
    eventType: "Monsoon surge warning",
    time: "11 Aug 2026, 04:15 PM",
    reading: "88%",
    threshold: "85%",
    status: "Reviewed",
    urgency: "High",
    location: "XYZ Drain (Demo Location A)",
    evidence: "water_surge_run.dat",
    notes: "Managed by emergency storm pumping station crew."
  },
  {
    id: "EVT-2105",
    sensorId: "SENSOR #04",
    eventType: "Acoustic sewer resonance",
    time: "08 Aug 2026, 02:00 AM",
    reading: "78 dB",
    threshold: "75 dB",
    status: "Reviewed",
    urgency: "Low",
    location: "Sector 4 Main Sump",
    evidence: "audio_acoustic.dat",
    notes: "Transient pressure change during night maintenance flushing."
  },
  {
    id: "EVT-2106",
    sensorId: "SENSOR #02",
    eventType: "Thermal expansion joint shift",
    time: "03 Aug 2026, 01:20 PM",
    reading: "81 mm/s",
    threshold: "80 mm/s",
    status: "Reviewed",
    urgency: "Medium",
    location: "Sector 5 Flyover",
    evidence: "joint_gauge.dat",
    notes: "Seasonal expansion within acceptable tolerance."
  }
];

const SEED_AI_LOGS = [
  {
    id: "AI-LOG-901",
    time: "10:32 AM",
    date: "12 Aug 2026",
    model: "Hugging Face",
    source: "Citizen",
    complaintId: "#1042",
    task: "Categorization",
    status: "Success",
    modelName: "Hugging Face Civic-BERT Classifier",
    inputDescription: "There has been garbage accumulating outside ABC School for several days. It smells bad and nobody has collected it.",
    outputSummary: "Garbage has been accumulating near ABC School for several days.",
    categorizationInput: "Summary: Garbage has accumulated outside ABC School for several days.",
    categorizationOutput: {
      category: "Waste & Sanitation",
      urgency: "Medium",
      assignedDepartment: "Municipal Waste Department XYZ",
      relevantLaws: ["Section 15 of Solid Waste Management Rules", "Article 21 (Constitution of India)"]
    }
  },
  {
    id: "AI-LOG-902",
    time: "10:18 AM",
    date: "14 Aug 2026",
    model: "Gemini",
    source: "Citizen",
    complaintId: "#1043",
    task: "Summarization",
    status: "Success",
    modelName: "Gemini Flash Civic-NLU v2.4",
    inputDescription: "Deep crater formed right in the middle of Sector 5 Main Road. Two motorbikes slipped yesterday evening.",
    outputSummary: "Large dangerous pothole causing road hazard on Sector 5 Main Road.",
    categorizationInput: "Summary: Large dangerous pothole on Sector 5 Main Road.",
    categorizationOutput: {
      category: "Roads & Infrastructure",
      urgency: "High",
      assignedDepartment: "Department of Public Works (PWD)",
      relevantLaws: ["Motor Vehicles Act, Sec 198A"]
    }
  },
  {
    id: "AI-LOG-903",
    time: "09:52 AM",
    date: "14 Aug 2026",
    model: "Hugging Face",
    source: "IoT Sensor",
    complaintId: "Event #21",
    task: "Categorization",
    status: "Review",
    modelName: "Hugging Face Sensor Signal Classifier",
    inputDescription: "Sensor Packet [SENSOR #02]: Axis-Z vibrational amplitude spiked to 84 mm/s at 09:12 AM.",
    outputSummary: "Road / Infrastructure anomalous dynamic vibration detected on flyover span.",
    categorizationInput: "Sensor signal shock profile #21 on Sector 5 Flyover.",
    categorizationOutput: {
      category: "Roads & Infrastructure",
      urgency: "High",
      assignedDepartment: "PWD Structural Inspection",
      relevantLaws: ["Bridge Safety Code 2022"]
    }
  },
  {
    id: "AI-LOG-904",
    time: "09:41 AM",
    date: "15 Aug 2026",
    model: "Hugging Face",
    source: "Citizen",
    complaintId: "#1041",
    task: "Categorization",
    status: "Low Confidence",
    modelName: "Hugging Face Civic-BERT Classifier",
    inputDescription: "Strange noise coming from underground near the pole, water bubbling slightly.",
    outputSummary: "Ambiguous utility issue with audio vibrations and bubbling water.",
    categorizationInput: "Strange noise and water bubbling near utility pole.",
    categorizationOutput: {
      category: "Water & Drainage (Unconfirmed)",
      urgency: "Medium",
      assignedDepartment: "Pending Verification Cell",
      relevantLaws: ["Public Utilities Code"]
    }
  },
  {
    id: "AI-LOG-905",
    time: "08:45 AM",
    date: "15 Aug 2026",
    model: "Hugging Face",
    source: "Citizen",
    complaintId: "#1044",
    task: "Categorization",
    status: "Success",
    modelName: "Hugging Face Civic-BERT Classifier",
    inputDescription: "Sewage drain is overflowing with filthy black water onto pedestrian pathway near Metro Gate 2.",
    outputSummary: "Severe storm drain blockage causing wastewater overflow onto walking pathway.",
    categorizationInput: "Summary: Sewage drain overflowing onto Metro Gate 2 pathway.",
    categorizationOutput: {
      category: "Water & Drainage",
      urgency: "Critical",
      assignedDepartment: "Water Supply & Sewerage Board",
      relevantLaws: ["Public Health Act Section 23", "Water Prevention Act"]
    }
  }
];

const SEED_ADMIN_NOTIFICATIONS = [
  {
    id: "adm-1",
    title: "Complaint waiting for assignment",
    message: "Complaint #1048 is waiting for assignment.",
    type: "urgent",
    time: "10 mins ago",
    unread: true
  },
  {
    id: "adm-2",
    title: "Official update",
    message: "Official Amit Kumar updated Complaint #1044.",
    type: "update",
    time: "35 mins ago",
    unread: true
  },
  {
    id: "adm-3",
    title: "Sensor offline alert",
    message: "Sensor #03 has been offline for 20 minutes.",
    type: "warning",
    time: "1 hour ago",
    unread: true
  },
  {
    id: "adm-4",
    title: "IoT anomaly detected",
    message: "New IoT anomaly/event detected on SENSOR #01 (91% reading).",
    type: "urgent",
    time: "2 hours ago",
    unread: false
  }
];

const SEED_OFFICIAL_NOTIFICATIONS = [
  {
    id: "off-1",
    title: "New Complaint Assigned",
    message: "New complaint #1048 assigned to you.",
    type: "urgent",
    time: "10 mins ago",
    timestamp: "12 Aug 2026, 11:05 AM",
    unread: true,
    complaintId: 1048
  },
  {
    id: "off-2",
    title: "Additional Evidence Submitted",
    message: "Citizen provided additional evidence for Complaint #1045.",
    type: "update",
    time: "1 hour ago",
    timestamp: "12 Aug 2026, 10:15 AM",
    unread: true,
    complaintId: 1045
  },
  {
    id: "off-3",
    title: "Complaint Status Resolved",
    message: "Complaint #1039 has been marked resolved.",
    type: "resolved",
    time: "Yesterday",
    timestamp: "10 Aug 2026, 11:00 AM",
    unread: false,
    complaintId: 1039
  },
  {
    id: "off-4",
    title: "Admin Reassignment",
    message: "Admin reassigned Complaint #1042 to you.",
    type: "reassigned",
    time: "2 days ago",
    timestamp: "10 Aug 2026, 09:30 AM",
    unread: false,
    complaintId: 1042
  }
];

const SEED_FIELD_ACTIONS = [
  {
    id: "FA-1048",
    complaintId: 1048,
    action: "Drain Cleaning",
    assignedTeam: "Drainage Team 03",
    priority: "High",
    assignedOn: "14 Aug 2026",
    targetDate: "15 Aug 2026",
    status: "In Progress",
    instructions: "Perform thorough mechanical desilting of the blocked road storm drain outside ABC School gate.",
    completionReport: {
      completionNote: "Drain desilted and sediment blockage removed from ABC School junction. Flow normalized.",
      completionEvidence: ["before.jpg", "after.jpg"],
      completedOn: "15 Aug 2026"
    },
    resolutionDetails: null
  },
  {
    id: "FA-1045",
    complaintId: 1045,
    action: "Repair / Maintenance",
    assignedTeam: "PWD Road Crew 01",
    priority: "Medium",
    assignedOn: "12 Aug 2026",
    targetDate: "14 Aug 2026",
    status: "In Progress",
    instructions: "Milling and hot-mix bituminous patch work on damaged asphalt lane.",
    completionReport: null,
    resolutionDetails: null
  }
];

// Initialize Database Storage
const initializeDb = () => {
  // Always update with clean seeds on version bump
  localStorage.setItem("civic_complaints", JSON.stringify(SEED_COMPLAINTS));
  localStorage.setItem("civic_officials", JSON.stringify(SEED_OFFICIALS));
  localStorage.setItem("civic_sensors", JSON.stringify(SEED_SENSORS));
  localStorage.setItem("civic_detected_events", JSON.stringify(SEED_DETECTED_EVENTS));
  localStorage.setItem("civic_ai_logs", JSON.stringify(SEED_AI_LOGS));
  localStorage.setItem("civic_admin_notifications", JSON.stringify(SEED_ADMIN_NOTIFICATIONS));
  localStorage.setItem("civic_official_notifications", JSON.stringify(SEED_OFFICIAL_NOTIFICATIONS));
  localStorage.setItem("civic_field_actions", JSON.stringify(SEED_FIELD_ACTIONS));
  localStorage.setItem("civic_users", JSON.stringify(SEED_USERS_DB));
  
  if (!localStorage.getItem("civic_notifications")) {
    localStorage.setItem("civic_notifications", JSON.stringify([
      {
        id: 1,
        title: "Complaint assigned",
        message: "Your complaint #1048 has been assigned to Rahul Sharma (Water & Drainage).",
        type: "tracking",
        timestamp: "12 Aug 2026, 11:05 AM",
        unread: true
      },
      {
        id: 2,
        title: "Status change",
        message: "Complaint #1048 status changed to In Progress.",
        type: "tracking",
        timestamp: "12 Aug 2026, 03:10 PM",
        unread: true
      }
    ]));
  }
};

initializeDb();

export const mockDb = {
  // -------------------------------------------------------------
  // Complaints API
  // -------------------------------------------------------------
  getComplaints: () => {
    return JSON.parse(localStorage.getItem("civic_complaints") || "[]");
  },
  
  saveComplaint: (complaintData) => {
    const complaints = mockDb.getComplaints();
    const newComplaint = {
      ...complaintData,
      id: complaintData.id || Math.floor(1000 + Math.random() * 9000),
      submittedDate: complaintData.submittedDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: complaintData.status || "Pending",
      history: complaintData.history || [
        {
          status: "Submitted",
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          notes: "Complaint received by the system."
        }
      ]
    };
    
    const index = complaints.findIndex(c => c.id === newComplaint.id);
    if (index > -1) {
      complaints[index] = newComplaint;
    } else {
      complaints.unshift(newComplaint);
    }
    
    localStorage.setItem("civic_complaints", JSON.stringify(complaints));
    
    // Auto notifications
    mockDb.addAdminNotification({
      title: "New Complaint Registered",
      message: `Complaint #${newComplaint.id} (${newComplaint.category || 'General'}) is waiting for assignment.`,
      type: "urgent"
    });

    mockDb.addNotification({
      title: "Complaint Registered",
      message: `Your complaint #${newComplaint.id} has been submitted successfully for verification.`,
      type: "tracking"
    });
    
    return newComplaint;
  },

  updateComplaintStatus: (id, status, notes = "") => {
    const complaints = mockDb.getComplaints();
    const index = complaints.findIndex(c => c.id === id);
    if (index > -1) {
      const comp = complaints[index];
      comp.status = status;
      comp.lastUpdated = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      comp.history.push({
        status: status,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: notes || `Status changed to ${status}.`
      });
      complaints[index] = comp;
      localStorage.setItem("civic_complaints", JSON.stringify(complaints));
      
      mockDb.addNotification({
        title: `Complaint Status Updated`,
        message: `Complaint #${id} is now ${status}.`,
        type: "tracking"
      });
      return comp;
    }
    return null;
  },

  assignComplaint: (id, department, officialName, notes = "") => {
    const complaints = mockDb.getComplaints();
    const index = complaints.findIndex(c => c.id === id);
    if (index > -1) {
      const comp = complaints[index];
      comp.assignedDepartment = department;
      comp.assignedOfficial = officialName;
      comp.status = "Assigned";
      comp.lastUpdated = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      comp.history.push({
        status: "Assigned",
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: notes || `Assigned to ${officialName || department}.`
      });
      complaints[index] = comp;
      localStorage.setItem("civic_complaints", JSON.stringify(complaints));

      // Update official case history
      if (officialName) {
        mockDb.addOfficialCase(officialName, {
          id: comp.id,
          issue: comp.title || comp.issue,
          assignedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: "Assigned",
          timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }

      mockDb.addNotification({
        title: "Complaint Assigned",
        message: `Complaint #${id} has been assigned to ${officialName || department}.`,
        type: "tracking"
      });

      return comp;
    }
    return null;
  },

  // -------------------------------------------------------------
  // Officials API
  // -------------------------------------------------------------
  getOfficials: () => {
    return JSON.parse(localStorage.getItem("civic_officials") || "[]");
  },

  addOfficial: (officialData) => {
    const officials = mockDb.getOfficials();
    const newOfficial = {
      id: officialData.id || Math.floor(100 + Math.random() * 900),
      name: officialData.name,
      email: officialData.email || "",
      password: officialData.password || "password123",
      phone: officialData.phone || "+91 9800000000",
      department: officialData.department || "General Administration",
      role: officialData.role || "Department Officer",
      status: "Active",
      complaintStatus: "Free",
      resolutionRate: "100%",
      totalAssigned: 0,
      totalResolved: 0,
      caseHistory: []
    };
    officials.push(newOfficial);
    localStorage.setItem("civic_officials", JSON.stringify(officials));
    return newOfficial;
  },

  updateOfficial: (id, updatedFields) => {
    const officials = mockDb.getOfficials();
    const index = officials.findIndex(o => o.id === id);
    if (index > -1) {
      officials[index] = { ...officials[index], ...updatedFields };
      localStorage.setItem("civic_officials", JSON.stringify(officials));
      return officials[index];
    }
    return null;
  },

  addOfficialCase: (officialName, caseItem) => {
    const officials = mockDb.getOfficials();
    const index = officials.findIndex(o => o.name.toLowerCase() === officialName.toLowerCase());
    if (index > -1) {
      const off = officials[index];
      if (!off.caseHistory) off.caseHistory = [];
      const exists = off.caseHistory.findIndex(c => c.id === caseItem.id);
      if (exists > -1) {
        off.caseHistory[exists] = caseItem;
      } else {
        off.caseHistory.unshift(caseItem);
      }
      off.totalAssigned = (off.totalAssigned || 0) + 1;
      off.complaintStatus = "Assigned";
      officials[index] = off;
      localStorage.setItem("civic_officials", JSON.stringify(officials));
    }
  },

  // -------------------------------------------------------------
  // Citizens API
  // -------------------------------------------------------------
  getCitizens: () => {
    const users = JSON.parse(localStorage.getItem("civic_users") || "[]");
    const complaints = mockDb.getComplaints();
    
    // Filter only citizens and attach their complaint counts & list
    const citizens = users
      .filter(u => u.role !== "admin")
      .map(citizen => {
        const userComplaints = complaints.filter(
          c => (c.citizenEmail && c.citizenEmail.toLowerCase() === citizen.email.toLowerCase()) ||
               (c.citizenName && c.citizenName.toLowerCase() === citizen.name.toLowerCase())
        );
        return {
          ...citizen,
          totalComplaints: userComplaints.length,
          complaintsList: userComplaints
        };
      });

    return citizens;
  },

  // -------------------------------------------------------------
  // IoT Sensors API
  // -------------------------------------------------------------
  getSensors: () => {
    return JSON.parse(localStorage.getItem("civic_sensors") || "[]");
  },

  updateSensor: (sensorId, updatedData) => {
    const sensors = mockDb.getSensors();
    const index = sensors.findIndex(s => s.id === sensorId);
    if (index > -1) {
      sensors[index] = { ...sensors[index], ...updatedData };
      localStorage.setItem("civic_sensors", JSON.stringify(sensors));
      return sensors[index];
    }
    return null;
  },

  // -------------------------------------------------------------
  // Detected Events API
  // -------------------------------------------------------------
  getDetectedEvents: () => {
    return JSON.parse(localStorage.getItem("civic_detected_events") || "[]");
  },

  markEventReviewed: (eventId) => {
    const events = mockDb.getDetectedEvents();
    const index = events.findIndex(e => e.id === eventId);
    if (index > -1) {
      events[index].status = "Reviewed";
      localStorage.setItem("civic_detected_events", JSON.stringify(events));
      return events[index];
    }
    return null;
  },

  // -------------------------------------------------------------
  // AI Monitoring Logs API
  // -------------------------------------------------------------
  getAILogs: () => {
    return JSON.parse(localStorage.getItem("civic_ai_logs") || "[]");
  },

  addAILog: (logItem) => {
    const logs = mockDb.getAILogs();
    const newLog = {
      id: "AI-LOG-" + Math.floor(100 + Math.random() * 900),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      model: logItem.task === 'Summarization' ? 'Gemini' : 'Hugging Face',
      ...logItem
    };
    logs.unshift(newLog);
    localStorage.setItem("civic_ai_logs", JSON.stringify(logs));
    return newLog;
  },

  // -------------------------------------------------------------
  // Admin Notifications API
  // -------------------------------------------------------------
  getAdminNotifications: () => {
    return JSON.parse(localStorage.getItem("civic_admin_notifications") || "[]");
  },

  addAdminNotification: (notification) => {
    const notifs = mockDb.getAdminNotifications();
    const newNotif = {
      id: "adm-" + Math.floor(1000 + Math.random() * 9000),
      time: "Just now",
      unread: true,
      ...notification
    };
    notifs.unshift(newNotif);
    localStorage.setItem("civic_admin_notifications", JSON.stringify(notifs));
    return newNotif;
  },

  markAdminNotificationsRead: () => {
    const notifs = mockDb.getAdminNotifications();
    const updated = notifs.map(n => ({ ...n, unread: false }));
    localStorage.setItem("civic_admin_notifications", JSON.stringify(updated));
  },

  // -------------------------------------------------------------
  // Official Notifications API
  // -------------------------------------------------------------
  getOfficialNotifications: () => {
    return JSON.parse(localStorage.getItem("civic_official_notifications") || "[]");
  },

  addOfficialNotification: (notification) => {
    const notifs = mockDb.getOfficialNotifications();
    const newNotif = {
      id: "off-" + Math.floor(1000 + Math.random() * 9000),
      time: "Just now",
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: true,
      ...notification
    };
    notifs.unshift(newNotif);
    localStorage.setItem("civic_official_notifications", JSON.stringify(notifs));
    return newNotif;
  },

  markOfficialNotificationsRead: () => {
    const notifs = mockDb.getOfficialNotifications();
    const updated = notifs.map(n => ({ ...n, unread: false }));
    localStorage.setItem("civic_official_notifications", JSON.stringify(updated));
  },

  // -------------------------------------------------------------
  // Field Actions API
  // -------------------------------------------------------------
  getFieldActions: () => {
    return JSON.parse(localStorage.getItem("civic_field_actions") || "[]");
  },

  saveFieldAction: (actionData) => {
    const actions = mockDb.getFieldActions();
    const newAction = {
      id: actionData.id || "FA-" + (actionData.complaintId || Math.floor(1000 + Math.random() * 9000)),
      complaintId: Number(actionData.complaintId),
      action: actionData.action || "Site Inspection",
      assignedTeam: actionData.assignedTeam || "Drainage Team 03",
      priority: actionData.priority || "High",
      assignedOn: actionData.assignedOn || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      targetDate: actionData.targetDate || "15 Aug 2026",
      instructions: actionData.instructions || "",
      status: "In Progress",
      completionReport: {
        completionNote: "Field unit dispatched and work scheduled according to departmental protocol.",
        completionEvidence: ["before.jpg", "after.jpg"],
        completedOn: actionData.targetDate || "15 Aug 2026"
      },
      resolutionDetails: null
    };

    const index = actions.findIndex(a => a.id === newAction.id || a.complaintId === newAction.complaintId);
    if (index > -1) {
      actions[index] = { ...actions[index], ...newAction };
    } else {
      actions.unshift(newAction);
    }
    localStorage.setItem("civic_field_actions", JSON.stringify(actions));

    // Also update complaint history and status
    mockDb.updateComplaintStatus(newAction.complaintId, "In Progress", `Field Action Assigned: ${newAction.action} assigned to ${newAction.assignedTeam}`);

    mockDb.addOfficialNotification({
      title: "Field Action Dispatched",
      message: `Action '${newAction.action}' assigned to ${newAction.assignedTeam} for Complaint #${newAction.complaintId}.`,
      type: "update",
      complaintId: newAction.complaintId
    });

    return newAction;
  },

  verifyFieldActionAndResolve: (complaintId, resolutionNote = "") => {
    const actions = mockDb.getFieldActions();
    const actionIndex = actions.findIndex(a => a.complaintId === Number(complaintId));
    if (actionIndex > -1) {
      actions[actionIndex].status = "Completed";
      actions[actionIndex].resolutionDetails = {
        fieldActionCompleted: true,
        evidenceReviewed: true,
        issueResolved: true,
        resolutionNote: resolutionNote || "Field remediation verified and quality check passed.",
        resolvedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      };
      localStorage.setItem("civic_field_actions", JSON.stringify(actions));
    }

    mockDb.updateComplaintStatus(Number(complaintId), "Resolved", resolutionNote || "Field action verified complete. Issue resolved.");

    mockDb.addOfficialNotification({
      title: "Complaint Resolved",
      message: `Complaint #${complaintId} has been verified and marked as Resolved.`,
      type: "resolved",
      complaintId: Number(complaintId)
    });

    return true;
  },

  submitOfficialDecision: (complaintId, decisionPayload) => {
    const complaints = mockDb.getComplaints();
    const index = complaints.findIndex(c => c.id === Number(complaintId));
    if (index > -1) {
      const comp = complaints[index];
      const { step1Decision, step2Data, step3Action, step4Status, remarks } = decisionPayload;
      
      let nextStatus = step4Status || comp.status;
      if (step1Decision === "Requires Information") {
        nextStatus = "Requires Information";
      } else if (step1Decision === "Unable to Verify") {
        nextStatus = "Unable to Verify";
      } else if (step1Decision === "Not Applicable") {
        nextStatus = "Not Applicable";
      } else if (step1Decision === "Verified") {
        nextStatus = step4Status || "In Progress";
      }

      comp.status = nextStatus;
      comp.officialAction = {
        decision: step1Decision,
        step2Data: step2Data || null,
        actionSelected: step3Action || null,
        remarks: remarks || "Official assessment completed."
      };
      comp.lastUpdated = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      comp.history.push({
        status: nextStatus,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: remarks || `Official action decision: ${step1Decision}. Status set to ${nextStatus}.`
      });

      complaints[index] = comp;
      localStorage.setItem("civic_complaints", JSON.stringify(complaints));

      mockDb.addNotification({
        title: `Complaint #${comp.id} Update`,
        message: remarks || `Official review decision: ${step1Decision} (${nextStatus}).`,
        type: "official"
      });

      mockDb.addOfficialNotification({
        title: "Decision Submitted",
        message: `Decision '${step1Decision}' submitted for Complaint #${comp.id}.`,
        type: "update",
        complaintId: comp.id
      });

      return comp;
    }
    return null;
  },

  // -------------------------------------------------------------
  // Citizen Notifications API
  // -------------------------------------------------------------
  getNotifications: () => {
    return JSON.parse(localStorage.getItem("civic_notifications") || "[]");
  },
  
  addNotification: (notification) => {
    const notifications = mockDb.getNotifications();
    const newNotif = {
      ...notification,
      id: Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: true
    };
    notifications.unshift(newNotif);
    localStorage.setItem("civic_notifications", JSON.stringify(notifications));
  },

  markNotificationsRead: () => {
    const notifications = mockDb.getNotifications();
    const updated = notifications.map(n => ({ ...n, unread: false }));
    localStorage.setItem("civic_notifications", JSON.stringify(updated));
  },

  // -------------------------------------------------------------
  // Draft Management API
  // -------------------------------------------------------------
  getDraft: () => {
    const draft = localStorage.getItem("civic_draft_complaint");
    return draft ? JSON.parse(draft) : null;
  },

  saveDraft: (draftData) => {
    localStorage.setItem("civic_draft_complaint", JSON.stringify(draftData));
  },

  clearDraft: () => {
    localStorage.removeItem("civic_draft_complaint");
  },

  // -------------------------------------------------------------
  // User Authentication & Session
  // -------------------------------------------------------------
  getCurrentUser: () => {
    const user = localStorage.getItem("civic_current_user");
    return user ? JSON.parse(user) : null;
  },

  updateProfile: (profileData) => {
    localStorage.setItem("civic_current_user", JSON.stringify(profileData));
    
    const users = JSON.parse(localStorage.getItem("civic_users") || "[]");
    const index = users.findIndex(u => u.email.toLowerCase() === profileData.email.toLowerCase());
    if (index > -1) {
      users[index] = { ...users[index], ...profileData };
      localStorage.setItem("civic_users", JSON.stringify(users));
    }
  },

  changePassword: (oldPass, newPass) => {
    const currentUser = mockDb.getCurrentUser();
    if (!currentUser) return { success: false, message: "No active user session." };

    const users = JSON.parse(localStorage.getItem("civic_users") || "[]");
    const index = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
    if (index > -1) {
      if (users[index].password !== oldPass && oldPass !== "password123" && oldPass !== "12345") {
        return { success: false, message: "Current password does not match." };
      }
      users[index].password = newPass;
      localStorage.setItem("civic_users", JSON.stringify(users));
      return { success: true };
    }
    return { success: false, message: "User not found." };
  },

  login: (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const users = JSON.parse(localStorage.getItem("civic_users") || "[]");
    
    let user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
    
    // Official fallback
    if (!user && (cleanEmail === "grievance.officer@nagrikai.in" || cleanEmail === "rahul@department.gov") && (password === "12345" || password === "password123")) {
      user = {
        name: "Rahul Sharma",
        email: "grievance.officer@nagrikai.in",
        password: "12345",
        role: "official",
        phone: "+91 9876541102",
        department: "Water & Drainage",
        address: "Zonal Municipal Office, Ward 4",
        notificationsEnabled: true
      };
      users.push(user);
      localStorage.setItem("civic_users", JSON.stringify(users));
    }

    // Admin fallback
    if (!user && cleanEmail === "admin@nagrik.ai" && password === "password123") {
      user = {
        name: "System Administrator",
        email: "admin@nagrik.ai",
        password: "password123",
        role: "admin",
        phone: "+91 9811002233",
        department: "Administration",
        notificationsEnabled: true
      };
      users.push(user);
      localStorage.setItem("civic_users", JSON.stringify(users));
    }

    if (user) {
      let resolvedRole = user.role;
      if (!resolvedRole) {
        if (cleanEmail === "admin@nagrik.ai") resolvedRole = "admin";
        else if (cleanEmail === "grievance.officer@nagrikai.in" || cleanEmail.includes("officer") || cleanEmail.includes("department.gov")) resolvedRole = "official";
        else resolvedRole = "citizen";
      }

      const activeUser = {
        name: user.name,
        email: user.email,
        role: resolvedRole,
        phone: user.phone || "9876543210",
        address: user.address || "",
        department: user.department || (resolvedRole === "official" ? "Water & Drainage" : "General"),
        notificationsEnabled: user.notificationsEnabled !== undefined ? user.notificationsEnabled : true
      };
      localStorage.setItem("civic_current_user", JSON.stringify(activeUser));
      return { success: true, user: activeUser };
    }
    return { success: false, message: "Invalid email or password." };
  },

  register: (userData) => {
    const users = JSON.parse(localStorage.getItem("civic_users") || "[]");
    const cleanEmail = userData.email.trim().toLowerCase();
    const exists = users.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, message: "Email is already registered." };
    }
    
    const newUser = {
      email: cleanEmail,
      password: userData.password,
      name: userData.name,
      phone: userData.phone,
      address: userData.address,
      role: cleanEmail === "admin@nagrik.ai" ? "admin" : "citizen",
      notificationsEnabled: true
    };
    users.push(newUser);
    localStorage.setItem("civic_users", JSON.stringify(users));
    
    const activeUser = {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      address: newUser.address,
      notificationsEnabled: true
    };
    localStorage.setItem("civic_current_user", JSON.stringify(activeUser));
    return { success: true, user: activeUser };
  },

  logout: () => {
    localStorage.removeItem("civic_current_user");
  },

  // -------------------------------------------------------------
  // Mock AI Engine for Local Analysis
  // -------------------------------------------------------------
  analyzeComplaintDescription: (description) => {
    const lowercase = description.toLowerCase();
    
    let category = "General Municipal Issue";
    let understanding = `AI Classification: Public grievances noted from description. Verification unit recommended for onsite visit.`;
    let relevantLaws = [
      "Sec 44 of Municipal Corporation Code: Core functions and basic civic standards.",
      "General Law of Public Nuisance: Standard administrative rules on local environment maintenance."
    ];
    let suggestedAuthority = "General Grievance Redressal Cell";

    if (lowercase.includes("garbage") || lowercase.includes("waste") || lowercase.includes("refuse") || lowercase.includes("litter") || lowercase.includes("dump")) {
      category = "Waste & Sanitation";
      understanding = "Garbage accumulation has been reported near a public area. Sidewalk blockages and bio-hazards require solid waste collection team dispatch.";
      relevantLaws = [
        "Section 15 of Solid Waste Management Rules: Prohibits dumping of municipal waste on streets.",
        "Article 21 (Constitution of India): Right to a clean and healthy environment."
      ];
      suggestedAuthority = "Municipal Waste Department XYZ";
    } 
    else if (lowercase.includes("light") || lowercase.includes("lamp") || lowercase.includes("bulb") || lowercase.includes("dark")) {
      category = "Public Utilities";
      understanding = "Dysfunctional street lighting reported, creating safety hazards and dark zones. Recommends technician team for bulb replacement and power grid checks.";
      relevantLaws = [
        "Municipal Corporations Act, Sec 304: Mandate to light public streets.",
        "Bureau of Indian Standards Code (IS:1944): Guidelines for lighting levels on public pathways."
      ];
      suggestedAuthority = "Electrical & Street Lighting Wing";
    }
    else if (lowercase.includes("pot") || lowercase.includes("road") || lowercase.includes("street") || lowercase.includes("asphalt") || lowercase.includes("hole")) {
      category = "Roads & Infrastructure";
      understanding = "Potholes or cracked road conditions reported. Poses a severe threat to vehicle tires, cyclist balance, and traffic flow.";
      relevantLaws = [
        "Motor Vehicles Act, Sec 198A: Liability of authorities for design and maintenance standards.",
        "National Highways and Civic Roads Act: Legal duty to maintain pothole-free safe roads."
      ];
      suggestedAuthority = "Department of Public Works (PWD) Road Division";
    }
    else if (lowercase.includes("water") || lowercase.includes("sewage") || lowercase.includes("pipe") || lowercase.includes("leak") || lowercase.includes("drain")) {
      category = "Water & Drainage";
      understanding = "Contaminated water supply or sewage water leak. Risk of waterborne diseases and civic contamination.";
      relevantLaws = [
        "Water (Prevention and Control of Pollution) Act: Mandates drinking water quality preservation.",
        "Public Health Act Section 23: Regulations regarding public drains and sewage overflow prevention."
      ];
      suggestedAuthority = "Water Supply & Sewerage Board";
    }

    return {
      category,
      understanding,
      relevantLaws,
      suggestedAuthority
    };
  }
};
