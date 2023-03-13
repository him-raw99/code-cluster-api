import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

function verify(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.KEY, (err, user) => {
      if (err) {
        res.send("invalid token you damn hecker");
      } else {
        User.findOne({ username: user.username }, function (err, data) {
          if (data) {
            if (data.password === user.password) {
              req.user = data;
              next();
            }
          } else {
            res.send("re-login");
          }
        });
      }
    });
  } else {
    res.send("no token");
  }
}

export default verify;
