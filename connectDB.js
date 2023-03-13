import mongoose from "mongoose";

function connectDB() {
  mongoose
    .connect(process.env.URI)
    .then(() => {
      console.log("db connected");
    })
    .catch((err) => {
      console.log(err);
    });
}

export default connectDB;
