require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) =>
  res.send("Lab 06: Backend running successfully")
);

app.get("/health", (req, res) =>
  res.json({ status: "ok" })
);

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);