import User from "../models/userModel.js";

function userExists(req, res, next) {
  if (req.body.username && req.body.email && req.body.password) {
    User.find(
      { $or: [{ email: req.body.email }, { username: req.body.username }] },
      function (err, data) {
        if (data.length === 0) {
          next();
        } else {
          res.json({
            message: "Username or Email already in use",
            isLogin: false,
          });
        }
      }
    );
  } else {
    res.json({ message: "fill the details properly", isLogin: false });
  }
}

export default userExists;
