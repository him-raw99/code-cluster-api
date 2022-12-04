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
const app = express();

//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------
//                                                          MIDDLEWARES
//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var flag = 0;
//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------
//                                                          CONNECTING DB
//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------


mongoose.connect(process.env.URI).then(() => {
    console.log("db connected");
    flag=1;
}).catch(()=>{
    flag=0;
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
    password: String
})

//CODE SCHEMA
//desc@create codes in another schema and store their ids in User schema
const codeSchema = new mongoose.Schema({
    title: String,
    code: String,
    userID: String,
    isPublic: Boolean
})

//Models for respective schemas
const User = mongoose.model("users", userSchema);
const Code = mongoose.model("codes", codeSchema);

//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------
//                                                  (CODE TO ADD DATA IN DB MANUALLY)
//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------


// const sampleUser = new User({
//     username:"himanshu",
//     password:"password"
// });

// sampleUser.save();



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
            }
            else {
                User.findOne({ username: user.username }, function (err, data) {
                    if (data) {
                        if (data.password === user.password) {
                            req.user = data;
                            next();
                        }
                    }
                    else {
                        res.send("re-login");
                    }
                })
            }
        });
    }
    else {
        res.send("no token");
    }
}



//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------
//                                                          ROUTES
//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------

//                                                        HOME ROUTE
//@desc:- Test route
app.get("/",(req,res)=>{
    if(flag===1){
        res.send("yes the server is up");
    }
    else if (flag===0){
        res.send("server up but not connected to db");
    }
})

//                                                        LOGIN ROUTE

app.post("/login", (req, res) => {
    User.findOne({ username: req.body.username }, function (err, data) {
        if (data) {
            if (data.password === req.body.password) {
                const accessToken = jwt.sign({ username: req.body.username, password: req.body.password }, process.env.KEY);
                res.json({ token: accessToken, message: "logged in successfully" });
            }
            else {
                res.json({ message: "username or password wrong" });
            }
        }
        else {
            res.json({ message: "username or password wrong" });
        }
    })
})


//                                                        SIGNUP ROUTE

app.post("/signup", (req, res) => {
    User.findOne({ username: req.body.username }, function (err, data) {
        if (!err) {
            if (!data && req.body.username) {
                const newUser = new User({
                    username: req.body.username,
                    password: req.body.password
                })
                newUser.save();
                const accessToken = jwt.sign({ username: newUser.username, password: newUser.password }, process.env.KEY);
                res.json({ message: "User created", token: accessToken });
            }
            else {
                res.send("username already taken");
            }
        }
        else {
            res.send(err);
        }
    })
})




//                                                            POSTING CODE 

app.post("/newpost", verify, (req, res) => {
    Code.find({ title: req.body.title, userID: req.user._id }, function (err, doc) {
        if (!err && doc.length === 0) {
            const title = req.body.title;
            const code = req.body.code;
            const public = req.body.isPublic === "true" ? true : false;
            if (title && code) {
                const newCode = new Code({
                    title, code,
                    userID: req.user._id,
                    isPublic: public
                });
                newCode.save();
                res.send("saved successfully");
            }
            else {
                res.send("fill the details again");
            }
        }
        else {
            res.json({ message: "change the title" });
        }
    })
})


//                                                             GETTING USER

app.get("/user/:username", verify, (req, res) => {
    User.find({ username: req.params.username }, function (err, doc) {
        if (!err) {
            const userID = doc[0]._id;
            Code.find({ userID: userID, isPublic: true }, function (err, doc) {
                if (!err) {
                    res.send(doc);
                }
            }).select({ code: 0, userID: 0 });
        }
    });
})
//                                                             GETTING USER CODE

app.get("/user/:username/:codeID", verify, (req, res) => {
    Code.find({ _id: req.params.codeID, isPublic: true }, function (err, doc) {
        if (!err) {
            res.send(doc);
        }
    })
})

//                                                             GETTING ALL POSTS
//desc@- Only send title and ids

app.get("/codes", verify, (req, res) => {
    Code.find({ userID: req.user._id }, function (err, doc) {
        if (!err) {
            res.send(doc);
        }
        else {
            console.log(err);
        }
    }).select({ code: 0, userID: 0 });
})


//                                                             GETTING ONE POSTS
//desc@- sends complete info but url looks like - "localhost:4000/codes/idOfTheCode"

app.get("/codes/:id", verify, (req, res) => {
    Code.findOne({ _id: req.params.id }, function (err, doc) {
        if (!err) {
            res.send(doc);
        }
    })
})

//                                                             DELETING CODE
//desc@- send the id in the url and token in head

app.delete("/codes/:id", verify, (req, res) => {
    Code.deleteOne({ _id: req.params.id }, function (err) {
        if (!err) {
            res.send("sucessfully deleted");
        }
    })
})

//                                                             UPDATING CODE
//desc@- send the id in the url and token in head and new data in body

app.put("/codes/:id", verify, (req, res) => {
    if (req.body.title || req.body.code) {
        Code.find({ title: req.body.title, userID: req.user._id }, function (err, doc) {
            if (!err && doc.length <= 1) {
                Code.updateOne({ _id: req.params.id }, { title: req.body.title, code: req.body.code, isPublic: req.body.isPublic }, function (err) {
                    if (!err) {
                        res.send("update sucessfull");
                    }
                })
            }
            else {
                res.json({ message: "change the title" });
            }
        })
    }
    else {
        res.send("body is empty");
    }

})



//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------
//                                                          LISTENING AT PORT
//--------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------


app.listen(process.env.PORT, function () {
    console.log("server running at port " + process.env.PORT);
})