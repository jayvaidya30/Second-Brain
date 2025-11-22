import mongoose, { model, Schema } from "mongoose";

mongoose.connect("mongodb+srv://jayvaidya30:mivuqizBVpvXxegM@cluster0.86xlhas.mongodb.net/SecondBrain"); // test url

const UserSchema = new Schema({
  username: { type: String, unique: true },
  password: String,
});

export const UserModel = model("User", UserSchema);
