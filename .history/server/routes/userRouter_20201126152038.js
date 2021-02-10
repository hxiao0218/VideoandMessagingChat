/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongoose').Types;
const User = require('../models/userModel');
const Message = require('../models/messageModel');
const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;

    // validate
    // check if the required fields contain inputs
    if (!username || !password || !confirmPassword) {
      return res.status(400).json({ msg: 'Please enter the required fields' });
    }
    // check the password is of the valid length
    if (password.length < 5) {
      return res
        .status(400)
        .json({ msg: 'Password must contain at least 5 characters' });
    }
    // check if the user has entered the same password twice
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: 'Enter the same password' });
    }
    // check if the username has already been registered
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPw = await bcrypt.hash(password, salt);
    const newUser = new User({
      username,
      password: hashedPw,
    });
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    // validate
    if (!username || !password) {
      return res
        .status(400)
        .json({ msg: 'Please enter username and password ' });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'User does not exist' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ msg: 'Incorrect username or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    // console.log(token);
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (err) {
    // console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/delete', auth, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user);
    res.json(deletedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/tokenIsValid', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.json(false);
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      return res.json(false);
    }

    const user = await User.findById(verified.id);
    if (!user) {
      return res.json(false);
    }
    return res.json(true);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.user);
  res.json({
    username: user.username,
    id: user._id,
  });
});

router.get('/contacts', auth, async (req, res) => {
  const contactList = await User.find({});
  console.log(contactList);
  const newList = contactList.map((contactObj) => (
    {
      username: contactObj.username,
      id: contactObj._id,
    }
  ));
  console.log(newList);
  res.status(200).send(newList);
});

router.get('/messages', auth, async (req, res) => {
  console.log(req);
  console.log(req.params);
  const user = req.params.username;
  const contact = req.params.contactname;
  // console.log('user, contact', user, contact);
  const messages = await Message.aggregate([
    {
      $match: {
        $or:
      [
        { sender: ObjectId(user) },
        { receiver: ObjectId(contact) },
        { sender: ObjectId(contact) },
        { receiver: ObjectId(user) }],
      },
    },
    { $group: { _id: null, count: { $sum: 1 } } },
  ]);
  console.log(messages);
  res.status(200).send(messages);
});

module.exports = router;
