const mongoose = require("mongoose");
const isPositiveInteger = require("../utils/isPositiveInteger");

const recordSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: new Date(),
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Task"
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
  },
  {
    timestamps: true,
  },
);

const Record = mongoose.model("Record", recordSchema);

module.exports = Record;