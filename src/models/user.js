const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Task = require("./task");

const userSchema = new mongoose.Schema(
  {
    device: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        }
      }
    ],
  },
  {
    timestamps: true,
  },
);

userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.tokens;

  return userObject;
}

const User = mongoose.model("User", userSchema);

module.exports = User;