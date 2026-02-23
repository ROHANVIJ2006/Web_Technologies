require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000; // STRICT as per handout

// Home Route
app.get("/", (req, res) => {
  res.send("Lab 06: Backend running and GitHub push successful");
});

// About Route (Required in Handout)
app.get("/about", (req, res) => {
  res.send("Name: ROHAN VIJ | Enrollment: CS-2341127 | Section: YOUR_SECTION");
});

// Health Route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});