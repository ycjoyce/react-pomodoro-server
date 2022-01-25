const mongoose = require("mongoose");
const isPositiveInteger = require("../utils/isPositiveInteger");

const Record = mongoose.model("Record", {
  date: {
    type: Date,
    default: new Date(),
  },
  task_id: {
    type: String,
    trim: true,
    required: true,
  },
  count: {
    type: Number,
    required: true,
    validate(value) {
      if (!isPositiveInteger(value)) {
        throw new Error("The count must be a positive integer");
      }
    },
  },
});

module.exports = Record;