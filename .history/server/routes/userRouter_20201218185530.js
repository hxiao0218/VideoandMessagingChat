/* eslint-disable no-else-return */
/* eslint-disable object-curly-newline */
/* eslint-disable no-unused-vars */
/* eslint-disable operator-linebreak */
/* eslint-disable no-shadow */
/* eslint-disable comma-dangle */
/* eslint-disable quotes */
/* eslint-disable max-len */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongoose").Types;
const { ObjectID } = require("mongodb");
const mailgun = require("mailgun-js");
const redis = require("redis");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const User = require("../models/userModel");
const Message = require("../models/messageModel");
const Contact = require("../models/contactModel");
const auth = require("../middleware/auth");

const DOMAIN = "sandbox69ea79e0299949be9cbbafac8db9a415.mailgun.org";
const mg = mailgun({ apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN });
const redisClient = redis.createClient(process.env.REDISCLOUD_URL, {
  enable_offline_queue: false,
  no_ready_check: true,
});

const maxConsecutiveFailsByUsername = 3;

const limiterConsecutiveFailsByUsername = new RateLimiterRedis({
  redis: redisClient,
  keyPrefix: "login_fail_consecutive_username",
  points: maxConsecutiveFailsByUsername,
  duration: 60 * 60 * 3, // Store number for three hours since first fail
  blockDuration: 60 * 15, // Block for 30 minutes
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // validate
    // check if the required fields contain inputs
    if (!email || !username || !password || !confirmPassword) {
      return res.status(400).json({ msg: "Please enter the required fields" });
    }
    // check the password is of the valid length
    if (password.length < 5) {
      return res
        .status(400)
        .json({ msg: "Password must contain at least 5 characters" });
    }
    // check if the user has entered the same password twice
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Enter the same password" });
    }
    // check if the username has already been registered
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }
    // check if the email has already been used
    const usedEmail = await User.findOne({ email });
    if (usedEmail) {
      return res.status(400).json({ msg: "This email has already been used" });
    }

    const data = {
      from: "noreply@ChatApp.com",
      to: email,
      subject: "Welcome!",
      text: "Welcome to the chat app!",
    };
    mg.messages().send(data, (error, body) => {
      if (error) {
        return res.json({ error: error.message });
      }
      console.log(body);
      // return res.json({ message: "Email has been sent to your email." });
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPw = await bcrypt.hash(password, salt);
    const newUser = new User({
      username,
      email,
      password: hashedPw,
    });
    const savedUser = await newUser.save();
    const self = await User.findById(savedUser._id);
    const add = await User.findByIdAndUpdate(
      self._id,
      {
        $push: { contacts: self._id },
      },
      { new: true }
    );
    console.log(add);
    res.json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// router.post("/register", async (req, res) => {
//   try {
//     const { username, password, confirmPassword } = req.body;

//     // validate
//     // check if the required fields contain inputs
//     if (!username || !password || !confirmPassword) {
//       return res.status(400).json({ msg: "Please enter the required fields" });
//     }
//     // check the password is of the valid length
//     if (password.length < 5) {
//       return res
//         .status(400)
//         .json({ msg: "Password must contain at least 5 characters" });
//     }
//     // check if the user has entered the same password twice
//     if (password !== confirmPassword) {
//       return res.status(400).json({ msg: "Enter the same password" });
//     }
//     // check if the username has already been registered
//     const existingUser = await User.findOne({ username });
//     if (existingUser) {
//       return res.status(400).json({ msg: "User already exists" });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPw = await bcrypt.hash(password, salt);
//     const newUser = new User({
//       username,
//       password: hashedPw,
//     });
// const savedUser = await newUser.save();
// const self = await User.findById(savedUser._id);
// console.log(self);
// const add = await User.findByIdAndUpdate(
//   self._id,
//   {
//     $push: { contacts: self._id },
//   },
//   { new: true }
// )
//   .select("-password")
//   .then((result) => {
//     res.json(result);
//   })
//   .catch((err) => res.status(422).json({ error: err }));
// res.json(savedUser);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const rlResUsername = await limiterConsecutiveFailsByUsername.get(username);
    // validate
    if (!username || !password) {
      return res
        .status(400)
        .json({ msg: "Please enter username and password " });
    }
    if (
      rlResUsername !== null &&
      rlResUsername.consumedPoints >= maxConsecutiveFailsByUsername
    ) {
      const retrySecs = Math.round(rlResUsername.msBeforeNext / 60000) || 1;
      res.set("Retry-After", String(retrySecs));
      return res.status(429).json({
        msg: `Too Many Unsuccessful Attempts. Please Retry after ${retrySecs} minutes`,
      });
    } else {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ msg: "User does not exist" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        try {
          await limiterConsecutiveFailsByUsername.consume(username);
          const {
            remainingPoints,
          } = await limiterConsecutiveFailsByUsername.get(username);
          return res.status(400).json({
            msg: `Incorrect username or password. ${remainingPoints} Attempts left`,
          });
        } catch (rlRejected) {
          if (rlRejected instanceof Error) {
            throw rlRejected;
          } else {
            res.set(
              "Retry-After",
              String(Math.round(rlRejected.msBeforeNext / 60000)) || 1
            );
            return res.status(429).json({
              // eslint-disable-next-line no-undef
              msg: `Too Many Unsuccessful Attempts. Please Retry after ${retrySecs} minutes`,
            });
          }
        }
      }
      if (user) {
        if (rlResUsername !== null && rlResUsername.consumedPoints > 0) {
          // Reset on successful authorisation
          await limiterConsecutiveFailsByUsername.delete(username);
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({
          token,
          user: {
            id: user._id,
            username: user.username,
            contacts: user.contacts,
          },
        });
      }
    }
  } catch (err) {
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

router.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
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

router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user);
  res.json({
    username: user.username,
    id: user._id,
  });
});


router.get('/contacts', auth, async (req, res) => {
  const user = req.query.username;
  // console.log(user);
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
    {
      $sort: {
        updatedAt: -1,
      },
    },
  ]);
  console.log('[contactList]', contactList);
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

router.get("/messages", auth, async (req, res) => {
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
  // update messages' read status
  try {
    const readMessages = Promise.all((messages).map(async (msg) => {
      if (msg.sender === user) {
        console.log('[sender === user]', user);
        return null;
      }
      const newMessage = await Message.updateOne({ _id: ObjectId(msg._id) }, {
        read: true,
        delivered: true,
      });
      // console.log('newMessage', newMessage);
      return newMessage;
    }));
    console.log(readMessages);
  } catch (error) {
    console.log(error);
  }
  res.status(200).send(messages);
});

router.post('/message', auth, async (req, res) => {
  const {
    to, from, message, id,
  } = req.body;
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
    const newContact = await Contact.updateOne({ _id: ObjectId(id) }, {
      $inc: {
        numMessages: 1,
      },
    });
    console.log('newContact', newContact);
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
router.delete("/onemessage", auth, async (req, res) => {
  const user = req.query.username;
  const contact = req.query.contactname;
  const messagecontent1 = req.query.messagecontent;
  console.log(
    "user, contact, messagecontent in delete one message->>>>>",
    user,
    contact,
    messagecontent1
  );
  const messages = await Message.remove({
    $or: [
      {
        sender: ObjectId(user),
        receiver: ObjectId(contact),
        content: messagecontent1,
      },
      {
        sender: ObjectId(contact),
        receiver: ObjectId(user),
        content: messagecontent1,
      },
    ],
  });
  console.log("message removed backend----->", messages);
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
  await User.findByIdAndUpdate(
    ObjectID(user),
    {
      $push: { contacts: ObjectID(contact) },
    },
    { new: true },
    (err, res) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
    }
  );
  await User.findByIdAndUpdate(
    ObjectID(contact),
    {
      $push: { contacts: ObjectID(user) },
    },
    { new: true },
    (err, res) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
    }
  );
  console.log("back end add friend api");
  try {
    const savedContact = newContact.save();
    console.log("back end add contact success!");
    res.json(savedContact);
  } catch (error) {
    console.log("back end add contact failed");
    res.status(500).json({ error: error.message });
  }
});

router.delete("/unfriend", auth, async (req, res) => {
  const user = req.query.username;
  const contact = req.query.contactname;
  // console.log('user, contact', user, contact);
  await User.findByIdAndUpdate(
    ObjectID(user),
    {
      $pull: { contacts: ObjectID(contact) },
    },
    { new: true },
    (err, res) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
    }
  );
  await User.findByIdAndUpdate(
    ObjectID(contact),
    {
      $pull: { contacts: ObjectID(user) },
    },
    { new: true },
    (err, res) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
    }
  );
  const unfriend = await Contact.remove({
    $or: [
      { user1: ObjectId(user), user2: ObjectId(contact) },
      { user1: ObjectId(contact), user2: ObjectId(user) },
    ],
  });
  console.log(unfriend);
  res.status(200).send(unfriend);
});

router.get("/getAllUsers", auth, async (req, res) => {
  console.log("getallusers backend inside");
  const user = req.query.username;
  const contactList = await User.find({ _id: { $ne: ObjectID(user) } });
  console.log("all users list is:", contactList);
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
  console.log(newList);
  res.status(200).send(newList);
});

// get the friend list of a user
router.get('/friendlist', auth, async (req, res) => {
  const user = req.query.username;
  console.log('get friendlist backend');
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

router.put("/reset", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ error: "User with this email does not exist." });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_RESETKEY, {
      expiresIn: "20m",
    });
    const data = {
      from: "noreply@ChatApp.com",
      to: email,
      subject: "Reset Password",
      html: `<h2>Please click on the given link to reset your password. The link will expire in 20 minutes.</h2>
        <p>${process.env.CLIENT_URL}/reset/${token}</p>
        `,
    };
    await user.updateOne({ resetLink: token }, (err, success) => {
      if (err) {
        return res.status(400).json({ error: "Reset Password Link Error" });
      } else {
        mg.messages().send(data, (error, body) => {
          if (error) {
            return res.json({ error: err.message });
          }
          return res.json({ message: "An email has been sent to your email." });
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/new-password", async (req, res) => {
  try {
    const newPassword = req.body.password;
    const newConfirmedPassword = req.body.confirmPassword;
    const sentToken = req.body.token;

    if (
      !sentToken ||
      !newPassword ||
      !newConfirmedPassword ||
      newPassword !== newConfirmedPassword
    ) {
      return res
        .status(400)
        .json({ msg: "Please enter the same password twice" });
    }
    // check the password is of the valid length
    if (newPassword.length < 5) {
      return res
        .status(400)
        .json({ msg: "Password must contain at least 5 characters" });
    }
    const user = await User.findOne({ resetLink: sentToken });
    if (!user) {
      return res
        .status(401)
        .json({ error: "Incorrect token or session has expired." });
    }
    const match = await bcrypt.compare(newPassword, user.password);
    if (match) {
      return res
        .status(400)
        .json({ msg: "New password cannot be the same as the old password!" });
    }
    bcrypt.hash(newPassword, 10).then((hashedpassword) => {
      user.password = hashedpassword;
      user.resetLink = "";
      user.save().then((saveduser) => {
        res.json({ message: "You have successfully reset your password!" });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
