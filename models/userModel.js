/* eslint-disable comma-dangle */
/* eslint-disable quotes */
const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: [true, "username cannot be left blank"],
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: [true, "Please enter the password"],
      minlength: 5,
    },
    resetLink: {
      data: String,
      default: "",
    },
    contacts: [{ type: ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
