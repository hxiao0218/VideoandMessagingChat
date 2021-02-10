/* eslint-disable comma-dangle */
/* eslint-disable quotes */
const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title cannot be left blank"],
    },
    body: {
      type: String,
      required: [true, "Please enter the password"],
    },
    media: {
      type: String,
      default: "",
    },
    mediaType: {
      type: String,
      default: "plain text",
    },
    postedBy: {
      type: ObjectId,
      ref: "User",
    },
    seenBy: [{ type: ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
