const express = require("express");
const Record = require("../models/record");

const recordRouter = new express.Router();

// 新增 record
recordRouter.post("/records", async (req, res) => {
  try {
    const record = new Record(req.body);
    await record.save();
    res.status(201).send(record);
  } catch (e) {
    res.status(400).send(e);
  }
});

// 讀取所有 record
recordRouter.get("/records", async (req, res) => {
  try {
    if (req.query.date) {
      // 讀取特定日期的 record
      return res.send(await Record.find({ date: new Date(req.query.date) }));
    }
    const records = await Record.find({});
    res.send(records);
  } catch (e) {
    res.status(500).send(e);
  }
});

// 讀取特定 id 的 record
recordRouter.get("/records/:id", async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);
    if (!record) {
      return res.status(404).send();
    }
    res.send(record);
  } catch {
    res.status(500).send();
  }
});

// 更新特定 id 的 record 的 count
recordRouter.patch("/records/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["count"];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ errors: "Invalid update" });
  }

  try {
    const record = await Record.findById(req.params.id);
    if (!record) {
      return res.status(404).send();
    }
    updates.forEach((update) => record[update] = req.body[update]);
    await record.save();
    res.send(record);
  } catch (e) {
    res.status(400).send(e);
  }
});

// 刪除特定 id 的 record
recordRouter.delete("/records/:id", async (req, res) => {
  try {
    const record = await Record.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).send();
    }
    res.send(record);
  } catch {
    res.status(500).send();
  }
});

module.exports = recordRouter;