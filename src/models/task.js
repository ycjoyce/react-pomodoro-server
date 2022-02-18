const mongoose = require("mongoose");
const isPositiveInteger = require("../utils/isPositiveInteger");
const Record = require("./record");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    length: {
      type: Number,
      required: true,
      validate(value) {
        if (!isPositiveInteger(value)) {
          throw new Error("The total number must be a positive integer");
        }
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

taskSchema.virtual("records", {
  ref: "Record",
  localField: "_id",
  foreignField: "task",
});

taskSchema.pre("remove", async function (next) {
  const task = this;
  await Record.deleteMany({ task: task._id });
  next();
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;