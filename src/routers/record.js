const express = require("express");
const Record = require("../models/record");
const auth = require("../middlewares/auth");
const Task = require("../models/task");
const { userTwoId, taskOne } = require("../../tests/fixtures/db");

const recordRouter = new express.Router();

// 新增 record
recordRouter.post("/records", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.body.task,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    const record = new Record(req.body);
    await record.save();
    res.status(201).send(record);
  } catch (e) {
    res.status(400).send(e);
  }
});

// 讀取此使用者的所有 record (不分 task)
// GET /records?date=2022-01-01 讀取特定日期的所有 record
recordRouter.get("/records", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user._id });
    const taskRecords = await Promise.all(
      tasks.map((task) => Record.find({ task: task._id }))
    );

    if (req.query.date) {
      const dateArr = req.query.date
        .split("-")
        .map((e, i) => (i !== 1 ? parseInt(e) : parseInt(e) - 1));
      let result = [];
      await Promise.all(
        tasks.map((task) =>
          task.populate({
            path: "records",
            match: { date: new Date(Date.UTC(...dateArr)) },
          })
        )
      );
      tasks.forEach((task) => {
        result = result.concat(task.records);
      });
      return res.send(result);
    }

    res.send(taskRecords.flat());
  } catch (e) {
    res.status(500).send(e);
  }
});

// 讀取特定 task 的 record
recordRouter.get("/records/task/:task", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.task,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    await task.populate("records");
    res.send(task.records);
  } catch {
    res.status(500).send();
  }
});

// 讀取特定 id 的 record
recordRouter.get("/records/:id", auth, async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);
    if (!record) {
      return res.status(404).send();
    }
    const task = await Task.findOne({
      _id: record.task,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    res.send(record);
  } catch {
    res.status(500).send();
  }
});

// 更新特定 id 的 record
recordRouter.patch("/records/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["count"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ errors: "Invalid update" });
  }

  try {
    const record = await Record.findById(req.params.id);
    const task = await Task.findOne({
      _id: record?.task,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    updates.forEach((update) => (record[update] = req.body[update]));
    await record.save();
    res.send(record);
  } catch (e) {
    res.status(400).send(e);
  }
});

// 刪除特定 id 的 record
recordRouter.delete("/records/:id", auth, async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);
    const task = await Task.findOne({
      _id: record?.task,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    record.remove();
    res.send(record);
  } catch {
    res.status(500).send();
  }
});

module.exports = recordRouter;
