/* eslint-disable max-len */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongoose').Types;
const { ObjectID } = require('mongodb');
const User = require('../models/userModel');
const Message = require('../models/messageModel');
const Contact = require('../models/contactModel');
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

// delete user/deactive
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
  const user = req.query.username;
  console.log(user);
  // const contactList = await Contact.find({
  //   $or: [
  //     { user1: ObjectId(user) },
  //     { user2: ObjectId(user) },
  //   ],
  // });
  const contactList = await Contact.aggregate([
    {
      $match: {
        $or:
        [{
          user1: ObjectId(user),
        }, {
          user2: ObjectId(user),
        }],
      },
    },
    {
      $lookup:
      {
        from: 'users',
        localField: 'user1',
        foreignField: '_id',
        as: 'fromUsers1',
      },
    },
    {
      $lookup:
      {
        from: 'users',
        localField: 'user2',
        foreignField: '_id',
        as: 'fromUsers2',
      },
    },
  ]);
  console.log('contact list is:', contactList);
  const newList = contactList.map((contactObj) => {
    const userContact = (String(contactObj.user1) === user) ? contactObj.user2 : contactObj.user1;
    const nickname = (String(contactObj.user1) === user)
      ? contactObj.fromUsers2[0].username
      : contactObj.fromUsers1[0].username;
    console.log(userContact, nickname);
    const finalObj = {
      username: nickname,
      id: userContact,
      sid: contactObj.conversationSID,
      cid: contactObj._id,
    };
    return finalObj;
  });
  console.log(newList);
  res.status(200).send(newList);
});

router.get('/messages', auth, async (req, res) => {
  console.log('fetch text messages in the back end');
  const user = req.query.username;
  const contact = req.query.contactname;
  // console.log('user, contact', user, contact);
  const messages = await Message.aggregate([
    {
      $match: {
        $or:
      [
        {
          $and: [
            { sender: ObjectId(user) },
            { receiver: ObjectID(contact) },
          ],
        },
        {
          $and: [
            { sender: ObjectId(contact) },
            { receiver: ObjectID(user) },
          ],
        },
      ],
      },
    },
    // { $group: { _id: null, count: { $sum: 1 } } },
  ]);
  console.log(messages);
  res.status(200).send(messages);
});

router.post('/message', auth, async (req, res) => {
  const { to, from, message } = req.body;
  if (!to || !from || !message) {
    return res.status(400).json({ msg: 'Please enter the required fields' });
  }
  const newMessage = new Message({
    sender: ObjectId(from),
    receiver: ObjectId(to),
    type: 'text',
    content: message,
    delivered: false,
    read: false,
  });
  try {
    const savedMessage = newMessage.save();
    res.json(savedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/messages', auth, async (req, res) => {
  const user = req.query.username;
  const contact = req.query.contactname;
  // console.log('user, contact', user, contact);
  const messages = await Message.remove({ sender: ObjectId(user), receiver: ObjectId(contact) });
  console.log(messages);
  res.status(200).send(messages);
});

// router.get('/allusers', async (req, res) => {
//   try {
//     // validate
//     const users = await User.distinct('username');
//     console.log(users);
//     if (!users) {
//       return res.status(400).json({ msg: 'find all users failed' });
//     }
//     res.status(200).send(users);
//   } catch (err) {
//     // console.log(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// delete contact
router.delete('/unfriend', auth, async (req, res) => {
  const user = req.query.username;
  const contact = req.query.contactname;
  // console.log('user, contact', user, contact);
  const unfriend = await Contact.remove(
    { $or: [{ user1: ObjectId(user), user2: ObjectId(contact) }, { user1: ObjectId(contact), user2: ObjectId(user) }] },
  );
  console.log(unfriend);
  res.status(200).send(unfriend);
});

// delete whole conversation
router.delete('/conversation', auth, async (req, res) => {
  const user = req.query.username;
  const contact = req.query.contactname;
  // console.log('user, contact', user, contact);
  const messages = await Message.remove(
    { $or: [{ sender: ObjectId(user), receiver: ObjectId(contact) }, { sender: ObjectId(contact), receiver: ObjectId(user) }] },
  );
  console.log('conversation removed backend----->', user, contact, messages);
  res.status(200).send(messages);
});

// delete one message
router.delete('/onemessage', auth, async (req, res) => {
  const user = req.query.username;
  const contact = req.query.contactname;
  const messagecontent1 = req.query.messagecontent;
  console.log('user, contact, messagecontent in delete one message->>>>>', user, contact, messagecontent1);
  const messages = await Message.remove(
    { $or: [{ sender: ObjectId(user), receiver: ObjectId(contact), content: messagecontent1 }, { sender: ObjectId(contact), receiver: ObjectId(user), content: messagecontent1 }] },
  );
  console.log('message removed backend----->', messages);
  res.status(200).send(messages);
});

// add a contact
router.get('/addfriend', auth, async (req, res) => {
  const user = req.query.username;
  const contact = req.query.contactname;
  // console.log('user, contact', user, contact);
  const newContact = new Contact({
    user1: ObjectId(user),
    user2: ObjectId(contact),
    conversationSID: '',
  });
  console.log('back end add friend api');
  try {
    const savedContact = newContact.save();
    console.log('back end add contact success!');
    res.json(savedContact);
  } catch (error) {
    console.log('back end add contact failed');
    res.status(500).json({ error: error.message });
  }
});

// await Contact.find(
//   { $or: [{ user1: ObjectId(userContact), user2: ObjectId(user) }, { user1: ObjectId(user), user2: ObjectId(userContact) }] },
// ).count()==0;

router.get('/getAllUsers', auth, async (req, res) => {
  console.log('getallusers backend inside');
  const user = req.query.username;
  const contactList = await User.find({ _id: { $ne: ObjectID(user) } });
  console.log('all users list is:', contactList);
  const newList = contactList.map((contactObj) => {
    const userContact = String(contactObj._id);
    const nickname = String(contactObj.username);
    console.log(userContact, nickname);
    const finalObj = {
      username: nickname,
      id: userContact,
    };
    return finalObj;
  });
  // const contactList = await User.aggregate([
  //   {
  //     $match: {
  //       $or:
  //       [{
  //         user1: ObjectId(user),
  //       }, {
  //         user2: ObjectId(user),
  //       }],
  //     },
  //   },
  //   {
  //     $lookup:
  //     {
  //       from: 'users',
  //       localField: 'user1',
  //       foreignField: '_id',
  //       as: 'fromUsers1',
  //     },
  //   },
  //   {
  //     $lookup:
  //     {
  //       from: 'users',
  //       localField: 'user2',
  //       foreignField: '_id',
  //       as: 'fromUsers2',
  //     },
  //   },
  // ]);
  // console.log('contact list is:', contactList);
  // const newList = contactList.map((contactObj) => {
  //   const userContact = (String(contactObj.user1) === user) ? contactObj.user2 : contactObj.user1;
  //   const nickname = (String(contactObj.user1) === user)
  //     ? contactObj.fromUsers2[0].username
  //     : contactObj.fromUsers1[0].username;
  //   console.log(userContact, nickname);
  //   const finalObj = {
  //     username: nickname,
  //     id: userContact,
  //     sid: contactObj.conversationSID,
  //     cid: contactObj._id,
  //   };
  //   return finalObj;
  // });
  console.log(newList);
  res.status(200).send(newList);
});

// get the friend list of a user
router.get('/friendlist', auth, async (req, res) => {
  const user = req.query.username;
  console.log('get friendlist backend');
  // const contactList = await Contact.find({
  //   $or: [
  //     { user1: ObjectId(user) },
  //     { user2: ObjectId(user) },
  //   ],
  // });
  const contactList = await Contact.aggregate([
    {
      $match: {
        $or:
        [{
          user1: ObjectId(user),
        }, {
          user2: ObjectId(user),
        }],
      },
    },
    {
      $lookup:
      {
        from: 'users',
        localField: 'user1',
        foreignField: '_id',
        as: 'fromUsers1',
      },
    },
    {
      $lookup:
      {
        from: 'users',
        localField: 'user2',
        foreignField: '_id',
        as: 'fromUsers2',
      },
    },
  ]);
  const newList = contactList.map((contactObj) => {
    const userContact = (String(contactObj.user1) === user) ? contactObj.user2 : contactObj.user1;
    const nickname = (String(contactObj.user1) === user)
      ? contactObj.fromUsers2[0].username
      : contactObj.fromUsers1[0].username;
    console.log(userContact, nickname);
    const finalObj = nickname;
    return finalObj;
  });
  console.log('get friend list successfully', newList);
  res.status(200).send(newList);
});

router.get('/setconversationidnull', async (req, res) => {
  console.log('set conversation id to null in backend');
  const cid = req.query.contactcid;
  // console.log('user, contact', user, contact);
  const makeitnull = await Contact.updateOne(
    { _id: ObjectId(cid) }, { conversationSID: '' },
  );
  console.log('reset conversation id to null in back end ', makeitnull);
  res.status(200).send(makeitnull);
});
module.exports = router;
