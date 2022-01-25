const express = require("express");
require("./src/db/mongoose");
const taskRouter = require("./src/routers/task");
const recordRouter = require("./src/routers/record");

const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use(taskRouter);
app.use(recordRouter);

app.listen(port, () => {
  console.log(`Server start up on port ${port}`);
})