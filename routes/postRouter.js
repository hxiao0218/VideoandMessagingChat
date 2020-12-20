/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable object-curly-newline */
/* eslint-disable quotes */
/* eslint-disable consistent-return */
const router = require("express").Router();
const Post = require("../models/postModel");
const auth = require("../middleware/auth");
const User = require("../models/userModel");

router.post("/createPost", auth, async (req, res) => {
  const { title, body, url, mediaType } = req.body;
  let newPost;
  // if (req.body.media !== "") {
  //   media = req.body.media;
  // }
  if (!title || !body) {
    return res.status(422).json({ msg: "Title and body cannot be left blank" });
  }
  const user = await User.findById(req.user);
  // TODO: the response shows the password
  if (url !== "") {
    newPost = new Post({
      title,
      body,
      media: url,
      mediaType,
      postedBy: user,
    });
  } else {
    newPost = new Post({
      title,
      body,
      mediaType,
      postedBy: user,
    });
  }
  newPost
    .save()
    .then((result) => {
      res.json({ post: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

// router.get("/allPosts", auth, (req, res) => {
//   // TODO: add {postedBy: {$in: }} to ensure the author is my contacts
//   Post.find({ seen: false })
//     .sort({ createdAt: -1 })
//     .populate("postedBy", "_id username")
//     .then((posts) => {
//       // posts.forEach(async (post) => {
//       //   await post.updateOne({ seen: true });
//       // });
//       res.json({ posts });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });
router.get("/allPosts", auth, async (req, res) => {
  const user = await User.findById(req.user);
  console.log(user);
  Post.find({
    $and: [{ seenBy: { $ne: user._id } }, { postedBy: { $in: user.contacts } }],
  })
    .sort({ createdAt: -1 })
    .populate("postedBy", "_id username")
    .then((posts) => {
      posts.forEach(async (post) => {
        await post.updateOne({
          $push: { seenBy: user._id },
        });
      });
      res.json({ posts });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/myPosts", auth, async (req, res) => {
  const user = await User.findById(req.user);
  Post.find({ postedBy: user._id })
    .populate("postedBy", "_id username")
    .then((posts) => {
      res.json({ posts });
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(400)
        .json({ error: "User with this email does not exist." });
    });
});

module.exports = router;
