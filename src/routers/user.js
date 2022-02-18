const express = require("express");
const User = require("../models/user");
const auth = require("../middlewares/auth");

const userRouter = new express.Router();

// 新增使用者
userRouter.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// 登入使用者
userRouter.post("/users/login", async (req, res) => {
  try {
    const user = await User.findOne({ device: req.body.device });
    if (!user) {
      throw new Error("Unable to login");
    }
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// 登出使用者
userRouter.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
    await req.user.save();
    res.send();
  } catch {
    res.status(500).send();
  }
})

module.exports = userRouter;