//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------
//                                                          REQUIRING FILES
//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const app = express();

//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------
//                                                          MIDDLEWARES
//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------
//                                                          CONNECTING DB
//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------

mongoose
  .connect(process.env.URI)
  .then(() => {
    console.log("db connected");
  })
  .catch((err) => {
    console.log(err);
  });

//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------
//                                                              SCHEMAS
//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------

//USER SCHEMA
//desc@ schema for storing users
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  viewCount: Number,
});

//CODE SCHEMA
//desc@create codes in another schema and store their ids in User schema
const codeSchema = new mongoose.Schema({
  title: String,
  code: String,
  userID: String,
  isPublic: Boolean,
});

//Models for respective schemas
const User = mongoose.model("users", userSchema);
const Code = mongoose.model("codes", codeSchema);

//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------
//                                                          VERIFICATION FUNCTIONS
//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------

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

//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------
//                                                          ROUTES
//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------

//                                                        HOME ROUTE
//@desc:- Test route to check if api is working or not
app.get("/", (req, res) => {
  res.json({ message: "yes the server is up" });
});

//                                                        LOGIN ROUTE

app.post("/login", async (req, res) => {
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
});

//                                                        SIGNUP ROUTE

app.post("/signup", userExists, async (req, res) => {
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
});

//                                                            POSTING CODE

app.post("/codes", verify, (req, res) => {
  Code.find(
    { title: req.body.title, userID: req.user._id },
    function (err, doc) {
      if (!err && doc.length === 0) {
        const title = req.body.title;
        const code = req.body.code;
        const public = req.body.isPublic ? true : false;
        if (title && code) {
          const newCode = new Code({
            title,
            code,
            userID: req.user._id,
            isPublic: public,
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
});

//                                                            DASHBOARD ROUTE
app.get("/profile", verify, (req, res) => {
  res.json({email:req.user.email,username:req.user.username,viewCount:req.user.viewCount,success:true});
});


//                                                             GETTING USER

app.get("/user/:username", async(req, res) => {
  await User.findOneAndUpdate({username :req.params.username}, {$inc : {'viewCount' : 1}});
  User.find({ username: req.params.username },(err, doc) => {
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
});

//                                                             GETTING USER CODE

app.get("/user/:username/id/:codeID", (req, res) => {
  Code.find({ _id: req.params.codeID, isPublic: true }, function (err, doc) {
    if (!err) {
      res.json({ code: doc, success: true });
    } else {
      res.json({ message: err, success: false });
    }
  });
});

//                                                             GETTING ALL CODES
//desc@- Only send title and ids

app.get("/codes", verify, (req, res) => {
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
});

//                                                             GETTING ONE POSTS
//desc@- sends complete info but url looks like - "localhost:4000/codes/idOfTheCode"

app.get("/codes/:id", verify, (req, res) => {
  Code.findOne({ _id: req.params.id }, function (err, doc) {
    if (!err) {
      res.json({ code: doc, success: true });
    }
  });
});

//                                                             DELETING CODE
//desc@- send the id in the url and token in head

app.delete("/codes/:id", verify, (req, res) => {
  Code.deleteOne({ _id: req.params.id }, function (err) {
    if (!err) {
      res.json({ message: "sucessfully deleted", success: true });
    }
  });
});

//                                                             UPDATING CODE
//desc@- send the id in the url and token in head and new data in body

app.put("/codes/:id", verify, (req, res) => {
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
});

app.get("*", (req, res) => {
  res.send("not a valid route");
});

//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------
//                                                          LISTENING AT PORT
//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------

app.listen(process.env.PORT, function () {
  console.log("server running at port " + process.env.PORT);
});
