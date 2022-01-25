const mongoose = require("mongoose");
const isPositiveInteger = require("../utils/isPositiveInteger");

const Task = mongoose.model("Task", {
  title: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  total: {
    type: Number,
    required: true,
    validate(value) {
      if (!isPositiveInteger(value)) {
        throw new Error("The total number must be a positive integer");
      }
    },
  },
});

module.exports = Task;