const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title:   { type: String, default: "" },
  content: { type: String, default: "" },
  lastSavedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Note", noteSchema);
