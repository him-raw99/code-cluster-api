import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const login = async (req, res) => {
  User.findOne({ username: req.body.username }, async (err, data) => {
    if (data) {
      const pass = await bcrypt.compare(req.body.password, data.password);
      if (pass) {
        const accessToken = jwt.sign(
          { username: req.body.username, password: data.password },
          process.env.KEY
        );
        res.json({
          token: accessToken,
          message: "logged in successfully",
          isLogin: true,
        });
      } else {
        res.json({ message: "username or password wrong", isLogin: false });
      }
    } else {
      res.json({ message: "username or password wrong", isLogin: false });
    }
  });
};

export const signup = async (req, res) => {
  const pass = await bcrypt.hash(req.body.password, 10);
  const newUser = new User({
    username: req.body.username,
    password: pass,
    email: req.body.email,
    viewCount: 0,
  });
  console.log(pass);
  newUser.save();
  const accessToken = jwt.sign(
    { username: newUser.username, password: newUser.password },
    process.env.KEY
  );
  res.json({ message: "User created", token: accessToken, isLogin: true });
};
