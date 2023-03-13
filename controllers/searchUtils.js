import User from "../models/userModel.js";
import Code from "../models/codeModel.js";

export const searchUser = async (req, res) => {
  await User.findOneAndUpdate(
    { username: req.params.username },
    { $inc: { viewCount: 1 } }
  );
  User.find({ username: req.params.username }, (err, doc) => {
    if (!err && doc.length != 0) {
      const userID = doc[0]._id;
      Code.find({ userID: userID, isPublic: true }, function (err, doc) {
        if (!err) {
          const data = doc;
          data.forEach((code) => {
            code.code = code.code.slice(0, 150) + "...";
          });
          res.json({ codes: data, success: true });
        }
      }).select({ isPublic: 0, userID: 0 });
    } else if (doc.length === 0) {
      res.json({
        message: "user not found check the username again",
        success: false,
      });
    }
  });
};

export const searchUserCode = (req, res) => {
  Code.find({ _id: req.params.codeID, isPublic: true }, function (err, doc) {
    if (!err) {
      res.json({ code: doc[0], success: true });
    } else {
      res.json({ message: err, success: false });
    }
  });
};
