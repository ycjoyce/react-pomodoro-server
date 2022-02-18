const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const user = await User.findOne({
      _id: jwt.verify(token, process.env.JWT_SECRET)._id,
      "tokens.token": token
    });
    if (!user) {
      throw new Error();
    }
    req.user = user;
    req.token = token;
    next();
  } catch {
    res.status(401).send({ error: "You're not authorized" });
  }
};

module.exports = auth;