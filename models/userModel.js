import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  viewCount: Number,
});

const User = mongoose.model("users", userSchema);

export default User;
