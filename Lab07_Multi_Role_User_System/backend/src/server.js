require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const User = require("./models/User");

const app = express();
const PORT = 3000; // STRICT as per handout

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   DATABASE CONNECTION
========================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    seedSuperAdmin();
  })
  .catch((err) => {
    console.error("MongoDB Connection Failed:", err.message);
  });

/* =========================
   SEED SUPER ADMIN
========================= */
async function seedSuperAdmin() {
  try {
    const existing = await User.findOne({ role: "SUPER_ADMIN" });
    if (!existing) {
      const hashedPassword = await bcrypt.hash("superadmin123", 10);

      await User.create({
        name: "Super Admin",
        email: "superadmin@gmail.com",
        password: hashedPassword,
        role: "SUPER_ADMIN",
      });

      console.log("SUPER_ADMIN created");
    }
  } catch (error) {
    console.error("Seeding error:", error.message);
  }
}

/* =========================
   BASIC ROUTES (Lab 06)
========================= */
app.get("/", (req, res) => {
  res.send("Lab 07: Multi-Role User System Running");
});

app.get("/about", (req, res) => {
  res.send("Name: ROHAN VIJ | Enrollment: CS-2341127 | Section: 3CSE15");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* =========================
   API ROUTES (Lab 07)
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});