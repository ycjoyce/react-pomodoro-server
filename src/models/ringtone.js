const mongoose = require("mongoose");
const User = require("./user");

const ringtoneSchema = new mongoose.Schema({
  type: {
    type: String,
    trim: true,
    lowercase: true,
    default: "work",
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  audio: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
});

const Ringtone = mongoose.model("Ringtone", ringtoneSchema);

module.exports = Ringtone;