const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const axios = require("axios");

const PORT = "COM11";
const BAUD_RATE = 9600;

const API_URL =
  "http://localhost:5000/api/sensors/SENSOR%20%2301/readings";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhYWI0Y2Y5NjZjYjBiMzdjMDk4N2RmOCIsImlhdCI6MTc5MTM5MDczOCwiZXhwIjoxNzkxOTk1NTM4fQ.HM_j88htQFNZfXEHUVBio81Bc5u99zXDRI4EcJBTJ94";

const port = new SerialPort({
  path: PORT,
  baudRate: BAUD_RATE,
});

const parser = port.pipe(
  new ReadlineParser({ delimiter: "\r\n" })
);

port.on("open", () => {
  console.log(`Connected to Arduino on ${PORT}`);
});

parser.on("data", async (line) => {
  console.log("Arduino:", line);

  const readings = line
    .trim()
    .split(",")
    .map(Number);

  if (
    readings.length !== 3 ||
    readings.some((value) => Number.isNaN(value))
  ) {
    console.log("Invalid reading batch:", line);
    return;
  }

  try {
    const response = await axios.post(
      API_URL,
      { readings },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "Backend updated:",
      response.data.sensor.currentReading,
      response.data.sensor.urgency
    );
  } catch (error) {
    console.error(
      "Backend error:",
      error.response?.data || error.message
    );
  }
});

port.on("error", (err) => {
  console.error("Serial error:", err.message);
});