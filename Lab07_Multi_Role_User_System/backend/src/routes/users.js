const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const router = express.Router();

/* =========================
   GET OWN PROFILE
========================= */
router.get("/me", auth, async (req, res) => {
  res.json(req.user);
});

/* =========================
   GET ALL USERS
========================= */
router.get("/", auth, role("ADMIN", "SUPER_ADMIN"), async (req, res) => {
  let users;

  if (req.user.role === "ADMIN") {
    users = await User.find({ role: "USER" }).select("-password");
  } else {
    users = await User.find().select("-password");
  }

  res.json(users);
});

/* =========================
   CREATE USER
========================= */
router.post("/", auth, role("ADMIN", "SUPER_ADMIN"), async (req, res) => {
  const { name, email, password, role: newRole } = req.body;

  if (req.user.role === "ADMIN" && newRole !== "USER") {
    return res.status(403).json({ message: "ADMIN can only create USER" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: newRole,
  });

  res.status(201).json({
    message: "User created",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

/* =========================
   CHANGE ROLE (SUPER_ADMIN)
========================= */
router.patch("/:id/role", auth, role("SUPER_ADMIN"), async (req, res) => {
  const { role: newRole } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.role = newRole;
  await user.save();

  res.json({ message: "Role updated successfully" });
});

/* =========================
   DELETE USER
========================= */
router.delete("/:id", auth, async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    // SUPER_ADMIN can delete anyone
    if (req.user.role === "SUPER_ADMIN") {
      await userToDelete.deleteOne();
      return res.json({ message: "User deleted successfully" });
    }

    // ADMIN can delete only USER
    if (req.user.role === "ADMIN") {
      if (userToDelete.role === "USER") {
        await userToDelete.deleteOne();
        return res.json({ message: "User deleted successfully" });
      } else {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    // USER cannot delete anyone
    return res.status(403).json({ message: "Forbidden" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;