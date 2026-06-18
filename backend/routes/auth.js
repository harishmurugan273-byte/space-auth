const express = require("express");
const bcrypt  = require("bcryptjs");
const User    = require("../models/User");
const router  = express.Router();

const ADMIN_EMAIL = "harishmurugan54321@gmail.com";

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(409).json({ message: "Username or email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const user = await User.create({ username, email, password: hashed, isAdmin });

    res.status(201).json({ message: "User created", user: { username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account found with this email" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Incorrect password" });

    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        registeredAt: user.registeredAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all users (admin only - frontend checks isAdmin)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "username email registeredAt lastLogin isAdmin").sort({ registeredAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// Reset password (requires old password to match)
router.post("/reset-password", async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword)
      return res.status(400).json({ message: "All fields are required" });

    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password must be 6+ characters" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account found with this email" });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(401).json({ message: "Old password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
module.exports = router;
