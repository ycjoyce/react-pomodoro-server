const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../src/models/user");
const Task = require("../../src/models/task");
const Record = require("../../src/models/record");

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  device: "testdevice1",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  device: "testdevice2",
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),
    },
  ],
};

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  title: "task1",
  completed: false,
  length: 5,
  owner: userOneId,
};

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  title: "task2",
  completed: true,
  length: 10,
  owner: userOneId,
};

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  title: "task3",
  completed: false,
  length: 2,
  owner: userTwoId,
};

const recordOne = {
  _id: new mongoose.Types.ObjectId(),
  task: taskOne._id,
  date: new Date(Date.UTC(2022, 0, 1)),
  count: 2,
};

const recordTwo = {
  _id: new mongoose.Types.ObjectId(),
  task: taskOne._id,
  date: new Date(Date.UTC(2022, 1, 1)),
  count: 5,
};

const recordThree = {
  _id: new mongoose.Types.ObjectId(),
  task: taskTwo._id,
  date: new Date(Date.UTC(2022, 1, 1)),
  count: 4,
};

const setupDatabase = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await Record.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
  await new Record(recordOne).save();
  await new Record(recordTwo).save();
  await new Record(recordThree).save();
};

module.exports = {
  userOne,
  userOneId,
  userTwo,
  userTwoId,
  taskOne,
  taskTwo,
  taskThree,
  recordOne,
  recordTwo,
  recordThree,
  setupDatabase,
};
