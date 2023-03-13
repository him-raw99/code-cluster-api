import Code from "../models/codeModel.js";

export const getAllCodes = (req, res) => {
  Code.find({ userID: req.user._id }, function (err, doc) {
    if (!err) {
      const data = doc;
      data.forEach((code) => {
        code.code = code.code.slice(0, 150) + "...";
      });
      res.json({ codes: data, success: true });
    } else {
      console.log(err);
    }
  }).select({ userID: 0 });
};

export const postCode = (req, res) => {
  Code.find(
    { title: req.body.title, userID: req.user._id },
    function (err, doc) {
      if (!err && doc.length === 0) {
        const title = req.body.title;
        const code = req.body.code;
        const Public = req.body.isPublic ? true : false;
        if (title && code) {
          const newCode = new Code({
            title,
            code,
            userID: req.user._id,
            isPublic: Public,
          });
          newCode.save();
          res.json({ message: "saved successfully", success: true });
        } else {
          res.json({ message: "fill the details again", success: false });
        }
      } else {
        res.json({ message: "change the title", success: false });
      }
    }
  );
};

export const getOneCode = (req, res) => {
  Code.findOne({ _id: req.params.id }, function (err, doc) {
    if (!err) {
      res.json({ code: doc, success: true });
    }
  });
};

export const deleteCode = (req, res) => {
  Code.deleteOne({ _id: req.params.id }, function (err) {
    if (!err) {
      res.json({ message: "sucessfully deleted", success: true });
    }
  });
};

export const updateCode = (req, res) => {
  if (req.body.title && req.body.code) {
    Code.find(
      { title: req.body.title, userID: req.user._id },
      function (err, doc) {
        if (
          !err &&
          (doc.length < 1 || (doc.length === 1 && doc[0]._id == req.params.id))
        ) {
          Code.updateOne(
            { _id: req.params.id },
            {
              title: req.body.title,
              code: req.body.code,
              isPublic: req.body.isPublic,
            },
            function (err) {
              if (!err) {
                res.json({ message: "update sucessfull", success: true });
              }
            }
          );
        } else {
          res.json({ message: "change the title", success: false });
        }
      }
    );
  } else {
    res.json({ message: "form empty", success: false });
  }
};
