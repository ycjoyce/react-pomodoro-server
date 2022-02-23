const express = require("express");
const cors = require("cors");
require("./db/mongoose");
const taskRouter = require("./routers/task");
const recordRouter = require("./routers/record");
const userRouter = require("./routers/user");
const ringtoneRouter = require("./routers/ringtone");

const app = express();

// const allowedList = ["http://127.0.0.1:3001"];
const corsOptions = {
  // origin(origin, callback) {
  //   if (allowedList.includes(origin)) {
  //     return callback(null, true);
  //   }
  //   return callback(new Error());
  // },
  origin: true,
  methods: ["GET", "POST", "PATCH", "DELETE"]
};

app.use(express.json());

app.use(cors(corsOptions));

app.use(taskRouter);
app.use(recordRouter);
app.use(userRouter);
app.use(ringtoneRouter);

module.exports = app;