const express = require("express");
const Task = require("../models/task");
const { auth } = require("../middlewares/auth");

const taskRouter = new express.Router();

// 新增 task
taskRouter.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

// 讀取 task
// GET /tasks?completed=true
// GET /tasks?limit=2
// GET /tasks?limit=2&skip=1
// GET /tasks?sortBy=createdAt:asc
taskRouter.get("/tasks", auth, async (req, res) => {
  const match = {};
  const options = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.limit) {
    options.limit = parseInt(req.query.limit);
  }

  if (req.query.skip) {
    options.skip = parseInt(req.query.skip);
  }

  if (req.query.sortBy) {
    const [field, type] = req.query.sortBy.split(":");
    sort[field] = type === "desc" ? -1 : 1;
    options.sort = sort;
  }

  try {
    await req.user.populate({
      path: "tasks",
      match,
      options,
    });
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

// 讀取指定 id 的 task
taskRouter.get("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch {
    res.status(500).send();
  }
});

// 更新 task
taskRouter.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["title", "completed", "length"];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ errors: "Invalid update" });
  }

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    updates.forEach((update) => task[update] = req.body[update]);
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

// 刪除 task
taskRouter.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch {
    res.status(500).send();
  }
});

module.exports = taskRouter;