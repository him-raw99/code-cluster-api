import mongoose from "mongoose";

const codeSchema = new mongoose.Schema({
  title: String,
  code: String,
  userID: String,
  isPublic: Boolean,
});

const Code = mongoose.model("codes", codeSchema);

export default Code;
