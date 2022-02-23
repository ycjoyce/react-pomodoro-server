const express = require("express");
const Ringtone = require("../models/ringtone");
const { auth, adminAuth } = require("../middlewares/auth");

const ringtoneRouter = new express.Router();

// 新增鈴聲到資料庫
ringtoneRouter.post("/ringtones", adminAuth, async (req, res) => {
  try {
    const ringtone = new Ringtone(req.body);
    await ringtone.save();
    res.status(201).send(ringtone);
  } catch (e) {
    res.status(400).send(e);
  }
});

// 設定該使用者的鈴聲
ringtoneRouter.post("/ringtones/me", auth, async (req, res) => {
  try {
    const { type, id } = req.body;
    const ringtone = await Ringtone.findOne({
      type,
      _id: id,
    });
    if (!ringtone) {
      return res.status(404).send();
    }
    req.user.ringtones[type] = id;
    await req.user.save();
    res.send(req.user.ringtones);
  } catch {
    res.status(400).send();
  }
});

// 取得該使用者的鈴聲設定
ringtoneRouter.get("/ringtones/me", auth, async (req, res) => {
  try {
    res.send(req.user.ringtones);
  } catch {
    res.status(500).send();
  }
});

// 取得資料庫中的鈴聲
// GET /ringtones
// GET /ringtones?type=work
ringtoneRouter.get("/ringtones", auth, async (req, res) => {
  try {
    const match = {};
    if (req.query.type) {
      match.type = req.query.type;
    }
    const ringtones = await Ringtone.find(match);
    res.send(ringtones);
  } catch {
    res.status(500).send();
  }
});

// 取得特定鈴聲
ringtoneRouter.get("/ringtones/:id", auth, async (req, res) => {
  try {
    const ringtone = await Ringtone.findById(req.params.id);
    if (!ringtone) {
      return res.status(404).send();
    }
    res.send(ringtone);
  } catch {
    res.status(500).send();
  }
});

// 更新資料庫中的鈴聲
ringtoneRouter.patch("/ringtones/:id", adminAuth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["title", "audio", "type"];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ errors: "Invalid update" });
  }

  try {
    const ringtone = await Ringtone.findById(req.params.id);
    if (!ringtone) {
      return res.status(404).send();
    }
    updates.forEach((update) => ringtone[update] = req.body[update]);
    await ringtone.save();
    res.send(ringtone);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = ringtoneRouter;