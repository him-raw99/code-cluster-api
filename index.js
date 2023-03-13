import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./connectDB.js";
import homeRoute from "./routes/homeRoute.js";
import loginRoute from "./routes/loginRoute.js";
import signUpRoute from "./routes/signUpRoute.js";
import codeRoute from "./routes/codesRoute.js";
import userRoute from "./routes/userRoute.js";
import profileRoute from "./routes/profileRoute.js";
import invalidRoute from "./routes/invalidRoute.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use("/", homeRoute);
app.use("/login", loginRoute);
app.use("/signup", signUpRoute);
app.use("/codes", codeRoute);
app.use("/user", userRoute);
app.use("/profile", profileRoute);
app.use("*", invalidRoute);

app.listen(process.env.PORT, function () {
  console.log("server running at port " + process.env.PORT);
});
