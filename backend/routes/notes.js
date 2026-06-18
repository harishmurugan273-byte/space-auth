const express = require("express");
const Note = require("../models/Note");
const User = require("../models/User");
const router = express.Router();

// Get all notes for one user
router.get("/:userId", async (req, res) => {
  try {
    const notes = await Note.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Create a new note
router.post("/", async (req, res) => {
  try {
    const { userId, title, content } = req.body;
    const note = await Note.create({ user: userId, title, content });
    res.status(201).json({ note });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update a note (edit text)
router.put("/:noteId", async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findByIdAndUpdate(
      req.params.noteId,
      { title, content },
      { new: true }
    );
    res.json({ note });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Save a note (mark saved + timestamp)
router.put("/:noteId/save", async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findByIdAndUpdate(
      req.params.noteId,
      { title, content, lastSavedAt: new Date() },
      { new: true }
    );
    res.json({ note });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete a note
router.delete("/:noteId", async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.noteId);
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
